/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Address } from '@solana/addresses';
import {
  Codec,
  Decoder,
  Encoder,
  combineCodec,
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
  getU8Decoder,
  getU8Encoder,
  mapEncoder,
} from '@solana/codecs';
import {
  AccountRole,
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlyAccount,
  WritableAccount,
} from '@solana/instructions';
import { FEES_PROGRAM_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';
import {
  FeeSeeds,
  FeeSeedsArgs,
  getFeeSeedsDecoder,
  getFeeSeedsEncoder,
} from '../types';

export type CollectInstruction<
  TProgram extends string = typeof FEES_PROGRAM_PROGRAM_ADDRESS,
  TAccountTreasury extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountTreasury extends string
        ? WritableAccount<TAccountTreasury>
        : TAccountTreasury,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type CollectInstructionData = {
  discriminator: Array<number>;
  seeds: Array<FeeSeeds>;
};

export type CollectInstructionDataArgs = { seeds: Array<FeeSeedsArgs> };

export function getCollectInstructionDataEncoder(): Encoder<CollectInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['seeds', getArrayEncoder(getFeeSeedsEncoder())],
    ]),
    (value) => ({
      ...value,
      discriminator: [208, 47, 194, 155, 17, 98, 82, 236],
    })
  );
}

export function getCollectInstructionDataDecoder(): Decoder<CollectInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['seeds', getArrayDecoder(getFeeSeedsDecoder())],
  ]);
}

export function getCollectInstructionDataCodec(): Codec<
  CollectInstructionDataArgs,
  CollectInstructionData
> {
  return combineCodec(
    getCollectInstructionDataEncoder(),
    getCollectInstructionDataDecoder()
  );
}

export type CollectInput<
  TAccountTreasury extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  /** Fee destination account */
  treasury: Address<TAccountTreasury>;
  systemProgram?: Address<TAccountSystemProgram>;
  seeds: CollectInstructionDataArgs['seeds'];
  vaults: Array<Address>;
};

export function getCollectInstruction<
  TAccountTreasury extends string,
  TAccountSystemProgram extends string,
>(
  input: CollectInput<TAccountTreasury, TAccountSystemProgram>
): CollectInstruction<
  typeof FEES_PROGRAM_PROGRAM_ADDRESS,
  TAccountTreasury,
  TAccountSystemProgram
> {
  // Program address.
  const programAddress = FEES_PROGRAM_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    treasury: { value: input.treasury ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = args.vaults.map((address) => ({
    address,
    role: AccountRole.WRITABLE,
  }));

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.treasury),
      getAccountMeta(accounts.systemProgram),
      ...remainingAccounts,
    ],
    programAddress,
    data: getCollectInstructionDataEncoder().encode(
      args as CollectInstructionDataArgs
    ),
  } as CollectInstruction<
    typeof FEES_PROGRAM_PROGRAM_ADDRESS,
    TAccountTreasury,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedCollectInstruction<
  TProgram extends string = typeof FEES_PROGRAM_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    /** Fee destination account */
    treasury: TAccountMetas[0];
    systemProgram: TAccountMetas[1];
  };
  data: CollectInstructionData;
};

export function parseCollectInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedCollectInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 2) {
    // TODO: Coded error.
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      treasury: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getCollectInstructionDataDecoder().decode(instruction.data),
  };
}