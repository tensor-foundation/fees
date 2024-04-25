use anchor_lang::prelude::*;
use solana_program::pubkey;

// TODO: replace with actual treasury address.
pub const TREASURY: Pubkey = pubkey!("Hnozy7VdXR1ua2FZQyvxRgoCbn2dnpVZh3vZN9BMzDea");
pub const KEEP_ALIVE_LAMPORTS: u64 = 890880;

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct FeeSeeds {
    pub shard: u8,
    pub bump: u8,
}

// Dummy account for the Fee vault, so we can derive seeds for it.
#[account]
pub struct FeeVault {}
