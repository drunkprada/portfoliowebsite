import {test, expect} from '@playwright/test';
import {expectFocusVisible} from './helpers';

test.beforeEach(async ({page}) => {
  await page.setViewportSize({width:844, height:390});
  await page.setContent(`
    <style>
      html {scroll-padding-top:80px}
      body {margin:0}
      .navwrap {position:fixed;inset:0 0 auto;height:64px;z-index:100;background:white}
      a {position:fixed;top:80.5px;left:20px;width:100px;height:400px}
    </style>
    <header class="navwrap">Navigation</header>
    <a href="#paper">Paper preview</a>
  `);
  await page.locator('a').focus();
});

test('tall previews fill the padded viewport despite fractional coordinates', async ({page}) => {
  await expectFocusVisible(page);
});

test('focus partly hidden beneath the header is rejected', async ({page}) => {
  await page.addStyleTag({content:'a {top:50px;height:30px}'});
  await expect(expectFocusVisible(page)).rejects.toThrow('focused content control');
});

test('a control covered by another layer is rejected', async ({page}) => {
  await page.addStyleTag({content:'body::after {content:"";position:fixed;inset:64px 0 0;z-index:200;background:white}'});
  await expect(expectFocusVisible(page)).rejects.toThrow('focused content control');
});
