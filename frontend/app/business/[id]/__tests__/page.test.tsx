import { render, screen, fireEvent } from '@testing-library/react'
import BusinessDetailPage from '../page'
import * as wallet from '@solana/wallet-adapter-react'
import * as hook from '../../../hooks/useLocalshareProgram'

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn(),
}))

jest.mock('../../../hooks/useLocalshareProgram', () => ({
  useLocalshareProgram: jest.fn(),
}))

describe('BusinessDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(wallet.useWallet as jest.Mock).mockReturnValue({ connected: true, publicKey: 'pub' })
    ;(hook.useLocalshareProgram as jest.Mock).mockReturnValue({ program: null })
  })

  it('calculates shares based on investment amount', () => {
    render(<BusinessDetailPage params={{ id: 'st-peters-bakery' }} />)
    fireEvent.change(screen.getByPlaceholderText(/Minimum \$/), { target: { value: '1700' } })
    expect(screen.getByText(/You will receive/)).toBeInTheDocument()
  })
})