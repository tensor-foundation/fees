import { generateKeyPairSigner } from '@solana/signers';
import { appendTransactionInstruction, pipe } from '@solana/web3.js';
import test from 'ava';
import {
  MyAccount,
  fetchMyAccount,
  getCreateInstruction,
} from '../src/index.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from './_setup.js';

test('it can create new accounts', async (t) => {
  // Given a client and a new signer.
  const client = createDefaultSolanaClient();
  const account = await generateKeyPairSigner();
  const payer = await generateKeyPairSignerWithSol(client);

  // When we create a new account.
  const createIx = getCreateInstruction({
    address: account,
    authority: payer.address,
    payer,
    arg1: 1,
    arg2: 2,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionInstruction(createIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then an account was created with the correct data.
  t.like(await fetchMyAccount(client.rpc, account.address), <MyAccount>{
    address: account.address,
    data: {
      authority: payer.address,
      data: { field1: 1, field2: 2 },
    },
  });
});
