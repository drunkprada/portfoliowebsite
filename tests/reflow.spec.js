import {test, expect} from '@playwright/test';
import {expectFocusVisible} from './helpers';

test.beforeEach(async ({page}) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
});

async function expectNavReadable(page) {
  await expect.poll(() => page.locator('.nav__links a, .theme').evaluateAll(controls => controls.every(control => {
    const rect = control.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    const text = document.createRange();
    text.selectNodeContents(control);
    return rect.left >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight
      && control.contains(hit) && [...text.getClientRects()].every(line =>
        line.left >= rect.left - 1 && line.right <= rect.right + 1
        && line.top >= rect.top - 1 && line.bottom <= rect.bottom + 1);
  })), {message: 'Every navigation label must fit inside its own usable control'}).toBe(true);
}

for (const viewport of [
  {width: 320, height: 568},
  {width: 390, height: 844},
  {width: 844, height: 390},
  {width: 1440, height: 900},
]) {
  test(`200% text stays readable and keyboard accessible at ${viewport.width}px`, async ({page}) => {
    test.setTimeout(60_000);
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/#home');
    // Double the site's 93.75% root size without enlarging the viewport.
    await page.addStyleTag({content: 'html { font-size: 187.5% !important; }'});
    for (const route of ['home', 'research', 'projects', 'experience']) {
      await page.getByRole('navigation', {name: 'Main'}).getByRole('link', {name: route[0].toUpperCase() + route.slice(1), exact: true}).click();
      await expect(page.locator('main')).toBeFocused();
      await expectNavReadable(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const details of await page.locator('main button[aria-expanded]').all()) {
        await details.click();
        await expect(details).toHaveAttribute('aria-expanded', 'true');
      }
      // Check expanded cards as well as the document: overflow:hidden must not
      // conceal text that cannot reflow within a card.
      expect(await page.locator('main .card').evaluateAll(cards => cards.every(card =>
        card.scrollWidth <= card.clientWidth + 1))).toBe(true);
      const controls = page.locator('main a, main button, main [tabindex="0"]');
      const count = await controls.count();
      await page.locator('main').focus();
      for (let i = 0; i < count; i++) {
        await page.keyboard.press('Tab');
        await expect(controls.nth(i)).toBeFocused();
        await expectFocusVisible(page);
      }
      await page.keyboard.press('Tab');
      for (let i = count - 1; i >= 0; i--) {
        await page.keyboard.press('Shift+Tab');
        await expect(controls.nth(i)).toBeFocused();
        await expectFocusVisible(page);
      }
    }
    await page.getByRole('button', {name: 'Switch to dark theme'}).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expectNavReadable(page);
    expect(errors).toEqual([]);
  });
}

test('header spacing survives orientation changes without ResizeObserver', async ({page}) => {
  await page.addInitScript(() => { window.ResizeObserver = undefined; });
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/#research');
  await page.addStyleTag({content: 'html { font-size: 187.5% !important; }'});
  for (const viewport of [{width: 844, height: 390}, {width: 320, height: 568}]) {
    await page.setViewportSize(viewport);
    await expectNavReadable(page);
    await expect.poll(() => page.locator('html').evaluate(html =>
      parseFloat(getComputedStyle(html).scrollPaddingTop) - document.querySelector('.navwrap').getBoundingClientRect().height
    )).toBeGreaterThanOrEqual(8);
    await page.locator('main').focus();
    await page.locator('main a').last().focus();
    await expectFocusVisible(page);
  }
});
