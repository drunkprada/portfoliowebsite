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
    test.setTimeout(60_000);
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ['home', 'research', 'projects', 'experience']) {
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
      const controls = page.locator('main a, main button, main [tabindex="0"]');
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
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
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

test('Home, browser history and unknown hashes resolve safely', async ({page}) => {
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
  await page.getByRole('navigation', {name: 'Main'}).getByRole('link', {name: 'Home', exact: true}).click();
  await expect(page).toHaveTitle('Sahana Naganandh');
  for (const hash of ['unknown', '__proto__', 'constructor']) {
    await page.goto('/#' + hash);
    await expect(page.locator('main h1')).toHaveText('Hi, I’m Sahana.');
    await expect(page).toHaveTitle('Sahana Naganandh');
  }
  await page.reload();
  await expect(page.locator('main h1')).toHaveText('Hi, I’m Sahana.');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', {name: 'Skip to content'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  expect(errors).toEqual([]);
});

test('paper screenshots and manuscript are served; projects have no previews', async ({page, request}) => {
  await page.goto('/#research');
  await expect(page.getByRole('link', {name: 'Read manuscript (PDF)'})).toHaveAttribute('href', '/papers/os-tuning-manuscript.pdf');
  const pdf = await request.get('/papers/os-tuning-manuscript.pdf');
  expect(pdf.ok()).toBe(true);
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  const images = page.locator('.paper-preview img');
  await expect(images).toHaveCount(2);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(image).toHaveAttribute('alt', /^First page of /);
  }
  await page.goto('/#projects');
  await expect(page.locator('main img')).toHaveCount(0);
  await expect(page.locator('.project-list .proj')).toHaveCount(3);
  await expect(page.locator('.proj__links a[href^="https://github.com/"]')).toHaveCount(3);
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


test('Experience navigation restores work and society contributions', async ({page}) => {
  await page.goto('/#home');
  await page.getByRole('navigation', {name: 'Main'}).getByRole('link', {name: 'Experience'}).click();
  await expect(page.locator('main')).toBeFocused();
  await expect(page).toHaveTitle('Experience · Sahana Naganandh');
  await expect(page.locator('.nav__links [aria-current="page"]')).toHaveText('Experience');
  await expect(page.locator('.experience-entry h2')).toHaveText([
    'Dell Technologies', 'Nectar Building Technologies Inc.', 'Legal Horizons', 'Manipal Institute of Higher Education',
  ]);
  await expect(page.locator('.community-list')).toContainText('C++ game portal');
  await expect(page.locator('.community-list')).toContainText('MERN-stack website');
  await expect(page.locator('.community-list')).toContainText('AI/ML and development judging panel');
  await expect(page.locator('.community-list')).toContainText('Cook-Off');
  await expect(page.locator('.community-list')).toContainText('HackBattle sponsorship team');
  await expect(page.locator('.community-list')).toContainText('puzzles and ciphers');
  await expect(page.locator('.community__meta .label')).toHaveText([
    'Senior Core Member · Frontend Developer', 'Senior Core Member · Frontend Developer',
  ]);
  await expect(page.locator('.community__meta .muted')).toHaveText(['2024 – 2025 · 1 year', '2024 – 2025 · 1 year']);
  await page.reload();
  await expect(page.locator('main h1')).toHaveText('Where I’ve worked');
});

test('page landmarks are named and the active tab returns to the page start', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  const headings = {
    home: 'Hi, I’m Sahana.',
    research: 'Papers',
    projects: 'Things I’ve built',
    experience: 'Where I’ve worked',
  };
  for (const [route, heading] of Object.entries(headings)) {
    await page.goto('/#' + route);
    const main = page.locator('main');
    await expect(main).toHaveAttribute('aria-labelledby', route + '-heading');
    await expect(page.locator('#' + route + '-heading')).toHaveText(heading);
    await page.locator('.footer').scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    const active = page.locator('.nav__links [aria-current="page"]');
    await active.focus();
    await page.keyboard.press('Enter');
    await expect(main).toBeFocused();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page).toHaveURL(new RegExp('#' + route + '$'));
  }
});

test('active tabs preserve modified and non-primary link activation', async ({page}) => {
  for (const route of ['home', 'research', 'projects', 'experience']) {
    await page.goto('/#' + route);
    await page.locator('.footer a').first().focus();
    const scrollBefore = await page.evaluate(() => scrollY);
    expect(scrollBefore).toBeGreaterThan(0);

    for (const options of [{ctrlKey: true}, {metaKey: true}, {shiftKey: true}, {altKey: true}, {button: 1}]) {
      const activation = await page.locator('.nav__links [aria-current="page"]').evaluate((link, options) => {
        const event = new MouseEvent('click', {bubbles: true, cancelable: true, ...options});
        let prevented;
        // Observe React's decision, then suppress the browser default so this
        // cross-platform modifier matrix cannot open OS windows or downloads.
        document.addEventListener('click', e => {
          prevented = e.defaultPrevented;
          e.preventDefault();
        }, {once: true});
        link.dispatchEvent(event);
        return {prevented, hash: location.hash, scroll: scrollY, focus: document.activeElement.tagName};
      }, options);
      expect(activation, `${route}: ${JSON.stringify(options)}`).toEqual({
        prevented: false, hash: '#' + route, scroll: scrollBefore, focus: 'A',
      });
    }
  }
});

test('Ctrl-click opens the active page in a new tab without resetting the original', async ({page, context}) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
  await page.goto('/#research');
  const details = page.locator('.details > button').first();
  await details.click();
  await page.locator('.footer').scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    // Real pointer activation can first scroll the sticky link into view.
    // Compare from the click's capture phase, before React handles the link.
    document.addEventListener('click', () => { window.activationScroll = scrollY; }, {capture: true, once: true});
  });
  const popupPromise = context.waitForEvent('page');
  await page.locator('.nav__links [aria-current="page"]').click({modifiers: ['Control']});
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/#research$/);
  await expect(popup.locator('main h1')).toHaveText('Papers');
  await expect(page).toHaveURL(/#research$/);
  await expect(details).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => page.evaluate(() => scrollY === window.activationScroll && scrollY > 0)).toBe(true);
  await popup.close();
});

