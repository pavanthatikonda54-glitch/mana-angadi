# 🎬 60-Second Live Demo Script for Judges

**Project:** MaNa Angadi — Hindsight Agent Memory Concierge  
**Focus:** Proving Persistent Memory Value in Regional Indian Commerce  

---

## 🕒 Target Demo Duration: 60 to 90 Seconds

```
[0:00 - 0:15] Open App & Show The Problem (Stateless AI)
[0:15 - 0:40] Interaction 1: Ingesting Constraints into Hindsight Memory
[0:40 - 0:65] Interaction 2: Semantic Recall & Hyper-Personalized Action
[0:65 - 0:90] Memory Hub Inspection & Before vs. After Diff
```

---

## 📋 Step-by-Step Demonstration Walkthrough

### STEP 1: Launch Application & Open MaNa AI Concierge
1. Open browser at `http://localhost:5173`.
2. Click the floating **"Ask MaNa AI"** button at the bottom right corner (or Top Navigation).
3. The modal opens showing the **Hindsight Memory Core** header.

---

### STEP 2: Ingest & Retain User Context (Interaction 1)
**Action:** In the chat input, type (or click the quick demo button **"1. Seed Interaction 1"**):
> *"I need to buy Pochampally handlooms and cold-pressed oils for my niece's wedding in Hyderabad, keep budget under ₹10,000."*

**What happens on screen:**
- The AI responds with personalized product suggestions.
- Notice the green badge: **"Retained 3 new preference constraints into Hindsight Bank"**.
- Stored into Hindsight:
  1. `Budget Ceiling: under ₹10,000`
  2. `Craft Preference: GI-Tagged Pochampally Handlooms with Silk Mark`
  3. `Occasion: Wedding celebrations in Hyderabad`
  4. `Dietary: 100% Organic Cold-Pressed Oils`

---

### STEP 3: The Magical Recall Moment (Interaction 2 — Later Session)
**Action:** Clear the chat or simulate returning days later. Type:
> *"Show me suitable gifts for the wedding ceremony."*

**What happens on screen (The "WOW" Moment):**
- Notice you did **NOT** re-enter your budget (₹10k), location (Hyderabad), or fabric preference (Pochampally).
- The agent displays a purple badge: **"Retrieved 3 Hindsight Memories"**:
  - `[Score 0.96] Budget ceiling is under ₹10,000`
  - `[Score 0.94] Prefers GI-Tagged Telangana Handlooms`
  - `[Score 0.90] Procuring for niece wedding`
- The returned products strictly cost **under ₹10,000** (e.g. Pure Pochampally Ikkat Silk Saree at ₹8,499).

---

### STEP 4: Demonstrate Before-Memory vs. After-Memory
**Action:** Click the button **"View Before vs After Memory Impact"** under the AI response:
- **❌ Before Memory (Stateless LLM):** *"I found 50 sarees. What is your budget? Are you looking for silk or cotton? Is there a specific region you prefer?"* (Annoying, repetitive prompting).
- **✅ After Memory (Hindsight):** *"Remembering your preparation for your niece's wedding and keeping to your ₹10,000 budget ceiling, here are certified Pochampally Silk Handlooms..."*

---

### STEP 5: Live Memory Bank Inspection
**Action:** Click the **"Memory Hub"** tab in the modal:
- Shows the live memory cards stored in the bank.
- Review timestamps, confidence scores (95%+), categories (Budget, Dietary, Regional Craft), and relevance explanations.
- Judges can click **"Delete"** or **"Reset Bank"** to verify full dynamic state control.
