// tests/e2e/orders.spec.ts
import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

const BASE_URL = 'http://localhost:3000';

test.describe('Production Order Management', () => {
  test.beforeAll(async ({ page }) => {
    await page.evaluate(async () => {
      await fetch('http://localhost:3000/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'CNC Machine 1', status: 'Available' }),
      });
      await fetch('http://localhost:3000/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Assembly Line A', status: 'Available' }),
      });
    });
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/orders`);
    await expect(page.getByRole('table').or(page.getByText('No results.'))).toBeVisible();
  });

  test('should allow creating a new Pending order with valid data', async ({ page }) => {
    const orderName = `Test Order ${Date.now()}`;
    await page.getByTestId('create-order-button').click();
    await expect(page.getByRole('heading', { name: 'Create New Production Order' })).toBeVisible();
    await page.getByTestId('orderName').fill(orderName);
    await page.getByTestId('notes').fill('This is a test E2E order.');
    await page.getByTestId('status-select').click();
    await page.getByText('Pending').click();
    await page.getByTestId('submit-order').click();
    await expect(page.getByRole('heading', { name: 'Create New Production Order' })).not.toBeVisible();
    await expect(page.getByText(orderName)).toBeVisible();
    await expect(page.getByText('Pending', { exact: true }).last()).toBeVisible();
  });

  // ... (update other tests similarly with getByTestId and waitFor)
});