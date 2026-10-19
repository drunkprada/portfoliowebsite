import {test, expect} from '@playwright/test';

// Block external requests (fonts, publications) so tests only exercise the built site.
test.beforeEach(async ({page}) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
});

for (const viewport of [{width: 390, height: 844}, {width: 820, height: 1180}, {width: 1440, height: 900}]) {
  test(`every page renders without errors or sideways scroll at ${viewport.width}px`, async ({page}) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const route of ['home', 'research', 'projects']) {
      await page.goto('/#' + route);
      await expect(page.locator('main h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test('nav marks the current page and the theme toggle persists', async ({page}) => {
  await page.goto('/#home');
  await page.getByRole('navigation', {name: 'Main'}).getByRole('link', {name: 'Research'}).click();
  await expect(page.locator('main h1')).toHaveText('Papers');
  await expect(page.locator('.nav__links a[aria-current="page"]')).toHaveText('Research');
  await page.locator('.theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('research details expand', async ({page}) => {
  await page.goto('/#research');
  const btn = page.locator('.details > button').first();
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.details__body').first()).toContainText('The question');
});
