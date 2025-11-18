import { render } from '@testing-library/react'
import { SolanaProvider } from '../SolanaProvider'
import { clusterApiUrl, WalletAdapterNetwork } from '@solana/web3.js'

// Mock clusterApiUrl at the module level
jest.mock('@solana/web3.js', () => ({
  clusterApiUrl: jest.fn(),
  WalletAdapterNetwork: {
    Mainnet: 'mainnet-beta',
    Devnet: 'devnet',
  },
}))

// Mock Solana wallet adapter components
jest.mock('@solana/wallet-adapter-react', () => ({
  ConnectionProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="connection-provider">{children}</div>,
  WalletProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="wallet-provider">{children}</div>,
}))

jest.mock('@solana/wallet-adapter-react-ui', () => ({
  WalletModalProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="wallet-modal-provider">{children}</div>,
}))

jest.mock('@solana/wallet-adapter-wallets', () => ({
  PhantomWalletAdapter: jest.fn().mockImplementation(() => ({})),
  SolflareWalletAdapter: jest.fn().mockImplementation(() => ({})),
}))

describe('SolanaProvider', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variables
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('renders providers with default devnet configuration', () => {
    const { getByTestId } = render(
      <SolanaProvider>
        <div>Test Child</div>
      </SolanaProvider>
    )

    expect(getByTestId('connection-provider')).toBeInTheDocument()
    expect(getByTestId('wallet-provider')).toBeInTheDocument()
    expect(getByTestId('wallet-modal-provider')).toBeInTheDocument()
    expect(getByTestId('wallet-modal-provider')).toHaveTextContent('Test Child')
  })

  it('uses custom RPC endpoint when provided', () => {
    process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT = 'https://custom.rpc.endpoint'

    // Clear mock to verify it's not called
    const mockClusterApiUrl = clusterApiUrl as jest.MockedFunction<typeof clusterApiUrl>
    mockClusterApiUrl.mockClear()

    render(
      <SolanaProvider>
        <div>Test</div>
      </SolanaProvider>
    )

    // clusterApiUrl should not be called when custom endpoint is provided
    expect(mockClusterApiUrl).not.toHaveBeenCalled()
  })

  it('uses localnet endpoint when network is localnet', () => {
    process.env.NEXT_PUBLIC_SOLANA_NETWORK = 'localnet'

    const mockClusterApiUrl = clusterApiUrl as jest.MockedFunction<typeof clusterApiUrl>
    mockClusterApiUrl.mockClear()

    render(
      <SolanaProvider>
        <div>Test</div>
      </SolanaProvider>
    )

    // clusterApiUrl should not be called for localnet
    expect(mockClusterApiUrl).not.toHaveBeenCalled()
  })

  it('uses mainnet clusterApiUrl when network is mainnet', () => {
    process.env.NEXT_PUBLIC_SOLANA_NETWORK = 'mainnet'

    const mockClusterApiUrl = clusterApiUrl as jest.MockedFunction<typeof clusterApiUrl>
    mockClusterApiUrl.mockReturnValue('https://api.mainnet.solana.com')

    render(
      <SolanaProvider>
        <div>Test</div>
      </SolanaProvider>
    )

    expect(mockClusterApiUrl).toHaveBeenCalledWith('mainnet-beta')
  })

  it('uses devnet clusterApiUrl by default', () => {
    const mockClusterApiUrl = clusterApiUrl as jest.MockedFunction<typeof clusterApiUrl>
    mockClusterApiUrl.mockReturnValue('https://api.devnet.solana.com')

    render(
      <SolanaProvider>
        <div>Test</div>
      </SolanaProvider>
    )

    expect(mockClusterApiUrl).toHaveBeenCalledWith('devnet')
  })
})
