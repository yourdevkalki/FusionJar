# 🧾 Product Requirements Document (PRD)

## 📛 Fusion Jar

**Fusion Jar**
*A gamified, gasless, cross-chain micro-investment platform using 1inch Fusion+.*

---

## 🎯 Problem Statement

For retail users in DeFi, investing small amounts regularly across EVM chains (e.g., Ethereum, Base, Polygon) is:

* ❌ Too complex (bridging, multiple tokens, chains, fees)
* ❌ Too expensive for small amounts (gas fees outweigh gains)
* ❌ Not engaging (no retention or habit-building)

**Users want:**

* A simple, recurring way to invest \$1–\$10
* A gasless experience
* Motivation to stay consistent (gamified UX)

---

## 🌟 Solution Overview

**Fusion Jar** is a gasless, recurring cross-chain investment dApp that:

* Automates micro-investments (\$1–\$10) across EVM chains
* Uses **1inch Fusion+** to create off-chain swap intents
* Simulates or triggers intent execution (via resolvers)
* Tracks portfolio performance
* Uses **XP, streaks, and badges** to reward consistent savers

---

## 🛠️ Key Features

### 1. Wallet Integration

* ✅ MetaMask (via RainbowKit)
* ✅ Show connected wallet address
* ❌ No need for full login system

---

### 2. Create Investment Intent

* Input form:

  * [ ] Source Token + Chain
  * [ ] Target Token + Chain
  * [ ] Amount (\$1–\$10)
  * [ ] Frequency (Daily, Weekly)
  * [ ] Max fee/slippage tolerance
* Backend saves config as recurring intent

---

### 3. Fusion+ Swap Integration

* [ ] Fetch quote via `GET /quote`
* [ ] Sign off-chain swap intent via `POST /intent`
* [ ] Simulate resolver picking up and fulfilling
* [ ] Log execution details (resolver, time, fee)

---

### 4. Recurring Investment Engine

* [ ] `node-cron` or simple timer triggers based on frequency
* [ ] Marks investment status: pending, fulfilled, skipped, failed
* [ ] Handles retries or skipped executions

---

### 5. Portfolio Tracking UI

* [ ] Show total invested, current value, ROI %
* [ ] Pie chart of token allocations
* [ ] Investment history
* [ ] Optional: Pull token prices via CoinGecko or mock

---

### 6. Resolver Transparency Dashboard

* [ ] Table view of each investment

  * Resolver address
  * Execution time
  * Fee/slippage
  * Swap transaction hash (if available)

---

### 7. Gamification Layer

* [ ] XP system (+10 XP per investment)
* [ ] Streak tracker (daily or weekly)
* [ ] Milestone badges (e.g., "Saved \$50")
* [ ] Optional: Leaderboard (mocked or local)

---

### 8. Notifications (Stretch Goal)

* [ ] Toast notifications in frontend
* [ ] Optional: Telegram/email webhook triggers

---

## 💻 Tech Stack

| Layer     | Tool                             |
| --------- | -------------------------------- |
| Frontend  | Next.js, Tailwind, Wagmi         |
| Wallets   | MetaMask (RainbowKit)            |
| Backend   | Node.js (or Next.js API routes)  |
| DB        | supabase  |
| Scheduler | node-cron / setInterval          |
| API       | 1inch Fusion+, Quote, Token APIs |
| Hosting   | Vercel + Render or Fly.io        |

---

## 🧪 API Interactions

### 1inch Fusion+ Flow:

* `GET /quote` – best route for token+chain pair
* `POST /intent` – sign and submit off-chain swap intent
* Simulated resolver picks up and executes swap
* Confirmation data sent back to backend

---

## 🧑‍🎨 UX Layout

### Home (`/`)

* Hero: “Start Your \$5/Week DeFi Journey”
* CTA: “Connect Wallet”

### Create Investment (`/create`)

* Form with dropdowns: source/target tokens + chains
* Input: Amount, Frequency, Fee Tolerance
* Button: “Create Recurring Investment”

### Portfolio (`/portfolio`)

* Total invested + ROI %
* XP bar + Streak status
* Charts + investment history

### Resolver Dashboard (`/resolvers`)

* Table with:

  * Resolver address
  * Time of execution
  * Fee paid
  * Swap hash

---

## 📈 Success Metrics (MVP)

* ✅ Recurring swap intent created and stored
* ✅ Fusion+ intent posted and signed
* ✅ Simulated or real execution completed
* ✅ Portfolio dashboard shows updated data
* ✅ XP/streak system tracks progress
* ✅ UI/UX is clean, minimal, and interactive

---

## 📋 Out of Scope (For MVP)

* Multi-user auth or login
* Mobile app version
* On-chain staking/farming
* Full NEAR chain integration
* Real resolver operation (we simulate for now)

---

## 🧩 Example User Flow

1. User connects MetaMask
2. Sets: “Invest \$5 every 2 days from ETH → USDC on Polygon”
3. Platform stores investment intent
4. Cron job simulates or triggers Fusion+ intent
5. Backend logs resolver details
6. Portfolio updates + XP gained
7. User sees streaks, badges

---

## 🏆 Submission Track

**Track 3: Build a Full dApp using 1inch APIs**

* Deep integration with Fusion+, Quotes, Resolver data
* Realistic dApp focused on onboarding real users
* Unique UX angle (recurring DeFi + gamification)

