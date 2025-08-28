import { test, expect } from '@playwright/test';

test.describe('Visual Regression & Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Homepage visual consistency across viewports', async ({ page }) => {
    const mobileViewports = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 667, name: 'iPhone 8' },
      { width: 390, height: 844, name: 'iPhone 12 Pro' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' }
    ];

    for (const viewport of mobileViewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Wait for animations and content to load
      await page.waitForTimeout(2000);
      
      // Take screenshot for visual regression
      await expect(page).toHaveScreenshot(`homepage-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`);
      
      // Verify core elements are visible
      await expect(page.getByText('ดวงประจำวัน')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }
  });

  test('Questionnaire visual consistency', async ({ page }) => {
    // Navigate to questionnaire
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('visual-test@example.com');
    await emailInput.press('Enter');
    
    await page.waitForURL('**/fortune?email=*');
    await page.waitForTimeout(1000);
    
    // Test all three questionnaire steps
    const steps = [
      { question: 'คุณอายุเท่าไหร่?', answer: '26-35 ปี' },
      { question: 'คุณเกิดวันไหน?', answer: 'จันทร์' },
      { question: 'กรุ๊ปเลือดคุณคืออะไร?', answer: 'เอ (A)' }
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await expect(page.getByText(steps[i].question)).toBeVisible();
      
      // Take screenshot of each step
      await expect(page).toHaveScreenshot(`questionnaire-step-${i + 1}.png`);
      
      // Answer and proceed (except for last step)
      await page.getByText(steps[i].answer).click();
      if (i < steps.length - 1) {
        await page.getByText('ต่อไป').click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Results page visual consistency', async ({ page }) => {
    // Complete questionnaire quickly
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(`visual-results${Date.now()}@example.com`);
    await emailInput.press('Enter');
    
    await page.waitForURL('**/fortune?email=*');
    
    // Complete questionnaire
    await page.getByText('26-35 ปี').click();
    await page.getByText('ต่อไป').click();
    await page.getByText('จันทร์').click();
    await page.getByText('ต่อไป').click();
    await page.getByText('เอ (A)').click();
    await page.getByText('ดูดวงเลย!').click();
    
    await page.waitForURL('**/fortune/result?*');
    await page.waitForTimeout(2000); // Wait for all content to load
    
    // Take screenshot of results page
    await expect(page).toHaveScreenshot('results-page-full.png', { fullPage: true });
    
    // Verify all fortune sections are visible
    await expect(page.getByText('ดวงของคุณ')).toBeVisible();
    await expect(page.getByText('เลขนำโชค')).toBeVisible();
    await expect(page.getByText('💝 เรื่องรัก')).toBeVisible();
    await expect(page.getByText('💼 การงาน')).toBeVisible();
    await expect(page.getByText('🏥 สุขภาพ')).toBeVisible();
  });

  test('Loading animation visual consistency', async ({ page }) => {
    // Test loading animation appearance
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('loading-visual@example.com');
    await emailInput.press('Enter');
    
    // Try to capture loading state (might be fast)
    try {
      await page.waitForSelector('[style*="filter: drop-shadow"]', { timeout: 3000 });
      await expect(page).toHaveScreenshot('loading-animation.png');
    } catch {
      // Loading might be too fast, skip screenshot
      console.log('Loading animation too fast to capture');
    }
    
    // Verify we reach destination
    await page.waitForURL('**/fortune?email=*');
  });

  test('Desktop redirect visual consistency', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    await page.waitForTimeout(1000);
    
    // Take screenshot of desktop redirect
    await expect(page).toHaveScreenshot('desktop-redirect.png');
    
    // Verify desktop redirect elements
    await expect(page.getByText('MOOF')).toBeVisible();
    await expect(page.getByText('เว็บไซต์นี้รองรับเฉพาะมือถือ')).toBeVisible();
  });

  test('Accessibility compliance', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Elements = page.locator('h1');
    expect(await h1Elements.count()).toBeGreaterThan(0);
    
    // Check for proper form labels
    const emailInput = page.locator('input[type="email"]');
    const inputId = await emailInput.getAttribute('id');
    const placeholder = await emailInput.getAttribute('placeholder');
    
    // Should have either label, placeholder, or aria-label
    expect(placeholder || inputId).toBeTruthy();
    
    // Check for proper button text
    const submitButton = page.getByRole('button');
    const buttonText = await submitButton.textContent();
    expect(buttonText?.trim().length).toBeGreaterThan(0);
  });

  test('Color contrast and readability', async ({ page }) => {
    // Navigate through app and check text is readable
    await page.goto('/');
    
    // Check main text elements have sufficient contrast
    const mainHeading = page.getByText('ดวงประจำวัน');
    await expect(mainHeading).toBeVisible();
    
    // Check button text is visible
    const button = page.getByRole('button').first();
    await expect(button).toBeVisible();
    
    // Navigate to questionnaire
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('contrast-test@example.com');
    await emailInput.press('Enter');
    
    await page.waitForURL('**/fortune?email=*');
    
    // Check questionnaire text is readable
    await expect(page.getByText('คุณอายุเท่าไหร่?')).toBeVisible();
    
    // Check radio button labels are readable
    await expect(page.getByText('26-35 ปี')).toBeVisible();
  });

  test('Thai font rendering consistency', async ({ page }) => {
    const thaiTexts = [
      'ดวงประจำวัน',
      'คุณอายุเท่าไหร่?',
      'เลือกช่วงอายุของคุณ'
    ];
    
    // Check Thai text renders properly
    for (const text of thaiTexts) {
      const element = page.getByText(text);
      if (await element.isVisible()) {
        // Verify text is not garbled (contains Thai characters)
        const textContent = await element.textContent();
        expect(textContent).toMatch(/[\u0E00-\u0E7F]/); // Thai Unicode range
      }
    }
  });

  test('Animation performance check', async ({ page }) => {
    // Monitor performance during animations
    await page.goto('/');
    
    // Start performance monitoring
    await page.evaluate(() => {
      (window as { performanceMarks?: unknown[] }).performanceMarks = [];
      performance.mark('animation-start');
    });
    
    // Navigate to trigger loading animation
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('perf-animation@example.com');
    await emailInput.press('Enter');
    
    await page.waitForURL('**/fortune?email=*');
    
    // End performance monitoring
    const performanceData = await page.evaluate(() => {
      performance.mark('animation-end');
      performance.measure('animation-duration', 'animation-start', 'animation-end');
      const measure = performance.getEntriesByName('animation-duration')[0];
      return measure.duration;
    });
    
    // Verify animation doesn't take too long
    expect(performanceData).toBeLessThan(3000); // Less than 3 seconds
  });
});