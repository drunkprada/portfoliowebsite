import {test, expect} from '@playwright/test';
import {experienceJourney} from '../src/data.js';

test.beforeEach(async ({page}) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
});

for (const width of [320,1440]) {
  test(`skills follow the winding trail after text reflows at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/#home');
    await expect(page.locator('.skill-bubble')).toHaveCount(experienceJourney.reduce((count,step)=>count+step.skills.length,0));
    await expect(page.locator('.skill-trail__branch')).toHaveCount(experienceJourney.length);
    expect(await page.locator('.intro .skill-bubble').count()).toBe(0);
    expect(await page.evaluate(() => document.querySelector('.skills-section').offsetTop > document.querySelector('.home-resume').offsetTop)).toBe(true);
    const anchors = await page.locator('.skill-journey').evaluate(root => {
      const svg = root.querySelector('svg');
      return [...root.querySelectorAll('.skill-stop')].map((stop,index) => {
        const marker = stop.querySelector('.skill-stop__marker').getBoundingClientRect();
        const body = stop.querySelector('.skill-stop__body').getBoundingClientRect();
        const path = svg.querySelectorAll('.skill-trail__branch')[index];
        const p = path.getPointAtLength(0);
        const screen = new DOMPoint(p.x,p.y).matrixTransform(svg.getScreenCTM());
        return {error:Math.hypot(screen.x - marker.left - marker.width / 2, screen.y - marker.top - marker.height / 2),right:body.left > marker.left};
      });
    });
    anchors.forEach(anchor => expect(anchor.error).toBeLessThan(1));
    expect(anchors.map(anchor=>anchor.right)).toEqual(experienceJourney.map((_,index)=>width===320 || index%2===0));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.setViewportSize({width:width===320?1440:320,height:900});
    await expect.poll(() => page.locator('.skill-trail').evaluate(svg=>Math.abs(svg.viewBox.baseVal.width-svg.parentElement.clientWidth))).toBeLessThan(1);
  });
}

test('the trail draws with scrolling and becomes complete with reduced motion', async ({page}) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/#home');
  const line=page.locator('.skill-trail__progress');
  await expect(line).toHaveCount(1);
  await expect.poll(()=>line.evaluate(path=>parseFloat(getComputedStyle(path).strokeDashoffset))).toBe(1);
  await page.locator('.skill-stop').last().scrollIntoViewIfNeeded();
  await expect.poll(()=>line.evaluate(path=>parseFloat(getComputedStyle(path).strokeDashoffset))).toBeLessThan(.2);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(line).toHaveCSS('stroke-dashoffset','0px');
  await expect(page.locator('.skill-stop__marker.is-learning')).toHaveCSS('animation-name','none');
});

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
