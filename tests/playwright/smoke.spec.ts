import { expect, test } from "@playwright/test";

test("innloggingssiden vises", async ({ page }) => {
  await page.goto("/innlogging");
  await expect(page.getByRole("heading", { name: "Kundeportal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Logg inn" })).toBeVisible();
});
