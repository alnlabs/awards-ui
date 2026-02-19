import { test, expect } from '@playwright/test';

test.describe('Panels Management', () => {
    test('should list panels', async ({ page }) => {
        await page.goto('/panels');
        await expect(page.getByRole('heading', { name: /Panels/i })).toBeVisible({ timeout: 15000 });

        // Check for "Create Panel" button for admin
        await expect(page.getByRole('button', { name: /Create Panel/i })).toBeVisible({ timeout: 15000 });
    });

    test('should open create panel page', async ({ page }) => {
        await page.goto('/panels');
        await page.getByRole('button', { name: /Create Panel/i }).click();

        await expect(page.url()).toContain('/panels/new');
        await expect(page.getByText(/Create New Panel/i)).toBeVisible({ timeout: 15000 });

        // Check for form fields
        await expect(page.getByLabel(/Panel Name/i)).toBeVisible();
        await expect(page.getByLabel(/Description/i)).toBeVisible();
    });
});
