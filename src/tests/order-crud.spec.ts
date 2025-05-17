test("should create a Scheduled order with date-only strings", async ({ page }) => {
  await page.evaluate(async () => {
    await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "CNC Machine 1", status: "Available" }),
    });
  });
  await page.goto("/orders");
  await page.getByTestId("create-order-button").click();
  await page.getByTestId("orderName").fill("Test Order");
  await page.getByTestId("status-select").click();
  await page.getByText("Scheduled").click();
  await page.getByTestId("resource-select").click();
  await page.getByText("CNC Machine 1 (Available)").click();
  await page.getByTestId("startTime").click();
  await page.getByRole("button", { name: /21/i }).click(); // May 21, 2025
  await page.getByTestId("startTime").getByRole("textbox").fill("00:00");
  await page.getByTestId("endTime").click();
  await page.getByRole("button", { name: /29/i }).click(); // May 29, 2025
  await page.getByTestId("endTime").getByRole("textbox").fill("00:00");
  await page.getByTestId("notes").fill("Test Notes");
  await page.getByTestId("submit-order").click();
  await expect(page.getByText("Order created successfully!")).toBeVisible();
});