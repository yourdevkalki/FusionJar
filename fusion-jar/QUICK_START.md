# 🚀 Quick Start Guide - Phase 2

Get Fusion Jar running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MetaMask browser extension
- Supabase account (free tier works)
- 1inch API key (free tier available)

## Step 1: Clone and Setup

```bash
# Navigate to the project directory
cd fusion-jar

# Install dependencies
npm install
```

## Step 2: Environment Setup

Create `.env.local` file:

```bash
# Copy the template
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

Fill in your credentials:

```env
# Supabase (get from https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# 1inch API (get from https://portal.1inch.dev)
INCH_API_KEY=your_1inch_api_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Database Setup

1. **Go to Supabase Dashboard**

   - Visit [supabase.com](https://supabase.com)
   - Create new project or use existing

2. **Run Schema Script**

   - Go to SQL Editor
   - Copy contents of `database/schema.sql`
   - Paste and execute

3. **Verify Tables**
   - Check Table Editor
   - Should see: `investment_intents`, `investment_executions`, `gamification_data`, `resolver_data`

## Step 4: Run the App

```bash
npm run dev
```

Visit: http://localhost:3000

## Step 5: Test the Features

### Test Investment Creation

1. **Connect Wallet**

   - Click "Connect Wallet" in header
   - Approve MetaMask connection

2. **Create Investment**

   - Go to `/create` page
   - Select source: Ethereum → USDT
   - Select target: Ethereum → USDC
   - Set amount: $5
   - Choose frequency: Weekly
   - Click "Get Quote Preview"
   - Click "Create Investment Intent"

3. **Check Portfolio**
   - Go to `/portfolio` page
   - Should see your investment intent
   - View portfolio summary

### Test API Endpoints

```bash
# Test quote endpoint
curl -X POST http://localhost:3000/api/investments/quote \
  -H "Content-Type: application/json" \
  -d '{
    "src": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "dst": "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C",
    "amount": "5000000",
    "from": "0x1234567890123456789012345678901234567890",
    "chainId": 1
  }'
```

## 🎯 What's Working

✅ **Investment Form**

- Multi-chain token selection
- Amount validation ($1-$10)
- Frequency options (daily/weekly)
- Fee tolerance slider
- Real-time quote preview

✅ **1inch Integration**

- Quote fetching
- Intent creation
- Error handling
- Multi-chain support

✅ **Portfolio Dashboard**

- Investment summary
- Active intents list
- Execution history
- Performance metrics

✅ **Database**

- Investment intents storage
- Execution tracking
- Gamification data
- Proper indexing

## 🚨 Common Issues

### "User address not found"

- Make sure wallet is connected
- Check MetaMask is unlocked
- Try refreshing the page

### "Failed to get quote"

- Verify 1inch API key is correct
- Check API key has proper permissions
- Ensure token addresses are valid

### "Database error"

- Verify Supabase credentials
- Check if schema was executed
- Ensure tables exist in Supabase

### "Wallet connection failed"

- Install MetaMask extension
- Make sure you're on a supported network
- Try switching networks in MetaMask

## 🔧 Debug Mode

Enable detailed logging:

```bash
# Add to .env.local
DEBUG=true
```

Check browser console and terminal for detailed error messages.

## 📱 Mobile Testing

The app is responsive! Test on:

- iPhone Safari
- Android Chrome
- Tablet browsers

## 🎉 Success!

You now have a fully functional:

- Investment creation system
- 1inch Fusion+ integration
- Portfolio tracking
- Multi-chain support

Ready for Phase 3: Investment Scheduler & Gamification!
