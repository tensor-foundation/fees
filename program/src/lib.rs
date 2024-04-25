pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use instructions::*;
use state::FeeSeeds;

declare_id!("MyProgram1111111111111111111111111111111111");

#[program]
pub mod fees_program_program {

    use super::*;

    pub fn collect<'info>(
        ctx: Context<'_, '_, '_, 'info, Collect<'info>>,
        seeds: Vec<FeeSeeds>,
    ) -> Result<()> {
        process_collect(ctx, &seeds)
    }
}
