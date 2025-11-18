import { PublicKey, Keypair } from '@solana/web3.js'
import { getBusinessPda, getOfferingPda, getMintPda, getMintAuthorityPda } from '../../lib/localshare'

describe('Localshare PDA helpers', () => {
  beforeAll(() => {
    jest.spyOn(PublicKey, 'findProgramAddressSync').mockImplementation(() => [Keypair.generate().publicKey, 255])
  })
  const owner = new PublicKey('EwCiSnQEJTSZV4B9v4xRkJJFcDDFKA1i8NbyNAmXGm4z')

  it('derives business PDA', () => {
    const [pda1] = getBusinessPda(owner)
    expect(pda1).toBeInstanceOf(PublicKey)
  })

  it('derives mint and authority PDAs', () => {
    const [businessPda] = getBusinessPda(owner)
    const [mintPda] = getMintPda(businessPda)
    const [mintAuthPda] = getMintAuthorityPda(businessPda)
    expect(mintPda).toBeInstanceOf(PublicKey)
    expect(mintAuthPda).toBeInstanceOf(PublicKey)
  })

  it('derives offering PDA from business + share mint', () => {
    const [businessPda] = getBusinessPda(owner)
    const [mintPda] = getMintPda(businessPda)
    const [offeringPda] = getOfferingPda(businessPda, mintPda)
    expect(offeringPda).toBeInstanceOf(PublicKey)
  })
})