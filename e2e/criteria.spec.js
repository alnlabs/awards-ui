import { test, expect } from '@playwright/test';

test.describe('Criteria Management', () => {
    test('should list criteria', async ({ page }) => {
        await page.goto('/criteria');
        await expect(page.getByRole('heading', { name: /Criteria Configuration/i })).toBeVisible({ timeout: 15000 });
    });

    test('should create new criteria with category', async ({ page }) => {
        await page.goto('/criteria/new');

        const criteriaName = `Test Criteria ${Date.now()}`;
        const category = 'Innovation';

        await page.locator('input[name="name"]').fill(criteriaName);
        await page.locator('input[name="category"]').fill(category);
        await page.locator('textarea[name="description"]').fill('E2E Test Description');

        // Add a field
        await page.getByRole('button', { name: '+ Add Field' }).click();
        await page.getByPlaceholder('Label').fill('Impact Score');
        await page.getByPlaceholder('field_key').fill('impact_score');
        await page.selectOption('select', 'RATING');

        await page.getByRole('button', { name: 'Create Criteria' }).click();

        await expect(page).toHaveURL(/\/criteria$/);
        const criteriaCard = page.locator('div.border.rounded').filter({ hasText: criteriaName });
        await expect(criteriaCard).toBeVisible({ timeout: 15000 });
        await expect(criteriaCard.getByText(category)).toBeVisible();
    });

    test('should clone criteria', async ({ page }) => {
        await page.goto('/criteria');

        const cloneButton = page.getByRole('button', { name: 'Clone' }).first();
        if (await cloneButton.isVisible()) {
            await cloneButton.click();

            // Should be on the new criteria page with populated values
            await expect(page).toHaveURL(/\/criteria\/.*\/clone/);
            await expect(page.locator('input[name="name"]')).not.toHaveValue('');
            await page.getByRole('button', { name: 'Create Criteria' }).click();
            await expect(page).toHaveURL(/\/criteria$/);
        }
    });
});
