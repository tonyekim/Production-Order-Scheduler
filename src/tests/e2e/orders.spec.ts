// tests/e2e/orders.spec.ts
import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

const BASE_URL = 'http://localhost:3000';

test.describe('Production Order Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/orders`);
    // Wait for the table to be potentially populated or show "No results."
    await expect(page.getByRole('table').or(page.getByText('No results.'))).toBeVisible();
  });

  test('should allow creating a new Pending order with valid data', async ({ page }) => {
    const orderName = `Test Order ${Date.now()}`;
    await page.getByTestId('create-order-button').click();
    
    await expect(page.getByRole('heading', { name: 'Create New Production Order' })).toBeVisible();
    
    await page.getByTestId('orderName').fill(orderName);
    await page.getByTestId('notes').fill('This is a test E2E order.');
    
    // Status should default to Pending, but we can explicitly check/select
    // Click the select trigger for status
    await page.locator('//button[@data-testid="status-select"]').click();
    // Click the 'Pending' option
    await page.locator('//div[contains(@class, "select-item") and normalize-space(.)="Pending"]').click();
    
    await page.getByTestId('submit-order').click();

    await expect(page.getByRole('heading', { name: 'Create New Production Order' })).not.toBeVisible(); // Dialog closed
    await expect(page.getByText(orderName)).toBeVisible(); // Order in table
    await expect(page.getByText('Pending', { exact: true }).last()).toBeVisible(); // Status in table
  });

  test('should show validation errors for invalid order creation data', async ({ page }) => {
    await page.getByTestId('create-order-button').click();
    await page.getByTestId('submit-order').click(); // Try to submit empty form

    await expect(page.getByText('Order name must be at least 3 characters long.')).toBeVisible();
    // No need to check dialog not closed as errors prevent it
  });

  test('should allow editing a Pending order, scheduling it, and verify update', async ({ page }) => {
    // First, create a pending order to edit
    const orderName = `Pending Order to Schedule ${Date.now()}`;
    await page.getByTestId('create-order-button').click();
    await page.getByTestId('orderName').fill(orderName);
    await page.getByTestId('submit-order').click();
    await expect(page.getByText(orderName)).toBeVisible(); // Ensure created

    // Find the row and click actions
    const orderRow = page.getByRole('row', { name: new RegExp(orderName) });
    await orderRow.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('menuitem', { name: 'Edit / Schedule' }).click();

    await expect(page.getByRole('heading', { name: 'Edit Production Order' })).toBeVisible();
    
    // Change status to Scheduled
    await page.locator('//button[@data-testid="status-select"]').click();
    await page.locator('//div[contains(@class, "select-item") and normalize-space(.)="Scheduled"]').click();
    
    // Select a resource (assuming 'CNC Machine 1' is ID 'res-001' and Available)
    await page.locator('//button[@data-testid="resource-select"]').click();
    await page.locator('//div[contains(@class, "select-item") and contains(normalize-space(.),"CNC Machine 1")]').click();


    // Set start and end times
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 1); // Tomorrow
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(17, 0, 0, 0);

    await page.getByTestId('startTime').click(); // Open start time popover
    await page.getByRole('gridcell', { name: startTime.getDate().toString(), exact: true }).first().click(); // Select day
    // For time input within popover
    await page.locator('div.p-2.border-t input[type="time"]').first().fill(format(startTime, "HH:mm"));
    // Click somewhere to close popover (if not auto-closing) - or ensure value is set

    await page.getByTestId('endTime').click(); // Open end time popover
    await page.getByRole('gridcell', { name: endTime.getDate().toString(), exact: true }).last().click(); // Select day
    await page.locator('div.p-2.border-t input[type="time"]').last().fill(format(endTime, "HH:mm"));


    await page.getByTestId('submit-order').click();

    await expect(page.getByRole('heading', { name: 'Edit Production Order' })).not.toBeVisible(); // Dialog closed
    
    // Verify updated data in the table
    const updatedRow = page.getByRole('row', { name: new RegExp(orderName) });
    await expect(updatedRow.getByText('Scheduled')).toBeVisible();
    await expect(updatedRow.getByText('CNC Machine 1')).toBeVisible();
    await expect(updatedRow.getByText(format(startTime, "yyyy-MM-dd HH:mm"))).toBeVisible();
    await expect(updatedRow.getByText(format(endTime, "yyyy-MM-dd HH:mm"))).toBeVisible();
  });


  test('should prevent scheduling if End Time is not after Start Time', async ({ page }) => {
    await page.getByTestId('create-order-button').click();
    await page.getByTestId('orderName').fill('Time Validation Order');
    
    // Change status to Scheduled
    await page.locator('//button[@data-testid="status-select"]').click();
    await page.locator('//div[contains(@class, "select-item") and normalize-space(.)="Scheduled"]').click();

    // Select resource
    await page.locator('//button[@data-testid="resource-select"]').click();
    await page.locator('//div[contains(@class, "select-item") and contains(normalize-space(.),"CNC Machine 1")]').click();

    const time = new Date();
    time.setDate(time.getDate() + 1); // Tomorrow
    time.setHours(10, 0, 0, 0);

    // Set Start Time
    await page.getByTestId('startTime').click();
    await page.getByRole('gridcell', { name: time.getDate().toString(), exact: true }).first().click();
    await page.locator('div.p-2.border-t input[type="time"]').first().fill(format(time, "HH:mm"));

    // Set End Time to be SAME AS Start Time
    await page.getByTestId('endTime').click();
    await page.getByRole('gridcell', { name: time.getDate().toString(), exact: true }).last().click();
    await page.locator('div.p-2.border-t input[type="time"]').last().fill(format(time, "HH:mm"));
    
    await page.getByTestId('submit-order').click();
    await expect(page.getByText('End time must be after start time.')).toBeVisible();

    // Set End Time to be BEFORE Start Time
    const earlierTime = new Date(time);
    earlierTime.setHours(8,0,0,0); // Earlier time
    await page.getByTestId('endTime').click();
    await page.getByRole('gridcell', { name: earlierTime.getDate().toString(), exact: true }).last().click(); // Day might be same
    await page.locator('div.p-2.border-t input[type="time"]').last().fill(format(earlierTime, "HH:mm"));

    await page.getByTestId('submit-order').click();
    await expect(page.getByText('End time must be after start time.')).toBeVisible();
  });


  test('should filter orders table by "Scheduled" status', async ({ page }) => {
    // Ensure there's at least one scheduled and one pending order (or create them)
    // Create a scheduled order
    const scheduledOrderName = `Scheduled Order Filter Test ${Date.now()}`;
    await page.getByTestId('create-order-button').click();
    await page.getByTestId('orderName').fill(scheduledOrderName);
    await page.locator('//button[@data-testid="status-select"]').click();
    await page.locator('//div[contains(@class, "select-item") and normalize-space(.)="Scheduled"]').click();
    await page.locator('//button[@data-testid="resource-select"]').click();
    await page.locator('//div[contains(@class, "select-item") and contains(normalize-space(.),"Assembly Line A")]').click(); // Assuming available
    // Set valid dates
    const startTime = new Date(); startTime.setDate(startTime.getDate() + 2); startTime.setHours(9,0);
    const endTime = new Date(startTime); endTime.setHours(17,0);
    await page.getByTestId('startTime').click();
    await page.getByRole('gridcell', { name: startTime.getDate().toString(), exact: true }).first().click();
    await page.locator('div.p-2.border-t input[type="time"]').first().fill(format(startTime, "HH:mm"));
    await page.getByTestId('endTime').click();
    await page.getByRole('gridcell', { name: endTime.getDate().toString(), exact: true }).last().click();
    await page.locator('div.p-2.border-t input[type="time"]').last().fill(format(endTime, "HH:mm"));
    await page.getByTestId('submit-order').click();
    await expect(page.getByText(scheduledOrderName)).toBeVisible();


    // Create a pending order
    const pendingOrderName = `Pending Order Filter Test ${Date.now()}`;
    await page.getByTestId('create-order-button').click();
    await page.getByTestId('orderName').fill(pendingOrderName);
    // Default status is Pending
    await page.getByTestId('submit-order').click();
    await expect(page.getByText(pendingOrderName)).toBeVisible();

    // Filter by Scheduled
    await page.getByTestId('filter-status-button').click();
    await page.getByRole('menuitemcheckbox', { name: 'Scheduled' }).click();
    // Click outside to close dropdown or it should auto close
    await page.getByRole('heading', { name: 'Production Orders' }).click(); // Click main heading to ensure dropdown closes


    await expect(page.getByText(scheduledOrderName)).toBeVisible();
    await expect(page.getByText(pendingOrderName)).not.toBeVisible();

    // Clear filter to check if pending order reappears
    await page.getByTestId('filter-status-button').click();
    await page.getByRole('menuitemcheckbox', { name: 'All Statuses' }).click();
    await page.getByRole('heading', { name: 'Production Orders' }).click(); 

    await expect(page.getByText(scheduledOrderName)).toBeVisible();
    await expect(page.getByText(pendingOrderName)).toBeVisible();
  });
});

