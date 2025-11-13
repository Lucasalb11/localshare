use anchor_lang::prelude::*;

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
    pub fn init_config(ctx: Context<InitConfig>, payment_mint: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.config;
        
        // Set admin as the signer of this transaction
        config.admin = ctx.accounts.admin.key();
        
        // Set the mint used for payments (e.g., USDC, wrapped SOL)
        config.payment_mint = payment_mint;
        
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
        share_mint: Pubkey,
    ) -> Result<()> {
        let business = &mut ctx.accounts.business;
        
        // Validation: Name cannot be empty
        require!(!name.is_empty(), LocalshareError::EmptyBusinessName);
        
        // Validation: Name cannot exceed 50 characters
        require!(name.len() <= 50, LocalshareError::BusinessNameTooLong);
        
        // Initialize business fields
        business.owner = ctx.accounts.owner.key();
        business.name = name.clone();
        business.share_mint = share_mint;
        business.bump = ctx.bumps.business;
        
        msg!("✅ Business registered successfully!");
        msg!("Name: {}", name);
        msg!("Owner: {}", business.owner);
        msg!("Share Mint: {}", business.share_mint);
        
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
        
        msg!("✅ Oferta criada com sucesso!");
        msg!("Negócio: {}", offering.business);
        msg!("Preço por share: {} lamports", price_per_share);
        msg!("Shares disponíveis: {}", initial_shares);
        
        Ok(())
    }

    /// Permite que investidores comprem shares de um negócio
    /// Realiza a transferência de fundos e atribui as shares ao comprador
    /// 
    /// # Segurança
    /// - Valida que a oferta está ativa
    /// - Valida disponibilidade de shares
    /// - Transferência atômica de tokens via CPI
    /// - Desativa oferta automaticamente quando esgotada
    pub fn buy_shares(ctx: Context<BuyShares>, amount: u64) -> Result<()> {
        let offering = &mut ctx.accounts.offering;
        
        // Validação: Oferta deve estar ativa
        require!(offering.is_active, LocalshareError::OfferingNotActive);
        
        // Validação: Quantidade deve ser maior que zero
        require!(amount > 0, LocalshareError::InvalidShareAmount);
        
        // Validação: Deve haver shares suficientes disponíveis
        require!(
            amount <= offering.remaining_shares,
            LocalshareError::InsufficientShares
        );
        
        // Calcula o custo total com proteção contra overflow
        let total_cost = offering
            .price_per_share
            .checked_mul(amount)
            .ok_or(LocalshareError::MathOverflow)?;
        
        msg!("💰 Processando compra de {} shares", amount);
        msg!("Custo total: {} lamports", total_cost);
        
        // Transfere tokens do comprador para o dono do negócio usando CPI
        // Nota: Aqui usamos transfer direto de SOL para simplificar
        // Em produção, usar SPL Token Program para tokens customizados
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
        
        // Atualiza a quantidade de shares restantes
        offering.remaining_shares = offering
            .remaining_shares
            .checked_sub(amount)
            .ok_or(LocalshareError::MathOverflow)?;
        
        // Se não há mais shares, desativa a oferta automaticamente
        if offering.remaining_shares == 0 {
            offering.is_active = false;
            msg!("🔒 Oferta esgotada e desativada automaticamente");
        }
        
        msg!("✅ Compra realizada com sucesso!");
        msg!("Comprador: {}", ctx.accounts.buyer.key());
        msg!("Shares restantes: {}", offering.remaining_shares);
        
        Ok(())
    }
}

// ============================================================================
// Structs de Contas (Account State)
// ============================================================================

/// Configuração global do protocolo
/// PDA: ["config"]
#[account]
pub struct Config {
    /// Administrador do protocolo (pode atualizar configurações)
    pub admin: Pubkey,
    
    /// Mint do token usado para pagamentos (ex: USDC)
    pub payment_mint: Pubkey,
    
    /// Bump seed da PDA
    pub bump: u8,
}

/// Representa um negócio registrado no protocolo
/// PDA: ["business", owner.key()]
#[account]
pub struct Business {
    /// Proprietário do negócio (empresário)
    pub owner: Pubkey,
    
    /// Nome do negócio (máximo 50 caracteres)
    pub name: String,
    
    /// Mint das shares deste negócio (NFT ou Fungible Token)
    pub share_mint: Pubkey,
    
    /// Bump seed da PDA
    pub bump: u8,
}

/// Representa uma oferta de shares de um negócio
/// PDA: ["offering", business.key(), share_mint.key()]
#[account]
pub struct Offering {
    /// Referência ao negócio que criou esta oferta
    pub business: Pubkey,
    
