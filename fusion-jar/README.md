# Fusion Jar - Phase 2 Implementation

A gamified, gasless, cross-chain micro-investment platform using 1inch Fusion+.

## 🚀 Features Implemented (Phase 2)

### ✅ Investment Intent Creation

- **Multi-chain support**: Ethereum, Polygon, BSC
- **Token selection**: Popular tokens on each chain
- **Amount validation**: $1-$10 range with decimal support
- **Frequency options**: Daily or weekly investments
- **Fee tolerance**: Configurable 0.1%-2% range
- **Quote preview**: Real-time 1inch Fusion+ quotes

### ✅ 1inch Fusion+ Integration

- **Quote fetching**: Real-time swap quotes
- **Intent creation**: Off-chain swap intent signing
- **Error handling**: Graceful fallbacks for API failures
- **Multi-chain support**: Works across all supported chains

### ✅ Portfolio Tracking

- **Investment summary**: Total invested, current value, ROI
- **Success metrics**: Success rate, total executions
- **Investment history**: Detailed execution records
- **Active intents**: Current investment strategies
- **Real-time updates**: Live portfolio data

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 1inch API
INCH_API_KEY=your_1inch_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

1. **Create Supabase Project**:

   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Run Database Schema**:

   - Go to your Supabase SQL Editor
   - Copy and paste the contents of `database/schema.sql`
   - Execute the script to create all tables

3. **Verify Tables**:
   - Check that the following tables were created:
     - `investment_intents`
     - `investment_executions`
     - `gamification_data`
     - `resolver_data`

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
fusion-jar/
├── app/
│   ├── api/
│   │   └── investments/
│   │       ├── create/route.ts      # Investment creation API
│   │       ├── quote/route.ts       # Quote fetching API
│   │       └── user/[address]/route.ts # Portfolio data API
│   ├── create/page.tsx              # Investment creation page
│   └── portfolio/page.tsx           # Portfolio dashboard page
├── components/
│   └── features/
│       ├── InvestmentForm.tsx       # Investment creation form
│       └── PortfolioDashboard.tsx   # Portfolio dashboard
├── lib/
│   ├── 1inch.ts                    # 1inch API integration
│   ├── supabase.ts                 # Supabase client
│   └── tokens.ts                   # Token lists and utilities
├── types/
│   └── investment.ts               # TypeScript interfaces
├── utils/
│   └── auth.ts                     # Authentication utilities
└── database/
    └── schema.sql                  # Database schema
```

## 🔧 API Endpoints

### POST `/api/investments/create`

Creates a new investment intent with enhanced features.

**Request Body:**

```json
{
  "sourceToken": "0x...",
  "sourceChain": 1,
  "targetToken": "0x...",
  "targetChain": 1,
  "amount": 100.0,
  "amountUnit": "USDC",
  "frequency": "weekly",
  "customDays": 7,
  "startDate": "2024-07-15",
  "jarName": "My Weekly DCA Jar",
  "saveAsTemplate": false,
  "gasLimit": "auto",
  "minSlippage": 0.5,
  "deadline": 20,
  "stopAfterSwaps": 100
}
```

### GET `/api/tokens/search/[address]`

Search for token information by contract address.

**Response:**

```json
{
  "success": true,
  "token": {
    "address": "0x...",
    "symbol": "UNI",
    "name": "Uniswap",
    "decimals": 18,
    "chainCompatibility": [
      {"chainId": 1, "chainName": "Ethereum", "supported": true}
    ]
  }
}
```

### POST `/api/tokens/validate`

Validate a token contract address.

**Request Body:**
```json
{
  "address": "0x..."
}
```

### GET `/api/templates`

Get user's saved investment templates.

### POST `/api/templates`

Save a new investment template.

### POST `/api/investments/quote`

Gets a quote from 1inch Fusion+.

**Request Body:**

```json
{
  "src": "0x...",
  "dst": "0x...",
  "amount": "5000000",
  "from": "0x...",
  "chainId": 1
}
```

### GET `/api/investments/user/[address]`

Gets portfolio data for a user.

**Response:**

```json
{
  "success": true,
  "intents": [...],
  "executions": [...],
  "portfolio": {
    "total_invested_usd": 25.0,
    "current_value_usd": 26.25,
    "total_roi_percentage": 5.0,
    "total_executions": 5,
    "successful_executions": 4,
    "failed_executions": 1
  }
}
```

## 🎯 Usage Guide

### Creating an Investment

1. **Connect Wallet**: Click "Connect Wallet" in the header
2. **Navigate to Create**: Go to `/create` page
3. **Select Source**: Choose source chain and token
4. **Select Target**: Choose target chain and token
5. **Set Amount**: Enter amount between $1-$10
6. **Choose Frequency**: Select daily or weekly
7. **Adjust Fee Tolerance**: Set maximum fee percentage
8. **Get Quote**: Click "Get Quote Preview" to see estimated swap
9. **Create Intent**: Click "Create Investment Intent"

### Viewing Portfolio

1. **Navigate to Portfolio**: Go to `/portfolio` page
2. **View Summary**: See total invested, current value, and ROI
3. **Check Active Intents**: View current investment strategies
4. **Review History**: See past investment executions
5. **Monitor Performance**: Track success rate and metrics

## 🔒 Security Features

- **Wallet Authentication**: All API calls require connected wallet
- **Input Validation**: Comprehensive form and API validation
- **Address Validation**: Ethereum address format verification
- **Amount Limits**: Enforced $1-$10 investment range
- **Error Handling**: Graceful error handling and user feedback

## 🧪 Testing

### Manual Testing Checklist

- [ ] Wallet connection works
- [ ] Investment form validation
- [ ] Quote fetching from 1inch
- [ ] Investment intent creation
- [ ] Portfolio data loading
- [ ] Error handling and user feedback
- [ ] Responsive design on mobile

### API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Test investment creation
curl -X POST http://localhost:3000/api/investments/create \
  -H "Content-Type: application/json" \
  -H "x-user-address: 0x1234567890123456789012345678901234567890" \
  -d '{
    "sourceToken": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "sourceChain": 1,
    "targetToken": "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C",
    "targetChain": 1,
    "amountUsd": 5.0,
    "frequency": "weekly",
    "feeTolerance": 0.5
  }'
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**:

   - Verify Supabase credentials in `.env.local`
   - Check if database schema was executed

2. **1inch API Errors**:

   - Verify `INCH_API_KEY` is set correctly
   - Check API key permissions and rate limits

3. **Wallet Connection Issues**:

   - Ensure MetaMask is installed
   - Check if wallet is connected to correct network

4. **Form Validation Errors**:
   - Verify all required fields are filled
   - Check amount is within $1-$10 range

### Debug Mode

Enable debug logging by adding to `.env.local`:

```bash
DEBUG=true
```

## 📈 Next Steps (Phase 3)

- [ ] Investment scheduler implementation
- [ ] Gamification system (XP, streaks, badges)
- [ ] Resolver transparency dashboard
- [ ] Enhanced portfolio analytics
- [ ] Mobile app optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
