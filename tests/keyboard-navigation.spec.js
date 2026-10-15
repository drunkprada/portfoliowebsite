import {test, expect} from '@playwright/test';

const viewports = [
  {name: 'phone', width: 390, height: 844},
  {name: 'landscape phone', width: 844, height: 390},
  {name: 'tablet', width: 820, height: 1180},
  {name: 'desktop', width: 1440, height: 900},
];

// Test the rendered production site without depending on Google Fonts or
// visiting external publications, profiles, live demos or project services.
test.beforeEach(async ({page}) => {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
});

async function expectFocusClearOfDock(page) {
  await expect.poll(() => page.evaluate(() => {
    const focused = document.activeElement;
    const rect = focused.getBoundingClientRect();
    const dock = document.querySelector('.site-nav').getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    const clear = rect.top >= 0 && rect.bottom <= dock.top - 4 && focused.contains(hit);
    return clear ? null : {text: focused.textContent, top: rect.top, bottom: rect.bottom,
      dockTop: dock.top, hit: hit?.tagName};
  }), {message: 'The focused content control must be visible above the fixed dock'}).toBeNull();
}

for (const viewport of viewports) {
  test(`${viewport.name}: Tab and Shift+Tab keep content clear of the dock`, async ({page}) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    for (const route of ['home', 'research', 'projects', 'experience', 'about']) {
      await page.goto('/#' + route);
      await expect(page.locator('main h1')).toBeVisible();
      // Include links and controls below expanded research/project content.
      for (const button of await page.locator('main button[aria-expanded]').all()) {
        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'true');
      }

      const controls = page.locator('main a, main button');
      const count = await controls.count();
      expect(count).toBeGreaterThan(0);
      await page.locator('main').focus();
      for (let index = 0; index < count; index++) {
        await page.keyboard.press('Tab');
        await expect(controls.nth(index)).toBeFocused();
        await expectFocusClearOfDock(page);
      }
      // The next focusable item is the first dock tab, following <main>.
      await page.keyboard.press('Tab');
      await expect(page.locator('.site-nav a').first()).toBeFocused();
      for (let index = count - 1; index >= 0; index--) {
        await page.keyboard.press('Shift+Tab');
        await expect(controls.nth(index)).toBeFocused();
        await expectFocusClearOfDock(page);
      }

      await expect(page.locator('.site-nav')).toHaveCSS('position', 'fixed');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test('keyboard route changes and detail toggles retain usable focus', async ({page}) => {
  await page.goto('/#home');
  await page.getByRole('navigation').getByRole('link', {name: 'Research', exact: true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main h1')).toHaveText('Research');
  await expect(page.locator('main')).toBeFocused();
  const details = page.locator('main button[aria-expanded]').first();
  await details.focus();
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('aria-expanded', 'true');
  const panel = page.locator('.expand-content').first();
  await expect(panel).toBeVisible();
  await page.keyboard.press('Space');
  await expect(details).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toHaveCount(0);
  await expect(details).toBeFocused();
  await expectFocusClearOfDock(page);
});
