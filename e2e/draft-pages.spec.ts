/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';

/**
 * Draft Pages E2E Tests
 * 
 * NOTE: These tests require an authenticated user session.
 * The draft-settings and draft pages are protected routes that require authentication.
 * 
 * To run these tests successfully, you need to either:
 * 1. Authenticate manually before running tests
 * 2. Set up Playwright authentication storage (see Playwright docs)
 * 3. Use a test account with proper credentials
 * 
 * Currently, tests will be skipped if the user is not authenticated.
 */
test.describe('Draft Pages', () => {
  // Helper to check if logged in and skip test if not
  async function checkLoggedIn(page: any) {
    // Check for elements that indicate logged-in state
    // LoggedContent shows "User Info" heading, NotLoggedContent shows "Login" button
    const hasUserInfo = await page.getByText(/user info/i).isVisible().catch(() => false);
    const hasLoginButton = await page.getByRole('link', { name: /login/i }).isVisible().catch(() => false);
    const isLoggedIn = hasUserInfo && !hasLoginButton;

    test.skip(!isLoggedIn, 'User is not logged in - skipping test. Authentication is required for draft pages tests.');
    return isLoggedIn;
  }

  test.describe('Draft Settings Page', () => {
    test('authenticated user can access draft-settings page', async ({ page }) => {
      await checkLoggedIn(page);

      await page.goto('/draft-settings?lng=en');
      await page.waitForLoadState('networkidle');

      // Should not redirect to login
      await expect(page).not.toHaveURL(/\/auth\/login/);
      await expect(page).toHaveURL(/\/draft-settings/);

      // Page should render with draft settings content
      await expect(page.getByRole('heading', { name: /draft settings/i })).toBeVisible({ timeout: 5000 });
    });

    test('draft-settings page displays opponent selection', async ({ page }) => {
      await checkLoggedIn(page);

      await page.goto('/draft-settings?lng=en');
      await page.waitForLoadState('networkidle');

      // Should show opponent selection field
      await expect(page.getByLabel(/select your opponent/i)).toBeVisible({ timeout: 5000 });
    });

    test('draft-settings page displays draft count field', async ({ page }) => {
      await checkLoggedIn(page);

      await page.goto('/draft-settings?lng=en');
      await page.waitForLoadState('networkidle');

      // Should show draft count field
      await expect(page.getByLabel(/draft count/i)).toBeVisible({ timeout: 5000 });
    });

    test('draft-settings page displays gods amount field', async ({ page }) => {
      await checkLoggedIn(page);

      await page.goto('/draft-settings?lng=en');
      await page.waitForLoadState('networkidle');

      // Should show gods amount field
      await expect(page.getByLabel(/gods amount/i)).toBeVisible({ timeout: 5000 });
    });

    test('draft-settings page displays titans amount field', async ({ page }) => {
      await checkLoggedIn(page);

      await page.goto('/draft-settings?lng=en');
      await page.waitForLoadState('networkidle');

      // Should show titans amount field
      await expect(page.getByLabel(/titans amount/i)).toBeVisible({ timeout: 5000 });
    });

    test('draft-settings page displays troop attachment amount field', async ({ page }) => {
      await checkLoggedIn(page);

      await page.goto('/draft-settings?lng=en');
      await page.waitForLoadState('networkidle');

      // Should show troop attachment amount field
      await expect(page.getByLabel(/troop attachments amount/i)).toBeVisible({ timeout: 5000 });
    });

    test('draft-settings page displays generate draft button', async ({ page }) => {
      await checkLoggedIn(page);

      await page.goto('/draft-settings?lng=en');
      await page.waitForLoadState('networkidle');

      // Should show generate draft button
      await expect(page.getByRole('button', { name: /generate draft/i })).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Draft Detail Page', () => {
    test('authenticated user can access draft detail page', async ({ page }) => {
      await checkLoggedIn(page);

      // Use a dummy draft ID - the page should load even if draft doesn't exist
      // (it will show error, but shouldn't redirect to login)
      await page.goto('/draft/test-draft-id?lng=en');
      await page.waitForLoadState('networkidle');

      // Should not redirect to login
      await expect(page).not.toHaveURL(/\/auth\/login/);
      await expect(page).toHaveURL(/\/draft\/test-draft-id/);
    });

    test('draft detail page displays draft details heading', async ({ page }) => {
      await checkLoggedIn(page);

      await page.goto('/draft/test-draft-id?lng=en');
      await page.waitForLoadState('networkidle');

      // Should show draft details heading (or error if draft doesn't exist)
      // Either way, the page should render without redirecting
      const hasDraftDetails = await page.getByText(/draft details/i).isVisible().catch(() => false);
      const hasError = await page.getByText(/draft not found/i).isVisible().catch(() => false);

      expect(hasDraftDetails || hasError).toBe(true);
    });
  });
});


