import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    // Perform authentication steps.
    await page.goto('/login');
    await page.getByPlaceholder('name@company.com').fill('admin@company.com');
    await page.getByPlaceholder('••••••••').fill('ChangeMe123');

    // Use force: true because the button might be animated (fadeIn)
    await page.getByRole('button', { name: 'Sign In' }).click({ force: true });

    // Wait for the dashboard to be visible.
    await expect(page.getByText('Welcome back')).toBeVisible();

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
});
