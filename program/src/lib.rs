pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use instructions::*;
use state::FeeSeeds;

declare_id!("TFEEgwDP6nn1s8mMX2tTNPPz8j2VomkphLUmyxKm17A");

#[program]
pub mod fees_program {

    use super::*;

    pub fn collect<'info>(
        ctx: Context<'_, '_, '_, 'info, Collect<'info>>,
        seeds: Vec<FeeSeeds>,
    ) -> Result<()> {
        process_collect(ctx, &seeds)
    }
}
