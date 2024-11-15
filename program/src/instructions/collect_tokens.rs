use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::TransferChecked,
    token_interface::{Mint, TokenAccount, TokenInterface},
};
use tensor_toolbox::token_2022::transfer::transfer_checked;

use crate::state::FeeSeeds;
use crate::{error::FeesProgramError, state::TREASURY};

/// Permissionless fee crank that collects fees from fee vault accounts and sends them
/// to the Tensor Foundation treasury.
#[derive(Accounts)]
pub struct CollectTokens<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Fee destination account
    /// CHECK: This is hard-coded to the Tensor Foundation's treasury account.
    #[account(
        mut,
        address = TREASURY,
    )]
    pub treasury: UncheckedAccount<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = treasury,
    )]
    pub treasury_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    // n fee accounts in remaining accounts
    // where the accounts are derived from the passed in
    // indices and bumps, in order
    // n token_accounts belonging to the fee accounts
}

pub fn process_collect_tokens<'info>(
    ctx: Context<'_, '_, '_, 'info, CollectTokens<'info>>,
    seeds: &[FeeSeeds],
) -> Result<()> {
    let treasury_ta = &ctx.accounts.treasury_ta.to_account_info();

    let (fee_accounts, token_accounts) = ctx.remaining_accounts.split_at(seeds.len());

    if token_accounts.len() != fee_accounts.len() && token_accounts.len() != seeds.len() {
        return Err(FeesProgramError::MismatchedSeedsAndAccounts.into());
    }

    let decimals = ctx.accounts.mint.decimals;

    msg!("Received {} fee accounts", fee_accounts.len());

    // Iterate over fee accounts, token accounts and seeds to collect fees
    for ((fee_account, token_account), fee_seeds) in
        fee_accounts.iter().zip(token_accounts).zip(seeds)
    {
        // Collect fees
        let shard = &[fee_seeds.shard];
        let bump = &[fee_seeds.bump];

        let signers_seeds: &[&[&[u8]]] = &[&[b"fee_vault", shard, bump]];

        let token =
            TokenAccount::try_deserialize_unchecked(&mut &**token_account.try_borrow_data()?)?;
        let amount = token.amount;

        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: token_account.to_account_info(),
                to: treasury_ta.to_account_info(),
                authority: fee_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
            },
        )
        .with_signer(signers_seeds);

        transfer_checked(transfer_ctx, amount, decimals)?;

        msg!(
            "Collecting {} tokens from account {}",
            amount,
            fee_account.key()
        );
    }

    Ok(())
}
