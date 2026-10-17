import {test, expect} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
});

for (const viewport of [{width: 390, height: 844}, {width: 1440, height: 900}]) {
  for (const reducedMotion of ['reduce', 'no-preference']) {
    test(`Back to top restores keyboard focus at ${viewport.width}px with ${reducedMotion} motion`, async ({page}) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({reducedMotion});
      for (const route of ['research', 'projects', 'experience', 'about']) {
        await page.goto('/#' + route);
        await expect(page.locator('main h1')).toBeVisible();
        const details = page.locator('main button[aria-expanded]').first();
        if (await details.count()) {
          await details.click();
          await expect(details).toHaveAttribute('aria-expanded', 'true');
        }

        const top = page.getByRole('button', {name: 'Back to top'});
        await top.focus();
        expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
        await page.keyboard.press('Enter');
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
        await expect(page.locator('main')).toBeFocused();
        await expect(page).toHaveURL(new RegExp('#' + route + '$'));
        if (await details.count()) await expect(details).toHaveAttribute('aria-expanded', 'true');

        // Scrolling alone left focus at the off-screen footer. Tab should now
        // continue at the first content link/control, not jump past the page.
        await page.keyboard.press('Tab');
        const firstControl = page.locator('main a, main button').first();
        await expect(firstControl).toBeFocused();
        await expect(firstControl).toBeInViewport();
      }
    });
  }
}

test('pointer activation also restores focus without changing the selected theme', async ({page}) => {
  await page.goto('/#experience');
  await page.getByRole('button', {name: 'Use light theme'}).click();
  await page.getByRole('button', {name: 'Back to top'}).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('main')).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.site-nav [aria-current="page"]')).toHaveText('Experience');
});
