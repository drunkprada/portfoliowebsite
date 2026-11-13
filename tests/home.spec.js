import {test, expect} from '@playwright/test';
import {createHash} from 'node:crypto';
import {skillGroups} from '../src/data.js';

test.beforeEach(async ({page}) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
});

test('resume button serves the exact uploaded PDF', async ({page, request}) => {
  await page.goto('/#home');
  const resume = page.getByRole('link', {name: 'View my resume'});
  await expect(resume).toHaveJSProperty('href', new URL('/resume/sahana-naganandh-resume.pdf', page.url()).href);
  await expect(resume).toHaveAttribute('target', '_blank');
  const response = await request.get(await resume.evaluate(link => link.href));
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect(createHash('sha256').update(await response.body()).digest('hex'))
    .toBe('daff2692c15fe4d124e65d93cf3a2120c720140fad7514a91d75d886b81b49df');
});

test('home shows education and skills without the timeline', async ({page}) => {
  await page.goto('/#home');
  await expect(page.locator('.journey-stop')).toHaveCount(0);
  await expect(page.locator('.intro__eyebrow, .ink-name svg')).toHaveCount(0);
  for (const group of skillGroups) {
    await expect(page.getByRole('list', {name:group.label, exact:true}).getByRole('listitem')).toHaveText(group.items);
  }
  await expect(page.locator('.education-row h3')).toHaveText(['University of Edinburgh', 'Vellore Institute of Technology']);
  await expect(page.locator('.education-row').last()).toContainText('2024 – 2026');
  await expect(page.locator('.education-row').last()).not.toContainText('8.75');
  await page.goto('/#research');
  await expect(page.locator('.feature h2')).toHaveText('Operating System Level Optimization for Energy Efficient AI Inference Performance');
  await expect(page.getByText('The question, method & findings')).toHaveCount(0);
});

test('reduced motion keeps all content visible and skill bubbles still', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/#home');
  await expect(page.locator('.intro__copy')).toHaveCSS('opacity', '1');
  const bubble = page.locator('.skill-bubble').first();
  await bubble.hover();
  await expect(bubble).toHaveCSS('transform', 'none');
  await expect(page.locator('.enter')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.intro__doodle .sketch-orbit')).toHaveCSS('animation-name', 'none');
});

test('scroll reveals work with motion enabled and keyboard focus stays visible', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.goto('/#home');
  const panel = page.locator('.education-row').first();
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveClass(/is-revealed/);
  await expect(panel).toHaveCSS('opacity', '1');
  const research = page.getByRole('link', {name: 'Read my research'});
  await research.focus();
  await expect(research).toBeInViewport();
  await expect(research).toBeInViewport();
});

test('content remains readable when IntersectionObserver is unavailable', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.addInitScript(() => { window.IntersectionObserver = undefined; window.ResizeObserver = undefined; });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#home');
  for (const section of await page.locator('.reveal').all()) {
    await expect(section).toHaveCSS('opacity', '1');
    await expect(section).not.toHaveClass(/will-reveal/);
  }
  expect(errors).toEqual([]);
});


test.describe('touch phone', () => {
  test.use({isMobile: true, hasTouch: true, viewport: {width: 320, height: 568}});

  test('navigation has Home and comfortable tap targets', async ({page}) => {
    await page.goto('/#home');
    const nav = page.getByRole('navigation', {name: 'Main'});
    await expect(nav.getByRole('link')).toHaveText(['Home', 'Research', 'Projects', 'Experience']);
    await expect(nav.getByRole('link', {name: 'Home', exact: true})).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.navwrap')).not.toContainText('Sahana Naganandh');
    for (const target of await page.locator('.nav__links a, .theme, main a, .footer a').all()) {
      const box = await target.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await nav.getByRole('link', {name: 'Experience'}).tap();
    await expect(page.locator('main h1')).toHaveText('Where I’ve worked');
    await nav.getByRole('link', {name: 'Home', exact: true}).tap();
    await expect(page.locator('main h1')).toHaveText('Hi, I’m Sahana.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
