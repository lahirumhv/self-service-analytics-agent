import { test, expect } from '@playwright/test';

test.describe('Analytics Agent E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the backend API to avoid real LLM calls
    await page.route('**/api/chat', async (route) => {
      const payload = route.request().postDataJSON();
      if (payload.query.includes('customers')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sql: 'SELECT * FROM customers;',
            results: [
              { id: 1, name: 'Alice Johnson', email: 'alice@example.com', city: 'New York' },
              { id: 2, name: 'Bob Smith', email: 'bob@example.com', city: 'San Francisco' }
            ],
            validationNote: null
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sql: 'SELECT count(*) as count FROM products;',
            results: [{ count: 4 }],
            validationNote: null
          })
        });
      }
    });

    await page.goto('/');
  });

  test('should allow user to enter a query and see results', async ({ page }) => {
    const input = page.getByPlaceholder(/Ask a question/i);
    await input.fill('Show all customers');
    await page.keyboard.press('Enter');

    // Check if SQL is displayed
    await expect(page.getByText('SELECT * FROM customers;')).toBeVisible();

    // Check if results table is displayed
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('Alice Johnson')).toBeVisible();
    await expect(page.getByText('Bob Smith')).toBeVisible();
  });

  test('should display a loading state while fetching', async ({ page }) => {
    // Slow down the mock response to see loading state
    await page.route('**/api/chat', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sql: '-- mock', results: [] })
      });
    });

    const input = page.getByPlaceholder(/Ask a question/i);
    await input.fill('test');
    await page.keyboard.press('Enter');

    // Loader2 from lucide-react often renders as an svg with animate-spin class
    await expect(page.locator('.animate-spin')).toBeVisible();
  });
});
