import { test, expect } from '@playwright/test';

test("should create a Scheduled order with date-only strings", async ({ page }) => {
  await page.goto("http://localhost:3000/orders");
  await page.getByTestId("create-order-button").click();
  await page.getByTestId("orderName").fill("Test Order");
  await page.getByTestId("status-select").click();
  await page.getByText("Scheduled").click();
  await page.getByTestId("resource-select").click();
  await page.getByText("CNC Machine 1 (Available)").click();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 8);
  await page.getByTestId("startTime").click();
  await page.getByRole("gridcell", { name: startDate.getDate().toString(), exact: true }).click();
  await page.getByTestId("startTime").getByRole("textbox").fill("00:00");
  await page.getByTestId("endTime").click();
  await page.getByRole("gridcell", { name: endDate.getDate().toString(), exact: true }).click();
  await page.getByTestId("endTime").getByRole("textbox").fill("00:00");
  await page.getByTestId("notes").fill("Test Notes");
  await page.getByTestId("submit-order").click();
  await expect(page.getByText("Order created successfully!")).toBeVisible();
});