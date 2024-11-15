import { fetchToken } from '@solana-program/token';
import {
  Address,
  address,
  airdropFactory,
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  getAddressEncoder,
  lamports,
  pipe,
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_ACCOUNTS_PROGRAM_ID,
  createAta,
  createDefaultSolanaClient,
  createDefaultTransaction,
  createMint,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TOKEN_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import { FeeSeeds, findFeeVaultPda, getCollectTokensInstruction } from '../src';
import { mintTo } from './_common';

const getShardNumber = (address: Address) => {
  return getAddressEncoder().encode(address)[31];
};

const ONE_SOL = 10n ** 9n;
const KEEP_ALIVE_LAMPORTS = 890880n;
const AMOUNT = 10_000_000n;

test('it can collect fees from sharded fee token accounts', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const treasury = address('243cQR2jrZQHQjReVpmq3DjPbqerJZEw7texPYudrfko');
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  // SPL Token mint
  const mint = await createMint({
    client,
    payer,
    decimals: 6,
    mintAuthority: mintAuthority.address,
    freezeAuthority: mintAuthority.address,
  });

  const treasuryAta = await createAta({ client, payer, mint, owner: treasury });

  const treasuryAtaStartBalance = (await fetchToken(client.rpc, treasuryAta))
    .data.amount;

  const numFeeAccounts = 5;

  // Arbitrary keypairs to use to get the sharded fee accounts.
  // In AMM, for example, these would be actual pool accounts.
  const mints = await Promise.all(
    Array.from(
      { length: numFeeAccounts },
      async () => await generateKeyPairSigner()
    )
  );

  // Remove duplicates before we derive the PDAs.
  const shardNumbers = Array.from(
    new Set(mints.map((mint) => getShardNumber(mint.address)))
  );

  // Derive the fee accounts.
  const pdas = await Promise.all(
    shardNumbers.map(
      async (shard) =>
        await findFeeVaultPda({ shard: Uint8Array.from([shard]) })
    )
  );

  // Build the bump, shard pairs for the collect instruction.
  const seeds: FeeSeeds[] = pdas.map((pda, i) => ({
    bump: pda[1],
    shard: shardNumbers[i],
  }));

  // Fund the accounts
  await Promise.all(
    pdas.map(async (pda) => {
      const vaultBalance = (await client.rpc.getBalance(pda[0]).send()).value;

      return await airdropFactory(client)({
        recipientAddress: pda[0],
        lamports: lamports(ONE_SOL + KEEP_ALIVE_LAMPORTS - vaultBalance),
        commitment: 'confirmed',
      });
    })
  );

  const vaults = pdas.map((pda) => pda[0]);

  // Create the associated token accounts.
  const tokens = await Promise.all(
    vaults.map(async (vault) => {
      return await createAta({ client, payer, mint, owner: vault });
    })
  );

  // Mint to the associated token accounts.
  await Promise.all(
    tokens.map(async (token) => {
      await mintTo({
        client,
        payer,
        mint,
        token,
        mintAuthority,
        amount: AMOUNT,
      });
    })
  );

  const collectTokensIx = getCollectTokensInstruction({
    treasury,
    seeds,
    vaults,
    tokenAccounts: tokens,
    payer,
    mint,
    treasuryTa: treasuryAta,
    associatedTokenProgram: ASSOCIATED_TOKEN_ACCOUNTS_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(collectTokensIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const treasuryAtaBalance = (await fetchToken(client.rpc, treasuryAta)).data
    .amount;

  for (const token of tokens) {
    const balance = (await fetchToken(client.rpc, token)).data.amount;
    // Empty balance
    t.assert(balance === 0n, 'Vault ATA balance is incorrect');
  }

  // Check that the treasury balance is the correct amount higher than the start balance.
  t.assert(
    treasuryAtaBalance ===
      treasuryAtaStartBalance + AMOUNT * BigInt(tokens.length),
    'Treasury balance is incorrect'
  );
});
