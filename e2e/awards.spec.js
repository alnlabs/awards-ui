import { test, expect } from '@playwright/test';

test.describe('Awards Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/awards');
    });

    test('should display awards recognition header', async ({ page }) => {
        await expect(page.getByText(/Awards Recognition/i).first()).toBeVisible({ timeout: 15000 });
    });

    test('should show winners gallery by default', async ({ page }) => {
        // Check for Ceremonial Gallery heading
        await expect(page.getByText(/Ceremonial Gallery/i)).toBeVisible({ timeout: 15000 });
    });

    test('should navigate to finalized nominations tab', async ({ page }) => {
        await page.getByText(/Finalized Nominations/i).click();
        await expect(page.getByText(/Nominations Ready for Awards/i)).toBeVisible({ timeout: 15000 });
    });

    test('should navigate to award settings tab', async ({ page }) => {
        await page.getByText(/Award Settings/i).click();
        await expect(page.getByText(/Configured Award Types/i)).toBeVisible({ timeout: 15000 });
        await expect(page.getByText(/New Award Type/i)).toBeVisible({ timeout: 15000 });
    });
});
