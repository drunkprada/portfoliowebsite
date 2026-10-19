import {test, expect} from '@playwright/test';

// Keep verification local: no publication, profile or project service requests.
test.beforeEach(async ({page}) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
});

const viewports = [
  {width: 320, height: 568},
  {width: 390, height: 844},
  {width: 844, height: 390},
  {width: 820, height: 1180},
  {width: 1440, height: 900},
];

async function expectFocusVisible(page) {
  await expect.poll(() => page.evaluate(() => {
    const focused = document.activeElement;
    const rect = focused.getBoundingClientRect();
    const nav = document.querySelector('.navwrap').getBoundingClientRect();
    const top = Math.max(rect.top, nav.bottom + 4);
    const bottom = Math.min(rect.bottom, innerHeight - 4);
    const available = innerHeight - nav.bottom - 8;
    // A linked project image can be taller than a landscape phone's viewport.
    // In that case its visible portion should fill the available content area.
    const visible = rect.height > available
      ? bottom - top >= available - 4
      : rect.top >= nav.bottom + 4 && rect.bottom <= innerHeight;
    const hit = document.elementFromPoint(rect.x + rect.width / 2, (top + bottom) / 2);
    return visible && focused.contains(hit);
  }), {message: 'The focused content control must remain visible below the sticky nav'}).toBe(true);
}

for (const viewport of viewports) {
  test(`layout, themes and keyboard navigation at ${viewport.width}px`, async ({page}) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ['home', 'research', 'projects']) {
      await page.goto('/#' + route);
      for (const dark of [false, true]) {
        const theme = page.getByRole('button', {name: dark ? 'Switch to dark theme' : 'Switch to light theme'});
        if (await theme.count()) await theme.click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.locator('.theme')).toBeVisible();
      }
      for (const button of await page.locator('main button[aria-expanded]').all()) {
        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'true');
        const panel = page.locator('#' + await button.getAttribute('aria-controls'));
        await expect(panel).toBeVisible();
      }
      const controls = page.locator('main a, main button');
      const count = await controls.count();
      expect(count).toBeGreaterThan(0);
      await page.locator('main').focus();
      for (let i = 0; i < count; i++) {
        await page.keyboard.press('Tab');
        await expect(controls.nth(i)).toBeFocused();
        await expectFocusVisible(page);
      }
      await page.keyboard.press('Tab');
      await expect(page.locator('.footer a').first()).toBeFocused();
      for (let i = count - 1; i >= 0; i--) {
        await page.keyboard.press('Shift+Tab');
        await expect(controls.nth(i)).toBeFocused();
        await expectFocusVisible(page);
      }
    }
    expect(errors).toEqual([]);
  });
}

for (const reducedMotion of ['reduce', 'no-preference']) {
  test(`route changes restore focus and scroll with ${reducedMotion} motion`, async ({page}) => {
    await page.emulateMedia({reducedMotion});
    await page.setViewportSize({width: 390, height: 844});
    await page.goto('/#research');
    await page.locator('.footer a').first().focus();
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await page.getByRole('navigation', {name: 'Main'}).getByRole('link', {name: 'Projects'}).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    await expect(page).toHaveTitle('Projects · Sahana Naganandh');
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.keyboard.press('Tab');
    await expect(page.locator('main a').first()).toBeFocused();
    await expectFocusVisible(page);
    const details = page.locator('main button[aria-expanded]').first();
    await details.focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(details).toHaveAttribute('aria-expanded', 'false');
    await expect(details).toBeFocused();
  });
}

test('brand, browser history and unknown hashes resolve safely', async ({page}) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#home');
  await page.getByRole('link', {name: 'Read my research'}).click();
  await expect(page).toHaveTitle('Research · Sahana Naganandh');
  await page.getByRole('navigation').getByRole('link', {name: 'Projects'}).click();
  await expect(page).toHaveTitle('Projects · Sahana Naganandh');
  await page.goBack();
  await expect(page.locator('main h1')).toHaveText('Papers');
  await page.goForward();
  await expect(page.locator('main h1')).toHaveText('Things I’ve built');
  await page.getByRole('link', {name: 'Sahana Naganandh, home'}).click();
  await expect(page).toHaveTitle('Sahana Naganandh');
  for (const hash of ['unknown', '__proto__', 'constructor']) {
    await page.goto('/#' + hash);
    await expect(page.locator('main h1')).toHaveText('SahanaNaganandh');
    await expect(page).toHaveTitle('Sahana Naganandh');
  }
  await page.reload();
  await expect(page.locator('main h1')).toHaveText('SahanaNaganandh');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', {name: 'Skip to content'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  expect(errors).toEqual([]);
});

test('local manuscript and all project diagrams are served', async ({page, request}) => {
  await page.goto('/#research');
  await expect(page.getByRole('link', {name: 'Read manuscript (PDF)'})).toHaveAttribute('href', '/papers/os-tuning-manuscript.pdf');
  const pdf = await request.get('/papers/os-tuning-manuscript.pdf');
  expect(pdf.ok()).toBe(true);
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  await page.goto('/#projects');
  const images = page.locator('main img');
  await expect(images).toHaveCount(3);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  }
});

test('theme switching still works when browser storage is unavailable', async ({page}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage disabled'); };
    Storage.prototype.setItem = () => { throw new Error('Storage disabled'); };
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', {name: 'Switch to dark theme'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', {name: 'Switch to light theme'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(errors).toEqual([]);
});
