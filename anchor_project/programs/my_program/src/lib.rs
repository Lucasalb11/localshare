use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::{self, AssociatedToken};

declare_id!("8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y");

/// Localshare Lite Program
/// Local business investment sharing system
#[program]
pub mod my_program {
    use super::*;

    /// Initializes the program's global configuration
    /// Sets initial parameters and authorities
    ///
    /// # Security
    /// - Can only be called once (unique PDA)
    /// - Admin is set as the transaction signer
    pub fn init_config(ctx: Context<InitConfig>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        
        // Set admin as the signer of this transaction
        config.admin = ctx.accounts.admin.key();

        // Set SOL as the payment token (native SOL)
        config.payment_mint = anchor_lang::solana_program::system_program::ID;

        // Save the PDA bump for future validations
        config.bump = ctx.bumps.config;

        msg!("✅ Config initialized successfully!");
        msg!("Admin: {}", config.admin);
        msg!("Payment Mint: {}", config.payment_mint);
        
        Ok(())
    }

    /// Registers a new business in the protocol
    /// Allows local entrepreneurs to register and offer shares
    ///
    /// # Security
    /// - Each owner can only have one business (unique PDA per owner)
    /// - Name is validated to not exceed size limit
    pub fn register_business(
        ctx: Context<RegisterBusiness>,
        name: String,
    ) -> Result<()> {
        require!(!name.is_empty(), LocalshareError::EmptyBusinessName);
        require!(name.len() <= 50, LocalshareError::BusinessNameTooLong);

        let business = &mut ctx.accounts.business;
        business.owner = ctx.accounts.owner.key();
        business.name = name;
        business.share_mint = ctx.accounts.mint.key();
        business.bump = ctx.bumps.business;

        let initial_supply: u64 = 100;
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.owner_token_account.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                &[&[
                    b"mint_authority",
                    business.key().as_ref(),
                    &[ctx.bumps.mint_authority],
                ]],
            ),
            initial_supply,
        )?;

        Ok(())
    }



    /// Creates a new share offering for a business
    /// Defines quantity, price, and other share characteristics
    /// 
    /// # Security
    /// - Only the business owner can create offerings
    /// - Price and quantity validations
    /// - Payment mint comes from global config
    pub fn create_offering(
        ctx: Context<CreateOffering>,
        price_per_share: u64,
        initial_shares: u64,
    ) -> Result<()> {
        require!(price_per_share > 0, LocalshareError::InvalidPrice);
        require!(initial_shares > 0, LocalshareError::InvalidShareAmount);
        price_per_share.checked_mul(initial_shares).ok_or(LocalshareError::MathOverflow)?;

        require!(
            ctx.accounts.owner_token_account.amount >= initial_shares,
            LocalshareError::InsufficientShares
        );

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.owner_token_account.to_account_info(),
                    to: ctx.accounts.offering_vault.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            initial_shares,
        )?;

        let offering = &mut ctx.accounts.offering;
        let business = &ctx.accounts.business;
        let config = &ctx.accounts.config;
        offering.business = business.key();
        offering.share_mint = business.share_mint;
        offering.payment_mint = config.payment_mint;
        offering.price_per_share = price_per_share;
        offering.remaining_shares = initial_shares;
        offering.is_active = true;
        offering.bump = ctx.bumps.offering;

        Ok(())
    }

    /// Allows investors to buy shares of a business
    /// Performs fund transfer and mints shares to the buyer
    ///
    /// # Security
    /// - Validates that the offering is active
    /// - Validates share availability
    /// - Atomic SOL transfer and token minting via CPI
    /// - Automatically deactivates offering when exhausted
    pub fn buy_shares(ctx: Context<BuyShares>, amount: u64) -> Result<()> {
        
        // Validation: Offering must be active
        require!(ctx.accounts.offering.is_active, LocalshareError::OfferingNotActive);
        
        // Validation: Amount must be greater than zero
        require!(amount > 0, LocalshareError::InvalidShareAmount);
        
        // Validation: There must be enough shares available
        require!(
            amount <= ctx.accounts.offering.remaining_shares,
            LocalshareError::InsufficientShares
        );
        require!(
            ctx.accounts.offering_vault.amount >= amount,
            LocalshareError::InsufficientShares
        );
        
        // Calculate total cost with overflow protection
        let total_cost = ctx.accounts.offering
            .price_per_share
            .checked_mul(amount)
            .ok_or(LocalshareError::MathOverflow)?;
        
        msg!("💰 Processing purchase of {} shares", amount);
        msg!("Total cost: {} lamports", total_cost);
        
        // Transfer SOL from buyer to business owner
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.owner.to_account_info(),
                },
            ),
            total_cost,
        )?;

        let offering_bump = ctx.accounts.offering.bump;
        let business_key = ctx.accounts.business.key();
        let mint_key = ctx.accounts.mint.key();
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.offering_vault.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.offering.to_account_info(),
                },
                &[&[
                    b"offering",
                    business_key.as_ref(),
                    mint_key.as_ref(),
                    &[offering_bump],
                ]],
            ),
            amount,
        )?;

        // Update remaining shares count
        let offering = &mut ctx.accounts.offering;
        offering.remaining_shares = offering
            .remaining_shares
            .checked_sub(amount)
            .ok_or(LocalshareError::MathOverflow)?;

        // If no more shares, deactivate offering automatically
        if offering.remaining_shares == 0 {
            offering.is_active = false;
            msg!("🔒 Offering exhausted and deactivated automatically");
        }

        msg!("✅ Purchase completed successfully!");
        msg!("Buyer: {}", ctx.accounts.buyer.key());
        msg!("Shares transferred: {}", amount);
        msg!("Remaining shares: {}", offering.remaining_shares);
        
        Ok(())
    }
}

