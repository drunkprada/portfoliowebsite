import {expect} from '@playwright/test';

export async function expectFocusVisible(page) {
  let diagnostic;
  try {
    await expect.poll(async () => {
      diagnostic = await page.evaluate(() => {
        const focused = document.activeElement;
        const rect = focused.getBoundingClientRect();
        const nav = document.querySelector('.navwrap').getBoundingClientRect();
        const spacing = getComputedStyle(document.documentElement);
        const contentTop = Math.max(nav.bottom + 4, parseFloat(spacing.scrollPaddingTop) || 0);
        const contentBottom = innerHeight - Math.max(4, parseFloat(spacing.scrollPaddingBottom) || 0);
        const top = Math.max(rect.top, contentTop);
        const bottom = Math.min(rect.bottom, contentBottom);
        const available = contentBottom - contentTop;
        // Tall linked previews cannot fit in a landscape phone. Their visible
        // portion must fill the actual content area, allowing subpixel rounding.
        const visible = rect.height > available
          ? bottom - top >= available - 1
          : rect.top >= nav.bottom + 4 && rect.bottom <= innerHeight;
        const hit = document.elementFromPoint(rect.x + rect.width / 2, (top + bottom) / 2);
        return {visible, hittable: focused.contains(hit), control: focused.outerHTML.slice(0, 200),
          top: rect.top, bottom: rect.bottom, navBottom: nav.bottom, contentTop, contentBottom, available};
      });
      return diagnostic;
    }, {message: 'The focused content control must remain visible below the sticky nav'})
      .toMatchObject({visible: true, hittable: true});
  } catch (error) {
    throw new Error(JSON.stringify(diagnostic) + '\n' + error.message);
  }
}
