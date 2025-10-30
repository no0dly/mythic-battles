import { test, expect } from '@playwright/test';

test.describe('Auth flows (public navigation only)', () => {
  test('Login link navigates to login page', async ({ page }) => {
    await page.goto('/?lng=en');
    const loginLink = page.getByRole('link', { name: 'Login' });
    await expect(loginLink).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/auth\/login(\?[^#]*)?$/),
      loginLink.click(),
    ]);
    await expect(page.getByRole('heading', { name: 'Login to Mythic Battles' })).toBeVisible();
  });

  test('Unauthenticated visit to /profile redirects to /auth/login', async ({ page }) => {
    await page.goto('/profile?lng=en');
    await expect(page).toHaveURL(/\/auth\/login(\?[^#]*)?$/);
    await expect(page.getByRole('heading', { name: 'Login to Mythic Battles' })).toBeVisible();
  });
});


