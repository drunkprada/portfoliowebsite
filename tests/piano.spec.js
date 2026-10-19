import {test, expect} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
});

async function installAudio(page, options = {}) {
  await page.addInitScript(options => {
    const state = window.__audio = {contexts: [], voices: [], gains: [], pending: [], failed: false};
    class AudioContext {
      constructor() {
        this.state = 'suspended';
        this.currentTime = 10;
        this.destination = {};
        this.closes = 0;
        state.contexts.push(this);
      }
      resume() {
        if (options.pending) return new Promise(resolve => state.pending.push(resolve));
        if (this.state === 'closed') return Promise.reject(new Error('Context is closed'));
        if (options.fail === 'resume' && !state.failed) {
          state.failed = true;
          return Promise.reject(new Error('Audio device unavailable'));
        }
        this.state = 'running';
        return Promise.resolve();
      }
      close() {
        this.closes++;
        this.state = 'closed';
        if (options.close === 'throw') throw new Error('Close failed');
        if (options.close === 'reject') return Promise.reject(new Error('Close rejected'));
        return Promise.resolve();
      }
      createOscillator() {
        const voice = {frequency: {value: 0}, starts: 0, stops: [], disconnects: 0,
          connect() {}, disconnect() {this.disconnects++},
          start() {
            if (options.fail === 'start' && !state.failed) {
              state.failed = true;
              throw new Error('Cannot start oscillator');
            }
            this.starts++;
          },
          stop(when) {this.stops.push(when)},
        };
        state.voices.push(voice);
        return voice;
      }
      createGain() {
        if (options.fail === 'gain' && !state.failed) {
          state.failed = true;
          throw new Error('Cannot create gain');
        }
        const gain = {disconnects: 0,
          gain: {setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}},
          connect() {}, disconnect() {this.disconnects++},
        };
        state.gains.push(gain);
        return gain;
      }
    }
    window.AudioContext = options.webkit ? undefined : AudioContext;
    window.webkitAudioContext = options.webkit ? AudioContext : undefined;
  }, options);
}

for (const webkit of [false, true]) {
  test(`notes retain their sound settings and release ended nodes (${webkit ? 'webkit' : 'standard'})`, async ({page}) => {
    await installAudio(page, {webkit});
    await page.goto('/#about');
    await expect(page.locator('.piano button')).toHaveCount(8);
    expect(await page.evaluate(() => window.__audio.contexts.length)).toBe(0);
    await page.getByRole('button', {name: 'Play C4', exact: true}).click();
    await page.getByRole('button', {name: 'Play C5', exact: true}).click();
    const result = await page.evaluate(() => ({contexts: window.__audio.contexts.length,
      voices: window.__audio.voices.map(v => ({frequency: v.frequency.value, type: v.type, starts: v.starts, stops: v.stops}))}));
    expect(result).toEqual({contexts: 1, voices: [
      {frequency: 261.63, type: 'triangle', starts: 1, stops: [11]},
      {frequency: 523.26, type: 'triangle', starts: 1, stops: [11]},
    ]});
    await page.evaluate(() => window.__audio.voices.forEach(v => v.onended?.()));
    expect(await page.evaluate(() => window.__audio.voices.map(v => v.disconnects))).toEqual([1, 1]);
    expect(await page.evaluate(() => window.__audio.gains.map(g => g.disconnects))).toEqual([1, 1]);
  });
}

for (const close of ['reject', 'throw']) {
  test(`leaving About stops notes and handles ${close} during context cleanup`, async ({page}) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await installAudio(page, {close});
    await page.goto('/#about');
    await page.getByRole('button', {name: 'Play C4', exact: true}).click();
    await page.getByRole('navigation').getByRole('link', {name: 'Home', exact: true}).click();
    await expect(page.locator('main h1')).toHaveText('Hi, I’m Sahana.');
    expect(await page.evaluate(() => window.__audio.contexts[0].closes)).toBe(1);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => window.__audio.voices[0].disconnects)).toBe(1);
    expect(await page.evaluate(() => window.__audio.voices[0].stops.length)).toBe(2);
    expect(await page.evaluate(() => window.__audio.gains[0].disconnects)).toBe(1);
  });
}

test('a pending resume cannot create notes after leaving About', async ({page}) => {
  await installAudio(page, {pending: true});
  await page.goto('/#about');
  await page.getByRole('button', {name: 'Play C4', exact: true}).click();
  await page.getByRole('navigation').getByRole('link', {name: 'Home', exact: true}).click();
  await expect(page.locator('main h1')).toHaveText('Hi, I’m Sahana.');
  await page.evaluate(() => window.__audio.pending.forEach(resolve => resolve()));
  expect(await page.evaluate(() => window.__audio.voices.length)).toBe(0);
  expect(await page.evaluate(() => window.__audio.contexts[0].closes)).toBe(1);
});

for (const fail of ['resume', 'gain', 'start']) {
  test(`audio can recover after ${fail} fails without leaving nodes connected`, async ({page}) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await installAudio(page, {fail});
    await page.goto('/#about');
    const key = page.getByRole('button', {name: 'Play C4', exact: true});
    await key.click();
    await expect(page.locator('.piano .playing')).toHaveCount(0);
    if (fail !== 'resume') expect(await page.evaluate(() => window.__audio.voices[0].disconnects)).toBe(1);
    await key.click();
    await expect(key).toHaveClass('playing');
    expect(errors).toEqual([]);
  });
}

test('a closed context is replaced on the next explicit note', async ({page}) => {
  await installAudio(page);
  await page.goto('/#about');
  const key = page.getByRole('button', {name: 'Play C4', exact: true});
  await key.click();
  await page.evaluate(() => window.__audio.contexts[0].close());
  await key.click();
  expect(await page.evaluate(() => window.__audio.contexts.length)).toBe(2);
  expect(await page.evaluate(() => window.__audio.voices.length)).toBe(2);
  expect(await page.evaluate(() => window.__audio.voices[0].disconnects)).toBe(1);
  expect(await page.evaluate(() => window.__audio.gains[0].disconnects)).toBe(1);
});

test('unsupported audio leaves the portfolio usable', async ({page}) => {
  await page.addInitScript(() => {window.AudioContext = undefined; window.webkitAudioContext = undefined});
  await page.goto('/#about');
  await page.getByRole('button', {name: 'Play C4', exact: true}).click();
  await expect(page.locator('.piano .playing')).toHaveCount(0);
  await page.getByRole('navigation').getByRole('link', {name: 'Research', exact: true}).click();
  await expect(page.locator('main h1')).toHaveText('Research');
});

test('real browser audio still supports keyboard activation and navigation away', async ({page}) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#about');
  const key = page.getByRole('button', {name: 'Play C4', exact: true});
  await key.focus();
  await page.keyboard.press('Enter');
  await expect(key).toHaveClass('playing');
  await page.getByRole('navigation').getByRole('link', {name: 'Home', exact: true}).click();
  await expect(page.locator('main h1')).toHaveText('Hi, I’m Sahana.');
  expect(errors).toEqual([]);
});
