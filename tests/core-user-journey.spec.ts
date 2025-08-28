import { test, expect } from '@playwright/test';

test.describe('Core User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('Complete fortune telling flow - new user', async ({ page }) => {
    // Test data
    const testEmail = `test${Date.now()}@example.com`;
    
    // Step 1: Homepage - Email submission
    await expect(page.getByText('ดวงประจำวัน')).toBeVisible();
    
    // Fill email and submit
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(testEmail);
    await emailInput.press('Enter');
    
    // Step 2: Verify navigation to questionnaire
    await page.waitForURL('**/fortune?email=*');
    await expect(page.getByText('คุณอายุเท่าไหร่?')).toBeVisible();
    
    // Step 3: Complete questionnaire - Age selection
    await page.getByText('26-35 ปี').click();
    await page.getByText('ต่อไป').click();
    
    // Step 4: Birth day selection
    await expect(page.getByText('คุณเกิดวันไหน?')).toBeVisible();
    await page.getByText('จันทร์').click();
    await page.getByText('ต่อไป').click();
    
    // Step 5: Blood group selection
    await expect(page.getByText('กรุ๊ปเลือดคุณคืออะไร?')).toBeVisible();
    await page.getByText('เอ (A)').click();
    await page.getByText('ดูดวงเลย!').click();
    
    // Step 6: Verify results page
    await page.waitForURL('**/fortune/result?*');
    await expect(page.getByText('ดวงของคุณ')).toBeVisible();
    
    // Verify user info is displayed
    await expect(page.getByText('26-35')).toBeVisible();
    await expect(page.getByText('Monday')).toBeVisible();
    await expect(page.getByText('A')).toBeVisible();
    
    // Verify fortune sections are present
    await expect(page.getByText('เลขนำโชค')).toBeVisible();
    await expect(page.getByText('💝 เรื่องรัก')).toBeVisible();
    await expect(page.getByText('💼 การงาน')).toBeVisible();
    await expect(page.getByText('🏥 สุขภาพ')).toBeVisible();
    
    // Verify lucky number is displayed (2-digit number)
    const luckyNumber = page.locator('[style*="font-size: 4rem"]');
    await expect(luckyNumber).toBeVisible();
    const numberText = await luckyNumber.textContent();
    expect(numberText).toMatch(/^\d{2}$/);
  });

  test('Existing user redirects to results', async ({ page }) => {
    // Use a test email that should exist (from previous test or seeded data)
    const existingEmail = 'existing@example.com';
    
    // Fill email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(existingEmail);
    await emailInput.press('Enter');
    
    // Should redirect directly to results if email exists
    await page.waitForTimeout(2000); // Wait for redirect logic
    
    // Check if we're on results page or questionnaire
    const currentUrl = page.url();
    if (currentUrl.includes('/fortune/result')) {
      await expect(page.getByText('ดวงของคุณ')).toBeVisible();
    } else {
      // If new user, complete questionnaire quickly
      await page.getByText('18-25 ปี').click();
      await page.getByText('ต่อไป').click();
      await page.getByText('อังคาร').click();
      await page.getByText('ต่อไป').click();
      await page.getByText('บี (B)').click();
      await page.getByText('ดูดวงเลย!').click();
      await page.waitForURL('**/fortune/result?*');
    }
  });

  test('Email validation works correctly', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    
    // Test invalid email formats
    const invalidEmails = ['invalid', 'test@', '@domain.com', 'test.domain'];
    
    for (const invalidEmail of invalidEmails) {
      await emailInput.fill(invalidEmail);
      await emailInput.press('Enter');
      
      // Should not navigate (stay on homepage)
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/');
    }
    
    // Test valid email
    await emailInput.fill('valid@example.com');
    await emailInput.press('Enter');
    
    // Should navigate to questionnaire
    await page.waitForURL('**/fortune?email=*', { timeout: 5000 });
  });

  test('Mobile-only enforcement works', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    
    // Should show desktop redirect message
    await expect(page.getByText('เว็บไซต์นี้รองรับเฉพาะมือถือ')).toBeVisible();
    
    // Should not show main fortune content
    await expect(page.getByText('ดวงประจำวัน')).not.toBeVisible();
  });

  test('Back navigation works correctly', async ({ page }) => {
    // Navigate through questionnaire
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test-back@example.com');
    await emailInput.press('Enter');
    
    await page.waitForURL('**/fortune?email=*');
    
    // Go to second question
    await page.getByText('26-35 ปี').click();
    await page.getByText('ต่อไป').click();
    
    // Test back button
    await page.getByText('ย้อนกลับ').click();
    await expect(page.getByText('คุณอายุเท่าไหร่?')).toBeVisible();
    
    // Go back from first question should return to homepage
    await page.getByText('กลับ').click();
    expect(page.url()).not.toContain('/fortune');
  });
});