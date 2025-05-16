# Test info

- Name: Production Order Scheduler >> should render the dashboard chart
- Location: C:\Users\Owner\Desktop\production-order-scheduler\src\tests\orders.spec.ts:72:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\Owner\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 |
   3 | test.describe("Production Order Scheduler", () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto("http://localhost:3000/orders");
   6 |   });
   7 |
   8 |   test("should create a Pending order with valid data", async ({ page }) => {
   9 |     await page.getByTestId("create-order-button").click();
  10 |     await page.getByTestId("orderName").fill("Test Order");
  11 |     await page.getByTestId("status-select").selectOption("Pending");
  12 |     await page.getByTestId("notes").fill("Test notes");
  13 |     await page.getByTestId("submit-order").click();
  14 |
  15 |     await expect(page.getByText("Order created successfully!")).toBeVisible();
  16 |     await expect(page.getByText("Test Order")).toBeVisible();
  17 |   });
  18 |
  19 |   test("should show validation errors for invalid data", async ({ page }) => {
  20 |     await page.getByTestId("create-order-button").click();
  21 |     await page.getByTestId("status-select").selectOption("Scheduled");
  22 |     await page.getByTestId("submit-order").click();
  23 |
  24 |     await expect(
  25 |       page.getByText("For 'Scheduled' orders, Resource, Start Time, and End Time are mandatory.")
  26 |     ).toBeVisible();
  27 |   });
  28 |
  29 |   test("should edit a Pending order and schedule it", async ({ page }) => {
  30 |     await page.getByRole("button", { name: "Open menu" }).first().click();
  31 |     await page.getByText("Edit / Schedule").click();
  32 |
  33 |     await page.getByTestId("orderName").fill("Updated Order");
  34 |     await page.getByTestId("status-select").selectOption("Scheduled");
  35 |     await page.getByTestId("resource-select").selectOption("res-001");
  36 |     await page.getByTestId("startTime").click();
  37 |     await page.getByRole("gridcell", { name: "17" }).click();
  38 |     await page.locator('input[type="time"]').first().fill("09:00");
  39 |     await page.getByTestId("endTime").click();
  40 |     await page.getByRole("gridcell", { name: "17" }).click();
  41 |     await page.locator('input[type="time"]').last().fill("17:00");
  42 |     await page.getByTestId("submit-order").click();
  43 |
  44 |     await expect(page.getByText("Order updated successfully!")).toBeVisible();
  45 |     await expect(page.getByText("Updated Order")).toBeVisible();
  46 |     await expect(page.getByText("CNC Machine 1")).toBeVisible();
  47 |   });
  48 |
  49 |   test("should prevent scheduling if end time is not after start time", async ({ page }) => {
  50 |     await page.getByRole("button", { name: "Open menu" }).first().click();
  51 |     await page.getByText("Edit / Schedule").click();
  52 |
  53 |     await page.getByTestId("status-select").selectOption("Scheduled");
  54 |     await page.getByTestId("resource-select").selectOption("res-001");
  55 |     await page.getByTestId("startTime").click();
  56 |     await page.getByRole("gridcell", { name: "17" }).click();
  57 |     await page.locator('input[type="time"]').first().fill("09:00");
  58 |     await page.getByTestId("endTime").click();
  59 |     await page.getByRole("gridcell", { name: "17" }).click();
  60 |     await page.locator('input[type="time"]').last().fill("08:00");
  61 |     await page.getByTestId("submit-order").click();
  62 |
  63 |     await expect(page.getByText("End Time must be after Start Time")).toBeVisible();
  64 |   });
  65 |
  66 |   test("should filter orders by status", async ({ page }) => {
  67 |     await page.getByTestId("filter-status-button").click();
  68 |     await page.getByText("Scheduled").click();
  69 |     await expect(page.getByText("No results.")).toBeVisible();
  70 |   });
  71 |
> 72 |   test("should render the dashboard chart", async ({ page }) => {
     |       ^ Error: browserType.launch: Executable doesn't exist at C:\Users\Owner\AppData\Local\ms-playwright\chromium_headless_shell-1169\chrome-win\headless_shell.exe
  73 |     await page.goto("http://localhost:3000/dashboard");
  74 |     await expect(page.getByTestId("order-status-chart")).toBeVisible();
  75 |   });
  76 | });
```