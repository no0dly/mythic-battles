import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('renders header, title and auth actions', async ({ page }) => {
    await page.goto('/');

    // Title
    await expect(page).toHaveTitle(/Mythic Battles/i);

    // Header actions: Wiki button and Login link
    await expect(page.getByRole('link', { name: 'Wiki' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

    // Logo text (visible on sm+ screens); the image alt should always exist
    await expect(page.getByRole('img', { name: 'Mythic Battles' })).toBeVisible();
  });

  test('language switcher updates visible labels', async ({ page }) => {
    await page.goto('/');

    // Initially English
    await expect(page.getByRole('link', { name: 'Wiki' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

    // Open language switcher dropdown
    const languageButton = page.getByRole('button', { name: 'Change language' });
    await expect(languageButton).toBeVisible();
    await languageButton.click();

    // Select Russian from dropdown
    await expect(page.getByRole('menuitem', { name: 'Русский' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Русский' }).click();

    // Labels should change
    await expect(page.getByRole('link', { name: 'Вики' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible();
  });
});


