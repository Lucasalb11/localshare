# Localshare Lite — School of Solana Submission

## Overview
- A minimal, didactic Solana dApp where a local business registers, creates a share offering, and investors buy those shares on Devnet.
- On-chain program implements exactly 4 instructions and uses PDAs for state.

## Program
- Program ID (Devnet): `8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y`
- PDAs:
  - Config: `["config"]`
  - Business: `["business", owner]`
  - Offering: `["offering", business, share_mint]`

### Instructions
- `init_config`
  - Initializes global config with `admin` and sets `payment_mint = SystemProgram::ID` (native SOL).
  - PDA seeds: `config`.
- `register_business(name)`
  - Creates `Business` PDA for the `owner`.
  - Creates `Mint` PDA and `MintAuthority` PDA; mints initial supply (decimals = 0) to owner ATA.
  - Validates name (1–50 chars).
- `create_offering(price_per_share, initial_shares)`
  - Transfers `initial_shares` from owner ATA to the `offering_vault` ATA (authority = offering PDA).
  - Stores price, remaining, and marks as active.
- `buy_shares(amount)`
  - Transfers SOL from buyer → owner for `amount * price_per_share`.
  - Transfers `amount` tokens from `offering_vault` → buyer ATA using offering PDA signer seeds.
  - Deactivates when `remaining_shares == 0`.

### Accounts
- `Config { admin, payment_mint, bump }`
- `Business { owner, name, share_mint, bump }`
- `MintAuthority { business, bump }`
- `Offering { business, share_mint, payment_mint, price_per_share, remaining_shares, is_active, bump }`

## Tests
- TypeScript tests cover happy and unhappy paths for all 4 instructions.
- Happy: config init, business register (+ mint), offering create, buy shares, auto-deactivate.
- Unhappy: invalid name, zero price/shares, insufficient shares, inactive offering.
- Tests use deterministic PDAs and correct ATAs.

## Frontend
- Next.js App Router + Tailwind + Solana Wallet Adapter.
- Pages: Landing, Marketplace, Business Details, Dashboard, Register Business.
- Flows supported:
  - Init Config
  - Register Business (creates mint automatically)
  - Create Offering (moves shares to vault)
  - Buy Shares (SOL payment + token transfer)
- Anchor client uses synced IDL and `PROGRAM_ID` from env.

## Deployment
- Live: `https://localshare-nine.vercel.app`
- Ensure env vars:
  - `NEXT_PUBLIC_PROGRAM_ID=8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y`
  - `NEXT_PUBLIC_SOLANA_NETWORK=devnet`
  - Optional `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT`

## Usage Flow
1. Admin initializes config.
2. Business owner registers; mint and ATA created, initial supply minted to owner.
3. Owner creates offering; shares moved to offering vault.
4. Investor buys shares; SOL sent to owner; shares transferred from vault to buyer.

## Links
- Demo: https://localshare-nine.vercel.app
- Explorer (Devnet): https://explorer.solana.com/address/8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y?cluster=devnet
- Repo: https://github.com/Lucasalb11/localshare