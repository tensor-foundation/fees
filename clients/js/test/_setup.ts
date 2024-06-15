import {
  KeyPairSigner,
  createSignerFromKeyPair,
  generateKeyPairSigner,
  Address,
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
  airdropFactory,
  createPrivateKeyFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  lamports,
} from '@solana/web3.js';
import {
  Client
} from '@tensor-foundation/test-helpers';

export const createDefaultSolanaClient = (): Client => {
  const rpc = createSolanaRpc('http://127.0.0.1:8899');
  const rpcSubscriptions = createSolanaRpcSubscriptions('ws://127.0.0.1:8900');
  return { rpc, rpcSubscriptions };
};

export const createKeyPairSigner = async (
  bytes: Uint8Array
): Promise<KeyPairSigner<string>> => {
  const publicKeyBytes = bytes.slice(32);
  const privateKeyBytes = bytes.slice(0, 32);

  const [publicKey, privateKey] = await Promise.all([
    crypto.subtle.importKey('raw', publicKeyBytes, 'Ed25519', true, ['verify']),
    createPrivateKeyFromBytes(privateKeyBytes),
  ]);
  return createSignerFromKeyPair({ privateKey, publicKey } as CryptoKeyPair);
};

export const generateKeyPairSignerWithSol = async (
  client: Client,
  putativeLamports: bigint = 1_000_000_000n
) => {
  const signer = await generateKeyPairSigner();
  await airdropFactory(client)({
    recipientAddress: signer.address,
    lamports: lamports(putativeLamports),
    commitment: 'confirmed',
  });
  return signer;
};

export const fundWalletWithSol = async (
  client: Client,
  address: Address,
  putativeLamports: bigint = 1_000_000_000n
) => {
  await airdropFactory(client)({
    recipientAddress: address,
    lamports: lamports(putativeLamports),
    commitment: 'confirmed',
  });
};

export const getBalance = async (client: Client, address: Address) =>
  (await client.rpc.getBalance(address, { commitment: 'confirmed' }).send())
    .value;
