# 🛒 MaNa Angadi (మన అంగడి) — Memory-Powered Regional Commerce & Procurement Concierge

> **One-Line Value Proposition:** A high-precision Indian regional multi-vendor marketplace concierge powered by **Hindsight persistent agent memory** that retains user budgets, GI-tagged artisan craft preferences, and dietary requirements across sessions to eliminate repetitive prompting.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Hindsight Memory](https://img.shields.io/badge/Agent_Memory-Hindsight-8A2BE2.svg)](https://hindsight.vectorize.io/)
[![Tests](https://img.shields.io/badge/Tests-26%20Passed-brightgreen.svg)](#-automated-testing)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Problem Statement

Traditional conversational shopping assistants and recommendation engines are **stateless**. Every time a customer returns to an e-commerce platform, they must repeatedly restate:
1. **Procurement Budgets:** E.g., *"Keep it under ₹10,000 for wedding gifts."*
2. **Artisan Craft & Authenticity Preferences:** E.g., *"I only buy authentic GI-Tagged Pochampally Ikkat silk with Silk Mark certification."*
3. **Dietary & Health Constraints:** E.g., *"Strictly 100% cold-pressed Wood Ganuga oils, no chemical preservatives."*
4. **Milestone Context:** E.g., *"Shopping for my niece's upcoming wedding in Hyderabad."*

Without persistent memory, conversational agents force users into tedious repetitive surveys, leading to high abandonment and generic, irrelevant product recommendations.

---

## 💡 The Solution: Persistent Agent Memory with Hindsight

**MaNa Angadi** integrates **[Hindsight](https://github.com/vectorize-io/hindsight)** as its central agent memory layer. 
- **Continuous Retention (`retain`)**: In the initial interaction, the agent automatically extracts explicit constraints (budget ceilings, fabric choices, dietary habits, family events) and persists them in an isolated Hindsight memory bank.
- **Semantic Recall (`recall`)**: In later sessions, when the user issues high-level requests (e.g., *"Show me gifts for the ceremony"*), Hindsight semantically retrieves relevant constraints and injects them directly into catalog search queries.
- **Transparent Memory Inspector**: Users and judges can open the **Memory Hub** to inspect active memory cards, confidence scores, timestamps, and before-vs-after comparison metrics in real time.

---

## ⚡ Before Memory vs. After Memory Comparison

| Dimension | ❌ Before Memory (Stateless LLM / Bot) | ✅ After Memory (Hindsight Powered) |
|---|---|---|
| **Query:** *"Show me gifts for the wedding"* | Returns 50+ generic sarees from ₹500 to ₹50,000 without filtering. | Recalls ₹10k budget and returns ₹8,499 authentic Pochampally Silk Handloom. |
| **User Friction** | Asks 4 repetitive clarifying questions about budget, fabric, and occasion. | **Zero repetitive prompting.** Seamless, personalized recommendation on the first turn. |
| **Dietary Reorder** | Suggests generic refined oils requiring manual searching. | Automatically prioritizes cold-pressed Wood Ganuga groundnut oils. |
| **Confidence & Traceability** | Black-box output with no rationale. | Transparent memory trace detailing why each item was selected. |

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│               MaNa Angadi Frontend (React 18)          │
│   - Regional Storefront & 14 Curated Categories        │
│   - Ask MaNa AI Concierge Modal                        │
│   - Live Hindsight Memory Hub (Bank Inspector)         │
│   - Interactive Before vs. After Memory Impact Diff    │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON
┌───────────────────────────▼────────────────────────────┐
│          Backend API Server (Express + TypeScript)      │
│   - AI Agent Orchestrator (/api/ai/agent-chat)         │
│   - Intent & Constraint Extraction Pipeline            │
│   - SQL Catalog Search Engine                          │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌───────────────────────────┐   ┌─────────────────────────┐
│     Hindsight Memory      │   │     SQLite Database     │
│  (Vectorize Hindsight)    │   │  - Products & Inventory │
│  - Bank ID Partitioning   │   │  - Users & Addresses    │
│  - retain() & recall()    │   │  - Orders & Reviews     │
│  - Resilient Fallback     │   │  - Coupons & Payments   │
└───────────────────────────┘   └─────────────────────────┘
```

---

## 📂 Project Structure

```
mana-angadi/
├── backend/
│   ├── src/
│   │   ├── config/              # Database connection & WAL mode SQLite configuration
│   │   ├── controllers/         # AI, Product, Order, Auth, Seller, Admin, Delivery controllers
│   │   ├── middleware/          # JWT auth, optional auth, and role guards
│   │   ├── models/              # Schema definition (15 relational tables)
│   │   ├── routes/              # Express REST endpoints
│   │   ├── seed/                # Seed script with 14 Indian categories, artisans, and products
│   │   ├── services/
│   │   │   ├── hindsightService.ts # Hindsight client abstraction (retain, recall, fallback)
│   │   │   └── aiAgentService.ts   # AI Orchestrator with memory diff engine
│   │   ├── server.ts            # Server entry point
│   │   └── testRunner.ts        # 26 automated E2E and Hindsight verification tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   │   └── AskManaAIModal.tsx # Upgraded AI Concierge with Memory Hub & Before/After Diff
│   │   │   ├── layout/          # Top Navbar, Footer, Category Header
│   │   │   └── product/         # Product cards, badges, and filters
│   │   ├── pages/               # Storefront, Product Detail, Cart, Checkout, Order Tracking
│   │   └── services/api.ts      # Axios client configuration
│   └── package.json
├── content/
│   ├── article.md               # 1200+ word deep-dive technical article
│   ├── linkedin-post.md         # Professional social media summary
│   └── video-script.md          # 4-minute demo recording script
├── ARCHITECTURE.md              # System design diagrams & Hindsight workflow
├── TESTING.md                   # 26/26 test report and verification logs
├── DEMO_SCRIPT.md               # Step-by-step judge demonstration guide
└── PROJECT_AUDIT.md             # Complete codebase audit and roadmap
```

---

## 🚀 Quick Start Guide (Windows / Linux / macOS)

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)

### 2. Installation & Database Seeding

```powershell
# Navigate to project directory
cd d:\thatikonda0522\mana-angadi

# Install backend dependencies
cd backend
npm install

# Seed the database with authentic Indian artisan & regional products
npm run seed

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Start Local Servers

```powershell
# Terminal 1: Start Backend API (runs on http://localhost:5000)
cd d:\thatikonda0522\mana-angadi\backend
npm run dev

# Terminal 2: Start Frontend Application (runs on http://localhost:5173)
cd d:\thatikonda0522\mana-angadi\frontend
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 🧪 Automated Testing

The project includes an automated test suite verifying both Hindsight memory integration and the complete marketplace workflow:

```powershell
cd d:\thatikonda0522\mana-angadi\backend
npm run test
```

### Verified Test Results (26/26 Passed):
- ✅ `1. Server Health Check`
- ✅ `2-5. Multi-Role Authentication (Customer, Seller, Delivery, Admin)`
- ✅ `6-7. Indian Marketplace Catalog & Categories`
- ✅ `8. Hindsight Bank Reset & Clean State`
- ✅ `9-11. Hindsight Retain (Budget, Craft, Dietary Constraints)`
- ✅ `12. Hindsight List Memories (Partition Isolation)`
- ✅ `13. Hindsight Semantic Recall (Ranked Confidence)`
- ✅ `14. Agent Turn 1: Continuous Extraction & Ingestion`
- ✅ `15-16. Agent Turn 2: Context-Aware Recall & Strict Budget Filtering`
- ✅ `17. Before-Memory vs. After-Memory Diff Generation`
- ✅ `18. 1-Click Demo Scenario Seed`
- ✅ `19. Subsystem Health Diagnostics`
- ✅ `20-25. E-Commerce Cart, Wishlist, Coupon, Payment Intent & Order Placement`
- ✅ `26. Safe Input Validation (400 Bad Request rejection)`

---

## 🔑 Demo Login Credentials

For exploring role-based features (Seller portal, Delivery dispatch, Admin governance):

| Role | Email | Password |
|---|---|---|
| 🛒 **Customer** | `customer@manaangadi.demo` | `Customer@123` |
| 🏪 **Seller (Artisan/Store)** | `seller@manaangadi.demo` | `Seller@123` |
| 🚚 **Delivery Partner** | `delivery@manaangadi.demo` | `Delivery@123` |
| 👑 **Platform Admin** | `admin@manaangadi.demo` | `Admin@123` |

---

## 📚 Official Hindsight Resources

- **Hindsight GitHub Repository:** [https://github.com/vectorize-io/hindsight](https://github.com/vectorize-io/hindsight)
- **Hindsight Documentation:** [https://hindsight.vectorize.io/](https://hindsight.vectorize.io/)
- **Hindsight Cloud Console:** [https://ui.hindsight.vectorize.io/](https://ui.hindsight.vectorize.io/)
- **What is Agent Memory:** [https://vectorize.io/what-is-agent-memory](https://vectorize.io/what-is-agent-memory)
