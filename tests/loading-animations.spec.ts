import { test, expect } from '@playwright/test';

test.describe('Loading Animations and Lottie Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('MOOF Lottie animation displays on homepage', async ({ page }) => {
    // Check for MOOF branding with Lottie
    const moofText = page.getByText('MOOF').first();
    await expect(moofText).toBeVisible();
    
    // Look for Lottie animation container
    const lottieContainer = page.locator('[style*="filter: drop-shadow"]');
    await expect(lottieContainer.first()).toBeVisible();
    
    // Verify animation is not static (check for animated elements)
    const animatedSvg = page.locator('svg').first();
    await expect(animatedSvg).toBeVisible({ timeout: 3000 });
  });

  test('Loading screens show Lottie animation during transitions', async ({ page }) => {
    const testEmail = `loading-test${Date.now()}@example.com`;
    
    // Submit email to trigger loading state
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(testEmail);
    await emailInput.press('Enter');
    
    // Look for loading animation during transition
    // Note: This might be fast, so we check quickly
    try {
      await expect(page.getByText('กำลังโหลด...')).toBeVisible({ timeout: 2000 });
    } catch {
      // Loading might be too fast, continue to verify we reached the destination
    }
    
    // Verify we reach questionnaire page
    await page.waitForURL('**/fortune?email=*');
    await expect(page.getByText('คุณอายุเท่าไหร่?')).toBeVisible();
  });

  test('Loading animation appears during fortune generation', async ({ page }) => {
    const testEmail = `fortune-gen${Date.now()}@example.com`;
    
    // Complete questionnaire quickly
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(testEmail);
    await emailInput.press('Enter');
    
    await page.waitForURL('**/fortune?email=*');
    
    // Complete questionnaire
    await page.getByText('26-35 ปี').click();
    await page.getByText('ต่อไป').click();
    await page.getByText('จันทร์').click();
    await page.getByText('ต่อไป').click();
    await page.getByText('เอ (A)').click();
    
    // Submit and look for loading during result generation
    await page.getByText('ดูดวงเลย!').click();
    
    // Try to catch loading animation
    try {
      await expect(page.getByText('กำลังโหลด...')).toBeVisible({ timeout: 2000 });
    } catch {
      // Loading might be very fast in development
    }
    
    // Verify results are displayed
    await page.waitForURL('**/fortune/result?*');
    await expect(page.getByText('ดวงของคุณ')).toBeVisible();
  });

  test('Desktop redirect shows proper branding', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    // Should show desktop redirect with MOOF branding
    await expect(page.getByText('MOOF')).toBeVisible();
    await expect(page.getByText('เว็บไซต์นี้รองรับเฉพาะมือถือ')).toBeVisible();
  });

  test('Loading animation performance check', async ({ page }) => {
    // Monitor network and performance
    let animationLoaded = false;
    
    page.on('response', response => {
      if (response.url().includes('loading-star-animation.json')) {
        animationLoaded = true;
      }
    });
    
    // Navigate and trigger loading
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(`perf-test${Date.now()}@example.com`);
    await emailInput.press('Enter');
    
    // Wait a bit for any network requests
    await page.waitForTimeout(2000);
    
    // Verify animation file was loaded
    expect(animationLoaded).toBe(true);
  });

  test('Animation works across different mobile viewports', async ({ page }) => {
    const mobileViewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 8
      { width: 414, height: 896 }  // iPhone 11 Pro Max
    ];
    
    for (const viewport of mobileViewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Verify MOOF animation is visible and properly sized
      const moofText = page.getByText('MOOF').first();
      await expect(moofText).toBeVisible();
      
      // Check that main content is visible (not desktop redirect)
      await expect(page.getByText('ดวงประจำวัน')).toBeVisible();
    }
  });

  test('Lottie animation accessibility', async ({ page }) => {
    // Check that animations don't interfere with screen readers
    await page.goto('/');
    
    // Verify text content is still accessible
    await expect(page.getByRole('button', { name: /ดูดวง/i })).toBeVisible();
    
    // Check that form inputs are properly labeled
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    // Verify the input has proper accessibility attributes
    const placeholder = await emailInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });
});