// ============================================================================
// Account State Structs
// ============================================================================

/// Global protocol configuration
/// PDA: ["config"]
#[account]
pub struct Config {
    /// Protocol administrator (can update configurations)
    pub admin: Pubkey,
    
    /// Token mint used for payments (e.g., USDC)
    pub payment_mint: Pubkey,
    
    /// PDA bump seed
    pub bump: u8,
}

/// Represents a registered business in the protocol
/// PDA: ["business", owner.key()]
#[account]
pub struct Business {
    /// Business owner (entrepreneur)
    pub owner: Pubkey,
    
    /// Business name (maximum 50 characters)
    pub name: String,
    
    /// Share mint of this business (NFT or Fungible Token)
    pub share_mint: Pubkey,
    
    /// PDA bump seed
    pub bump: u8,
}

/// Authority for minting business shares
/// PDA: ["mint_authority", business.key()]
#[account]
pub struct MintAuthority {
    /// Business this authority belongs to
    pub business: Pubkey,
    /// Bump seed
    pub bump: u8,
}

/// Represents a share offering from a business
/// PDA: ["offering", business.key(), share_mint.key()]
#[account]
pub struct Offering {
    /// Reference to the business that created this offering
    pub business: Pubkey,
    
    /// Mint of the shares being offered
    pub share_mint: Pubkey,
    
    /// Mint of the token accepted as payment
    pub payment_mint: Pubkey,
    
    /// Price per share (in lamports of payment_mint)
    pub price_per_share: u64,
    
    /// Amount of shares still available
    pub remaining_shares: u64,
    
    /// Whether the offering is active
    pub is_active: bool,
    
    /// PDA bump seed
    pub bump: u8,
}

// ============================================================================
// Context Structs (Accounts) for Instructions
// ============================================================================

/// Context for initializing the global configuration
/// Can only be called once to configure the protocol
#[derive(Accounts)]
pub struct InitConfig<'info> {
    /// Config account being initialized as PDA
    /// Space: 8 (discriminator) + 32 (admin) + 32 (payment_mint) + 1 (bump) = 73 bytes
    #[account(
        init,
        seeds = [b"config"],
        bump,
        payer = admin,
        space = 8 + 32 + 32 + 1
    )]
    pub config: Account<'info, Config>,

    /// Administrator who pays for creation and will be set as admin
    #[account(mut)]
    pub admin: Signer<'info>,

    /// System program to create the account
    pub system_program: Program<'info, System>,
}