    /// Mint das shares sendo oferecidas
    pub share_mint: Pubkey,
    
    /// Mint do token aceito como pagamento
    pub payment_mint: Pubkey,
    
    /// Preço por share (em lamports do payment_mint)
    pub price_per_share: u64,
    
    /// Quantidade de shares ainda disponíveis
    pub remaining_shares: u64,
    
    /// Se a oferta está ativa
    pub is_active: bool,
    
    /// Bump seed da PDA
    pub bump: u8,
}

// ============================================================================
// Structs de Contexto (Accounts) para as Instruções
// ============================================================================

/// Contexto para inicialização da configuração global
/// Pode ser chamado apenas uma vez para configurar o protocolo
#[derive(Accounts)]
pub struct InitConfig<'info> {
    /// Conta Config sendo inicializada como PDA
    /// Space: 8 (discriminator) + 32 (admin) + 32 (payment_mint) + 1 (bump) = 73 bytes
    #[account(
        init,
        seeds = [b"config"],
        bump,
        payer = admin,
        space = 8 + 32 + 32 + 1
    )]
    pub config: Account<'info, Config>,
    
    /// Administrador que paga pela criação e será definido como admin
    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// System program para criar a conta
    pub system_program: Program<'info, System>,
}

/// Contexto para registro de um novo negócio
/// Permite que empresários criem seu perfil de negócio
#[derive(Accounts)]
pub struct RegisterBusiness<'info> {
    /// Conta Business sendo inicializada como PDA
    /// Space: 8 (discriminator) + 32 (owner) + (4 + 50) (name String) + 32 (share_mint) + 1 (bump) = 127 bytes
    #[account(
        init,
        seeds = [b"business", owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 + (4 + 50) + 32 + 1
    )]
    pub business: Account<'info, Business>,
    
    /// Proprietário do negócio (empresário que paga pela criação)
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// System program para criar a conta
    pub system_program: Program<'info, System>,
}

/// Contexto para criação de uma oferta de shares
/// Permite que um negócio registrado crie uma oferta de shares
#[derive(Accounts)]
pub struct CreateOffering<'info> {
    /// Conta Offering sendo inicializada como PDA
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
    
    /// Conta Business que está criando a oferta
    /// Deve ter has_one = owner para validação
    #[account(has_one = owner)]
    pub business: Account<'info, Business>,
    
    /// Conta Config global para obter o payment_mint
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    
    /// Proprietário do negócio (deve assinar e pagar)
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// System program para criar a conta
    pub system_program: Program<'info, System>,
}

/// Contexto para compra de shares
/// Permite que investidores comprem shares de uma oferta ativa
#[derive(Accounts)]
pub struct BuyShares<'info> {
    /// Conta Offering de onde as shares serão compradas
    /// Deve ser mutável para atualizar remaining_shares
    #[account(
        mut,
        constraint = offering.business == business.key() @ LocalshareError::InvalidBusiness
    )]
    pub offering: Account<'info, Offering>,
    
    /// Conta Business relacionada à oferta
    #[account(has_one = owner @ LocalshareError::InvalidBusinessOwner)]
    pub business: Account<'info, Business>,
    
    /// Proprietário do negócio (recebe o pagamento)
    /// Referenciado como 'owner' pelo has_one constraint
    /// CHECK: Validado pelo constraint has_one no business
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,
    
    /// Comprador que está adquirindo as shares
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    /// System program (para transferências SOL)
    pub system_program: Program<'info, System>,
}

// ============================================================================
// Erros Customizados
// ============================================================================

#[error_code]
pub enum LocalshareError {
    #[msg("O nome do negócio não pode ser vazio")]
    EmptyBusinessName,
    
    #[msg("O nome do negócio não pode ter mais de 50 caracteres")]
    BusinessNameTooLong,
    
    #[msg("O preço por share deve ser maior que zero")]
    InvalidPrice,
    
    #[msg("A quantidade de shares deve ser maior que zero")]
    InvalidShareAmount,
    
    #[msg("Operação matemática resultou em overflow")]
    MathOverflow,
    
    #[msg("A oferta não está ativa")]
    OfferingNotActive,
    
    #[msg("Não há shares suficientes disponíveis")]
    InsufficientShares,
    
    #[msg("Negócio inválido ou não corresponde à oferta")]
    InvalidBusiness,
    
    #[msg("Proprietário do negócio inválido")]
    InvalidBusinessOwner,
}
