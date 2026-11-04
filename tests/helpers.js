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
    // Header measurements round up to whole pixels; allow that extra pixel
    // when a tall control fills the content area between the two margins.
    const visible = rect.height > available
      ? bottom - top >= available - 5
      : rect.top >= nav.bottom + 4 && rect.bottom <= innerHeight;
    const hit = document.elementFromPoint(rect.x + rect.width / 2, (top + bottom) / 2);
    return {visible, hittable: focused.contains(hit), control: focused.outerHTML.slice(0, 200),
      top: rect.top, bottom: rect.bottom, navBottom: nav.bottom, available};
  }), {message: 'The focused content control must remain visible below the sticky nav'}).toMatchObject({visible: true, hittable: true});
}
