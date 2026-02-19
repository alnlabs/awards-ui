import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
    test('should view user profile', async ({ page }) => {
        await page.goto('/profile');
        await expect(page.getByText(/User Profile/i).first()).toBeVisible({ timeout: 15000 });

        // Check for display name or email
        await expect(page.getByText(/admin@company.com/i)).toBeVisible();
    });

    test('should display role badge on profile', async ({ page }) => {
        await page.goto('/profile');
        await expect(page.locator('.badge').filter({ hasText: 'SUPER_ADMIN' })).toBeVisible();
    });
});
