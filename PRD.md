🧾 Product Requirements Document (PRD)
📛 Product Name Fusion Jar
CrossChain SIP (Systematic Investment Platform)A gamified, gasless, cross-chain micro-investment dApp built on 1inch Fusion+, supporting recurring $1–$10 investments between Ethereum and NEAR.

🎯 Problem Statement
For retail users, investing in cross-chain DeFi is:
* Too complex (bridges, wallets, gas fees)
* Too expensive (gas costs outweigh small investments)
* Not sticky or engaging (no incentives, UX barriers)
Retail users want to invest small amounts regularly, across chains like Ethereum and NEAR, without needing to understand complex DeFi infrastructure.

🌟 Solution Overview
This product is a gasless, recurring, cross-chain investment platform that:
* Lets users schedule small recurring swaps ($1–$10) between ETH ↔ NEAR
* Uses 1inch Fusion+ to handle cross-chain execution (intent-based, resolver executed)
* Shows portfolio performance
* Adds gamification to incentivize saving (XP, streaks, badges)
* Surfaces transparency of swap execution (who fulfilled, when, at what cost)

🛠️ Key Features
1. Wallet Integration
* Support Ethereum (via MetaMask)
* Support NEAR (via NEAR Wallet Adapter)
* Show connected wallet addresses

2. Create Investment Intent
Form where users can define:
* Source Token (e.g., ETH, USDC)
* Target Token on NEAR (e.g., REF, USDT)
* Amount (e.g., $5)
* Frequency (e.g., daily, weekly)
* Max Fee Tolerance (% slippage or resolver fee)
System saves this as a recurring intent in the backend.

3. Intent Execution via 1inch Fusion+
* Use 1inch Fusion+ to generate and sign off-chain intent
* Monitor available resolvers to pick up and execute swap
* Ensure swap is atomic, using hashlock/timelock (Fusion handles this)
* Send confirmation back to backend after successful execution

4. Recurring Intent Scheduling Engine (Backend)
* Cron job or loop-based task runner (simulated if needed)
* Triggers swap intents based on frequency
* Logs status (pending, fulfilled, skipped, failed)
* Optional: Retry if gas or fee exceeds threshold

5. Portfolio Tracking UI
* Aggregate token balances across chains (via wallet RPC or API)
* Display:
    * Total amount invested
    * Current value
    * ROI %
    * Pie chart of allocations
    * Time-series chart (investments over time)

6. Resolver Transparency Dashboard
* For each executed swap, show:
    * Resolver wallet address
    * Execution time
    * Execution fee/slippage
    * Route taken
* Optional: 1inch analytics if public API allows

7. Gamification Layer
* Users earn XP for:
    * Each successful investment
    * Streaks (e.g., 3 weeks in a row)
    * Milestones (e.g., saved $50)
* Badges/unlocks (basic SVG/UI visuals)
* Optional: Leaderboard or community metrics

8. Notifications (optional / stretch)
* Telegram, Email, or frontend toast notifications:
    * When investment is successful
    * When resolver fails
    * When user breaks streak

💻 Tech Stack
Layer	Tool
Frontend	Next.js, Tailwind, Wagmi
Wallets	MetaMask, NEAR Wallet
API Layer	1inch Fusion+, Dev Portal
Backend	Node.js + Express
Scheduling	node-cron or BullMQ
DB (optional)	SQLite or Firebase
Hosting	Vercel + Render/Fly.io
🧪 API Interactions (Examples)
1inch Fusion+ Flow:
* GET /quote → Get best swap route
* POST /intent → Create/schedule signed swap intent
* Swap monitored via webhook or polling

🧑‍🎨 UX Layout (Minimalist MVP)
1. Home
    * Hero: “Start Your $5/Week DeFi Journey”
    * Button: “Connect Wallet”
2. Create Investment
    * Dropdowns: Source token, Target token
    * Input: Amount, Frequency
    * Button: “Create Recurring Investment”
3. Portfolio
    * Chart of total invested & current value
    * XP bar
    * Last 5 investments + resolver info
4. Resolver Dashboard
    * Table:
        * Resolver Address
        * Time Taken
        * Fee Paid
        * Swap Hash (if available)

📈 Success Metrics (Hackathon MVP)
* Successful gasless cross-chain swap via Fusion+
* Recurring swap logic triggers and executes
* Portfolio reflects invested value
* Resolver stats visible in frontend
* Basic gamified UX elements work (XP, streak counter)

📋 Out of Scope (For MVP)
* Multi-user auth system
* On-chain staking/farming after swap
* Deep resolver analytics beyond public API
* Mobile app
* Fiat onboarding

🧩 Example User Flow (E2E)
1. User connects MetaMask and NEAR Wallet
2. Sets: “Invest $5 every 2 days from ETH → REF”
3. Platform stores intent + config
4. Backend triggers intent → resolver fulfills it
5. User sees confirmation + portfolio updates
6. XP increases → "3-Day Streak Badge Unlocked"


