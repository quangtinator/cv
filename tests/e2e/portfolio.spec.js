import { test, expect } from '@playwright/test';

for (const path of ['', 'v1.html', 'v2.html', 'v4/']) {
  test(`portfolio ${path || 'home'} loads its application and local assets`, async ({ page, baseURL }) => {
    const errors = [];
    const failedAssets = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(new URL(baseURL).origin) && response.status() >= 400) failedAssets.push(`${response.status()} ${response.url()}`);
    });
    const response = await page.goto(path || './');
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toContainText(/Quang/i);
    await expect(page.locator('#root')).not.toBeEmpty();
    if (path !== 'v4/') {
      const nav = page.getByRole('navigation', { name: 'Portfolio version' });
      await nav.getByRole('button').click();
      await expect(nav.locator('a')).toHaveCount(3);
      const links = await nav.locator('a').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
      for (const link of links) expect(link).toMatch(/^\/cv\/(?:staging\/)?/);
    }
    expect(errors).toEqual([]);
    expect(failedAssets).toEqual([]);
  });
}
