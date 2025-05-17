# Test info

- Name: should create a Scheduled order with date-only strings
- Location: C:\Users\Owner\Desktop\production-order-scheduler\src\tests\e2e\order-crud.spec.ts:3:5

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('status-select')

    at C:\Users\Owner\Desktop\production-order-scheduler\src\tests\e2e\order-crud.spec.ts:7:43
```

# Page snapshot

```yaml
- region "Notifications alt+T"
- dialog "Create New Production Order":
  - heading "Create New Production Order" [level=2]
  - paragraph: Fill in the details to create a new production order.
  - text: Order Name *
  - textbox "Order Name *": Test Order
  - text: Status *
  - combobox "Status *": Pending
  - text: Notes
  - textbox "Notes"
  - button "Cancel"
  - button "Create Order"
  - button "Close"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test("should create a Scheduled order with date-only strings", async ({ page }) => {
   4 |   await page.goto("http://localhost:3000/orders");
   5 |   await page.getByTestId("create-order-button").click();
   6 |   await page.getByTestId("orderName").fill("Test Order");
>  7 |   await page.getByTestId("status-select").click();
     |                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
   8 |   await page.getByText("Scheduled").click();
   9 |   await page.getByTestId("resource-select").click();
  10 |   await page.getByText("CNC Machine 1 (Available)").click();
  11 |   const startDate = new Date();
  12 |   startDate.setDate(startDate.getDate() + 1);
  13 |   const endDate = new Date(startDate);
  14 |   endDate.setDate(endDate.getDate() + 8);
  15 |   await page.getByTestId("startTime").click();
  16 |   await page.getByRole("gridcell", { name: startDate.getDate().toString(), exact: true }).click();
  17 |   await page.getByTestId("startTime").getByRole("textbox").fill("00:00");
  18 |   await page.getByTestId("endTime").click();
  19 |   await page.getByRole("gridcell", { name: endDate.getDate().toString(), exact: true }).click();
  20 |   await page.getByTestId("endTime").getByRole("textbox").fill("00:00");
  21 |   await page.getByTestId("notes").fill("Test Notes");
  22 |   await page.getByTestId("submit-order").click();
  23 |   await expect(page.getByText("Order created successfully!")).toBeVisible();
  24 | });
```