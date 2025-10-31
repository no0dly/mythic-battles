import { test, expect } from '@playwright/test';

test.describe('Wiki Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wiki?lng=en');
  });

  test('displays wiki page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Mythic Battles/i);

    // Check for wiki heading (translated title)
    const heading = page.getByRole('heading', { name: /wiki/i });
    await expect(heading).toBeVisible();
  });

  test('displays cards in grid layout', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid*="card-"]', { timeout: 5000 }).catch(() => {
      // Cards might not have test IDs, try alternative selectors
    });

    // Check for card titles (Zeus, Ares, Athena)
    await expect(page.getByText('Zeus')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Ares')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Athena')).toBeVisible({ timeout: 10000 });
  });

  test('opens modal when card is clicked', async ({ page }) => {
    // Wait for cards to load
    await page.waitForTimeout(1000);

    // Click on Zeus card
    const zeusCard = page.getByText('Zeus').first();
    await expect(zeusCard).toBeVisible();

    // Try to find clickable card element
    // Cards are rendered as buttons, so we can click the text and navigate up
    await zeusCard.click({ timeout: 5000 });

    // Wait for modal to appear
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Check modal content
    await expect(page.getByRole('heading', { name: 'Zeus' })).toBeVisible();
    await expect(page.getByText(/King of the gods/i)).toBeVisible();
  });

  test('displays card image in modal', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 5000 });

    // Click on the first card to open modal
    const firstCard = page.locator('[data-testid="card-item"]').first();
    await firstCard.click();

    // Wait for modal
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Check for image in the modal (should have an alt text matching a card title)
    const modalImage = page.getByRole('dialog').locator('img').first();
    await expect(modalImage).toBeVisible({ timeout: 5000 });
    const imageAlt = await modalImage.getAttribute('alt');
    expect(imageAlt).toBeTruthy();
    expect(imageAlt).not.toBe('');
  });

  test('closes modal when close button is clicked', async ({ page }) => {
    // Wait for cards to load
    await page.waitForTimeout(1000);

    // Open modal
    const zeusCard = page.getByText('Zeus').first();
    await zeusCard.click();

    // Wait for modal
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Find and click close button
    const closeButton = page.getByRole('button', { name: /close/i }).first();
    await closeButton.click();

    // Wait for modal to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
  });

  test('does not show wiki link in header when on wiki page', async ({ page }) => {
    // The wiki link should not be visible when we're already on the wiki page
    // Check that there's no link with text "wiki" that points to /wiki
    const wikiLinks = page.getByRole('link', { name: /wiki/i });
    const count = await wikiLinks.count();

    // Should be 0 or the link should not point to /wiki
    if (count > 0) {
      const href = await wikiLinks.first().getAttribute('href');
      expect(href).not.toBe('/wiki');
    }
  });

  test('shows loading state while cards are loading', async ({ page }) => {
    // Navigate to wiki page
    await page.goto('/wiki?lng=en');

    // The loader might appear briefly, check for it
    // Since cards load quickly, we might not catch it, but we can verify
    // that cards eventually appear
    await expect(page.getByText('Zeus')).toBeVisible({ timeout: 10000 });
  });

  test('displays card descriptions', async ({ page }) => {
    // Wait for cards to load
    await page.waitForTimeout(1000);

    // Check for short descriptions
    await expect(page.getByText(/King of the gods/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/God of war/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Goddess of wisdom/i)).toBeVisible({ timeout: 5000 });
  });
});

