import {test, expect} from '@playwright/test';
import {experienceJourney} from '../src/data.js';

test.beforeEach(async ({page}) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
});

for (const dark of [false, true]) {
  test(`printing includes the whole experience trail in ${dark ? 'dark' : 'light'} theme`, async ({page}) => {
    await page.setViewportSize({width: 794, height: 1123});
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.goto('/#home');
    if (dark) await page.getByRole('button', {name: 'Switch to dark theme'}).click();
    const strip = page.locator('.journey-scroll');
    await page.emulateMedia({media: 'print'});
    await expect(page.locator('.navwrap')).toBeHidden();
    await expect(page.locator('.journey-path')).toBeHidden();
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(17, 17, 17)');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('.journey-stop')).toHaveCount(experienceJourney.filter(step => step.year).length);
    const layout = await strip.evaluate(node => {
      const bounds = node.getBoundingClientRect();
      const stops = [...node.querySelectorAll('.journey-stop')].map(stop => stop.getBoundingClientRect());
      return {
        contained: stops.every(stop => stop.left >= bounds.left - 1 && stop.right <= bounds.right + 1),
        wraps: stops.at(-1).top > stops[0].top,
        noClip: node.scrollWidth <= node.clientWidth,
      };
    });
    expect(layout).toEqual({contained: true, wraps: true, noClip: true});
    for (const section of await page.locator('.reveal').all()) {
      await expect(section).toHaveCSS('opacity', '1');
    }
    // Returning from print restores the user's screen theme and scrollable trail.
    await page.emulateMedia({media: 'screen'});
    await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light');
    await expect(page.locator('.navwrap')).toBeVisible();
    await expect(strip).toHaveCSS('overflow-x', 'auto');
  });
}

for (const route of ['research', 'projects']) {
  test(`printing includes collapsed ${route} details without changing their screen state`, async ({page}) => {
    await page.goto('/#' + route);
    const buttons = page.locator('.details > button');
    const panels = page.locator('.details__body');
    for (const button of await buttons.all()) {
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    }
    await expect(panels).toHaveCount(await buttons.count());
    for (const panel of await panels.all()) await expect(panel).toBeHidden();
    await page.emulateMedia({media: 'print'});
    for (const panel of await panels.all()) await expect(panel).toBeVisible();
    for (const button of await buttons.all()) await expect(button).toBeHidden();
    await page.emulateMedia({media: 'screen'});
    for (const panel of await panels.all()) await expect(panel).toBeHidden();
    const first = buttons.first();
    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(panels.first()).toBeVisible();
  });
}
