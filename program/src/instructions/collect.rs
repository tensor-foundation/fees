use std::iter::zip;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke_signed, system_instruction};

use crate::state::FeeSeeds;
use crate::{error::FeesProgramError, state::TREASURY};

/// Permissionless fee crank that collects fees from fee vault accounts and sends them
/// to the Tensor Foundation treasury.
#[derive(Accounts)]
pub struct Collect<'info> {
    /// Fee destination account
    /// CHECK: This is hard-coded to the Tensor Foundation's treasury account.
    #[account(
        mut,
        address = TREASURY,
    )]
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    // n fee accounts in remaining accounts
    // where the accounts are derived from the passed in
    // indices and bumps, in order
}

pub fn process_collect<'info>(
    ctx: Context<'_, '_, '_, 'info, Collect<'info>>,
    seeds: &[FeeSeeds],
) -> Result<()> {
    let rent = Rent::get()?;
    let treasury = &ctx.accounts.treasury.to_account_info();
    let treasury_pubkey = treasury.key();

    let fee_accounts = ctx.remaining_accounts;

    if seeds.len() != fee_accounts.len() {
        return Err(FeesProgramError::MismatchedSeedsAndAccounts.into());
    }

    msg!("Received {} fee accounts", fee_accounts.len());

    // Iterate over fee accounts and passed in seeds and collect fees
    for (account, fee_seeds) in zip(fee_accounts, seeds) {
        // Collect fees
        let shard = &[fee_seeds.shard];
        let bump = &[fee_seeds.bump];

        let signers_seeds: &[&[&[u8]]] = &[&[b"fee_vault", shard, bump]];

        let lamports = account
            .lamports()
            .checked_sub(rent.minimum_balance(0))
            .ok_or(FeesProgramError::ArithmeticError)?;

        msg!(
            "Collecting {} lamports from account {}",
            lamports,
            account.key()
        );

        // Fee account is a "ghost PDA"--owned by the system program, so requires a system transfer.
        invoke_signed(
            &system_instruction::transfer(&account.key(), &treasury_pubkey, lamports),
            &[account.clone(), treasury.clone()],
            signers_seeds,
        )?;
    }

    Ok(())
}
