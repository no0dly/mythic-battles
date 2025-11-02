import { test, expect } from '@playwright/test';

test.describe('Language Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?lng=en');
  });

  test('renders language switcher button with icon', async ({ page }) => {
    const languageButton = page.getByRole('button', { name: 'Change language' });
    await expect(languageButton).toBeVisible();
  });

  test('opens dropdown menu when button is clicked', async ({ page }) => {
    const languageButton = page.getByRole('button', { name: 'Change language' });
    await languageButton.click();

    // Wait for dropdown menu to appear
    await expect(page.getByRole('menuitem', { name: 'English' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Русский' })).toBeVisible();
  });

  test('displays all supported languages in dropdown', async ({ page }) => {
    const languageButton = page.getByRole('button', { name: 'Change language' });
    await languageButton.click();

    await expect(page.getByRole('menuitem', { name: 'English' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Русский' })).toBeVisible();
  });

  test('changes language to Russian when selected', async ({ page }) => {
    // Initially should be in English
    await expect(page.getByRole('link', { name: 'Wiki' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

    // Open dropdown and select Russian
    const languageButton = page.getByRole('button', { name: 'Change language' });
    await languageButton.click();
    await page.getByRole('menuitem', { name: 'Русский' }).click();

    // Wait for language change and verify labels updated
    await expect(page.getByRole('link', { name: 'Вики' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible();
  });

  test('changes language back to English when selected', async ({ page }) => {
    // First switch to Russian
    const languageButton = page.getByRole('button', { name: 'Change language' });
    await languageButton.click();
    await page.getByRole('menuitem', { name: 'Русский' }).click();

    // Wait for Russian labels
    await expect(page.getByRole('link', { name: 'Вики' })).toBeVisible();

    // Switch back to English
    await languageButton.click();
    await page.getByRole('menuitem', { name: 'English' }).click();

    // Verify English labels are back
    await expect(page.getByRole('link', { name: 'Wiki' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });

  test('highlights current language in dropdown', async ({ page }) => {
    const languageButton = page.getByRole('button', { name: 'Change language' });
    await languageButton.click();

    // English should be highlighted initially
    const englishMenuItem = page.getByRole('menuitem', { name: 'English' });
    await expect(englishMenuItem).toBeVisible();
    
    // Check if English menu item has the accent class
    const englishItemClasses = await englishMenuItem.getAttribute('class');
    expect(englishItemClasses).toContain('bg-accent');
  });

  test('highlights Russian when Russian is selected', async ({ page }) => {
    const languageButton = page.getByRole('button', { name: 'Change language' });
    
    // Switch to Russian first
    await languageButton.click();
    await page.getByRole('menuitem', { name: 'Русский' }).click();

    // Wait for language change
    await expect(page.getByRole('link', { name: 'Вики' })).toBeVisible();

    // Open dropdown again to check highlighting
    await languageButton.click();
    
    // Russian should now be highlighted
    const russianMenuItem = page.getByRole('menuitem', { name: 'Русский' });
    await expect(russianMenuItem).toBeVisible();
    
    const russianItemClasses = await russianMenuItem.getAttribute('class');
    expect(russianItemClasses).toContain('bg-accent');
  });

  test('closes dropdown after selecting a language', async ({ page }) => {
    const languageButton = page.getByRole('button', { name: 'Change language' });
    await languageButton.click();

    // Verify dropdown is open
    await expect(page.getByRole('menuitem', { name: 'English' })).toBeVisible();

    // Select a language
    await page.getByRole('menuitem', { name: 'Русский' }).click();

    // Wait a bit for dropdown to close
    await page.waitForTimeout(300);

    // Verify dropdown is closed (menu items should not be visible)
    await expect(page.getByRole('menuitem', { name: 'English' })).not.toBeVisible();
  });
});

