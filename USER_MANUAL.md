# Localshare User Manual

## Overview
Localshare is a decentralized application (dApp) on Solana that allows local businesses to tokenize and sell shares to investors. This manual guides you through the complete process of registering a business, configuring an offering, and buying shares.

## Prerequisites

### For Business Owners
- A Solana wallet (Phantom, Solflare, etc.)
- Devnet SOL (test tokens - get free from [Solana Faucet](https://faucet.solana.com/))
- Basic understanding of blockchain transactions

### For Investors
- A Solana wallet
- Devnet SOL for purchasing shares
- Understanding of token investments

## Network Configuration

**Current Network**: Devnet (Testnet)
- **Program ID**: `91CC3aZEnHLe7VvnE9wXwY4TPUTLR4EKfRAZYNjRPM2a`
- **Frontend URL**: https://localshare-nine.vercel.app/ (or your local deployment)
- **Explorer**: https://explorer.solana.com/?cluster=devnet

⚠️ **IMPORTANT**: This is an educational prototype. Use only Devnet SOL. Do not use real funds!

## Business Owner Journey

### Step 1: Connect Your Wallet

1. Open the Localshare frontend
2. Click "Connect Wallet" in the top right
3. Select your wallet (Phantom, Solflare, etc.)
4. Approve the connection
5. Ensure your wallet is set to **Devnet** network

### Step 2: Register Your Business

1. Navigate to `/onboarding/business` or click "Register Business"
2. Enter your business name (max 50 characters)
3. Click "Register Business"
4. Approve the transaction in your wallet
5. Wait for confirmation (you'll be redirected to the dashboard)

**What happens**:
- A Business account is created on-chain
- Your business is registered with your wallet as the owner
- Initial state: Not listed, no shares configured

### Step 3: Configure Your Offering

1. Go to `/dashboard/business`
2. You'll see a step-by-step guide
3. **Step 1: Configure Offering**
   - Enter **Total Shares**: The total number of shares you want to offer (e.g., 1000)
   - Enter **Price per Share (in SOL)**: Price in SOL (e.g., 0.001)
   - Enter **Treasury Address**: Wallet address to receive payments (defaults to your wallet)
4. Click "Configure Offering"
5. Approve the transaction

**What happens**:
- Your offering parameters are saved on-chain
- Business is still not listed (next step)

### Step 4: Create Share Token

1. After configuring the offering, you'll see **Step 2: Create Share Token**
2. Review the summary:
   - Total shares
   - Price per share
3. Click "Create Share Token"
4. Approve the transaction

**What happens**:
- A new SPL token mint is created (decimals = 0, whole shares only)
- All shares are minted into a vault controlled by the program
- The share mint address is saved to your business account

### Step 5: Publish on Marketplace

1. After creating the token, you'll see **Step 3: Publish on Marketplace**
2. Review that everything is correct
3. Click "Publish"
4. Approve the transaction

**What happens**:
- Your business is marked as `is_listed = true`
- It becomes visible on the marketplace
- Investors can now purchase shares

### Step 6: Monitor Your Business

Once published, you can:
- View your business on the marketplace
- See available shares (decreases as investors buy)
- Monitor treasury balance (increases with each purchase)

## Investor Journey

### Step 1: Connect Your Wallet

1. Open the Localshare frontend
2. Connect your wallet (set to Devnet)
3. Ensure you have Devnet SOL for purchases

### Step 2: Browse the Marketplace

1. Navigate to `/marketplace`
2. You'll see all listed businesses
3. Each card shows:
   - Business name
   - Price per share (in SOL)
   - Available shares / Total shares
   - Progress bar

### Step 3: View Business Details

1. Click on a business card
2. You'll see:
   - Business name
   - Owner address
   - Treasury address
   - Share mint address
   - Total shares
   - Available shares
   - Price per share

### Step 4: Buy Shares

1. On the business detail page, find the "Buy Shares" section
2. Enter the number of shares you want to buy
3. Review the total cost (calculated automatically)
4. Click "Buy Shares"
5. Approve the transaction in your wallet

**What happens**:
- SOL is transferred from your wallet to the business treasury
- Share tokens are transferred from the vault to your wallet
- Your wallet receives the share tokens (you can view them in Phantom)

### Step 5: View Your Portfolio

1. Navigate to the marketplace
2. Check the Portfolio sidebar
3. You'll see your share token balances

## Transaction Fees

All transactions on Solana require a small fee (typically 0.000005 SOL):
- Register business: ~0.002 SOL (account creation)
- Configure offering: ~0.000005 SOL
- Create share token: ~0.01 SOL (mint + vault creation)
- List business: ~0.000005 SOL
- Buy shares: ~0.00001 SOL + cost of shares

## Troubleshooting

### "Insufficient Funds"
- **Solution**: Get more Devnet SOL from the faucet
- **Faucet**: https://faucet.solana.com/

### "Business not found"
- **Solution**: Ensure you're using the correct wallet that registered the business
- Check that you're on Devnet network

### "Transaction failed"
- **Solution**: 
  - Check browser console for error details
  - Ensure wallet has enough SOL for fees
  - Verify you're on Devnet
  - Try refreshing the page

### "IDL mismatch"
- **Solution**: The frontend IDL may be out of sync
- Contact the developer to sync the IDL

### "Account already in use"
- **Solution**: This usually means the business is already registered
- Try going to the dashboard instead

## Understanding Share Tokens

### What are Share Tokens?
- SPL tokens representing ownership in a business
- Decimals = 0 (whole shares only, no fractions)
- Non-transferable by default (can be made transferable by business owner)

### Where are they stored?
- Initially: In the program-controlled vault
- After purchase: In your wallet's Associated Token Account (ATA)

### How to view them?
- In Phantom: Go to "Tokens" tab
- In Solana Explorer: Search your wallet address
- The token will show the mint address and your balance

## Security Best Practices

1. **Never share your private key or seed phrase**
2. **Always verify transactions** before approving
3. **Use Devnet only** for testing
4. **Double-check addresses** before sending funds
5. **Keep your wallet software updated**

## Common Workflows

### Complete Business Setup
```
1. Connect wallet → 2. Register business → 3. Configure offering → 
4. Create token → 5. Publish → Done!
```

### Complete Investment
```
1. Connect wallet → 2. Browse marketplace → 3. Select business → 
4. Enter shares → 5. Buy → Done!
```

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify you're on Devnet network
3. Ensure you have sufficient SOL for fees
4. Check Solana Explorer for transaction status

## Technical Details

- **Program**: Anchor framework (Rust)
- **Frontend**: Next.js with TypeScript
- **Wallet**: Solana Wallet Adapter
- **Network**: Solana Devnet
- **Token Standard**: SPL Token (decimals = 0)

## Notes

- This is an **educational prototype**
- All transactions are on **Devnet** (testnet)
- **Do not use real funds**
- Share tokens are for demonstration purposes only
- The system is designed for testing and learning

---

**Last Updated**: Based on program version deployed to devnet
**Program ID**: `91CC3aZEnHLe7VvnE9wXwY4TPUTLR4EKfRAZYNjRPM2a`

