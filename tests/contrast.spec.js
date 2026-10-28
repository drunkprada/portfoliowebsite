import {test, expect} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
});

for (const theme of ['light', 'dark']) {
  for (const route of ['home', 'research', 'projects', 'experience']) {
    test(`${route} text contrast in ${theme} theme`, async ({page}) => {
      await page.addInitScript(theme => localStorage.setItem('portfolio-theme-v3', theme), theme);
      await page.goto('/#' + route);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('main h1')).toBeVisible();
      for (const button of await page.locator('main button[aria-expanded]').all()) {
        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'true');
      }

      const result = await page.evaluate(() => {
        const rgba = value => {
          // These content areas use solid sRGB colours, not images/gradients.
          if (!/^rgba?\(/.test(value)) throw new Error('Unsupported colour: ' + value);
          const [r, g, b, a = 1] = value.match(/[\d.]+/g).map(Number);
          return [r, g, b, a];
        };
        const over = (front, back) => front.slice(0, 3).map((v, i) => v * front[3] + back[i] * (1 - front[3]));
        const luminance = rgb => {
          const linear = rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
          return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
        };
        const failures = [];
        let checked = 0;
        // Check actual rendered text, including opened details, muted metadata,
        // footer links and pastel skills. The glass nav is covered by navigation
        // tests; its blurred backdrop needs a separate visual contrast audit.
        for (const root of document.querySelectorAll('main, .footer')) {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            const el = node.parentElement;
            if (!node.textContent.trim() || el.closest('[aria-hidden="true"]') || !el.getClientRects().length) continue;
            const style = getComputedStyle(el);
            if (style.visibility !== 'visible') continue;
            const ancestors = [];
            for (let ancestor = el; ancestor; ancestor = ancestor.parentElement) ancestors.unshift(ancestor);
            let background = [255, 255, 255];
            for (const ancestor of ancestors) {
              const layer = getComputedStyle(ancestor);
              if (layer.backgroundImage !== 'none') throw new Error('Image background needs a visual contrast audit');
              background = over(rgba(layer.backgroundColor), background);
            }
            const foreground = over(rgba(style.color), background);
            const a = luminance(foreground), b = luminance(background);
            const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
            const size = parseFloat(style.fontSize);
            const large = size >= 24 || (size >= 18.667 && Number(style.fontWeight) >= 700);
            const minimum = large ? 3 : 4.5;
            checked++;
            if (ratio < minimum) failures.push({
              text: node.textContent.trim().slice(0, 70), colour: style.color,
              ratio: Number(ratio.toFixed(2)), minimum,
            });
          }
        }
        return {checked, failures};
      });
      expect(result.checked).toBeGreaterThan(20);
      expect(result.failures).toEqual([]);
    });
  }
}
