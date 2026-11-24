import {test, expect} from '@playwright/test';
import {education, skillGroups, papers} from '../src/data.js';

test.beforeEach(async ({page}) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
});

for (const dark of [false, true]) {
  test(`printing includes education and skills in ${dark ? 'dark' : 'light'} theme`, async ({page}) => {
    await page.setViewportSize({width: 794, height: 1123});
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.goto('/#home');
    if (dark) await page.getByRole('button', {name: 'Switch to dark theme'}).click();

    await page.emulateMedia({media: 'print'});
    await expect(page.locator('.navwrap')).toBeHidden();
    await expect(page.locator('.journey-path')).toBeHidden();
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(17, 17, 17)');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('.education-row h3')).toHaveText(education.map(item => item.name));
    for (const group of skillGroups) {
      await expect(page.getByRole('list', {name: group.label, exact:true}).getByRole('listitem')).toHaveText(group.items);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const section of await page.locator('.reveal').all()) {
      await expect(section).toHaveCSS('opacity', '1');
    }
    // Returning from print restores the user's screen theme and scrollable trail.
    await page.emulateMedia({media: 'screen'});
    await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light');
    await expect(page.locator('.navwrap')).toBeVisible();
    await expect(page.locator('.journey-scroll')).toHaveCount(0);
  });
}

for (const route of ['projects']) {
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


test('printed research retains titles, summaries and manuscript links', async ({page}) => {
  await page.goto('/#research');
  await page.emulateMedia({media:'print'});
  await expect(page.locator('.feature h2, .paperrow h2')).toHaveText(papers.map(paper => paper.title));
  for (const paper of papers) await expect(page.getByText(paper.summary, {exact:true})).toBeVisible();
  await expect(page.getByRole('link', {name:'Read manuscript (PDF)'})).toBeVisible();
  await page.emulateMedia({media:'screen'});
  await expect(page.locator('.details > button')).toHaveCount(0);
});
