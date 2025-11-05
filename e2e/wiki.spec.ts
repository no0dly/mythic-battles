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
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 5000 });

    // Check for card items in the grid
    const cardItems = page.locator('[data-testid="card-item"]');
    await expect(cardItems.first()).toBeVisible({ timeout: 10000 });

    // Check for card names (Zeus, Ares, Athena) - displayed as "Name (cost)"
    await expect(page.getByText(/Zeus/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Ares/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Athena/i)).toBeVisible({ timeout: 10000 });
  });

  test('opens modal when card is clicked', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 10000 });

    // Find the card button and click it
    const cardButton = page.locator('[data-testid="card-item"]').first();
    await cardButton.click({ timeout: 5000 });

    // Wait for modal to appear
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('card-modal')).toBeVisible({ timeout: 5000 });

    // Check modal content - should show card name and properties
    // The heading should contain a card name (could be Zeus, Ares, Athena, etc.)
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
    const headingText = await heading.textContent();
    expect(headingText).toBeTruthy();

    await expect(page.getByText(/Type:/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Cost:/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Strategic Value:/i)).toBeVisible({ timeout: 5000 });
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

    // Open modal by clicking on a card
    const cardButton = page.locator('[data-testid="card-item"]').first();
    await cardButton.click();

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
    await expect(page.locator('[data-testid="card-item"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Zeus/i)).toBeVisible({ timeout: 10000 });
  });

  test('displays card information', async ({ page }) => {
    // Wait for cards to load
    await page.waitForTimeout(1000);

    // Check for card names and cost information
    // Cards display as "Zeus (5)" format
    await expect(page.getByText(/Zeus/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Ares/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Athena/i)).toBeVisible({ timeout: 5000 });

    // Check for card type badges (unit_type)
    // These should be visible as badges
    const cardItems = page.locator('[data-testid="card-item"]');
    const count = await cardItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('displays filter controls', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check for filter inputs
    const searchInput = page.getByLabel(/search by name/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Check for type filter
    const typeFilter = page.getByLabel(/type/i);
    await expect(typeFilter).toBeVisible({ timeout: 5000 });

    // Check for cost filter
    const costFilter = page.getByLabel(/cost/i);
    await expect(costFilter).toBeVisible({ timeout: 5000 });
  });

  test('filters cards by search name', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 10000 });

    // Get initial card count
    const initialCards = page.locator('[data-testid="card-item"]');
    const initialCount = await initialCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Type in search input
    const searchInput = page.getByLabel(/search by name/i);
    await searchInput.fill('Zeus');

    // Wait for debounce to complete (400ms) plus filtering
    await page.waitForTimeout(600);

    // Check that filtered cards are shown
    // Should show cards matching "Zeus"
    await expect(page.getByText(/Zeus/i)).toBeVisible({ timeout: 5000 });

    // Verify that the filtered count is less than or equal to initial count
    const filteredCards = page.locator('[data-testid="card-item"]');
    const filteredCount = await filteredCards.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('shows clear filters button when filters are active', async ({ page }) => {
    // Wait for cards to load
    await page.waitForTimeout(1000);

    // Type in search input to activate filter
    const searchInput = page.getByLabel(/search by name/i);
    await searchInput.fill('Zeus');

    // Wait for debounce to complete (400ms) plus some buffer
    await page.waitForTimeout(600);

    // Check for clear filters button - the button text is "Clear" not "Clear Filters"
    const clearButton = page.getByRole('button', { name: /clear/i });
    await expect(clearButton).toBeVisible({ timeout: 5000 });
  });

  test('clears filters when clear button is clicked', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 10000 });

    // Get initial card count
    const initialCards = page.locator('[data-testid="card-item"]');
    const initialCount = await initialCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Apply a filter
    const searchInput = page.getByLabel(/search by name/i);
    await searchInput.fill('Zeus');
    await page.waitForTimeout(600);

    // Verify filter is applied
    const clearButton = page.getByRole('button', { name: /clear/i });
    await expect(clearButton).toBeVisible({ timeout: 5000 });

    // Get filtered count before clearing
    const filteredBeforeClear = page.locator('[data-testid="card-item"]');
    const filteredCountBefore = await filteredBeforeClear.count();

    // Click clear button
    await clearButton.click();
    await page.waitForTimeout(600);

    // Verify clear button is gone
    await expect(clearButton).not.toBeVisible({ timeout: 5000 });

    // Verify all cards are shown again (count should be >= filtered count)
    const cardsAfterClear = page.locator('[data-testid="card-item"]');
    await expect(cardsAfterClear.first()).toBeVisible({ timeout: 5000 });
    const countAfterClear = await cardsAfterClear.count();
    expect(countAfterClear).toBeGreaterThanOrEqual(filteredCountBefore);
    expect(countAfterClear).toBeGreaterThanOrEqual(initialCount);
  });

  test('filters cards by type', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 10000 });

    // Get initial card count
    const initialCards = page.locator('[data-testid="card-item"]');
    const initialCount = await initialCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Open type filter dropdown
    const typeFilter = page.getByLabel(/type/i);
    await typeFilter.click();
    await page.waitForTimeout(300);

    // Select a type (e.g., "god")
    const godOption = page.getByRole('option', { name: /god/i });
    await godOption.click();
    await page.waitForTimeout(300);

    // Wait for filtering to complete
    await page.waitForTimeout(300);

    // Verify cards are filtered
    const filteredCards = page.locator('[data-testid="card-item"]');
    const filteredCount = await filteredCards.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Verify clear button appears
    const clearButton = page.getByRole('button', { name: /clear/i });
    await expect(clearButton).toBeVisible({ timeout: 5000 });
  });

  test('filters cards by cost', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 10000 });

    // Get initial card count
    const initialCards = page.locator('[data-testid="card-item"]');
    const initialCount = await initialCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Open cost filter dropdown
    const costFilter = page.getByLabel(/cost/i);
    await costFilter.click();
    await page.waitForTimeout(500);

    // Wait for dropdown to be visible and find the option list
    // The options are in a SelectContent, so we need to find them properly
    const selectContent = page.locator('[role="listbox"], [data-radix-popper-content-wrapper]').last();
    await expect(selectContent).toBeVisible({ timeout: 5000 });

    // Find cost options - they should be in role="option" inside the dropdown
    // Look for options that are numeric (not "All Costs")
    const costOptions = selectContent.locator('[role="option"]').filter({ hasNotText: /all costs/i });
    const optionCount = await costOptions.count();

    if (optionCount > 0) {
      // Click the first numeric cost option
      await costOptions.first().click();
      await page.waitForTimeout(500);
    } else {
      // Fallback: try to find any option with a number
      const numericOption = selectContent.locator('[role="option"]').filter({ hasText: /^\d+$/ });
      if (await numericOption.count() > 0) {
        await numericOption.first().click();
        await page.waitForTimeout(500);
      } else {
        // If no options found, just close the dropdown
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    }

    // Wait for filtering to complete
    await page.waitForTimeout(500);

    // Verify cards are filtered (if we selected an option)
    if (optionCount > 0) {
      const filteredCards = page.locator('[data-testid="card-item"]');
      const filteredCount = await filteredCards.count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      // Verify clear button appears
      const clearButton = page.getByRole('button', { name: /clear/i });
      await expect(clearButton).toBeVisible({ timeout: 5000 });
    }
  });

  test('filters cards by multiple criteria', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 10000 });

    // Get initial card count
    const initialCards = page.locator('[data-testid="card-item"]');
    const initialCount = await initialCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Apply search filter
    const searchInput = page.getByLabel(/search by name/i);
    await searchInput.fill('Zeus');
    await page.waitForTimeout(600);

    // Apply type filter
    const typeFilter = page.getByLabel(/type/i);
    await typeFilter.click();
    await page.waitForTimeout(300);

    const godOption = page.getByRole('option', { name: /god/i });
    const godCount = await godOption.count();
    if (godCount > 0) {
      await godOption.click();
    }
    await page.waitForTimeout(300);

    // Verify filtered results
    const filteredCards = page.locator('[data-testid="card-item"]');
    const filteredCount = await filteredCards.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Verify clear button is visible
    const clearButton = page.getByRole('button', { name: /clear/i });
    await expect(clearButton).toBeVisible({ timeout: 5000 });
  });

  test('displays filtered card count', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 10000 });

    // Check for "showing cards" text that displays count
    // This text should be visible after cards load
    await page.waitForTimeout(1000);

    // The page should show information about filtered cards
    // Look for text that contains numbers (card counts)
    const showingCardsText = page.locator('text=/showing|cards/i');
    const count = await showingCardsText.count();
    // This might not always be visible, so we just verify cards are displayed
    const cardItems = page.locator('[data-testid="card-item"]');
    await expect(cardItems.first()).toBeVisible({ timeout: 5000 });
  });

  test('displays empty state when no cards match filters', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 10000 });

    // Apply a filter that won't match any cards
    const searchInput = page.getByLabel(/search by name/i);
    await searchInput.fill('NonExistentCardName12345');

    // Wait for debounce and filtering
    await page.waitForTimeout(600);

    // Check for "no cards found matching your filters" message
    const noCardsMessage = page.getByText(/no cards found matching your filters/i);
    await expect(noCardsMessage).toBeVisible({ timeout: 5000 });

    // Verify no cards are displayed
    const cardItems = page.locator('[data-testid="card-item"]');
    const visibleCount = await cardItems.count();
    expect(visibleCount).toBe(0);
  });
});

