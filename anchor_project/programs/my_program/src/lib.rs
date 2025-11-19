use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("91CC3aZEnHLe7VvnE9wXwY4TPUTLR4EKfRAZYNjRPM2a");

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

    /// Registers a new business in the protocol or updates an existing one
    /// Allows local entrepreneurs to register and offer shares
    ///
    /// # Security
    /// - Each owner can only have one business (unique PDA per owner)
    /// - Name is validated to not exceed size limit
    /// - Supports upsert: initializes if new, updates name if exists
    pub fn register_business(
        ctx: Context<RegisterBusiness>,
        name: String,
    ) -> Result<()> {
        require!(!name.is_empty(), LocalshareError::EmptyBusinessName);
        require!(name.len() <= 50, LocalshareError::BusinessNameTooLong);

        let business = &mut ctx.accounts.business;
        
        // Check if business account is newly initialized
        // If the account was just created, all fields will be at their default values
        let is_new = business.owner == Pubkey::default();
        
        if is_new {
            // Initialize new business
            business.owner = ctx.accounts.owner.key();
            business.name = name.clone();
            // share_mint will be set later by init_share_mint
            // For now, set to default (Pubkey::default())
            business.share_mint = Pubkey::default();
            business.total_shares = 0;
            business.price_per_share_lamports = 0;
            business.treasury = ctx.accounts.owner.key(); // Default to owner as treasury
            business.is_listed = false;
            business.bump = ctx.bumps.business;

            // Note: The old mint (ctx.accounts.mint) is kept for backward compatibility
            // with the old offering flow, but the new flow uses share_mint created
            // in init_share_mint. We don't mint shares here anymore.
            
            msg!("✅ New business registered: {}", name);
        } else {
            // Update existing business - only allow name update
            require!(
                business.owner == ctx.accounts.owner.key(),
                LocalshareError::InvalidBusinessOwner
            );
            
            business.name = name.clone();
            msg!("✅ Business name updated: {}", name);
        }

        Ok(())
    }

    /// Configures the offering parameters for a business
    /// Sets total shares, price per share, and treasury address
    /// 
    /// # Security
    /// - Only the business owner can configure offerings
    /// - Validates that total_shares and price_per_share are greater than zero
    /// - Does NOT list the business (is_listed remains false)
    pub fn configure_offering(
        ctx: Context<ConfigureOffering>,
        total_shares: u64,
        price_per_share_lamports: u64,
        treasury: Pubkey,
    ) -> Result<()> {
        // Validation: total_shares must be greater than zero
        require!(total_shares > 0, LocalshareError::InvalidShareAmount);
        
        // Validation: price_per_share_lamports must be greater than zero
        require!(price_per_share_lamports > 0, LocalshareError::InvalidPrice);

        // Update business account with new offering configuration
        let business = &mut ctx.accounts.business;
        business.total_shares = total_shares;
        business.price_per_share_lamports = price_per_share_lamports;
        business.treasury = treasury;
        // Explicitly keep is_listed as false (do not list the business yet)
        business.is_listed = false;

        msg!("✅ Offering configured successfully!");
        msg!("Total shares: {}", total_shares);
        msg!("Price per share: {} lamports", price_per_share_lamports);
        msg!("Treasury: {}", treasury);

        Ok(())
    }

    /// Initializes the share mint and vault for a business
    /// Creates an SPL mint representing business equity tokens and mints all shares into a vault
    /// 
    /// # Security
    /// - Only the business owner can initialize the share mint
    /// - Requires that total_shares > 0 (must call configure_offering first)
    /// - Creates a dedicated mint with decimals = 0 (whole shares only)
    /// - All shares are minted into a PDA-controlled vault
    pub fn init_share_mint(ctx: Context<InitShareMint>) -> Result<()> {
        let business = &mut ctx.accounts.business;
        
        // Validation: total_shares must be greater than zero
        require!(
            business.total_shares > 0,
            LocalshareError::InvalidShareAmount
        );

        // Initialize the share mint authority account
        let share_mint_authority = &mut ctx.accounts.share_mint_authority;
        share_mint_authority.business = business.key();
        share_mint_authority.bump = ctx.bumps.share_mint_authority;

        // Update business account with the new share mint
        business.share_mint = ctx.accounts.share_mint.key();

        // Mint all total_shares into the shares_vault
        let business_key = business.key();
        let seeds = &[
            b"share_mint_authority",
            business_key.as_ref(),
            &[ctx.bumps.share_mint_authority],
        ];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.share_mint.to_account_info(),
                    to: ctx.accounts.shares_vault.to_account_info(),
                    authority: ctx.accounts.share_mint_authority.to_account_info(),
                },
                signer,
            ),
            business.total_shares,
        )?;

        msg!("✅ Share mint initialized successfully!");
        msg!("Share Mint: {}", business.share_mint);
        msg!("Shares Vault: {}", ctx.accounts.shares_vault.key());
        msg!("Total Shares Minted: {}", business.total_shares);

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

    /// Allows investors to buy shares from an offering
    /// Performs fund transfer and mints shares to the buyer
    ///
    /// # Security
    /// - Validates that the offering is active
    /// - Validates share availability
    /// - Atomic SOL transfer and token minting via CPI
    /// - Automatically deactivates offering when exhausted
    pub fn buy_shares_from_offering(ctx: Context<BuyShares>, amount: u64) -> Result<()> {
        
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

    /// Lists a business on the marketplace
    /// Sets is_listed to true, making the business available for investment
    /// 
    /// # Security
    /// - Only the business owner can list their business
    /// - Requires that total_shares > 0
    /// - Requires that price_per_share_lamports > 0
    /// - Requires that share_mint is initialized (not default)
    /// - Prevents double-listing (returns error if already listed)
    pub fn list_business(ctx: Context<ListBusiness>) -> Result<()> {
        let business = &mut ctx.accounts.business;
        
        // Validation: total_shares must be greater than zero
        require!(
            business.total_shares > 0,
            LocalshareError::InvalidShareAmount
        );
        
        // Validation: price_per_share_lamports must be greater than zero
        require!(
            business.price_per_share_lamports > 0,
            LocalshareError::InvalidPrice
        );
        
        // Validation: share_mint must be initialized (not default)
        require!(
            business.share_mint != Pubkey::default(),
            LocalshareError::InvalidBusiness
        );
        
        // Validation: business must not already be listed
        require!(
            !business.is_listed,
            LocalshareError::BusinessAlreadyListed
        );
        
        // Set business as listed
        business.is_listed = true;
        
        msg!("✅ Business listed successfully!");
        msg!("Business: {}", business.name);
        msg!("Total shares: {}", business.total_shares);
        msg!("Price per share: {} lamports", business.price_per_share_lamports);
        
        Ok(())
    }

    /// Allows investors to buy shares directly from a listed business
    /// Transfers SOL from buyer to treasury and transfers share tokens from vault to buyer
    ///
    /// # Security
    /// - Requires that the business is listed (is_listed == true)
    /// - Validates share availability in vault
    /// - Atomic SOL transfer and token transfer via CPI
    /// - Overflow protection for price calculations
    pub fn buy_shares(ctx: Context<BuySharesFromBusiness>, amount_shares: u64) -> Result<()> {
        let business = &ctx.accounts.business;
        
        // Validation: Business must be listed
        require!(
            business.is_listed,
            LocalshareError::OfferingNotActive // Reusing error, or could create new one
        );
        
        // Validation: Amount must be greater than zero
        require!(
            amount_shares > 0,
            LocalshareError::InvalidShareAmount
        );
        
        // Validation: There must be enough shares in the vault
        require!(
            ctx.accounts.shares_vault.amount >= amount_shares,
            LocalshareError::InsufficientShares
        );
        
        // Calculate total cost with overflow protection
        let amount_lamports = business
            .price_per_share_lamports
            .checked_mul(amount_shares)
            .ok_or(LocalshareError::MathOverflow)?;
        
        msg!("💰 Processing purchase of {} shares", amount_shares);
        msg!("Price per share: {} lamports", business.price_per_share_lamports);
        msg!("Total cost: {} lamports", amount_lamports);
        
        // Transfer SOL from buyer to treasury
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            amount_lamports,
        )?;
        
        msg!("✅ SOL transferred to treasury: {} lamports", amount_lamports);
        
        // Transfer share tokens from shares_vault to buyer_shares_ata
        // The shares_vault authority is share_mint_authority, so we sign with that PDA
        let business_key = business.key();
        let seeds = &[
            b"share_mint_authority",
            business_key.as_ref(),
            &[ctx.bumps.share_mint_authority],
        ];
        let signer = &[&seeds[..]];
        
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.shares_vault.to_account_info(),
                    to: ctx.accounts.buyer_shares_ata.to_account_info(),
                    authority: ctx.accounts.share_mint_authority.to_account_info(),
                },
                signer,
            ),
            amount_shares,
        )?;
        
        msg!("✅ Shares transferred to buyer: {}", amount_shares);
        msg!("✅ Purchase completed successfully!");
        msg!("Buyer: {}", ctx.accounts.buyer.key());
        msg!("Treasury: {}", ctx.accounts.treasury.key());
        msg!("Remaining shares in vault: {}", ctx.accounts.shares_vault.amount - amount_shares);
        
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
    
    /// Total number of shares issued
    pub total_shares: u64,
    
    /// Price per share in lamports
    pub price_per_share_lamports: u64,
    
    /// Treasury account for receiving payments
    pub treasury: Pubkey,
    
    /// Whether the business is listed on the marketplace
    pub is_listed: bool,
    
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

