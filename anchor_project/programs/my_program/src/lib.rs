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
        let business = &mut ctx.accounts.business;

        // Validation: Name cannot be empty
        require!(!name.is_empty(), LocalshareError::EmptyBusinessName);

        // Validation: Name cannot exceed 50 characters
        require!(name.len() <= 50, LocalshareError::BusinessNameTooLong);

        // Calculate the share mint PDA (will be created in create_business_mint)
        let (share_mint, _) = Pubkey::find_program_address(
            &[b"mint", business.key().as_ref()],
            ctx.program_id,
        );

        // Initialize business fields
        business.owner = ctx.accounts.owner.key();
        business.name = name.clone();
        business.share_mint = share_mint;
        business.bump = ctx.bumps.business;

        msg!("✅ Business registered successfully!");
        msg!("Name: {}", name);
        msg!("Owner: {}", business.owner);
        msg!("Share Mint (PDA): {}", business.share_mint);

        Ok(())
    }

    /// Creates a mint for business shares
    /// Each business gets its own SPL token representing shares
    ///
    /// # Security
    /// - Only the business owner can create the mint
    /// - Mint is created as PDA for security
    pub fn create_business_mint(ctx: Context<CreateBusinessMint>) -> Result<()> {
        let business = &ctx.accounts.business;
        let mint = &ctx.accounts.mint;
        let mint_authority = &mut ctx.accounts.mint_authority;

        // Validate that the signer is the business owner
        require!(business.owner == ctx.accounts.owner.key(), LocalshareError::InvalidBusinessOwner);

        // Initialize mint authority
        mint_authority.business = business.key();
        mint_authority.bump = ctx.bumps.mint_authority;

        msg!("✅ Business share mint created successfully!");
        msg!("Business: {}", business.name);
        msg!("Mint: {}", mint.key());
        msg!("Mint Authority: {}", ctx.accounts.mint_authority.key());
        msg!("Owner: {}", business.owner);

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
        let offering = &mut ctx.accounts.offering;
        let business = &ctx.accounts.business;
        let config = &ctx.accounts.config;
        
        // Validation: Price must be greater than zero
        require!(price_per_share > 0, LocalshareError::InvalidPrice);
        
        // Validation: Initial share quantity must be greater than zero
        require!(initial_shares > 0, LocalshareError::InvalidShareAmount);
        
        // Validation: Prevent overflow in total value calculation
        let _total_value = price_per_share
            .checked_mul(initial_shares)
            .ok_or(LocalshareError::MathOverflow)?;
        
        // Initialize offering fields
        offering.business = business.key();
        offering.share_mint = business.share_mint;
        offering.payment_mint = config.payment_mint;
        offering.price_per_share = price_per_share;
        offering.remaining_shares = initial_shares;
        offering.is_active = true;
        offering.bump = ctx.bumps.offering;
        
        msg!("✅ Offering created successfully!");
        msg!("Business: {}", offering.business);
        msg!("Price per share: {} lamports", price_per_share);
        msg!("Shares available: {}", initial_shares);
        
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
        let offering = &mut ctx.accounts.offering;
        
        // Validation: Offering must be active
        require!(offering.is_active, LocalshareError::OfferingNotActive);
        
        // Validation: Amount must be greater than zero
        require!(amount > 0, LocalshareError::InvalidShareAmount);
        
        // Validation: There must be enough shares available
        require!(
            amount <= offering.remaining_shares,
            LocalshareError::InsufficientShares
        );
        
        // Calculate total cost with overflow protection
        let total_cost = offering
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

        // Mint shares to the buyer using SPL Token program
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                &[&[
                    b"mint_authority",
                    ctx.accounts.business.key().as_ref(),
                    &[ctx.accounts.mint_authority.bump],
                ]],
            ),
            amount,
        )?;

        // Update remaining shares count
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
        msg!("Shares minted: {}", amount);
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
    /// Business account being initialized as PDA
    /// Space: 8 (discriminator) + 32 (owner) + (4 + 50) (name String) + 32 (share_mint) + 1 (bump) = 127 bytes
    #[account(
        init,
        seeds = [b"business", owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 + (4 + 50) + 32 + 1
    )]
    pub business: Account<'info, Business>,
    
    /// Business owner (entrepreneur who pays for creation)
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// System program to create the account
    pub system_program: Program<'info, System>,
}

/// Context for creating a business share mint
/// Creates the SPL token mint and mint authority for a business
#[derive(Accounts)]
pub struct CreateBusinessMint<'info> {
    /// Business account that will own the mint
    #[account(
        mut,
        constraint = business.owner == owner.key() @ LocalshareError::InvalidBusinessOwner
    )]
    pub business: Account<'info, Business>,

    /// Mint account for business shares (SPL Token)
    /// Space: 82 bytes for Mint account
    #[account(
        init,
        seeds = [b"mint", business.key().as_ref()],
        bump,
        payer = owner,
        mint::decimals = 0,      // Whole shares only
        mint::authority = mint_authority.key(),
        mint::freeze_authority = mint_authority.key(),
    )]
    pub mint: Account<'info, Mint>,

    /// Mint authority PDA that controls the mint
    #[account(
        init,
        seeds = [b"mint_authority", business.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 + 1
    )]
    pub mint_authority: Account<'info, MintAuthority>,

    /// Business owner (must sign and pay)
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Rent sysvar for PDA validation
    pub rent: Sysvar<'info, Rent>,

    /// Token program
    pub token_program: Program<'info, Token>,

    /// System program
    pub system_program: Program<'info, System>,
}

/// Context for creating a share offering
/// Allows a registered business to create a share offering
#[derive(Accounts)]
pub struct CreateOffering<'info> {
    /// Offering account being initialized as PDA
    /// Space: 8 (discriminator) + 32 (business) + 32 (share_mint) + 32 (payment_mint) + 
    ///        8 (price_per_share) + 8 (remaining_shares) + 1 (is_active) + 1 (bump) = 122 bytes
    #[account(
        init,
        seeds = [b"offering", business.key().as_ref(), business.share_mint.as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1
    )]
    pub offering: Account<'info, Offering>,
    
    /// Business account creating the offering
    /// Must have has_one = owner for validation
    #[account(has_one = owner)]
    pub business: Account<'info, Business>,
    
    /// Global Config account to get the payment_mint
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    
    /// Business owner (must sign and pay)
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// System program to create the account
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

    /// Mint authority PDA that controls the minting
    #[account(
        seeds = [b"mint_authority", business.key().as_ref()],
        bump,
    )]
    pub mint_authority: Account<'info, MintAuthority>,

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

    /// Associated token program (for creating token accounts)
    /// CHECK: Validated by anchor
    pub associated_token_program: UncheckedAccount<'info>,

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
