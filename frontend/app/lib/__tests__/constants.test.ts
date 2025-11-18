import { getExplorerUrl, PROGRAM_ID, FEATURE_FLAGS, RPC_CONFIG } from '../constants'
import { PublicKey } from '@solana/web3.js'

// Mock environment variables
const originalEnv = process.env

describe('constants', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('PROGRAM_ID', () => {
    it('uses default program ID when no env var is set', () => {
      delete process.env.NEXT_PUBLIC_PROGRAM_ID
      // Import after env reset
      const { PROGRAM_ID } = require('../constants')
      expect(PROGRAM_ID).toBeInstanceOf(PublicKey)
      expect(PROGRAM_ID.toString()).toBe('8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y')
    })

    it('uses custom program ID from environment', () => {
      process.env.NEXT_PUBLIC_PROGRAM_ID = '11111111111111111111111111111112'
      // Force module reload
      jest.resetModules()
      const { PROGRAM_ID } = require('../constants')
      expect(PROGRAM_ID.toString()).toBe('11111111111111111111111111111112')
    })
  })

  describe('getExplorerUrl', () => {
    it('returns mainnet explorer URL when network is mainnet-beta', () => {
      process.env.NEXT_PUBLIC_SOLANA_NETWORK = 'mainnet-beta'
      jest.resetModules()
      const { getExplorerUrl } = require('../constants')

      const signature = 'test-signature'
      const url = getExplorerUrl(signature)

      expect(url).toBe('https://explorer.solana.com/tx/test-signature')
    })

    it('returns devnet explorer URL when network is devnet', () => {
      process.env.NEXT_PUBLIC_SOLANA_NETWORK = 'devnet'
      jest.resetModules()
      const { getExplorerUrl } = require('../constants')

      const signature = 'test-signature'
      const url = getExplorerUrl(signature)

      expect(url).toBe('https://explorer.solana.com/tx/test-signature?cluster=devnet')
    })

    it('returns custom network explorer URL', () => {
      process.env.NEXT_PUBLIC_SOLANA_NETWORK = 'localnet'
      jest.resetModules()
      const { getExplorerUrl } = require('../constants')

      const signature = 'test-signature'
      const url = getExplorerUrl(signature)

      expect(url).toBe('https://explorer.solana.com/tx/test-signature?cluster=localnet')
    })
  })

  describe('FEATURE_FLAGS', () => {
    it('enables features by default', () => {
      const { FEATURE_FLAGS } = require('../constants')

      expect(FEATURE_FLAGS.ENABLE_INVESTMENT).toBe(true)
      expect(FEATURE_FLAGS.ENABLE_REGISTRATION).toBe(true)
    })

    it('disables investment feature when env var is set to false', () => {
      process.env.NEXT_PUBLIC_ENABLE_INVESTMENT = 'false'
      jest.resetModules()
      const { FEATURE_FLAGS } = require('../constants')

      expect(FEATURE_FLAGS.ENABLE_INVESTMENT).toBe(false)
      expect(FEATURE_FLAGS.ENABLE_REGISTRATION).toBe(true)
    })

    it('disables registration feature when env var is set to false', () => {
      process.env.NEXT_PUBLIC_ENABLE_REGISTRATION = 'false'
      jest.resetModules()
      const { FEATURE_FLAGS } = require('../constants')

      expect(FEATURE_FLAGS.ENABLE_INVESTMENT).toBe(true)
      expect(FEATURE_FLAGS.ENABLE_REGISTRATION).toBe(false)
    })
  })

  describe('RPC_CONFIG', () => {
    it('has correct commitment levels', () => {
      expect(RPC_CONFIG.commitment).toBe('confirmed')
      expect(RPC_CONFIG.preflightCommitment).toBe('confirmed')
    })
  })
})
