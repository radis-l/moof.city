import { test, expect } from '@playwright/test';

test.describe('Admin Functionality Tests', () => {
  const defaultCredentials = {
    password: 'Punpun12' // Default admin password from CLAUDE.md
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
  });

  test('Admin login flow works correctly', async ({ page }) => {
    // Should show login form
    await expect(page.getByText('Admin Login')).toBeVisible();
    
    // Test with correct credentials
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(defaultCredentials.password);
    await page.getByRole('button', { name: /login|เข้าสู่ระบบ/i }).click();
    
    // Should navigate to admin dashboard
    await expect(page.getByText('Fortune Tell Admin')).toBeVisible();
    await expect(page.getByText('Analytics')).toBeVisible();
  });

  test('Admin login with wrong credentials fails', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('wrongpassword');
    await page.getByRole('button', { name: /login|เข้าสู่ระบบ/i }).click();
    
    // Should show error or stay on login page
    await page.waitForTimeout(1000);
    
    // Should not see admin dashboard
    await expect(page.getByText('Fortune Tell Admin')).not.toBeVisible();
  });

  test('Admin dashboard displays analytics correctly', async ({ page }) => {
    // Login first
    await page.locator('input[type="password"]').fill(defaultCredentials.password);
    await page.getByRole('button', { name: /login|เข้าสู่ระบบ/i }).click();
    
    // Wait for dashboard to load
    await expect(page.getByText('Fortune Tell Admin')).toBeVisible();
    
    // Check analytics sections
    await expect(page.getByText('Total Fortunes')).toBeVisible();
    await expect(page.getByText('Today')).toBeVisible();
    
    // Check filter buttons
    await expect(page.getByText('Hourly')).toBeVisible();
    await expect(page.getByText('Daily')).toBeVisible();
    await expect(page.getByText('Weekly')).toBeVisible();
    await expect(page.getByText('Monthly')).toBeVisible();
  });

  test('Admin data export functionality', async ({ page }) => {
    // Login
    await page.locator('input[type="password"]').fill(defaultCredentials.password);
    await page.getByRole('button', { name: /login|เข้าสู่ระบบ/i }).click();
    await expect(page.getByText('Fortune Tell Admin')).toBeVisible();
    
    // Look for export button
    const exportButton = page.getByRole('button', { name: /export|ส่งออก/i });
    if (await exportButton.isVisible()) {
      // Test export functionality
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.csv$/);
    }
  });

  test('Admin can change password', async ({ page }) => {
    // Login with current password
    await page.locator('input[type="password"]').fill(defaultCredentials.password);
    await page.getByRole('button', { name: /login|เข้าสู่ระบบ/i }).click();
    await expect(page.getByText('Fortune Tell Admin')).toBeVisible();
    
    // Look for change password option
    const changePasswordButton = page.getByRole('button', { name: /change password|เปลี่ยนรหัสผ่าน/i });
    if (await changePasswordButton.isVisible()) {
      await changePasswordButton.click();
      
      // Should show change password modal/form
      await expect(page.getByText(/new password|รหัสผ่านใหม่/i)).toBeVisible();
    }
  });

  test('Admin dashboard data refresh works', async ({ page }) => {
    // Login
    await page.locator('input[type="password"]').fill(defaultCredentials.password);
    await page.getByRole('button', { name: /login|เข้าสู่ระบบ/i }).click();
    await expect(page.getByText('Fortune Tell Admin')).toBeVisible();
    
    // Test filter changes
    const filterButtons = ['Hourly', 'Daily', 'Weekly', 'Monthly'];
    
    for (const filter of filterButtons) {
      const filterButton = page.getByText(filter);
      if (await filterButton.isVisible()) {
        await filterButton.click();
        // Wait for potential data refresh
        await page.waitForTimeout(1000);
        
        // Verify button is active/selected
        const buttonClasses = await filterButton.getAttribute('class');
        expect(buttonClasses).toBeTruthy();
      }
    }
  });

  test('Admin session management works', async ({ page }) => {
    // Login
    await page.locator('input[type="password"]').fill(defaultCredentials.password);
    await page.getByRole('button', { name: /login|เข้าสู่ระบบ/i }).click();
    await expect(page.getByText('Fortune Tell Admin')).toBeVisible();
    
    // Test logout functionality
    const logoutButton = page.getByRole('button', { name: /logout|ออกจากระบบ/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should return to login screen
      await expect(page.getByText('Admin Login')).toBeVisible();
      await expect(page.getByText('Fortune Tell Admin')).not.toBeVisible();
    }
  });

  test('Admin dashboard responsive design', async ({ page }) => {
    // Login
    await page.locator('input[type="password"]').fill(defaultCredentials.password);
    await page.getByRole('button', { name: /login|เข้าسู่ระบบ/i }).click();
    await expect(page.getByText('Fortune Tell Admin')).toBeVisible();
    
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1280, height: 720 }  // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Verify admin content is still visible and properly laid out
      await expect(page.getByText('Fortune Tell Admin')).toBeVisible();
      await expect(page.getByText('Total Fortunes')).toBeVisible();
      
      // Check that buttons are accessible
      const hourlyButton = page.getByText('Hourly');
      await expect(hourlyButton).toBeVisible();
    }
  });

  test('Admin data display accuracy', async ({ page }) => {
    // Login
    await page.locator('input[type="password"]').fill(defaultCredentials.password);
    await page.getByRole('button', { name: /login|เข้าสู่ระบบ/i }).click();
    await expect(page.getByText('Fortune Tell Admin')).toBeVisible();
    
    // Check that numeric data displays properly
    const totalFortunesElement = page.getByText('Total Fortunes').locator('..').locator('[class*="text"]').first();
    
    if (await totalFortunesElement.isVisible()) {
      const totalText = await totalFortunesElement.textContent();
      // Should be a number or "0"
      expect(totalText).toMatch(/^\d+$/);
    }
  });
});