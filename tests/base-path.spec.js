import {test, expect} from '@playwright/test';

test('local assets resolve when the built portfolio is served in a subdirectory', async ({page}) => {
  const prefix = '/portfolio/';
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1' || !url.pathname.startsWith(prefix)) {
      return route.abort();
    }
    // Mount the built output at a prefix without letting root URLs succeed.
    url.pathname = '/' + url.pathname.slice(prefix.length);
    await route.fulfill({response: await route.fetch({url: url.href, maxRedirects: 0})});
  });

  for (const [view, pdf, imageCount] of [
    ['home', 'resume/sahana-naganandh-resume.pdf', 4],
    ['research', 'papers/os-tuning-manuscript.pdf', 2],
    ['experience', null, 4],
  ]) {
    await page.goto(prefix + '#' + view);
    await expect(page.locator('main h1')).toBeVisible();
    const images = page.locator('main img');
    await expect(images).toHaveCount(imageCount);
    for (const image of await images.all()) {
      await image.evaluate(node => { node.loading = 'eager'; });
      await expect.poll(() => image.evaluate(node =>
        new URL(node.src).pathname.startsWith('/portfolio/') && node.naturalWidth > 0
      )).toBe(true);
    }
    if (pdf) {
      const response = await page.evaluate(async path => {
        const link = [...document.querySelectorAll('main a')].find(a => a.href.endsWith(path));
        const result = await fetch(link.href);
        return [new URL(link.href).pathname, result.ok, (await result.text()).slice(0, 5)];
      }, pdf);
      expect(response).toEqual([prefix + pdf, true, '%PDF-']);
    }
  }
});
