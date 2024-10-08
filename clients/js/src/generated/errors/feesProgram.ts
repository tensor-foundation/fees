/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

/** ArithmeticError: Arithmetic error */
export const FEES_PROGRAM_ERROR__ARITHMETIC_ERROR = 0x1770; // 6000
/** MismatchedSeedsAndAccounts: Number of seeds and accounts do not match */
export const FEES_PROGRAM_ERROR__MISMATCHED_SEEDS_AND_ACCOUNTS = 0x1771; // 6001

export type FeesProgramError =
  | typeof FEES_PROGRAM_ERROR__ARITHMETIC_ERROR
  | typeof FEES_PROGRAM_ERROR__MISMATCHED_SEEDS_AND_ACCOUNTS;

let feesProgramErrorMessages: Record<FeesProgramError, string> | undefined;
if (process.env.NODE_ENV !== 'production') {
  feesProgramErrorMessages = {
    [FEES_PROGRAM_ERROR__ARITHMETIC_ERROR]: `Arithmetic error`,
    [FEES_PROGRAM_ERROR__MISMATCHED_SEEDS_AND_ACCOUNTS]: `Number of seeds and accounts do not match`,
  };
}

export function getFeesProgramErrorMessage(code: FeesProgramError): string {
  if (process.env.NODE_ENV !== 'production') {
    return (feesProgramErrorMessages as Record<FeesProgramError, string>)[code];
  }

  return 'Error message not available in production bundles.';
}
