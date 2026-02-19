import { test, expect } from '@playwright/test';

/**
 * ULTIMATE AWARD LIFECYCLE E2E SUITE
 * This test orchestrates the ENTIRE lifecycle of an award in 10 stages.
 * Roles involved: HR Admin, Manager, Panel Member, Employee (Winner).
 */

test.describe.serial('Ultimate Award Lifecycle Orchestration', () => {
    let cycleName = `Lifecycle Cycle ${Date.now()}`;
    let criteriaName = `Lifecycle Criteria ${Date.now()}`;
    let panelName = `Lifecycle Panel ${Date.now()}`;
    let nomineeName = 'Employee One'; // From sample_users.py
    let panelMemberEmail = 'panel@example.com';

    // Helper for robust login
    async function login(page, email, password) {
        await page.goto('/login');
        await page.waitForLoadState('load');
        await page.getByPlaceholder('name@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);

        // Verify values are there
        await expect(page.getByPlaceholder('name@company.com')).toHaveValue(email);

        await page.getByRole('button', { name: /Sign In/i }).click({ force: true });

        // Wait longer for redirect
        await page.waitForURL(/\/dashboard$/, { timeout: 60000 });
        await page.waitForLoadState('load');
    }

    test('Stage 1: HR Configures Award Criteria & Category', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await login(page, 'hr.admin@example.com', 'HrAdmin123');

        await page.goto('/criteria/new');
        await page.waitForLoadState('load');
        await expect(page.getByRole('heading', { name: /Create Criteria/i })).toBeVisible({ timeout: 30000 });

        await page.locator('input[name="name"]').fill(criteriaName);
        await page.locator('textarea[name="description"]').fill('Ultimate lifecycle E2E testing criteria');

        // Add a field (required)
        await page.getByRole('button', { name: /\+ Add Field/i }).click({ force: true });
        await page.locator('input[placeholder="Label"]').fill('Performance');

        await page.getByRole('button', { name: /Create Criteria/i }).click({ force: true });

        await expect(page.getByText(/Criteria created successfully/i)).toBeVisible({ timeout: 30000 });
        await context.close();
    });

    test('Stage 2: HR Launches Award Cycle', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await login(page, 'hr.admin@example.com', 'HrAdmin123');

        await page.goto('/cycles/new');
        await page.waitForLoadState('load');
        await expect(page.getByRole('heading', { name: /Create Award Cycle/i })).toBeVisible({ timeout: 30000 });

        await page.locator('#cycle-name').fill(cycleName);
        await page.locator('select[name="quarter"]').selectOption('Q1');
        await page.locator('input[name="year"]').fill('2026');
        await page.locator('input[name="start_date"]').fill('2026-01-01');
        await page.locator('input[name="end_date"]').fill('2026-12-31');

        await page.getByRole('button', { name: /Create Cycle/i }).click({ force: true });
        await expect(page).toHaveURL(/\/cycles$/);
        await expect(page.getByText(cycleName).first()).toBeVisible({ timeout: 30000 });

        await context.close();
    });

    test('Stage 3: Manager Submits Nomination', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await login(page, 'manager@example.com', 'Manager123');

        console.log(`Starting Stage 3 with cycle: ${cycleName}`);
        await page.goto('/nominations/new');
        await page.waitForLoadState('load');
        await expect(page.getByRole('heading', { name: /New Nomination/i })).toBeVisible({ timeout: 30000 });

        console.log('Nomination page loaded, checking cycle...');
        // Cycle is auto-selected and field is disabled in UpsertNomination.jsx
        const cycleInput = page.locator('input[disabled]').first();
        await expect(cycleInput).toHaveValue(new RegExp(cycleName), { timeout: 30000 });

        console.log('Cycle verified, selecting nominee...');
        const nomineeSelect = page.locator('select');
        await expect(nomineeSelect).toBeVisible();
        await nomineeSelect.selectOption({ label: nomineeName }, { timeout: 30000 });
        console.log('Nominee selected, checking criteria field...');

        // Criteria responses (Performance field is an input)
        const perfInput = page.locator('input').last();
        await expect(perfInput).toBeVisible({ timeout: 10000 });
        console.log('Criteria field visible, filling...');
        await perfInput.fill('Submitting for the ultimate lifecycle test. Exceptional contribution.');
        console.log('Filled criteria, clicking Submit...');

        await page.getByRole('button', { name: /Submit Nomination/i }).click({ force: true });
        console.log('Clicked Submit, waiting for success message...');
        await expect(page.getByText(/Nomination submitted successfully/i)).toBeVisible({ timeout: 30000 });
        console.log('Stage 3 Finished');
        await context.close();
    });

    test('Stage 4: HR Closes Nomination Window', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await login(page, 'hr.admin@example.com', 'HrAdmin123');

        console.log(`Starting Stage 4 for cycle: ${cycleName}`);
        await page.goto('/cycles');
        await page.waitForLoadState('load');

        // Robust cycle card finding
        console.log('Finding cycle card...');
        const cycleCard = page.locator('div').filter({ hasText: cycleName }).filter({ has: page.getByRole('button', { name: /View Details/i }) }).last();
        await expect(cycleCard).toBeVisible({ timeout: 30000 });

        console.log('Clicking View Details...');
        await cycleCard.getByRole('button', { name: /View Details/i }).click({ force: true });

        console.log('Waiting for Cycle Details page...');
        await expect(page).toHaveURL(/\/cycles\/.*\/view/, { timeout: 30000 });
        await expect(page.getByText(cycleName).first()).toBeVisible({ timeout: 30000 });
        await expect(page.getByText(/Status:/i)).toBeVisible({ timeout: 30000 });

        // Close nomination window
        console.log('Closing nomination window...');
        await page.getByRole('button', { name: /Close Cycle/i }).click({ force: true });

        // Handle Closure Modal (Early or Normal)
        const endCycleBtn = page.getByRole('button', { name: /End Cycle/i });
        const confirmBtn = page.getByRole('button', { name: /Yes, Close Cycle/i });

        // Wait for either button to appear
        await Promise.race([
            endCycleBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { }),
            confirmBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { })
        ]);

        if (await endCycleBtn.isVisible()) {
            console.log('Early closure modal detected, clicking End Cycle...');
            await endCycleBtn.click({ force: true });
        } else if (await confirmBtn.isVisible()) {
            console.log('Normal closure modal detected, clicking Yes, Close Cycle...');
            await confirmBtn.click({ force: true });
        }

        await expect(page.getByText(/Cycle closed successfully/i)).toBeVisible({ timeout: 30000 });

        await context.close();
    });

    test('Stage 5: HR Creates Review Panel', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await login(page, 'hr.admin@example.com', 'HrAdmin123');

        await page.goto('/panels/new');
        await page.waitForLoadState('load');
        await expect(page.getByRole('heading', { name: /Create Panel/i })).toBeVisible({ timeout: 30000 });
        await page.getByPlaceholder(/Leadership Review Panel/i).fill(panelName);
        await page.getByRole('button', { name: /Save Panel/i }).click({ force: true });

        await page.waitForURL(/\/panels$/);
        await page.waitForLoadState('load');

        const panelCard = page.locator('div').filter({ has: page.getByText(panelName) }).filter({ has: page.getByRole('button', { name: /Manage/i }) }).last();
        await expect(panelCard).toBeVisible({ timeout: 30000 });
        await panelCard.getByRole('button', { name: /Manage/i }).click({ force: true });

        await expect(page.getByText(/Panel Members/i)).toBeVisible({ timeout: 30000 });
        await page.getByRole('button', { name: /Add Members/i }).click({ force: true });
        await page.locator('select').selectOption({ label: 'Panel Member' });
        await page.getByRole('button', { name: /Assign Selected/i }).click({ force: true });
        await expect(page.getByText(panelMemberEmail)).toBeVisible({ timeout: 30000 });

        await context.close();
    });

    test('Stage 6: HR Assigns Nomination to Panel', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await login(page, 'hr.admin@example.com', 'HrAdmin123');

        await page.goto('/nominations');
        await page.waitForLoadState('load');
        await expect(page.getByRole('heading', { name: /Nominations/i }).first()).toBeVisible({ timeout: 30000 });

        await page.locator('tr', { hasText: nomineeName }).getByRole('button', { name: /View/i }).click({ force: true });
        await expect(page.getByText(/Nomination Details/i)).toBeVisible({ timeout: 30000 });

        await page.getByRole('button', { name: /Assign to Panel/i }).click({ force: true });
        await page.locator('select').selectOption({ label: panelName });
        await page.getByRole('button', { name: /Assign Panels/i }).click({ force: true });
        await expect(page.getByText(panelName)).toBeVisible({ timeout: 30000 });

        await context.close();
    });

    test('Stage 7: Panel Member Submits Review', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await login(page, panelMemberEmail, 'Panel123');

        await page.goto('/reviews');
        await page.waitForLoadState('load');
        await expect(page.getByText(/My Assignments/i)).toBeVisible({ timeout: 30000 });
        await page.getByText(nomineeName).click({ force: true });

        await expect(page.getByText(/Review Tasks/i)).toBeVisible({ timeout: 30000 });
        await page.locator('input[type="number"]').first().fill('5');
        await page.locator('textarea').fill('The lifecycle test is looking perfect from a panel perspective.');
        await page.getByRole('button', { name: /Save/i }).click({ force: true });
        await expect(page.getByText(/Review saved/i)).toBeVisible({ timeout: 30000 });

        await context.close();
    });

    test('Stage 8: HR Ranks & Promotes to Award', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await login(page, 'hr.admin@example.com', 'HrAdmin123');

        await page.goto('/awards');
        await page.waitForLoadState('load');

        await page.getByRole('tab', { name: /Finalized Nominations/i }).click();

        const row = page.locator('tr', { hasText: nomineeName });
        await expect(row).toBeVisible({ timeout: 30000 });
        await row.getByRole('button', { name: /Create Award/i }).click({ force: true });

        await expect(page).toHaveURL(/\/awards\/new/);

        const select = page.locator('select');
        if (await select.isVisible() && await select.isEnabled()) {
            const options = await select.locator('option').count();
            if (options > 1) {
                await select.selectOption({ index: 1 });
            }
        }

        await page.getByRole('button', { name: /Create Award/i }).click({ force: true });
        await expect(page.getByText(/Award created successfully/i)).toBeVisible({ timeout: 30000 });

        await context.close();
    });

    test('Stage 9: HR Finalizes Award Cycle', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await login(page, 'hr.admin@example.com', 'HrAdmin123');

        await page.goto('/cycles');
        await page.waitForLoadState('load');
        const cycleCard = page.locator('div').filter({ has: page.getByText(cycleName) }).filter({ has: page.getByRole('button', { name: /View Details/i }) }).last();
        await expect(cycleCard).toBeVisible({ timeout: 30000 });
        await cycleCard.getByRole('button', { name: /View Details/i }).click({ force: true });
        await expect(page.getByText(cycleName).first()).toBeVisible({ timeout: 30000 });
        await expect(page.getByText(/Status:/i)).toBeVisible({ timeout: 30000 });

        await expect(page.getByText(/CLOSED/i)).toBeVisible({ timeout: 30000 });

        await context.close();
    });

    test('Stage 10: Winner Views Certificate', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await login(page, 'employee1@example.com', 'Employee123');

        await page.goto('/awards');
        await page.waitForLoadState('load');
        await expect(page.getByText(nomineeName).first()).toBeVisible({ timeout: 30000 });
        await page.getByRole('button', { name: /Certificate/i }).first().click({ force: true });

        await expect(page.getByText(/CERTIFICATE/i)).toBeVisible({ timeout: 30000 });
        await expect(page.getByText(nomineeName)).toBeVisible();
        await expect(page.getByText(cycleName)).toBeVisible();

        await context.close();
    });
});
