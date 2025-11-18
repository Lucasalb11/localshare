## Anchor Program
- Rename module references consistently to `my_program` or `localshare` (keep on-chain ID `8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y`).
- Fix `buy_shares` to transfer from the vault ATA owned by the `offering` PDA instead of minting new shares. Use signer seeds `["offering", business.key(), mint.key(), bump]`.
- Keep payment in native SOL for didactic scope. Store `payment_mint = SystemProgram::ID` to denote SOL and document this.
- Strengthen constraints and account types:
  - `associated_token_program: Program<AssociatedToken>` everywhere.
  - `create_offering`: assert `offering_vault.mint == mint.key()` and `owner_token_account.amount >= initial_shares`.
  - `buy_shares`: require `offering.is_active`, `amount > 0`, `amount <= offering.remaining_shares`, and `offering_vault.amount >= amount`.
  - Use `has_one = owner` on `Business` and validate `offering.business == business.key()`.
- Seed alignment (SoS requirement):
  - `Config`: seeds `[b"config"]`.
  - `Business`: seeds `[b"business", owner]`.
  - `Offering`: seeds `[b"offering", business, share_mint]`.
- Keep `register_business` responsible for mint creation with `mint_authority` PDA and mint initial supply to owner ATA (decimals = 0).
- Remove unused accounts from `buy_shares` (e.g., `mint_authority`) and add `offering_vault`.
- Regenerate IDL after code changes and sync it to `frontend/app/idl/localshare.json`.

## TypeScript Tests (Anchor)
- Replace current tests with aligned, deterministic tests using Devnet provider (or localnet in CI if preferred).
- Write ≥1 happy and ≥1 unhappy test per instruction:
  - `init_config`:
    - Happy: creates config, asserts `admin`, `payment_mint == SystemProgram.programId`.
    - Unhappy: second init fails due to PDA already initialized.
  - `register_business`:
    - Happy: creates `Business`, `Mint`, `MintAuthority`, owner ATA receives initial supply.
    - Unhappy: empty name / name > 50 chars.
  - `create_offering`:
    - Happy: transfers `initial_shares` from owner ATA → `offering_vault`, offering fields match, vault balance == `initial_shares`.
    - Unhappy: owner ATA insufficient balance; `price_per_share == 0`.
  - `buy_shares`:
    - Happy: SOL transfer from buyer → owner equals `amount * price_per_share`; token transfer from `offering_vault` → buyer ATA; `remaining_shares` decreases; auto-deactivate at 0.
    - Unhappy: amount 0; amount > remaining; offering inactive.
- Use deterministic PDAs via helpers; build mints/ATAs correctly with `anchor.utils.token`.
- Ensure tests call the program with the exact accounts the instructions require now.
- Run `anchor test` until all green.

## Frontend (Next.js App Router)
- Sync the regenerated IDL and remove any references to non-existent instructions (`create_business_mint`).
- Register Business page (`frontend/app/register-business/page.tsx:120`):
  - Remove the second “Create Share Mint” step; `register_business` already creates the mint and mints initial supply.
  - Keep validation and success feedback.
- Dashboard (`frontend/app/dashboard/page.tsx:104`):
  - Ensure `create_offering` passes `owner_token_account`, `offering_vault`, `mint`, `business`, `config`, and correct programs.
- Business Detail (Buy flow) (`frontend/app/business/[id]/page.tsx:104`):
  - Stop minting in buy; pass `offering_vault` and call the updated `buy_shares` that transfers from vault.
  - Replace the hardcoded owner with a minimal fetch to derive the real `business` and `offering` PDAs (or keep a documented demo mapping for lite prototype).
- Add basic input validation for pubkeys and numeric fields; keep clear status banners for pending → success → error.
- Ensure the Anchor client uses the synced IDL + `PROGRAM_ID`.

## Documentation
- Update root `README.md` to match reality:
  - Accurate overview, live link, Program ID, Explorer link.
  - How to run Anchor, tests, and frontend.
  - Short usage guide (init config → register business → create offering → buy shares).
  - Remove references to missing files and advanced features not implemented.
- Create `PROJECT_DESCRIPTION.md`:
  - Concise architecture, exact instruction list, PDA seeds, interaction flow, and links (demo, explorer, repo).
- Add `env.example` values used by the frontend (`NEXT_PUBLIC_PROGRAM_ID`, optional RPC).

## Deployment
- Verify the frontend builds: `npm install && npm run build` in `frontend`.
- Keep Vercel project root pointing to `frontend/`; ensure env vars exist in Vercel.
- Smoke-test the live site against Devnet using Phantom (connect, register, create offering, buy shares) after IDL sync.

## Verification & Deliverables
- All tests passing (happy + unhappy) across all four instructions.
- Program IDL regenerated and synced to the frontend.
- Frontend flows functional on Devnet with clear feedback and input validation.
- Clean constraints, correct PDAs, safe token + SOL transfers.
- Updated documentation ready for School of Solana submission.

## Noted Issues To Fix
- `buy_shares` currently mints new tokens instead of transferring from vault (`anchor_project/programs/my_program/src/lib.rs:172`).
- `init_config` sets `payment_mint` to `SystemProgram::ID`; tests expect a random mint (`anchor_project/tests/integration.ts:90`). Align tests to SOL.
- Frontend IDL contains `create_business_mint` which is not implemented (`frontend/app/idl/localshare.json:239`). Remove usage and sync IDL.
- Buy page uses a hardcoded owner pubkey for PDAs (`frontend/app/business/[id]/page.tsx:82`). Replace with real business/offering derivation or document demo mapping.
- Ensure `associated_token_program` accounts use `Program<AssociatedToken>` instead of `UncheckedAccount`.

If you approve, I will implement the code changes, rewrite tests, regenerate IDL, update the frontend, and deliver the verified, fully working Devnet deployment with documentation.