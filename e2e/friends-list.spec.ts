import { test, expect } from "@playwright/test";

/**
 * Friends page E2E tests.
 *
 * Requires an authenticated session. Tests are skipped when logged out.
 */
test.describe("Friends page", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function checkLoggedIn(page: any) {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hasWelcome = await page
      .getByText(/welcome/i)
      .first()
      .isVisible()
      .catch(() => false);
    const hasLoginButton = await page
      .getByRole("link", { name: /login/i })
      .isVisible()
      .catch(() => false);
    const isLoggedIn = hasWelcome && !hasLoginButton;

    test.skip(
      !isLoggedIn,
      "User is not logged in - skipping friends page tests."
    );
    return isLoggedIn;
  }

  test("navigates to friends page from home link", async ({ page }) => {
    await checkLoggedIn(page);

    const friendsLink = page.getByRole("link", { name: /friends/i }).first();
    await expect(friendsLink).toBeVisible({ timeout: 5000 });
    await friendsLink.click();

    await expect(page).toHaveURL(/\/friends/);
    await expect(page.getByRole("heading", { name: /friends/i })).toBeVisible();
  });

  test("shows friend count on home link", async ({ page }) => {
    await checkLoggedIn(page);

    const friendsLink = page.getByRole("link", { name: /friends/i }).first();
    await expect(friendsLink).toBeVisible({ timeout: 5000 });
    await expect(friendsLink).toContainText(/\(\d+\)|\.\.\./);
  });

  test("displays invite form on friends page", async ({ page }) => {
    await checkLoggedIn(page);
    await page.goto("/friends");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /friends/i })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /by name|by email|по имени|по email/i }).first()
    ).toBeVisible();
  });

  test("validates email invite on friends page", async ({ page }) => {
    await checkLoggedIn(page);
    await page.goto("/friends");
    await page.waitForLoadState("networkidle");

    await page.getByRole("tab", { name: /by email|по email/i }).click();

    const submitButton = page
      .getByRole("button", { name: /send request|отправить запрос/i })
      .last();
    await submitButton.click();

    await expect(
      page.getByText(/email is required|email обязателен/i)
    ).toBeVisible({ timeout: 3000 });
  });
});
