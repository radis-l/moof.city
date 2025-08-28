import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Theme Consistency', () => {
  // Test viewport configurations
  const viewports = {
    mobile: [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 667, name: 'iPhone 8' },
      { width: 390, height: 844, name: 'iPhone 12 Pro' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' }
    ],
    tablet: [
      { width: 768, height: 1024, name: 'iPad Portrait' },
      { width: 834, height: 1112, name: 'iPad Air Portrait' },
      { width: 1024, height: 768, name: 'iPad Landscape' }
    ],
    desktop: [
      { width: 1280, height: 720, name: 'Desktop Small' },
      { width: 1440, height: 900, name: 'Desktop Medium' },
      { width: 1920, height: 1080, name: 'Desktop Large' }
    ]
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    
    // Login with default credentials
    await page.waitForSelector('input[type="password"]');
    await page.fill('input[type="password"]', 'Punpun12');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Wait for admin dashboard to load
    await page.waitForSelector('text=Fortune Tell Admin');
  });

  // Mobile Theme Consistency Tests
  for (const viewport of viewports.mobile) {
    test(`Mobile theme consistency - ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Check mobile layout is visible
      const mobileLayout = page.locator('.block.md\\:hidden');
      await expect(mobileLayout).toBeVisible();
      
      // Check mystical background theme
      await expect(mobileLayout).toHaveClass(/bg-gradient-to-br from-purple-900 via-gray-900 to-indigo-900/);
      
      // Check glassmorphism cards
      const cards = page.locator('.bg-white\\/10.backdrop-blur-sm');
      await expect(cards.first()).toBeVisible();
      
      // Check button styling and touch targets
      const buttons = page.locator('button[size="mobile"]');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
      
      // Verify button heights (48px minimum)
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        const boundingBox = await button.boundingBox();
        expect(boundingBox?.height).toBeGreaterThanOrEqual(48);
      }
      
      // Check chart period buttons grid (2x2)
      const chartButtons = page.locator('.grid.grid-cols-2 button');
      const chartButtonCount = await chartButtons.count();
      expect(chartButtonCount).toBe(4);
      
      // Verify chart button heights (48px)
      for (let i = 0; i < chartButtonCount; i++) {
        const button = chartButtons.nth(i);
        const boundingBox = await button.boundingBox();
        expect(boundingBox?.height).toBeGreaterThanOrEqual(48);
      }
    });
  }

  // Tablet Theme Consistency Tests  
  for (const viewport of viewports.tablet) {
    test(`Tablet theme consistency - ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Check tablet layout is visible
      const tabletLayout = page.locator('.hidden.md\\:block.xl\\:hidden');
      await expect(tabletLayout).toBeVisible();
      
      // Check professional gray background
      await expect(tabletLayout).toHaveClass(/bg-gray-100/);
      
      // Check white cards
      const cards = page.locator('.bg-white.rounded-lg.shadow');
      await expect(cards.first()).toBeVisible();
      
      // Check button grouping (2-column grid)
      const buttonGrid = page.locator('.grid.grid-cols-2');
      await expect(buttonGrid).toBeVisible();
      
      // Check button sizing (44px)
      const buttons = page.locator('button[size="tablet"]');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
      
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        const boundingBox = await button.boundingBox();
        expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
      }
      
      // Check chart period buttons (4-column grid)
      const chartButtons = page.locator('.grid.grid-cols-4 button');
      const chartButtonCount = await chartButtons.count();
      expect(chartButtonCount).toBe(4);
    });
  }

  // Desktop Theme Consistency Tests
  for (const viewport of viewports.desktop) {
    test(`Desktop theme consistency - ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Check desktop layout is visible
      const desktopLayout = page.locator('.hidden.xl\\:block');
      await expect(desktopLayout).toBeVisible();
      
      // Check professional gray background
      await expect(desktopLayout).toHaveClass(/bg-gray-100/);
      
      // Check white cards
      const cards = page.locator('.bg-white.rounded-lg.shadow');
      await expect(cards.first()).toBeVisible();
      
      // Check button grouping (data actions left, auth actions right)
      const dataActions = page.locator('.flex.flex-wrap.gap-2').first();
      const authActions = page.locator('.flex.flex-wrap.gap-2.lg\\:ml-auto');
      await expect(dataActions).toBeVisible();
      await expect(authActions).toBeVisible();
      
      // Check button sizing (42px minimum)
      const buttons = page.locator('button[size="desktop"]');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
      
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        const boundingBox = await button.boundingBox();
        expect(boundingBox?.height).toBeGreaterThanOrEqual(42);
      }
      
      // Check chart period buttons (inline layout)
      const chartButtons = page.locator('.flex.flex-wrap button');
      const chartButtonCount = await chartButtons.count();
      expect(chartButtonCount).toBe(4);
    });
  }

  // Cross-breakpoint functionality tests
  test('Button functionality across all breakpoints', async ({ page }) => {
    const testViewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet  
      { width: 1440, height: 900 }  // Desktop
    ];

    for (const viewport of testViewports) {
      await page.setViewportSize(viewport);
      
      // Test Refresh Data button
      const refreshButton = page.locator('button:has-text("Refresh Data")').first();
      await refreshButton.click();
      await expect(refreshButton).toHaveText('Loading...');
      await page.waitForFunction(() => {
        const btn = document.querySelector('button:has-text("Refresh Data")');
        return btn && btn.textContent === 'Refresh Data';
      }, {}, { timeout: 5000 });
      
      // Test chart period switching
      const dailyButton = page.locator('button:has-text("Daily")').first();
      const weeklyButton = page.locator('button:has-text("Weekly")').first();
      
      await dailyButton.click();
      await expect(dailyButton).toHaveClass(/bg-blue-500|bg-purple-500/);
      
      await weeklyButton.click(); 
      await expect(weeklyButton).toHaveClass(/bg-blue-500|bg-purple-500/);
    }
  });

  // Theme color consistency check
  test('Color scheme consistency analysis', async ({ page }) => {
    const testViewports = [
      { width: 375, height: 667, type: 'mobile' },
      { width: 768, height: 1024, type: 'tablet' }, 
      { width: 1440, height: 900, type: 'desktop' }
    ];

    const colorSchemes = {};
    
    for (const viewport of testViewports) {
      await page.setViewportSize(viewport);
      
      // Extract color scheme information
      const backgroundColors = await page.evaluate(() => {
        const layouts = {
          mobile: document.querySelector('.block.md\\:hidden'),
          tablet: document.querySelector('.hidden.md\\:block.xl\\:hidden'),  
          desktop: document.querySelector('.hidden.xl\\:block')
        };
        
        const colors = {};
        for (const [type, element] of Object.entries(layouts)) {
          if (element && getComputedStyle(element).display !== 'none') {
            colors[type] = {
              background: getComputedStyle(element).background,
              backgroundColor: getComputedStyle(element).backgroundColor
            };
          }
        }
        return colors;
      });
      
      colorSchemes[viewport.type] = backgroundColors;
    }
    
    // Log color scheme analysis for manual review
    console.log('Color Scheme Analysis:', JSON.stringify(colorSchemes, null, 2));
    
    // Store results for theme consistency decision
    await page.evaluate((schemes) => {
      window.themeAnalysis = schemes;
    }, colorSchemes);
  });

  // Visual regression prevention
  test('Visual consistency snapshot', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1440, height: 900, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for visual comparison
      await expect(page).toHaveScreenshot(`admin-${viewport.name}-${viewport.width}x${viewport.height}.png`);
    }
  });
});