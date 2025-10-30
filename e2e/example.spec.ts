import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/?lng=en');
    await expect(page).toHaveTitle(/Mythic Battles/i);
    await expect(page.getByRole('heading', { name: 'Welcome to Mythic Battles' })).toBeVisible();
  });
});
