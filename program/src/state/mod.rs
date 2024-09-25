use anchor_lang::prelude::*;
use solana_program::pubkey;

// Tensor Protocol Foundation Fees Squads: https://v3.squads.so/dashboard/R3FMN1J5aFJTdWY2TDI3RUNITkN6Y3h0M3B4YjhUcWhENktoS3JMNkw0Q28=
pub const TREASURY: Pubkey = pubkey!("243cQR2jrZQHQjReVpmq3DjPbqerJZEw7texPYudrfko");

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct FeeSeeds {
    pub shard: u8,
    pub bump: u8,
}

// Dummy account for the Fee vault, so we can derive seeds for it.
#[account]
pub struct FeeVault {}
