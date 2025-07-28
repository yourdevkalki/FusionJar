# 🪙 FusionJar

**FusionJar** is a cross-chain, intent-based micro-investment platform built on top of **1inch Fusion+**, enabling users to easily automate and schedule small token swaps (e.g., $1-$10) between Ethereum and NEAR. It makes DeFi portfolio building accessible to everyone — especially retail users — by combining smart routing, intent-based architecture, and a gamified UI/UX.

---

## 🚀 Key Features

- **🧠 Intent-Based Investment Engine**  
  Users specify *what* they want to achieve (e.g., “invest $5 into NEAR-based DeFi tokens weekly”) — FusionJar handles the rest using 1inch Fusion+.

- **🔁 Recurring Cross-Chain Swaps**  
  Users can schedule automatic micro-swaps between Ethereum and NEAR ecosystems.

- **📦 Portfolio Jar System**  
  Funds are grouped into themed “Jars” for each investment strategy (e.g., Stable Jar, Growth Jar, DeFi Jar).

- **🎮 Gamified UX**  
  Simplifies cross-chain DeFi with friendly visuals, jar animations, and XP for recurring saving behavior.

- **📊 Transparency Dashboard**  
  Real-time display of resolver stats, executed intents, and fee breakdown via 1inch APIs.

- **🔐 Hashlock / Timelock Security**  
  Ensures secure settlement of cross-chain intents.

---

## 🔧 Tech Stack

| Layer         | Tools / Tech |
|---------------|--------------|
| **Cross-Chain**  | [1inch Fusion+](https://fusion.1inch.io) (Intent Protocol) |
| **Frontend**     | React + Tailwind + Wagmi + Ethers.js |
| **Backend**      | Node.js + Express (or FastAPI if using Python) |
| **Database**     | MongoDB / Supabase |
| **Wallets**      | MetaMask, NEAR Wallet |
| **Analytics**    | 1inch Developer Portal APIs |
| **Security**     | Hashlock / Timelock contracts |

---

## 💡 How It Works

1. **User signs in** with MetaMask and NEAR wallet.
2. **Chooses an intent** like: “Invest $2 every Monday into NEAR-based DeFi tokens.”
3. **FusionJar uses 1inch Fusion+** to execute the most efficient cross-chain swap.
4. The tokens land in the **Jar**, viewable in the user dashboard.
5. A **gamified jar UI** shows progress, portfolio health, and rewards.

---
