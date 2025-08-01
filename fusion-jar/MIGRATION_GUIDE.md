# 🚀 Migration Guide: New Invest.tsx UI

## ✅ What's Been Updated

### 1. **TypeScript Types** (`types/investment.ts`)
- ✅ Updated `CreateInvestmentFormData` interface
- ✅ Added `TokenSearchResult` interface
- ✅ Support for new features: jar naming, custom intervals, advanced settings

### 2. **API Endpoints**
- ✅ **Enhanced** `/api/investments/create` - Supports all new UI features
- ✅ **New** `/api/tokens/search/[address]` - Token lookup by contract address
- ✅ **New** `/api/tokens/validate` - Token address validation
- ✅ **New** `/api/templates` (GET/POST) - Save and load investment templates

### 3. **Database Migration** (`database/migration-new-ui.sql`)
- ✅ New columns for `investment_intents` table
- ✅ New `investment_templates` table
- ✅ Updated constraints and indexes

### 4. **Testing Infrastructure**
- ✅ Created `test-new-apis.js` for API validation
- ✅ Updated documentation in README.md

## 🔄 Migration Steps Required

### Step 1: Apply Database Migration
Run the SQL migration script in your Supabase dashboard:

```bash
# Copy contents of database/migration-new-ui.sql
# Go to Supabase SQL Editor → New Query → Paste → Run
```

### Step 2: Update Your UI Component
Replace the old `InvestmentForm.tsx` usage with the new `Invest.tsx`:

```tsx
// Old way (InvestmentForm.tsx)
import InvestmentForm from "@/components/features/InvestmentForm";

// New way (Invest.tsx)
import Invest from "@/components/Invest";
```

### Step 3: Test the New APIs
Start your development server and test:

```bash
npm run dev
```

Test these endpoints:
- `GET /api/tokens/search/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984`
- `POST /api/tokens/validate`
- `POST /api/investments/create` (with new data structure)
- `GET /api/templates`

## 📊 New Features Supported

### Enhanced Investment Creation
- **Jar Naming**: Custom names for investment strategies
- **Flexible Scheduling**: Daily, weekly, monthly, or custom intervals
- **Start Dates**: Schedule investments to begin on specific dates
- **Advanced Settings**: Gas limits, slippage tolerance, deadlines
- **Templates**: Save and reuse investment configurations

### Token Management
- **Address Search**: Look up tokens by contract address
- **Chain Compatibility**: See which chains support specific tokens
- **Validation**: Real-time address format validation

## 🎯 Updated Data Structure

### Old Format (InvestmentForm.tsx)
```json
{
  "sourceToken": "0x...",
  "sourceChain": 1,
  "targetToken": "0x...",
  "targetChain": 1,
  "amountUsd": 5.0,
  "frequency": "weekly",
  "feeTolerance": 0.5
}
```

### New Format (Invest.tsx)
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

## 🚨 Breaking Changes

1. **Amount Field**: Changed from `amountUsd` to `amount` + `amountUnit`
2. **Fee Tolerance**: Moved to `minSlippage` in advanced settings
3. **New Required Fields**: `jarName`, `startDate` are now required
4. **Database Schema**: New columns added, old data remains compatible

## 🧪 Testing Checklist

- [ ] Database migration applied successfully
- [ ] Token search works for known addresses
- [ ] Investment creation with new format succeeds
- [ ] Template saving and loading works
- [ ] All API endpoints return expected responses
- [ ] Frontend UI connects to new APIs correctly

## 📞 Need Help?

Run the test script to verify your setup:
```bash
cd fusion-jar && node test-new-apis.js
```

This will check database compatibility and API readiness.