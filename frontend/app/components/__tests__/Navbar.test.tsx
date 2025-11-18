import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from '../Navbar'
import { usePathname } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock Solana wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn(),
}))

jest.mock('@solana/wallet-adapter-react-ui', () => ({
  WalletMultiButton: ({ className }: { className: string }) => (
    <button className={className}>Connect Wallet</button>
  ),
}))

describe('Navbar', () => {
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
  const mockUseWallet = require('@solana/wallet-adapter-react').useWallet as jest.MockedFunction<any>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the logo and navigation items when wallet is not connected', () => {
    mockUsePathname.mockReturnValue('/')
    mockUseWallet.mockReturnValue({ connected: false })

    render(<Navbar />)

    expect(screen.getByText('Localshare')).toBeInTheDocument()
    expect(screen.getByText('Invest Local')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Explore Businesses')).toBeInTheDocument()
    expect(screen.queryByText('My Dashboard')).not.toBeInTheDocument()
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })

  it('shows dashboard link when wallet is connected', () => {
    mockUsePathname.mockReturnValue('/')
    mockUseWallet.mockReturnValue({ connected: true })

    render(<Navbar />)

    expect(screen.getByText('My Dashboard')).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    mockUsePathname.mockReturnValue('/marketplace')
    mockUseWallet.mockReturnValue({ connected: false })

    render(<Navbar />)

    const homeLink = screen.getByText('Home')
    const marketplaceLink = screen.getByText('Explore Businesses')

    expect(homeLink).not.toHaveClass('text-emerald-400')
    expect(marketplaceLink).toHaveClass('text-emerald-400')
  })

  it('renders wallet button with correct styling', () => {
    mockUsePathname.mockReturnValue('/')
    mockUseWallet.mockReturnValue({ connected: false })

    render(<Navbar />)

    const walletButton = screen.getByText('Connect Wallet')
    expect(walletButton).toHaveClass('!bg-gradient-to-r', 'from-emerald-500', 'to-sky-500')
  })
})
