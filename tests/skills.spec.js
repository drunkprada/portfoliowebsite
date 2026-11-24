import {test, expect} from '@playwright/test';
import {skillGroups} from '../src/data.js';

test.beforeEach(async ({page}) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
});

for (const width of [320,1440]) {
  test(`skills remain complete and contained at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/#home');
    await expect(page.locator('.journey-scroll')).toHaveCount(0);
    for (const group of skillGroups) {
      const list = page.getByRole('list', {name: group.label, exact: true});
      await list.scrollIntoViewIfNeeded();
      await expect(list.getByRole('listitem')).toHaveText(group.items);
      expect(await list.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.skill-bubble')).toHaveCount(skillGroups.reduce((count,group)=>count+group.items.length,0));
  });
}

test('glass navigation retains blur and readable controls in both themes', async ({page}) => {
  await page.goto('/#home');
  for (const dark of [false,true]) {
    if(dark)await page.getByRole('button',{name:'Switch to dark theme'}).click();
    await expect(page.locator('.nav')).toHaveCSS('backdrop-filter','saturate(1.8) blur(22px)');
    const alpha=await page.locator('.nav').evaluate(nav=>{
      const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');
      ctx.fillStyle=getComputedStyle(nav).backgroundColor;ctx.fillRect(0,0,1,1);
      return ctx.getImageData(0,0,1,1).data[3]/255;
    });
    expect(alpha).toBeGreaterThan(.5);expect(alpha).toBeLessThan(.8);
    await expect(page.getByRole('navigation',{name:'Main'}).getByRole('link',{name:'Home',exact:true})).toBeVisible();
  }
});
