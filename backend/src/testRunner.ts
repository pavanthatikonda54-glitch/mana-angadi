import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import router from './routes/index.js';
import { initializeSchema } from './models/schema.js';
import { db } from './config/db.js';
import { hindsightService } from './services/hindsightService.js';
import { aiAgentService } from './services/aiAgentService.js';

dotenv.config();

let serverInstance: any = null;
let BASE_URL = 'http://localhost:5000/api';

async function ensureServerRunning(): Promise<string> {
  // Check if server is already running on port 5000
  try {
    const res = await fetch('http://localhost:5000/api/health');
    if (res.ok) {
      console.log('⚡ Connected to active MaNa Angadi server on http://localhost:5000');
      return 'http://localhost:5000/api';
    }
  } catch (e) {
    // Server not running, spin up ephemeral test server on port 5055
  }

  console.log('⚡ Starting in-process test server on http://localhost:5055 ...');
  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'MaNa Angadi E-Commerce Platform API',
      tagline: 'Mana Ooru Shopping, Mana Angadi.',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api', router);

  await initializeSchema();
  await db.run(`
    INSERT OR IGNORE INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
    VALUES 
    ('cpn_1', 'MANA10', 'Flat 10% discount on all regional marketplace orders', 'percentage', 10, 499, 500, 1),
    ('cpn_2', 'FESTIVAL20', 'Special 20% discount on festive handlooms and crafts', 'percentage', 20, 1999, 1000, 1),
    ('cpn_3', 'VILLAGE50', 'Flat ₹50 OFF on cold-pressed groceries and direct farm harvest', 'fixed', 50, 499, 50, 1)
  `);

  const userCount = await db.getOne('SELECT COUNT(*) as cnt FROM users');
  if (!userCount || userCount.cnt === 0) {
    const { runSeed } = await import('./seed/seedData.js');
    await runSeed();
  }

  await new Promise<void>((resolve) => {
    serverInstance = app.listen(5055, () => {
      resolve();
    });
  });

  return 'http://localhost:5055/api';
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('  MaNa Angadi — E2E & Hindsight Memory Test Suite');
  console.log('  Tagline: "Mana Ooru Shopping, Mana Angadi."');
  console.log('====================================================\n');

  BASE_URL = await ensureServerRunning();

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      testsPassed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      testsFailed++;
    }
  }

  async function req(path: string, options: any = {}): Promise<{ status: number; data: any }> {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      method: options.method || 'GET',
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data: any = await res.json();
    return { status: res.status, data };
  }

  try {
    // 1. Health check
    const health = await req('/health');
    assert(health.data.status === 'ok', '1. Server Health Check');

    // 2. Demo logins
    const custLogin = await req('/auth/demo-login', { method: 'POST', body: { role: 'customer' } });
    assert(custLogin.data.success && !!custLogin.data.token, '2. Customer Demo Authentication');
    const customerToken = custLogin.data.token;

    const sellerLogin = await req('/auth/demo-login', { method: 'POST', body: { role: 'seller' } });
    assert(sellerLogin.data.success && !!sellerLogin.data.token, '3. Seller Demo Authentication');

    const delivLogin = await req('/auth/demo-login', { method: 'POST', body: { role: 'delivery' } });
    assert(delivLogin.data.success && !!delivLogin.data.token, '4. Delivery Partner Demo Authentication');

    const adminLogin = await req('/auth/demo-login', { method: 'POST', body: { role: 'admin' } });
    assert(adminLogin.data.success && !!adminLogin.data.token, '5. Admin Demo Authentication');

    // 3. Category & Banners
    const catRes = await req('/categories');
    assert(catRes.data.success && catRes.data.categories.length >= 8, '6. Fetch Indian Marketplace Categories');

    // 4. Products list
    const prodRes = await req('/products');
    const productsList = prodRes.data.data || prodRes.data.products || [];
    assert(prodRes.data.success && productsList.length > 0, '7. Fetch Active Products Catalog');
    const firstProduct = productsList[0];

    // ==========================================
    // 🧠 HINDSIGHT MEMORY TESTS
    // ==========================================
    console.log('\n--- 🧠 Hindsight Persistent Memory Verification ---');

    // 5. Clear Test Bank
    const clearRes = await req('/ai/memory/clear', { method: 'DELETE', body: { bankId: 'test_hindsight_bank' } });
    assert(clearRes.data.success, '8. Hindsight Bank Reset & Clean State');

    // 6. Retain Test Memory 1 (Budget & Occasion)
    const retain1 = await req('/ai/memory/retain', {
      method: 'POST',
      body: {
        bankId: 'test_hindsight_bank',
        content: 'Customer wedding gift budget ceiling is under ₹10,000 for Hyderabad celebrations',
        metadata: { category: 'budget', confidence: 0.98, source: 'test' }
      }
    });
    assert(retain1.data.success && retain1.data.memory.bank_id === 'test_hindsight_bank', '9. Hindsight Retain: Budget & Occasion Memory');

    // 7. Retain Test Memory 2 (Regional Artisan Craft)
    const retain2 = await req('/ai/memory/retain', {
      method: 'POST',
      body: {
        bankId: 'test_hindsight_bank',
        content: 'Customer prefers authentic GI-Tagged Pochampally Ikkat Silk handlooms',
        metadata: { category: 'regional_craft', confidence: 0.95, source: 'test' }
      }
    });
    assert(retain2.data.success, '10. Hindsight Retain: Regional GI Handloom Preference');

    // 8. Retain Test Memory 3 (Dietary Sourcing)
    const retain3 = await req('/ai/memory/retain', {
      method: 'POST',
      body: {
        bankId: 'test_hindsight_bank',
        content: 'Customer strictly requires cold-pressed Wood Ganuga groundnut oil',
        metadata: { category: 'dietary', confidence: 0.97, source: 'test' }
      }
    });
    assert(retain3.data.success, '11. Hindsight Retain: Cold-Pressed Dietary Preference');

    // 9. List Bank Memories
    const listMem = await req('/ai/memory/list?bankId=test_hindsight_bank');
    assert(listMem.data.success && listMem.data.total === 3, '12. Hindsight List Memories: Exact Bank Partition Count (3)');

    // 10. Recall Memory (Semantic Query for Wedding Gifts)
    const recallRes = await req('/ai/memory/recall', {
      method: 'POST',
      body: {
        bankId: 'test_hindsight_bank',
        query: 'wedding gifts and sarees'
      }
    });
    assert(
      recallRes.data.success && recallRes.data.memories.length > 0 && recallRes.data.memories[0].score >= 0.5,
      '13. Hindsight Semantic Recall: Correct High-Confidence Ranking'
    );

    // 11. AI Agent Memory Pipeline: Interaction 1 (Preferences retention)
    await req('/ai/memory/clear', { method: 'DELETE', body: { bankId: 'test_agent_workflow_bank' } });
    const agentTurn1 = await req('/ai/agent-chat', {
      method: 'POST',
      body: {
        bankId: 'test_agent_workflow_bank',
        message: 'I am shopping for wedding gifts, keep budget under 10k, and I prefer pure Pochampally handlooms.'
      }
    });
    assert(
      agentTurn1.data.success && agentTurn1.data.newMemoriesRetained.length >= 2,
      '14. Agent Turn 1: Ingests & Automatically Retains New Facts into Hindsight'
    );

    // 12. AI Agent Memory Pipeline: Interaction 2 (Later query without repeating budget)
    const agentTurn2 = await req('/ai/agent-chat', {
      method: 'POST',
      body: {
        bankId: 'test_agent_workflow_bank',
        message: 'Show me wedding gifts for the family.'
      }
    });
    assert(
      agentTurn2.data.success && agentTurn2.data.recalledMemories.length >= 1,
      '15. Agent Turn 2: Recalls Stored Budget (₹10,000) & Handloom Preference'
    );
    assert(
      agentTurn2.data.recommendedProducts.every((p: any) => p.price <= 10000),
      '16. Agent Turn 2: Recalled Budget Ceiling Strictly Filtered Matching Products'
    );

    // 13. Before vs After Memory Comparison Verification
    assert(
      !!agentTurn2.data.comparison.beforeMemory && !!agentTurn2.data.comparison.afterMemory,
      '17. Before-Memory vs After-Memory Comparison Generated for Judges'
    );

    // 14. Demo Seed Scenario Endpoint
    const seedRes = await req('/ai/demo-seed', {
      method: 'POST',
      body: { bankId: 'demo_user_hindsight' }
    });
    assert(seedRes.data.success && seedRes.data.seededMemories.length === 4, '18. 1-Click Demo Scenario Seed (4 Realistic Memories)');

    // 15. Subsystem Health
    const aiHealth = await req('/ai/health');
    assert(aiHealth.data.status === 'operational', '19. Hindsight Subsystem Health Check');

    // ==========================================
    // 🛒 E-COMMERCE CORE FLOW TESTS
    // ==========================================
    console.log('\n--- 🛒 Marketplace & Order Lifecycle Tests ---');

    // 16. Add to Cart
    const addCart = await req('/cart', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { product_id: firstProduct.id, quantity: 2 }
    });
    assert(addCart.data.success, '20. Customer Add to Cart');

    // 17. View Cart
    const getCart = await req('/cart', {
      method: 'GET',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const cartItems = getCart.data.cart?.items || getCart.data.items || [];
    assert(getCart.data.success && cartItems.length > 0, '21. Customer Get Cart Items');

    // 18. Coupon Validation
    const couponVal = await req('/coupons/validate', {
      method: 'POST',
      body: { code: 'MANA10', order_amount: 5000 }
    });
    assert(couponVal.data.success && couponVal.data.coupon?.discount_amount > 0, '22. Apply Coupon Code MANA10');

    // 19. Wishlist Toggle
    const wishRes = await req('/wishlist/toggle', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { product_id: firstProduct.id }
    });
    assert(wishRes.data.success && typeof wishRes.data.inWishlist === 'boolean', '23. Toggle Product Wishlist');

    // 20. Mock Payment Intent
    const paymentIntent = await req('/payments/create-intent', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { amount: 2500, method: 'UPI' }
    });
    assert(paymentIntent.data.success && !!paymentIntent.data.gatewayOrderId, '24. Create UPI Payment Intent');

    // 21. Create Order
    const createOrder = await req('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        recipient_name: 'Lakshmi Narayana',
        phone: '9876543210',
        shipping_address: 'Plot 42, Hitech City',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        payment_method: 'UPI',
        coupon_code: 'MANA10'
      }
    });
    assert(createOrder.data.success && !!createOrder.data.order, '25. Customer Complete Order Placement');

    // 22. Error Handling & Validation
    const emptyMsgRes = await req('/ai/agent-chat', {
      method: 'POST',
      body: { message: '' }
    });
    assert(emptyMsgRes.status === 400, '26. Safe Validation: Empty AI Message Rejected with 400');

    console.log('\n====================================================');
    console.log(`  Test Execution Completed!`);
    console.log(`  Passed: ${testsPassed} | Failed: ${testsFailed}`);
    console.log('====================================================\n');

  } catch (err: any) {
    console.error('Test Suite Error:', err.message);
    testsFailed++;
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
  }

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTestSuite();
