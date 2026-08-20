import { test, expect } from "@playwright/test";

const TOURNAMENT_SHARE_PATH = "/share/tournament-draft-1?lng=en";
const UNKNOWN_SHARE_PATH = "/share/not-a-real-share?lng=en";

test.describe("Shared draft preview", () => {
  test("guest can open a shared draft without logging in", async ({ page }) => {
    await page.goto(TOURNAMENT_SHARE_PATH);

    await expect(page).not.toHaveURL(/\/auth\/login/);
    await expect(page).toHaveURL(/\/share\/tournament-draft-1/);
    await expect(
      page.getByRole("heading", { name: /shared drafts/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /^map$/i })).toBeVisible();
    await expect(page.getByText("Tartarus")).toBeVisible();
    await expect(page.getByText(/setup:\s*b/i)).toBeVisible();
  });

  test("guest visiting an unknown share stays on the page", async ({
    page,
  }) => {
    await page.goto(UNKNOWN_SHARE_PATH);

    await expect(page).not.toHaveURL(/\/auth\/login/);
    await expect(page).toHaveURL(/\/share\/not-a-real-share/);
    await expect(
      page.getByRole("heading", { name: /shared drafts/i }),
    ).toBeVisible();
  });
});
