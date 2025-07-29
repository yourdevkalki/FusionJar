# 🚀 Fusion Jar Quick Start Guide

## 🎯 Immediate Next Steps

Based on the roadmap, here's how to get started building Fusion Jar:

---

## 📋 Step 1: Project Setup (Day 1)

### 1.1 Initialize Next.js Project

```bash
npx create-next-app@latest fusion-jar --typescript --tailwind --eslint --app
cd fusion-jar
```

### 1.2 Install Core Dependencies

```bash
npm install @rainbow-me/rainbowkit wagmi viem
npm install @supabase/supabase-js
npm install node-cron
npm install lucide-react
npm install recharts
npm install react-hot-toast
```

### 1.3 Setup Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
INCH_API_KEY=your_1inch_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📋 Step 2: Database Setup (Day 1)

### 2.1 Create Supabase Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment intents table
CREATE TABLE investment_intents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  source_token TEXT NOT NULL,
  source_chain TEXT NOT NULL,
  target_token TEXT NOT NULL,
  target_chain TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  frequency TEXT NOT NULL, -- 'daily', 'weekly'
  fee_tolerance DECIMAL NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment executions table
CREATE TABLE investment_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_id UUID REFERENCES investment_intents(id),
  status TEXT NOT NULL, -- 'pending', 'fulfilled', 'failed', 'skipped'
  resolver_address TEXT,
  execution_time TIMESTAMP WITH TIME ZONE,
  fee_paid DECIMAL,
  swap_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gamification data table
CREATE TABLE gamification_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  xp_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_investments INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📋 Step 3: Basic Project Structure (Day 1-2)

### 3.1 Create Folder Structure

```
src/
├── app/
│   ├── (pages)/
│   │   ├── create/
│   │   ├── portfolio/
│   │   └── resolvers/
│   ├── api/
│   │   ├── investments/
│   │   ├── portfolio/
│   │   └── gamification/
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   └── features/
├── lib/
│   ├── supabase.ts
│   ├── wagmi.ts
│   └── 1inch.ts
├── types/
└── utils/
```

### 3.2 Setup Core Configuration Files

**`lib/supabase.ts`**:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**`lib/wagmi.ts`**:

```typescript
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Fusion Jar",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [mainnet, polygon, base],
  ssr: true,
});
```

---

## 📋 Step 4: Wallet Integration (Day 2)

### 4.1 Create Wallet Provider

**`components/providers/WalletProvider.tsx`**:

```typescript
"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 4.2 Create Connect Button Component

**`components/ui/ConnectButton.tsx`**:

```typescript
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnectButton() {
  return <ConnectButton />;
}
```

---

## 📋 Step 5: Basic Layout (Day 2-3)

### 5.1 Create Header Component

**`components/layout/Header.tsx`**:

```typescript
"use client";

import { WalletConnectButton } from "@/components/ui/ConnectButton";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            Fusion Jar
          </Link>
          <nav className="flex space-x-8">
            <Link href="/create" className="text-gray-700 hover:text-gray-900">
              Create Investment
            </Link>
            <Link
              href="/portfolio"
              className="text-gray-700 hover:text-gray-900"
            >
              Portfolio
            </Link>
            <Link
              href="/resolvers"
              className="text-gray-700 hover:text-gray-900"
            >
              Resolvers
            </Link>
          </nav>
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
```

### 5.2 Update Root Layout

**`app/layout.tsx`**:

```typescript
import { WalletProvider } from "@/components/providers/WalletProvider";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
```

---

## 📋 Step 6: Landing Page (Day 3)

### 6.1 Create Hero Section

**`app/page.tsx`**:

```typescript
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
          Start Your $5/Week DeFi Journey
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
          Automate your micro-investments across chains with gasless swaps.
          Build wealth one dollar at a time with gamified savings.
        </p>
        <div className="mt-10">
          <Link
            href="/create"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Investing
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## 📋 Step 7: 1inch Integration Setup (Day 3-4)

### 7.1 Create 1inch API Client

**`lib/1inch.ts`**:

```typescript
const INCH_API_BASE = "https://api.1inch.dev";

export class OneInchAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuote(params: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    chainId: number;
  }) {
    const response = await fetch(
      `${INCH_API_BASE}/swap/v6.0/${params.chainId}/quote?${new URLSearchParams(
        {
          src: params.src,
          dst: params.dst,
          amount: params.amount,
          from: params.from,
        }
      )}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
      }
    );
    return response.json();
  }

  async createIntent(params: {
    src: string;
    dst: string;
    amount: string;
    from: string;
    chainId: number;
    permit?: string;
  }) {
    const response = await fetch(`${INCH_API_BASE}/fusion/intents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    return response.json();
  }
}

export const oneInchAPI = new OneInchAPI(process.env.INCH_API_KEY!);
```

---

## 🎯 Next Priority Tasks

After completing the setup above, focus on these MVP features in order:

1. **Investment Creation Form** (`/create` page)
2. **Basic Portfolio Display** (`/portfolio` page)
3. **Investment Scheduler** (cron job setup)
4. **Gamification System** (XP, streaks, badges)
5. **Resolver Dashboard** (`/resolvers` page)

---

## 🚀 Getting Started Checklist

- [ ] Initialize Next.js project with TypeScript and Tailwind
- [ ] Install all required dependencies
- [ ] Setup Supabase database and tables
- [ ] Configure environment variables
- [ ] Create basic project structure
- [ ] Implement wallet integration with RainbowKit
- [ ] Create basic layout and navigation
- [ ] Build landing page
- [ ] Setup 1inch API integration

Once you complete these steps, you'll have a solid foundation to build the core investment features and meet the MVP requirements!

---