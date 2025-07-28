# Fusion+ API Test App

A simple React app to test 1inch's Fusion+ cross-chain swap API from Ethereum to NEAR.

## 🚀 Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure your API keys:**
   Edit `src/App.tsx` and replace:

   - `YOUR_1INCH_FUSION_PLUS_API_KEY` with your 1inch Fusion+ API key
   - `YOUR_API_KEY` with your Ethereum RPC provider API key (Alchemy, Infura, etc.)

3. **Start the development server:**

   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Required API Keys:

- **1inch Fusion+ API Key**: Get from [1inch.dev](https://1inch.dev/)
- **Ethereum RPC**: Use Alchemy, Infura, or your preferred provider

### Token Addresses:

- **Source**: WETH on Ethereum (`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`)
- **Destination**: REF token on NEAR (`token.ref-finance.near`)

## 📋 Prerequisites

Before testing:

1. **Install MetaMask** and ensure it's connected to Ethereum mainnet
2. **Have a NEAR wallet** (MyNEARWallet, Sender, etc.) with some NEAR for gas
3. **Approve WETH allowance** via 1inch Limit Order Protocol
4. **Have sufficient WETH balance** on Ethereum mainnet

## 🧪 Testing Flow

1. **Connect Wallets**: Click "Connect Wallets" to connect MetaMask and NEAR wallet
2. **Set Amount**: Enter the USD amount you want to swap (default: $1)
3. **Start Swap**: Click "Start Swap" to begin the cross-chain swap process
4. **Monitor Status**: Watch the status updates as the swap progresses

## ⚠️ Important Notes

- This app tests on **mainnet** - use small amounts only
- Ensure you have approved WETH allowance before swapping
- The app monitors order status for up to 60 seconds
- Cross-chain swaps may take several minutes to complete

## 🛠️ Troubleshooting

- **MetaMask not found**: Install MetaMask browser extension
- **NEAR connection issues**: Ensure NEAR wallet is properly configured
- **API key errors**: Verify your 1inch Fusion+ API key is correct
- **Allowance errors**: Approve WETH allowance via 1inch Limit Order Protocol

## 📚 Resources

- [1inch Fusion+ Documentation](https://1inch.dev/fusion-api/)
- [1inch Cross-Chain SDK](https://github.com/1inch/cross-chain-sdk)
- [NEAR API Documentation](https://docs.near.org/)