/// Authority for minting business equity share tokens
/// PDA: ["share_mint_authority", business.key()]
#[account]
pub struct ShareMintAuthority {
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

/// Context for registering a new business or updating an existing one
/// Allows entrepreneurs to create their business profile or update business name
#[derive(Accounts)]
pub struct RegisterBusiness<'info> {
    /// Business account PDA: ["business", owner.key()]
    /// Space: 8 (discriminator) + 32 (owner) + (4 + 50) (name) + 32 (share_mint) + 8 (total_shares) + 8 (price_per_share_lamports) + 32 (treasury) + 1 (is_listed) + 1 (bump) = 176 bytes
    #[account(
        init_if_needed,
        seeds = [b"business", owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 + (4 + 50) + 32 + 8 + 8 + 32 + 1 + 1
    )]
    pub business: Account<'info, Business>,

    /// Mint account for business shares
    /// PDA: ["mint", business.key()]
    #[account(
        init_if_needed,
        seeds = [b"mint", business.key().as_ref()],
        bump,
        payer = owner,
        mint::decimals = 0,
        mint::authority = mint_authority.key(),
        mint::freeze_authority = mint_authority.key(),
    )]
    pub mint: Account<'info, Mint>,

    /// Mint authority PDA for the business
    /// PDA: ["mint_authority", business.key()]
    #[account(
        init_if_needed,
        seeds = [b"mint_authority", business.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 + 1
    )]
    pub mint_authority: Account<'info, MintAuthority>,

    /// Owner's token account for receiving shares
    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    /// Business owner (signer)
    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Context for configuring a business offering
