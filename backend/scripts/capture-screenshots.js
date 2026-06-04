import puppeteer from 'puppeteer-core';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const prisma = new PrismaClient();

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const FRONTEND_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.resolve('screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
}

async function prepareData() {
  console.log('Seeding user and analytics logs for screenshots...');
  
  const email = 'screenshot_admin@villageapi.com';
  const name = 'SaaS Admin';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      plan: 'PRO',
      isActive: true
    },
    create: {
      email,
      name,
      passwordHash,
      role: 'ADMIN',
      plan: 'PRO',
      isActive: true
    }
  });

  // Create active API key for screenshot tests
  const apiKeyKey = 'vap_screenshot_demo_key_2026_xyz';
  const apiKey = await prisma.apiKey.upsert({
    where: { key: apiKeyKey },
    update: {
      isActive: true,
      name: 'Production Key'
    },
    create: {
      key: apiKeyKey,
      name: 'Production Key',
      userId: user.id,
      isActive: true
    }
  });

  // Wipe previous demo logs for this user to make it clean
  await prisma.apiLog.deleteMany({
    where: { userId: user.id }
  });

  // Seed sample request logs over the last 15 days for beautiful charts
  const endpointsList = [
    { path: '/api/v1/villages', weight: 0.5, method: 'GET', statusCodes: [200, 200, 200, 200, 400] },
    { path: '/api/v1/villages/search', weight: 0.25, method: 'GET', statusCodes: [200, 200, 200, 404] },
    { path: '/api/v1/states', weight: 0.15, method: 'GET', statusCodes: [200] },
    { path: '/api/v1/districts', weight: 0.07, method: 'GET', statusCodes: [200] },
    { path: '/api/v1/subdistricts', weight: 0.03, method: 'GET', statusCodes: [200] },
  ];

  const logData = [];
  const now = new Date();
  
  // Seed logs for the past 15 days
  for (let i = 15; i >= 0; i--) {
    const logDate = new Date();
    logDate.setDate(now.getDate() - i);
    // Vary traffic daily
    const trafficCount = 10 + Math.floor(Math.sin(i) * 5) + (i === 0 ? 5 : 0); // extra traffic today

    for (let t = 0; t < trafficCount; t++) {
      const rand = Math.random();
      let selectedEp = endpointsList[0];
      let sum = 0;
      for (const ep of endpointsList) {
        sum += ep.weight;
        if (rand <= sum) {
          selectedEp = ep;
          break;
        }
      }

      const sc = selectedEp.statusCodes[Math.floor(Math.random() * selectedEp.statusCodes.length)];
      const logTime = new Date(logDate);
      logTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      logData.push({
        userId: user.id,
        apiKeyId: apiKey.id,
        endpoint: selectedEp.path,
        method: selectedEp.method,
        statusCode: sc,
        createdAt: logTime
      });
    }
  }

  await prisma.apiLog.createMany({
    data: logData
  });

  console.log(`Successfully seeded ${logData.length} API logs and credentials.`);

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return token;
}

async function capture() {
  const token = await prepareData();

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  
  // Debug listeners
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.toString()));
  page.on('requestfailed', request => console.error('BROWSER REQUEST FAILED:', request.url(), request.failure()?.errorText));

  const takeScreenshot = async (name) => {
    const dest = path.join(SCREENSHOTS_DIR, name);
    await page.screenshot({ path: dest });
    console.log(`Saved screenshot: ${name}`);
  };

  // 1. Landing Page
  console.log('Navigating to Landing Page...');
  await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
  await takeScreenshot('landing_page.png');

  // 2. Login Page
  console.log('Navigating to Login Page...');
  await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
  await takeScreenshot('login.png');

  // Set Auth Token in LocalStorage to log in
  console.log('Setting localStorage authentication token...');
  await page.evaluate((jwtToken) => {
    localStorage.setItem('village_token', jwtToken);
    console.log('LocalStorage set successfully. Token prefix:', jwtToken.substring(0, 15));
  }, token);

  const navigateAndCapture = async (routePath, screenshotName, waitTime = 1500) => {
    const targetUrl = `${FRONTEND_URL}${routePath}`;
    console.log(`Navigating to ${routePath}...`);
    
    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle2' });
      // Wait for h1 to load (give extra time: 15 seconds)
      await page.waitForSelector('h1', { timeout: 15000 });
      // Give charts and pages extra time to load
      await page.evaluate((ms) => new Promise(resolve => setTimeout(resolve, ms)), waitTime);
      await takeScreenshot(screenshotName);
    } catch (err) {
      console.error(`Failed on route ${routePath}:`, err.message);
      const currentUrl = page.url();
      console.error(`Current browser URL is: ${currentUrl}`);
      
      // Dump title and html slice for diagnostics
      const title = await page.title();
      console.error(`Page title: ${title}`);
      
      const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 1000));
      console.error(`HTML slice: ${bodyHTML}`);
      throw err;
    }
  };

  // 3. Dashboard
  await navigateAndCapture('/dashboard', 'dashboard.png', 3000);

  // 4. API Keys
  await navigateAndCapture('/api-keys', 'api_keys.png', 1500);

  // 5. Usage
  await navigateAndCapture('/usage', 'usage.png', 3000);

  // 6. Analytics
  await navigateAndCapture('/analytics', 'analytics.png', 4000);

  // 7. API Explorer
  await navigateAndCapture('/api-explorer', 'api_explorer.png', 1500);

  // 8. Documentation
  await navigateAndCapture('/docs', 'documentation.png', 1500);

  // 9. Settings
  await navigateAndCapture('/settings', 'settings.png', 1500);

  console.log('All screenshots captured successfully!');
  await browser.close();
}

capture().catch(err => {
  console.error('Screenshot capturing failed:', err);
  process.exit(1);
});
