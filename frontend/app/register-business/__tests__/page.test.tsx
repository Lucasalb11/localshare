import { render, screen, fireEvent } from '@testing-library/react'
import RegisterBusinessPage from '../page'
import * as wallet from '@solana/wallet-adapter-react'
import * as hook from '../../hooks/useLocalshareProgram'

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn(),
}))

jest.mock('../../hooks/useLocalshareProgram', () => ({
  useLocalshareProgram: jest.fn(),
}))

describe('RegisterBusinessPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(wallet.useWallet as jest.Mock).mockReturnValue({ connected: false, publicKey: null })
    ;(hook.useLocalshareProgram as jest.Mock).mockReturnValue({ program: null })
  })

  it('shows connect wallet message when not connected', () => {
    render(<RegisterBusinessPage />)
    expect(screen.getByText('Register Your Business')).toBeInTheDocument()
    expect(screen.getByText('Connect your wallet to register your business on Localshare')).toBeInTheDocument()
  })

  it('shows connect wallet error when program is null', () => {
    ;(wallet.useWallet as jest.Mock).mockReturnValue({ connected: true, publicKey: 'pub' })
    render(<RegisterBusinessPage />)
    fireEvent.change(screen.getByPlaceholderText('Enter your business name'), { target: { value: 'New Biz' } })
    fireEvent.click(screen.getByText('Register Business'))
    expect(screen.getByText('Please connect your wallet first')).toBeInTheDocument()
  })

  it('validates length > 50 when program available', () => {
    ;(wallet.useWallet as jest.Mock).mockReturnValue({ connected: true, publicKey: 'pub' })
    ;(hook.useLocalshareProgram as jest.Mock).mockReturnValue({ program: {} })
    render(<RegisterBusinessPage />)
    fireEvent.change(screen.getByPlaceholderText('Enter your business name'), { target: { value: 'x'.repeat(51) } })
    fireEvent.click(screen.getByText('Register Business'))
    expect(screen.getByText('Business name cannot exceed 50 characters')).toBeInTheDocument()
  })
})