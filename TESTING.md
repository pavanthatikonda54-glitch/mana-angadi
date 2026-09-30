# 🧪 Automated Test Suite & Verification Report

**Project:** MaNa Angadi — Memory Concierge  
**Date of Execution:** 2026-09-29  
**Result:** 26 / 26 Passed (100% Success Rate)  

---

## 1. How to Run the Automated Test Suite

```bash
# 1. Navigate to backend directory
cd mana-angadi/backend

# 2. Run automated test runner
npm run test
```

---

## 2. Test Execution Log & Verified Scenarios

```text
====================================================
  MaNa Angadi — E2E & Hindsight Memory Test Suite
  Tagline: "Mana Ooru Shopping, Mana Angadi."
====================================================

⚡ Starting in-process test server on http://localhost:5055 ...
Initializing database schema for MaNa Angadi...
Database schema created successfully.
✅ PASS: 1. Server Health Check
✅ PASS: 2. Customer Demo Authentication
✅ PASS: 3. Seller Demo Authentication
✅ PASS: 4. Delivery Partner Demo Authentication
✅ PASS: 5. Admin Demo Authentication
✅ PASS: 6. Fetch Indian Marketplace Categories
✅ PASS: 7. Fetch Active Products Catalog

--- 🧠 Hindsight Persistent Memory Verification ---
✅ PASS: 8. Hindsight Bank Reset & Clean State
✅ PASS: 9. Hindsight Retain: Budget & Occasion Memory
✅ PASS: 10. Hindsight Retain: Regional GI Handloom Preference
✅ PASS: 11. Hindsight Retain: Cold-Pressed Dietary Preference
✅ PASS: 12. Hindsight List Memories: Exact Bank Partition Count (3)
✅ PASS: 13. Hindsight Semantic Recall: Correct High-Confidence Ranking
✅ PASS: 14. Agent Turn 1: Ingests & Automatically Retains New Facts into Hindsight
✅ PASS: 15. Agent Turn 2: Recalls Stored Budget (₹10,000) & Handloom Preference
✅ PASS: 16. Agent Turn 2: Recalled Budget Ceiling Strictly Filtered Matching Products
✅ PASS: 17. Before-Memory vs After-Memory Comparison Generated for Judges
✅ PASS: 18. 1-Click Demo Scenario Seed (4 Realistic Memories)
✅ PASS: 19. Hindsight Subsystem Health Check

--- 🛒 Marketplace & Order Lifecycle Tests ---
✅ PASS: 20. Customer Add to Cart
✅ PASS: 21. Customer Get Cart Items
✅ PASS: 22. Apply Coupon Code MANA10
✅ PASS: 23. Toggle Product Wishlist
✅ PASS: 24. Create UPI Payment Intent
✅ PASS: 25. Customer Complete Order Placement
✅ PASS: 26. Safe Validation: Empty AI Message Rejected with 400

====================================================
  Test Execution Completed!
  Passed: 26 | Failed: 0
====================================================
```

---

## 3. Key Test Coverage Areas

1. **Persistent Memory Lifecycle (`retain` & `recall`)**:
   - Tested retention of budget constraints, occasion context, and regional handloom preferences.
   - Tested isolated memory bank partitioning (`test_hindsight_bank` vs `demo_user_hindsight`).
   - Tested semantic scoring and top-K filtering.

2. **Agent Workflow & Before/After Diff**:
   - Interaction 1 (Onboarding): Explicit preferences ingested and retained into Hindsight.
   - Interaction 2 (Follow-up): Query without budget automatically retrieves the ₹10,000 ceiling from Hindsight and filters catalog items strictly `<= ₹10,000`.
   - Verified generation of side-by-side comparison object (`beforeMemory` vs `afterMemory`).

3. **Multi-Role Marketplace E2E**:
   - JWT authentication for Customer, Seller, Delivery Executive, and Admin.
   - Catalog browsing, Cart, Wishlist, Coupon Engine, Payment Intent, and Order creation.

4. **Security & Input Validation**:
   - Verified rejection of empty message strings with HTTP 400.
   - Verified token validation and role guards.

---

## 4. Known Limitations

- Real vector embeddings in remote cloud mode require active internet and valid `HINDSIGHT_API_KEY`.
- In offline/airgapped environments, the local resilient semantic TF-IDF scoring engine seamlessly takes over without any downtime.
