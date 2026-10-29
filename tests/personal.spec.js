import {test, expect} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
});

test('decorative drawings animate without adding labels or hiding content', async ({page}) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/#home');
  await expect(page.locator('.intro__doodle .sketch-orbit')).toHaveCSS('animation-name','orbit');
  const strip = page.locator('.journey-scroll');
  await strip.scrollIntoViewIfNeeded();
  await expect(page.locator('.journey-track')).toHaveClass(/is-revealed/);
  await expect(page.locator('.journey-path path')).toHaveCSS('animation-name','pen-in');
  for (const sketch of await page.locator('svg.sketch').all()) {
    await expect(sketch).toHaveAttribute('aria-hidden','true');
    await expect(sketch).toHaveAttribute('focusable','false');
  }
});

test('page headings keep useful titles without generic section blurbs', async ({page}) => {
  for (const route of ['research','projects','experience']) {
    await page.goto('/#' + route);
    await expect(page.locator('.pagehead h1')).toBeVisible();
    await expect(page.locator('.pagehead p, .pagehead .label')).toHaveCount(0);
    await expect(page.locator('.pagehead .sketch')).toHaveCount(1);
  }
});

test('Endeavour positions stack on a phone and remain in Student clubs', async ({page}) => {
  await page.setViewportSize({width:320,height:700});
  await page.goto('/#experience');
  const card = page.locator('.community--current');
  await expect(card).toContainText('Oct 2026 – present');
  await expect(card.locator('h4')).toHaveText(['Telemetry and Diagnostics','Sponsorship Specialist']);
  const boxes = await card.locator('.community-position').evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect();
    return {top:box.top,bottom:box.bottom};
  }));
  expect(boxes[1].top).toBeGreaterThan(boxes[0].bottom);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