/// Allows the business owner to set offering parameters
#[derive(Accounts)]
pub struct ConfigureOffering<'info> {
    /// Business account being configured
    /// Must be mutable to update offering parameters
    /// Uses has_one constraint to ensure only the owner can call this
    #[account(
        mut,
        has_one = owner @ LocalshareError::InvalidBusinessOwner
    )]
    pub business: Account<'info, Business>,

    /// Business owner (signer)
    /// Must match the owner field in the business account
    #[account(mut)]
    pub owner: Signer<'info>,

    /// System program (for potential future use)
    pub system_program: Program<'info, System>,
}

/// Context for initializing the share mint and vault
/// Creates an SPL mint for business equity tokens and mints all shares into a vault
#[derive(Accounts)]
pub struct InitShareMint<'info> {
    /// Business account being configured
    /// Must be mutable to update share_mint field
    /// Uses has_one constraint to ensure only the owner can call this
    #[account(
        mut,
        has_one = owner @ LocalshareError::InvalidBusinessOwner
    )]
    pub business: Account<'info, Business>,

    /// Business owner (signer)
    /// Must match the owner field in the business account
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Share mint account for business equity tokens
    /// PDA: ["share_mint", business.key()]
    #[account(
        init,
        payer = owner,
        seeds = [b"share_mint", business.key().as_ref()],
        bump,
        mint::decimals = 0,
        mint::authority = share_mint_authority,
        mint::freeze_authority = share_mint_authority,
    )]
    pub share_mint: Account<'info, Mint>,

    /// Authority for the share mint
    /// PDA: ["share_mint_authority", business.key()]
    #[account(
        init,
        payer = owner,
        seeds = [b"share_mint_authority", business.key().as_ref()],
        bump,
        space = 8 + 32 + 1
    )]
    pub share_mint_authority: Account<'info, ShareMintAuthority>,

    /// Token vault for storing all business shares
    /// PDA: ["shares_vault", business.key()]
    #[account(
        init,
        payer = owner,
        seeds = [b"shares_vault", business.key().as_ref()],
        bump,
        token::mint = share_mint,
        token::authority = share_mint_authority,
    )]
    pub shares_vault: Account<'info, TokenAccount>,

    /// Token program for SPL token operations
    pub token_program: Program<'info, Token>,

    /// System program for account creation
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

