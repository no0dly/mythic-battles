import { test, expect } from '@playwright/test';

/**
 * Friends List E2E Tests
 * 
 * NOTE: These tests require an authenticated user session.
 * The FriendsList component is only visible when logged in (inside LoggedContent).
 * 
 * To run these tests successfully, you need to either:
 * 1. Authenticate manually before running tests
 * 2. Set up Playwright authentication storage (see Playwright docs)
 * 3. Use a test account with proper credentials
 * 
 * Currently, tests will be skipped if the user is not authenticated.
 */
test.describe('Friends List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Helper to check if logged in and skip test if not
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function checkLoggedIn(page: any) {
    // Check for elements that indicate logged-in state
    // LoggedContent shows "User Info" heading, NotLoggedContent shows "Login" button
    const hasUserInfo = await page.getByText(/user info/i).isVisible().catch(() => false);
    const hasLoginButton = await page.getByRole('link', { name: /login/i }).isVisible().catch(() => false);
    const isLoggedIn = hasUserInfo && !hasLoginButton;

    test.skip(!isLoggedIn, 'User is not logged in - skipping test. Authentication is required for FriendsList tests.');
    return isLoggedIn;
  }

  test('opens friends dialog when clicking friends button', async ({ page }) => {
    // Check if logged in - will skip test if not
    await checkLoggedIn(page);

    // Find and click the friends button - it's inside UserInfoCard
    const friendsButton = page.getByRole('button', { name: /friends/i }).first();
    await expect(friendsButton).toBeVisible({ timeout: 5000 });
    await friendsButton.click();

    // Dialog should be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /friends/i })).toBeVisible();
  });

  test('displays friends list in dialog', async ({ page }) => {
    await checkLoggedIn(page);

    const friendsButton = page.getByRole('button', { name: /friends/i }).first();
    await expect(friendsButton).toBeVisible({ timeout: 5000 });
    await friendsButton.click();

    // Wait for dialog to be visible
    await expect(page.getByRole('dialog')).toBeVisible();

    // Check that friends are displayed (at least one friend from mocked data)
    await expect(page.getByText('Alice')).toBeVisible({ timeout: 3000 });
  });

  test('shows friend count on button', async ({ page }) => {
    await checkLoggedIn(page);

    const friendsButton = page.getByRole('button', { name: /friends/i }).first();
    await expect(friendsButton).toBeVisible({ timeout: 5000 });

    // Should show count (17 from mocked data)
    await expect(friendsButton).toContainText('17');
  });

  test('displays add friend form in dialog', async ({ page }) => {
    await checkLoggedIn(page);

    const friendsButton = page.getByRole('button', { name: /friends/i }).first();
    await expect(friendsButton).toBeVisible({ timeout: 5000 });
    await friendsButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Form elements should be visible
    await expect(page.getByLabel(/friend's email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /add friend/i }).last()).toBeVisible();
  });

  test('validates email input - empty submission', async ({ page }) => {
    await checkLoggedIn(page);

    const friendsButton = page.getByRole('button', { name: /friends/i }).first();
    await expect(friendsButton).toBeVisible({ timeout: 5000 });
    await friendsButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Submit without entering email
    const submitButtons = page.getByRole('button', { name: /add friend/i });
    const submitButton = submitButtons.last();
    await submitButton.click();

    // Should show validation error
    await expect(page.getByText(/email is required/i)).toBeVisible({ timeout: 3000 });
  });

  test('validates email input - invalid format', async ({ page }) => {
    await checkLoggedIn(page);

    const friendsButton = page.getByRole('button', { name: /friends/i }).first();
    await expect(friendsButton).toBeVisible({ timeout: 5000 });
    await friendsButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    const emailInput = page.getByLabel(/friend's email/i);
    await emailInput.fill('invalid-email');

    const submitButtons = page.getByRole('button', { name: /add friend/i });
    const submitButton = submitButtons.last();
    await submitButton.click();

    // Should show validation error
    await expect(page.getByText(/please enter a valid email address/i)).toBeVisible({ timeout: 3000 });
  });

  test('accepts valid email input', async ({ page }) => {
    await checkLoggedIn(page);

    const friendsButton = page.getByRole('button', { name: /friends/i }).first();
    await expect(friendsButton).toBeVisible({ timeout: 5000 });
    await friendsButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    const emailInput = page.getByLabel(/friend's email/i);
    await emailInput.fill('newfriend@example.com');

    const submitButtons = page.getByRole('button', { name: /add friend/i });
    const submitButton = submitButtons.last();
    await submitButton.click();

    // Input should be cleared after submission (form resets)
    await expect(emailInput).toHaveValue('', { timeout: 3000 });

    // No error should be visible
    await expect(page.getByText(/email is required/i)).not.toBeVisible();
    await expect(page.getByText(/please enter a valid email address/i)).not.toBeVisible();
  });

  test('closes dialog and resets form', async ({ page }) => {
    await checkLoggedIn(page);

    const friendsButton = page.getByRole('button', { name: /friends/i }).first();
    await expect(friendsButton).toBeVisible({ timeout: 5000 });
    await friendsButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Enter invalid email to trigger error
    const emailInput = page.getByLabel(/friend's email/i);
    await emailInput.fill('invalid');

    const submitButtons = page.getByRole('button', { name: /add friend/i });
    const submitButton = submitButtons.last();
    await submitButton.click();

    await expect(page.getByText(/please enter a valid email address/i)).toBeVisible({ timeout: 3000 });

    // Close dialog (click outside or ESC)
    await page.keyboard.press('Escape');

    // Dialog should be closed
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Reopen dialog
    await friendsButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Form should be reset (no error visible)
    await expect(page.getByText(/please enter a valid email address/i)).not.toBeVisible();
    const newEmailInput = page.getByLabel(/friend's email/i);
    await expect(newEmailInput).toHaveValue('');
  });
});
