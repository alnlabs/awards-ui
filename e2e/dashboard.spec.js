import { test, expect } from '@playwright/test';

test.describe('Dashboard Smoke Tests', () => {
    test('should load the dashboard successfully', async ({ page }) => {
        await page.goto('/dashboard');

        // Check for the header/welcome
        await expect(page.getByText(/Welcome back/i)).toBeVisible({ timeout: 15000 });

        // Check for quick actions - using more generic text match to avoid heading/icon issues
        await expect(page.getByText(/Quick Actions/i).first()).toBeVisible({ timeout: 15000 });

        // Check for metrics cards (at least one should be present)
        await expect(page.getByText(/Total Cycles/i)).toBeVisible({ timeout: 15000 });
    });

    test('should navigate to awards page', async ({ page }) => {
        await page.goto('/dashboard');
        await page.getByRole('link', { name: /^Awards$/i }).click();

        await expect(page.getByText(/Awards Recognition/i)).toBeVisible({ timeout: 15000 });
    });
});
