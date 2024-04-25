import { generateKeyPairSigner } from '@solana/signers';
import {
  appendTransactionInstruction,
  pipe,
  address,
  Address,
  getAddressEncoder,
  airdropFactory,
  lamports,
} from '@solana/web3.js';
import test from 'ava';
import {
  findFeeVaultPda,
  FeeSeeds,
  getCollectInstruction,
} from '../src/index.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from './_setup.js';

const getShardNumber = (address: Address) => {
  return getAddressEncoder().encode(address)[31];
};

const ONE_SOL = 10n ** 9n;
const KEEP_ALIVE_LAMPORTS = 890880n;

test('it can collect fees from sharded fee accounts', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const treasury = address('Hnozy7VdXR1ua2FZQyvxRgoCbn2dnpVZh3vZN9BMzDea');

  const treasuryStartBalance = (await client.rpc.getBalance(treasury).send())
    .value;

  const numFeeAccounts = 8;

  // Arbitrary keypairs to use to get the sharded fee accounts.
  // In AMM, for example, these would be actual NFT mint accounts.
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

  // Derive some fee accounts.
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

  const collectIx = getCollectInstruction({
    treasury,
    seeds,
    vaults,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionInstruction(collectIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const treasuryBalance = (await client.rpc.getBalance(treasury).send()).value;

  for (const v of vaults) {
    const balance = (await client.rpc.getBalance(v).send()).value;
    // Only keep-alive state bond left.
    t.assert(balance === KEEP_ALIVE_LAMPORTS, 'Vault balance is correct');
  }

  // Check that the treasury balance is the correct amount higher than the start balance.
  t.assert(
    treasuryBalance === treasuryStartBalance + ONE_SOL * BigInt(vaults.length),
    'Treasury balance is correct'
  );
});
