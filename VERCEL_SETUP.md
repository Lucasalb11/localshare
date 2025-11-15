# Vercel Setup - Quick Guide

## 🚀 Current Deployment

**Live URL:** https://localshare-nine.vercel.app

**Status:** ✅ Deployed on Devnet

## ⚙️ Environment Variables Configuration

### Required Variables (Already Configured)

Go to your Vercel project → Settings → Environment Variables

```bash
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y
```

### Optional (Highly Recommended for Better Performance)

```bash
# Get free API key from https://www.helius.dev/
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

## 📝 Quick Steps After Push

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update: English translation and security improvements"
   git push origin main
   ```

2. **Auto-Deploy**
   - Vercel automatically detects the push
   - Builds and deploys in ~2-3 minutes
   - Check deployment status at https://vercel.com/dashboard

3. **Verify Deployment**
   - Visit https://localshare-nine.vercel.app
   - Check console for any errors
   - Test wallet connection
   - Browse marketplace
   - Test one transaction

## 🔒 Security Checklist

### ✅ Already Implemented

- [x] Security headers in next.config.js
- [x] HTTPS enforced
- [x] Environment variables for sensitive data
- [x] XSS protection (Next.js defaults)
- [x] Input validation
- [x] Proper error handling
- [x] No private keys in code
- [x] Devnet only (no real money risk)

### ⚠️ Recommended Next Steps

1. **Get Dedicated RPC** (Free tier available)
   - Sign up at [Helius.dev](https://www.helius.dev/)
   - Create Devnet project
   - Add API key to Vercel env vars
   - Benefits: Better speed, reliability, higher limits

2. **Monitor Deployment**
   - Enable Vercel Analytics
   - Watch for errors in console
   - Track user feedback

3. **Test Thoroughly**
   - Test on mobile devices
   - Try different wallets (Phantom, Solflare)
   - Test with real users
   - Gather feedback

## 🐛 Common Issues

### Issue: Website still shows Portuguese

**Solution:** 
- Deployment takes 2-3 minutes
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check Vercel deployment logs

### Issue: Wallet won't connect

**Solution:**
- Make sure wallet is on Devnet
- Check browser console for errors
- Try different wallet
- Verify RPC endpoint is working

### Issue: Transactions fail

**Solution:**
- Ensure Program ID is correct in Vercel env vars
- Verify wallet has Devnet SOL
- Check Solana Explorer for error details
- Make sure Config PDA is initialized on program

## 📊 Current Configuration

### Network
- **Environment:** Devnet (Testnet)
- **Program ID:** `8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y`
- **RPC:** Public Solana RPC (or custom if configured)

### Features
- ✅ Marketplace browsing
- ✅ Business details viewing
- ✅ AI analysis display
- ✅ Wallet connection
- ⚠️ Investment flow (requires Config PDA initialization)
- ⚠️ Business registration (requires Config PDA initialization)

### Security
- ✅ Educational prototype disclaimers
- ✅ Devnet-only warnings
- ✅ Link to free test SOL
- ✅ Safe for testing and demonstration

## 🎓 User Instructions

### For Investors Testing
1. Visit https://localshare-nine.vercel.app
2. Click "Explore Businesses"
3. View business details
4. To test investment:
   - Get free test SOL: https://faucet.solana.com/
   - Switch wallet to Devnet
   - Connect wallet
   - Enter investment amount
   - Sign transaction

### For Business Owners Testing
1. Visit dashboard
2. Connect wallet (Devnet)
3. Fill business information
4. Complete 3-step registration
5. Review on-chain transaction

## 📞 Support

### If Something Breaks

1. **Check Vercel Logs**
   - Go to Vercel dashboard
   - Click on deployment
   - View "Functions" and "Build" logs

2. **Check Browser Console**
   - Press F12
   - Look for errors in Console tab
   - Check Network tab for failed requests

3. **Rollback if Needed**
   ```bash
   vercel rollback
   ```

### Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Solana Faucet](https://faucet.solana.com/)
- [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
- [Program on Explorer](https://explorer.solana.com/address/8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y?cluster=devnet)

## ✅ What's Ready

- ✅ Frontend fully translated to English
- ✅ Security headers configured
- ✅ RPC endpoint configurable
- ✅ Environment variables setup
- ✅ Auto-deployment from GitHub
- ✅ Mobile responsive
- ✅ Multiple wallet support
- ✅ Error handling
- ✅ User-friendly messages

## ⏭️ Next Steps

After confirming deployment works:

1. **Share for Testing**
   - Share URL with testers
   - Provide instructions for getting test SOL
   - Gather feedback

2. **Optional: Initialize Program**
   - Run `init_config` instruction if not done
   - Required for investment/registration features
   - Only needed once per program

3. **Monitor and Iterate**
   - Watch for user issues
   - Fix bugs as discovered
   - Improve based on feedback

---

**Last Updated:** January 2025

**Status:** ✅ Ready for Push → Auto-Deploy

**Current URL:** https://localshare-nine.vercel.app

