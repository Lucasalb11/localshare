import { renderHook } from '@testing-library/react'
import { useLocalshareProgram } from '../useLocalshareProgram'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'

// Mock the wallet adapter hooks
jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: jest.fn(),
  useWallet: jest.fn(),
}))

// Mock AnchorProvider
const mockAnchorProvider = jest.fn().mockImplementation((connection, wallet, opts) => ({
  connection,
  wallet,
  opts,
}))

// Add defaultOptions as a static method
mockAnchorProvider.defaultOptions = jest.fn().mockReturnValue({
  preflightCommitment: 'confirmed',
  commitment: 'confirmed',
})

jest.mock('@coral-xyz/anchor', () => {
  const mockAP: any = jest.fn().mockImplementation((connection, wallet, opts) => ({ connection, wallet, opts }))
  mockAP.defaultOptions = jest.fn().mockReturnValue({ preflightCommitment: 'confirmed', commitment: 'confirmed' })
  return { AnchorProvider: mockAP }
})

// Mock the localshare program
jest.mock('../../lib/localshare', () => ({
  getLocalshareProgram: jest.fn().mockImplementation(() => ({
    programId: 'test-program-id',
  })),
}))

describe('useLocalshareProgram', () => {
  const mockUseConnection = useConnection as jest.MockedFunction<typeof useConnection>
  const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>
  const mockGetLocalshareProgram = require('../../lib/localshare').getLocalshareProgram

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null provider and program when wallet is not fully connected', () => {
    const mockConnection = new Connection('http://localhost:8899')
    mockUseConnection.mockReturnValue({ connection: mockConnection })
    mockUseWallet.mockReturnValue({
      publicKey: null,
      signTransaction: undefined,
      signAllTransactions: undefined,
    })

    const { result } = renderHook(() => useLocalshareProgram())

    expect(result.current.provider).toBeNull()
    expect(result.current.program).toBeNull()
    const { AnchorProvider } = require('@coral-xyz/anchor')
    expect(AnchorProvider).not.toHaveBeenCalled()
    expect(mockGetLocalshareProgram).not.toHaveBeenCalled()
  })

  it('returns null when wallet signTransaction is missing', () => {
    const mockConnection = new Connection('http://localhost:8899')
    mockUseConnection.mockReturnValue({ connection: mockConnection })
    mockUseWallet.mockReturnValue({
      publicKey: { toString: () => 'test-public-key' },
      signTransaction: undefined,
      signAllTransactions: jest.fn(),
    })

    const { result } = renderHook(() => useLocalshareProgram())

    expect(result.current.provider).toBeNull()
    expect(result.current.program).toBeNull()
  })

  it('returns null when wallet signAllTransactions is missing', () => {
    const mockConnection = new Connection('http://localhost:8899')
    mockUseConnection.mockReturnValue({ connection: mockConnection })
    mockUseWallet.mockReturnValue({
      publicKey: { toString: () => 'test-public-key' },
      signTransaction: jest.fn(),
      signAllTransactions: undefined,
    })

    const { result } = renderHook(() => useLocalshareProgram())

    expect(result.current.provider).toBeNull()
    expect(result.current.program).toBeNull()
  })

  it('creates provider and program when wallet is fully connected', () => {
    const mockConnection = new Connection('http://localhost:8899')
    const mockWallet = {
      publicKey: { toString: () => 'test-public-key' },
      signTransaction: jest.fn(),
      signAllTransactions: jest.fn(),
    }

    mockUseConnection.mockReturnValue({ connection: mockConnection })
    mockUseWallet.mockReturnValue(mockWallet)

    const { result } = renderHook(() => useLocalshareProgram())

    expect(result.current.provider).toBeTruthy()
    expect(result.current.program).toBeTruthy()
    expect(result.current.wallet).toBe(mockWallet)
    const { AnchorProvider } = require('@coral-xyz/anchor')
    expect(AnchorProvider).toHaveBeenCalledWith(
      mockConnection,
      mockWallet,
      expect.any(Object)
    )
    expect(mockGetLocalshareProgram).toHaveBeenCalledWith(result.current.provider)
  })

  it('handles AnchorProvider creation errors gracefully', () => {
    const mockConnection = new Connection('http://localhost:8899')
    const mockWallet = {
      publicKey: { toString: () => 'test-public-key' },
      signTransaction: jest.fn(),
      signAllTransactions: jest.fn(),
    }

    mockUseConnection.mockReturnValue({ connection: mockConnection })
    mockUseWallet.mockReturnValue(mockWallet)

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const { AnchorProvider } = require('@coral-xyz/anchor')
    AnchorProvider.mockImplementation(() => {
      throw new Error('AnchorProvider creation failed')
    })

    const { result } = renderHook(() => useLocalshareProgram())

    expect(result.current.provider).toBeNull()
    expect(result.current.program).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao criar provider:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('handles getLocalshareProgram errors gracefully', () => {
    const mockConnection = new Connection('http://localhost:8899')
    const mockWallet = {
      publicKey: { toString: () => 'test-public-key' },
      signTransaction: jest.fn(),
      signAllTransactions: jest.fn(),
    }

    mockUseConnection.mockReturnValue({ connection: mockConnection })
    mockUseWallet.mockReturnValue(mockWallet)

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const { AnchorProvider } = require('@coral-xyz/anchor')
    AnchorProvider.mockImplementation((connection:any, wallet:any, opts:any) => ({ connection, wallet, opts }))
    mockGetLocalshareProgram.mockImplementation(() => {
      throw new Error('Program creation failed')
    })

    const { result } = renderHook(() => useLocalshareProgram())

    // Program creation should fail
    expect(result.current.program).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao criar programa:', expect.any(Error))

    consoleSpy.mockRestore()
  })
})