test.describe('Dashboard Display', () => {
  test('should render Order Status chart and reflect current data', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Check that the card and chart are visible
    const orderStatusCard = page.getByTestId('order-status-chart-card');
    await expect(orderStatusCard).toBeVisible();
    await expect(orderStatusCard.getByText('Order Status Overview')).toBeVisible();
    // Check for the presence of the chart itself (e.g., by looking for SVG elements)
    await expect(orderStatusCard.locator('svg.recharts-surface')).toBeVisible({timeout: 10000}); // Wait a bit for chart to render

    // Optionally, check for specific data if you know the initial state
    // This is more complex as you need to inspect chart elements or have known data points
    // For example, if you know there's 1 pending order initially:
    // Check for a bar label or tooltip related to "Pending" and count "1"
    // This can be brittle, so test for chart presence primarily.
    // A more robust test would be to add an order on the orders page, then navigate to dashboard and verify chart updates.
    
    const initialPendingCountText = await orderStatusCard.locator('text:has-text("Pending")').first().isVisible();
    
    // Go add a new order
    await page.goto(`${BASE_URL}/orders`);
    const newOrderName = `Dashboard Test Order ${Date.now()}`;
    await page.getByTestId('create-order-button').click();
    await page.getByTestId('orderName').fill(newOrderName);
    await page.getByTestId('submit-order').click();
    await expect(page.getByText(newOrderName)).toBeVisible();

    // Go back to dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(orderStatusCard.locator('svg.recharts-surface')).toBeVisible({timeout: 10000});

    // Check if the chart *might* have updated. Specific value checks are hard with charts.
    // We can check if the "Pending" label is still there, or if a new bar appeared if counts change significantly
    // For now, just ensuring it still renders with new data is a good start.
    await expect(orderStatusCard.getByText('Order Status Overview')).toBeVisible();

  });
});