import {expect} from '@playwright/test';

export async function expectFocusVisible(page) {
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
