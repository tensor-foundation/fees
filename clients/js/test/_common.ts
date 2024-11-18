import { Address, KeyPairSigner, TransactionSigner } from '@solana/web3.js';

import { appendTransactionMessageInstruction, pipe } from '@solana/web3.js';
import {
  Client,
  createDefaultTransaction,
  getMintToInstruction,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';

export interface MintToArgs {
  client: Client;
  payer: TransactionSigner;
  mint: Address;
  token: Address;
  mintAuthority: KeyPairSigner;
  amount: bigint;
  tokenProgram?: Address;
}

export async function mintTo(args: MintToArgs) {
  const { client, payer, mint, token, mintAuthority, amount, tokenProgram } =
    args;

  const mintToIx = getMintToInstruction({
    mint,
    token,
    mintAuthority,
    amount,
    tokenProgram,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(mintToIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
}
