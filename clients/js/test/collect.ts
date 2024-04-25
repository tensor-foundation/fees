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
  findAmmVaultPda,
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

test('it can collect fees from sharded AMM fee accounts', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const fdnTreasury = address('Hnozy7VdXR1ua2FZQyvxRgoCbn2dnpVZh3vZN9BMzDea');

  const numFeeAccounts = 8;

  // Arbitrary keypairs to use to get the sharded fee accounts.
  // In AMM these would be actual NFT mint accounts.
  const mints = await Promise.all(
    Array.from(
      { length: numFeeAccounts },
      async () => await generateKeyPairSigner()
    )
  );

  const shardNumbers = mints.map((mint) => getShardNumber(mint.address));

  // Derive some fee accounts for AMM.
  const pdas = await Promise.all(
    shardNumbers.map(
      async (shard) =>
        await findAmmVaultPda({ shard: Uint8Array.from([shard]) })
    )
  );

  // Build the bump, shard pairs for the collect instruction.
  const seeds: FeeSeeds[] = pdas.map((pda, i) => ({
    bump: pda[1],
    shard: shardNumbers[i],
  }));

  // Fund the accounts
  await Promise.all(
    pdas.map(
      async (pda) =>
        await airdropFactory(client)({
          recipientAddress: pda[0],
          lamports: lamports(ONE_SOL + KEEP_ALIVE_LAMPORTS),
          commitment: 'confirmed',
        })
    )
  );

  const collectIx = getCollectInstruction({
    treasury: fdnTreasury,
    seeds,
    vaults: pdas.map((pda) => pda[0]),
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionInstruction(collectIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const treasuryBalance = (await client.rpc.getBalance(fdnTreasury).send())
    .value;

  // Check that the treasury balance is correct.
  t.assert(
    treasuryBalance === ONE_SOL * BigInt(numFeeAccounts),
    'Treasury balance is correct'
  );
});
