# 🎥 Demo Video Script: MaNa Angadi & Hindsight Persistent Memory

**Title:** Stateful AI Commerce: Powering Multi-Vendor Regional Procurement with Hindsight Agent Memory  
**Target Length:** 4 Minutes  

---

## ⏱️ Video Structure & Scene-by-Scene Directions

---

### SCENE 1: Introduction (0:00 – 0:30)
**Visual / Screen Action:**
- Screen captures browser showing MaNa Angadi homepage (`http://localhost:5173`) with vibrant banners, Indian craft badges, and regional categories (Pochampally Handlooms, Cold Pressed Oils, Kondapalli Toys).
- Cursor hovers over the floating **"Ask MaNa AI"** button.

**Voiceover / Script:**
> *"Welcome! Today, we're demonstrating **MaNa Angadi**, an Indian regional multi-vendor marketplace concierge. What sets MaNa Angadi apart is not just its catalog of authentic GI-tagged crafts and farm-direct groceries—it's that our AI shopping assistant has **persistent agent memory** powered by Vectorize Hindsight. Let's see why memory is the defining factor in conversational commerce."*

---

### SCENE 2: The Problem Without Memory (0:30 – 1:00)
**Visual / Screen Action:**
- Open the AI Modal with the **Memory Toggle set to DISABLED (Stateless Mode)**.
- Type: *"Show me gifts for a wedding."*
- Show the chatbot response asking 4 generic questions: *"What is your budget? Do you want silk or cotton? What city?"*

**Voiceover / Script:**
> *"Here's the problem with 99% of e-commerce chatbots today: they have complete amnesia. Even if you spent twenty minutes explaining your budget ceiling and dietary constraints yesterday, today you start from zero. The agent forces you to re-type your requirements repeatedly. This causes enormous friction and cart abandonment."*

---

### SCENE 3: Live Demonstration — Retain, Recall & Act (1:00 – 3:30)

#### Part A: Ingesting Context (Interaction 1)
**Visual / Screen Action:**
- Switch **Hindsight Memory Toggle to ACTIVE**.
- Click the demo button: **"1. Seed Interaction 1"** (or type: *"I need to buy Pochampally handlooms and cold-pressed oils for my niece's wedding in Hyderabad, keep budget under ₹10,000."*).
- Point cursor to the green badge: **"Retained 3 new preference constraints into Hindsight Bank"**.

**Voiceover / Script:**
> *"Now, watch what happens when we enable Hindsight Persistent Memory. In this first interaction, the customer establishes their context: shopping for a niece's wedding in Hyderabad, a strict budget ceiling of ₹10,000, a preference for authentic Pochampally silk handlooms, and organic cold-pressed oils. Hindsight automatically extracts and persists these facts into the customer's isolated memory bank."*

#### Part B: The Recall Moment (Interaction 2)
**Visual / Screen Action:**
- Clear the input and simulate returning in a new session.
- Click demo button: **"2. Test Interaction 2"** (or type: *"Show me suitable gifts for the wedding ceremony."*).
- Notice the agent instantly renders curated Pochampally Silk Handlooms with prices under ₹10,000 (e.g. ₹8,499).
- Point cursor to the purple badge showing: **"Retrieved 3 Hindsight Memories (Score: 0.96)"**.

**Voiceover / Script:**
> *"Three days later, the customer returns and simply asks: 'Show me suitable gifts for the wedding ceremony.' Notice we did NOT re-enter the budget or fabric type. Hindsight immediately recalled the ₹10,000 budget ceiling and Pochampally silk preference, filtering the catalog in one turn with zero repetitive prompting!"*

#### Part C: Memory Hub & Before/After Diff
**Visual / Screen Action:**
- Click **"View Before vs After Memory Impact"** button under the AI response to show the side-by-side comparison.
- Switch to the **"Memory Hub"** tab to reveal the live bank memories, timestamps, and confidence scores.

**Voiceover / Script:**
> *"We've built complete transparency into the UI. Under each turn, users and developers can view the Before-vs-After diff showing how memory transformed a generic query into a laser-focused action. In the Memory Hub tab, you can inspect the exact memory cards, confidence levels, and relevance explanations stored in Hindsight."*

---

### SCENE 4: Technical Architecture & Hindsight Integration (3:30 – 4:00)
**Visual / Screen Action:**
- Display `ARCHITECTURE.md` mermaid diagram or code editor showcasing `hindsightService.ts` (`retain()` and `recall()` methods).

**Voiceover / Script:**
> *"Under the hood, MaNa Angadi uses a dedicated Hindsight service abstraction. Our backend orchestrator calls Hindsight's retain endpoint during ingestion and the recall endpoint on subsequent turns. The recalled memories are synthesized directly into the SQL query engine to enforce hard constraints like budget caps and regional authenticity."*

---

### SCENE 5: Conclusion & Wrap-Up (4:00 – 4:30)
**Visual / Screen Action:**
- Switch back to the marketplace storefront. Add the recalled Pochampally Saree to cart and show the smooth checkout and order tracking flow.
- Display the GitHub repository URL and documentation links on screen.

**Voiceover / Script:**
> *"Persistent memory turns conversational interfaces from forgetful bots into proactive, intelligent commerce partners. With Vectorize Hindsight, we achieved this with clean architecture and seamless developer ergonomics. Check out the complete open-source code and 26-test automated suite on GitHub. Thank you!"*
