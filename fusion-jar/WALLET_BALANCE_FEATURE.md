# 🔗 Wallet Balance Feature

## Overview
The Wallet Balance feature integrates with the **[1inch Balance API](https://portal.1inch.dev/documentation/apis/balance/introduction)** to provide real-time token balance information for connected wallets across multiple blockchain networks.

## Features

### ✅ Real-time Balance Fetching
- Fetches token balances using the 1inch Balance API
- Supports multiple blockchain networks (Ethereum, Polygon, BSC, Base, Arbitrum)
- Displays both token amounts and USD values

### ✅ Multi-Chain Support
- Chain selector dropdown to view balances on different networks
- Automatic chain-specific balance fetching
- Support for all major EVM-compatible chains

### ✅ User Experience
- Clean, responsive UI with loading states
- Refresh functionality to update balances
- Error handling with user-friendly messages
- Secure access (users can only view their own balances)

## Implementation

### 1. API Integration
**File:** `fusion-jar/lib/1inch.ts`
```typescript
// Get wallet balances using 1inch Balance API
async getWalletBalances(address: string, chainId: number = 1)

// Get specific token balance
async getTokenBalance(address: string, tokenAddress: string, chainId: number = 1)
```

### 2. API Route
**Endpoint:** `GET /api/wallet/balance/[address]?chainId={chainId}`
- Requires authentication (users can only access their own data)
- Fetches balances from 1inch Balance API
- Returns formatted balance data

### 3. React Component
**File:** `fusion-jar/components/WalletBalance.tsx`
- Chain selector for switching between networks
- Token list with balance amounts and USD values
- Loading states and error handling
- Responsive design

### 4. Profile Integration
**Location:** Profile page (`/profile`)
- Added as a new section in the profile page
- Positioned after the Level System information
- Integrates seamlessly with existing profile layout

## API Reference

### 1inch Balance API
The integration uses the 1inch Balance API endpoint:
```
GET https://api.1inch.dev/balance/v1.0/{chainId}/balances/{address}
```

**Headers:**
- `Authorization: Bearer {API_KEY}`
- `Content-Type: application/json`

**Response Format:**
```json
{
  "tokenAddress": {
    "balance": "1000000000000000000",
    "symbol": "ETH",
    "name": "Ethereum",
    "decimals": 18,
    "priceUsd": 2000.00
  }
}
```

## Usage

1. **Navigate to Profile:** Go to `/profile` page
2. **Connect Wallet:** Ensure your wallet is connected
3. **Select Chain:** Use the dropdown to select desired blockchain
4. **View Balances:** See your token balances and USD values
5. **Refresh:** Click the refresh button to update balances

## Security

- **Authentication Required:** All balance requests require user authentication
- **Address Validation:** Users can only access their own wallet balance data
- **API Key Security:** 1inch API key is stored securely in environment variables

## Environment Variables

Add your 1inch API key to `.env.local`:
```bash
INCH_API_KEY=your_1inch_api_key_here
```

## Supported Networks

- **Ethereum (1)** - ETH and ERC-20 tokens
- **Polygon (137)** - MATIC and Polygon tokens  
- **BSC (56)** - BNB and BEP-20 tokens
- **Base (8453)** - ETH and Base tokens
- **Arbitrum (42161)** - ETH and Arbitrum tokens

## Future Enhancements

- [ ] Portfolio value tracking over time
- [ ] Token price change indicators
- [ ] Balance alerts and notifications
- [ ] Export balance data functionality
- [ ] Integration with investment jar creation

## Troubleshooting

### Common Issues

1. **"Failed to fetch wallet balances"**
   - Check if 1inch API key is configured
   - Verify wallet is connected
   - Try refreshing the page

2. **"No tokens found"**
   - Switch to a different chain
   - Check if wallet has any token balances
   - Ensure wallet address is valid

3. **API Rate Limits**
   - The free 1inch API has rate limits
   - Consider upgrading to premium plan for higher limits

### Debug Logs
Balance fetching logs are available in browser console:
```
Fetching balances for {address} on chain {chainId}
```