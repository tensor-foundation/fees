use anchor_lang::prelude::*;

#[error_code]
pub enum FeesProgramError {
    /// 0 - Arithmetic error
    #[msg("Arithmetic error")]
    ArithmeticError,
    /// 1 - Number of seeds and accounts do not match
    #[msg("Number of seeds and accounts do not match")]
    MismatchedSeedsAndAccounts,
}