/// Context for listing a business on the marketplace
/// Allows the business owner to make their business available for investment
#[derive(Accounts)]
pub struct ListBusiness<'info> {
    /// Business account being listed
    /// Must be mutable to update is_listed field
    /// Uses has_one constraint to ensure only the owner can call this
    #[account(
        mut,
        has_one = owner @ LocalshareError::InvalidBusinessOwner
    )]
    pub business: Account<'info, Business>,

    /// Business owner (signer)
    /// Must match the owner field in the business account
    pub owner: Signer<'info>,

    /// System program (for potential future use)
    pub system_program: Program<'info, System>,
}

/// Context for buying shares directly from a listed business
/// Allows investors to purchase shares by transferring SOL to treasury and receiving tokens from vault
#[derive(Accounts)]
pub struct BuySharesFromBusiness<'info> {
    /// Buyer who is purchasing the shares
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// Business account from which shares are being purchased
    /// Must be mutable to potentially track state changes
    #[account(
        mut,
        constraint = business.share_mint == share_mint.key() @ LocalshareError::InvalidBusiness
    )]
    pub business: Account<'info, Business>,

    /// Shares vault PDA that holds all the business shares
    /// PDA: ["shares_vault", business.key()]
    #[account(
        mut,
        seeds = [b"shares_vault", business.key().as_ref()],
        bump,
        constraint = shares_vault.mint == share_mint.key() @ LocalshareError::InvalidBusiness
    )]
    pub shares_vault: Account<'info, TokenAccount>,

    /// Treasury account that receives SOL payments
    /// Must match business.treasury
    #[account(
        mut,
        constraint = treasury.key() == business.treasury @ LocalshareError::InvalidBusiness
    )]
    /// CHECK: Validated by constraint above
    pub treasury: SystemAccount<'info>,

    /// Buyer's associated token account to receive the share tokens
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = share_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_shares_ata: Account<'info, TokenAccount>,

    /// Share mint account for the business
    #[account(
        constraint = share_mint.key() == business.share_mint @ LocalshareError::InvalidBusiness
    )]
    pub share_mint: Account<'info, Mint>,

    /// Share mint authority PDA that controls the shares_vault
    /// PDA: ["share_mint_authority", business.key()]
    #[account(
        seeds = [b"share_mint_authority", business.key().as_ref()],
        bump,
        constraint = share_mint_authority.business == business.key() @ LocalshareError::InvalidBusiness
    )]
    pub share_mint_authority: Account<'info, ShareMintAuthority>,

    /// Token program for SPL token operations
    pub token_program: Program<'info, Token>,

    /// System program for SOL transfers
    pub system_program: Program<'info, System>,

    /// Associated token program for ATA creation
    pub associated_token_program: Program<'info, AssociatedToken>,

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
    
    #[msg("Business is already initialized and cannot be re-initialized")]
    BusinessAlreadyInitialized,
    
    #[msg("Business is already listed on the marketplace")]
    BusinessAlreadyListed,
}
