import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
    test('should list users with correct roles', async ({ page }) => {
        await page.goto('/users');
        // Check for table headers instead of page heading for better reliability
        await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible({ timeout: 15000 });

        // Check for at least one user row
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });

        // Check for role badges
        await expect(page.locator('.badge').filter({ hasText: 'SUPER_ADMIN' }).first()).toBeVisible();
    });

    test('should handle pagination', async ({ page }) => {
        await page.goto('/users');

        const nextButton = page.getByRole('button', { name: 'Next' });
        if (await nextButton.isEnabled()) {
            await nextButton.click();
            await expect(page.getByText(/Page 2/i)).toBeVisible();
        }
    });

    test('should open add user page', async ({ page }) => {
        await page.goto('/users');
        await page.getByRole('button', { name: 'Add User' }).click();
        await expect(page).toHaveURL(/\/users\/new/);
        await expect(page.getByText(/Create New User/i)).toBeVisible({ timeout: 15000 });
    });
});
