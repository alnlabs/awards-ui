import { test, expect } from '@playwright/test';

test.describe('Cycles Management', () => {
    test('should list existing cycles', async ({ page }) => {
        await page.goto('/cycles');
        await expect(page.getByText(/Award Cycles/i).first()).toBeVisible({ timeout: 15000 });

        // Check if at least one cycle card exists (if seeded) or the empty state
        const cyclesCount = await page.locator('.row > div').count();
        if (cyclesCount > 0) {
            await expect(page.locator('.row > div').first()).toBeVisible({ timeout: 15000 });
        } else {
            await expect(page.getByText(/No cycles yet/i)).toBeVisible({ timeout: 15000 });
        }
    });

    test('should create a new cycle', async ({ page }) => {
        await page.goto('/cycles/new');

        const cycleName = `Test Cycle ${Date.now()}`;

        await page.getByLabel('Cycle Name').fill(cycleName);
        await page.getByLabel('Quarter').selectOption('Q4');
        await page.getByLabel('Year').fill('2025');
        await page.locator('input[type="date"]').nth(0).fill('2025-10-01'); // Start Date
        await page.locator('input[type="date"]').nth(1).fill('2025-12-31'); // End Date
        await page.getByLabel('Description').fill('Automated E2E Test Cycle');

        await page.getByRole('button', { name: 'Create Cycle' }).click();

        // Should redirect to cycles list and show success toast
        await expect(page).toHaveURL(/\/cycles$/);
        await expect(page.getByText(cycleName)).toBeVisible({ timeout: 10000 });
    });

    test('should view cycle details', async ({ page }) => {
        await page.goto('/cycles');

        const viewButton = page.getByRole('button', { name: 'View Details' }).first();
        if (await viewButton.isVisible()) {
            await viewButton.click();
            await expect(page).toHaveURL(/\/cycles\/.*\/view/);
            await expect(page.getByText('Cycle Timeline')).toBeVisible();
        }
    });
});