/// Context for registering a new business
/// Allows entrepreneurs to create their business profile
#[derive(Accounts)]
pub struct RegisterBusiness<'info> {
    #[account(
        init,
        seeds = [b"business", owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 + (4 + 50) + 32 + 1
    )]
    pub business: Account<'info, Business>,

    #[account(
        init,
        seeds = [b"mint", business.key().as_ref()],
        bump,
        payer = owner,
        mint::decimals = 0,
        mint::authority = mint_authority.key(),
        mint::freeze_authority = mint_authority.key(),
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        seeds = [b"mint_authority", business.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 + 1
    )]
    pub mint_authority: Account<'info, MintAuthority>,

    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Context for creating a business share mint
/// Creates the SPL token mint and mint authority for a business


/// Context for creating a share offering
/// Allows a registered business to create a share offering
#[derive(Accounts)]
pub struct CreateOffering<'info> {
    #[account(
        init,
        seeds = [b"offering", business.key().as_ref(), business.share_mint.as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1
    )]
    pub offering: Account<'info, Offering>,

    #[account(has_one = owner)]
    pub business: Account<'info, Business>,

    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,

    #[account(
        constraint = business.share_mint == mint.key() @ LocalshareError::InvalidBusiness
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key() @ LocalshareError::InvalidBusinessOwner,
        constraint = owner_token_account.mint == mint.key() @ LocalshareError::InvalidBusiness
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = offering,
        constraint = offering_vault.owner == offering.key() @ LocalshareError::InvalidBusiness,
    )]
    pub offering_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Context for buying shares
/// Allows investors to buy shares from an active offering
#[derive(Accounts)]
pub struct BuyShares<'info> {
    /// Offering account from which shares will be purchased
    /// Must be mutable to update remaining_shares
    #[account(
        mut,
        constraint = offering.business == business.key() @ LocalshareError::InvalidBusiness
    )]
    pub offering: Account<'info, Offering>,

    /// Business account related to the offering
    #[account(has_one = owner @ LocalshareError::InvalidBusinessOwner)]
    pub business: Account<'info, Business>,

    /// Mint account for the business shares
    #[account(
        mut,
        constraint = offering.share_mint == mint.key() @ LocalshareError::InvalidBusiness
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = offering_vault.mint == mint.key() @ LocalshareError::InvalidBusiness,
    )]
    pub offering_vault: Account<'info, TokenAccount>,

    /// Buyer's token account to receive the shares
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    /// Business owner (receives payment)
    /// Referenced as 'owner' by the has_one constraint
    /// CHECK: Validated by has_one constraint in business
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,

    /// Buyer acquiring the shares
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// Token program (for SPL token operations)
    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    /// System program (for SOL transfers and account creation)
    pub system_program: Program<'info, System>,

    /// Rent sysvar (for PDA validation)
    pub rent: Sysvar<'info, Rent>,
}

// ============================================================================
// Custom Errors
// ============================================================================

#[error_code]
pub enum LocalshareError {
    #[msg("Business name cannot be empty")]
    EmptyBusinessName,
    
    #[msg("Business name cannot be longer than 50 characters")]
    BusinessNameTooLong,
    
    #[msg("Price per share must be greater than zero")]
    InvalidPrice,
    
    #[msg("Share amount must be greater than zero")]
    InvalidShareAmount,
    
    #[msg("Math operation resulted in overflow")]
    MathOverflow,
    
    #[msg("Offering is not active")]
    OfferingNotActive,
    
    #[msg("Not enough shares available")]
    InsufficientShares,
    
    #[msg("Invalid business or does not match offering")]
    InvalidBusiness,
    
    #[msg("Invalid business owner")]
    InvalidBusinessOwner,
}
