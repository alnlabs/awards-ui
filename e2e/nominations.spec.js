import { test, expect } from '@playwright/test';

test.describe('Nominations Management', () => {
    test('should list nominations', async ({ page }) => {
        await page.goto('/nominations');
        await expect(page.getByText(/Nominations/i).first()).toBeVisible({ timeout: 15000 });
    });

    test('should open new nomination page', async ({ page }) => {
        await page.goto('/nominations');

        // Check for "Create Nomination" button - managers might see this
        // Admin sees "Create Your First Nomination" or similar if empty
        // Let's try to navigate via URL first to ensure it works, then refine
        await page.goto('/nominations/new');

        await expect(page.getByText(/New Nomination/i)).toBeVisible({ timeout: 15000 });
    });

    test('should show validation errors on empty submission', async ({ page }) => {
        await page.goto('/nominations/new');

        // Click submit without filling anything
        await page.getByRole('button', { name: /Submit Nomination/i }).click();

        // Check for toast error
        await expect(page.getByText(/Please select nominee/i)).toBeVisible();
    });

    test('should allow selecting a nominee and saving a draft', async ({ page }) => {
        await page.goto('/nominations/new');

        const nomineeSelect = page.getByRole('combobox').first();
        await nomineeSelect.selectOption({ index: 1 });

        // Save as draft
        await page.getByRole('button', { name: /Save Draft/i }).click();

        // Should show success toast and redirect
        await expect(page.getByText(/Draft saved successfully/i)).toBeVisible();
        await expect(page).toHaveURL(/\/nominations$/);
    });
});
