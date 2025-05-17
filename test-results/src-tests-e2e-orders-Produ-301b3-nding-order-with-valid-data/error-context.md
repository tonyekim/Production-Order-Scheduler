# Test info

- Name: Production Order Management >> should allow creating a new Pending order with valid data
- Location: C:\Users\Owner\Desktop\production-order-scheduler\src\tests\e2e\orders.spec.ts:28:7

# Error details

```
Error: "context" and "page" fixtures are not supported in "beforeAll" since they are created on a per-test basis.
If you would like to reuse a single page between tests, create context manually with browser.newContext(). See https://aka.ms/playwright/reuse-page for details.
If you would like to configure your page before each test, do that in beforeEach hook instead.
```

# Test source

```ts
   1 | // tests/e2e/orders.spec.ts
   2 | import { test, expect } from '@playwright/test';
   3 | import { format } from 'date-fns';
   4 |
   5 | const BASE_URL = 'http://localhost:3000';
   6 |
   7 | test.describe('Production Order Management', () => {
   8 |   test.beforeAll(async ({ page }) => {
   9 |     await page.evaluate(async () => {
  10 |       await fetch('http://localhost:3000/api/resources', {
  11 |         method: 'POST',
  12 |         headers: { 'Content-Type': 'application/json' },
  13 |         body: JSON.stringify({ name: 'CNC Machine 1', status: 'Available' }),
  14 |       });
  15 |       await fetch('http://localhost:3000/api/resources', {
  16 |         method: 'POST',
  17 |         headers: { 'Content-Type': 'application/json' },
  18 |         body: JSON.stringify({ name: 'Assembly Line A', status: 'Available' }),
  19 |       });
  20 |     });
  21 |   });
  22 |
  23 |   test.beforeEach(async ({ page }) => {
  24 |     await page.goto(`${BASE_URL}/orders`);
  25 |     await expect(page.getByRole('table').or(page.getByText('No results.'))).toBeVisible();
  26 |   });
  27 |
> 28 |   test('should allow creating a new Pending order with valid data', async ({ page }) => {
     |       ^ Error: "context" and "page" fixtures are not supported in "beforeAll" since they are created on a per-test basis.
  29 |     const orderName = `Test Order ${Date.now()}`;
  30 |     await page.getByTestId('create-order-button').click();
  31 |     await expect(page.getByRole('heading', { name: 'Create New Production Order' })).toBeVisible();
  32 |     await page.getByTestId('orderName').fill(orderName);
  33 |     await page.getByTestId('notes').fill('This is a test E2E order.');
  34 |     await page.getByTestId('status-select').click();
  35 |     await page.getByText('Pending').click();
  36 |     await page.getByTestId('submit-order').click();
  37 |     await expect(page.getByRole('heading', { name: 'Create New Production Order' })).not.toBeVisible();
  38 |     await expect(page.getByText(orderName)).toBeVisible();
  39 |     await expect(page.getByText('Pending', { exact: true }).last()).toBeVisible();
  40 |   });
  41 |
  42 |   // ... (update other tests similarly with getByTestId and waitFor)
  43 | });
```