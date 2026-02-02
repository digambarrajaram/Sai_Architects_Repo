# Web Testing Setup for Sai_App

# 1. Install Playwright
npm install -D @playwright/test
npx playwright install chromium

# 2. Create web test file
@"
import { test, expect } from '@playwright/test';

test('login screen renders', async ({ page }) => {
  await page.goto('http://localhost:8081');
  await expect(page.locator('input[placeholder=\"Enter your ID\"]')).toBeVisible();
});

test('login with owner credentials', async ({ page }) => {
  await page.goto('http://localhost:8081');
  await page.fill('input[placeholder=\"Enter your ID\"]', 'james_owner');
  await page.fill('input[placeholder=\"••••••••\"]', 'password123');
  await page.click('button:has-text(\"Sign In securely\")');
  await expect(page.locator('text=Projects')).toBeVisible();
});
"@ | Out-File -Encoding ASCII e2e/web/login.test.js

# 3. Start the app in web mode
# In a separate terminal:
# npx expo start --web

# 4. Run web tests
npx playwright test e2e/web/
