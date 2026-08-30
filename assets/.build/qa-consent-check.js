// 声明条（#consent-bar）回归闸门 —— 与 qa-scroll-check.js 并列
// 用法：
//   1) 起本地服务：python -m http.server 8899 --bind 127.0.0.1（项目根目录）
//   2) NODE_PATH=<装了 playwright-core 的 node_modules> node assets/.build/qa-consent-check.js
//   可选：QA_CHANNEL=chrome 切到 Chrome 通道（默认 msedge，调本机真实 Edge）
// 覆盖：新/旧 CSS（模拟 8/30 补丁前：剔除 [hidden] / :has() / .has-notice 三条规则）
//       × 桌面 1280 / 窄屏 390 × 顶部 / 滚动后 × 首页 / 政务页 / 搜索页
// 断言：关闭按钮 5 点全命中、点击后不可见、刷新后不再显示、滚动按钮 bottom 正确复位、无 pageerror
const fs = require('fs');
const { chromium } = require('playwright-core');
const BASE = 'http://127.0.0.1:8899';
const CSS_PATH = require('path').join(__dirname, '..', 'css', 'style.css');
const FRESH = fs.readFileSync(CSS_PATH, 'utf8');

// 模拟 8/30 补丁之前的 CSS：剔除 [hidden] 规则、:has 规则、has-notice 规则
const OLD = FRESH
  .replace(/\.official-banner\[hidden\]\s*\{\s*display:\s*none;\s*\}/g, '')
  .replace(/body:has\(\.official-banner:not\(\[hidden\]\)\)\s*\.scroll-btns\s*\{\s*bottom:\s*\d+px;\s*\}/g, '')
  .replace(/body\.has-notice\s*\.scroll-btns\s*\{\s*bottom:\s*\d+px;\s*\}/g, '');

async function check(browser, label, opts) {
  const ctx = await browser.newContext({ viewport: opts.vp });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.split('\n')[0]));
  if (opts.oldCss) {
    await page.route('**/assets/css/style.css*', r => r.fulfill({ status: 200, contentType: 'text/css; charset=utf-8', body: OLD }));
  }
  await page.goto(BASE + opts.url, { waitUntil: 'load' });
  if (opts.scroll) { await page.evaluate(y => window.scrollTo(0, y), opts.scroll); }
  await page.waitForTimeout(800);

  const before = await page.evaluate(() => {
    const bar = document.getElementById('consent-bar'), btn = document.getElementById('consent-close');
    const br = btn.getBoundingClientRect();
    const pts = { '中心': [0.5, 0.5], '上缘': [0.5, 0.15], '左上角': [0.15, 0.15], '右上角': [0.85, 0.15], '左下角': [0.15, 0.85] };
    const hits = {};
    Object.keys(pts).forEach(k => {
      const [fx, fy] = pts[k];
      const el = document.elementFromPoint(br.left + br.width * fx, br.top + br.height * fy);
      hits[k] = el ? (el.id || (el.tagName + '.' + (el.className || ''))) : 'null';
    });
    const sb = document.getElementById('scroll-btns');
    return {
      visible: bar.getBoundingClientRect().height > 0,
      hits: hits,
      bodyClass: document.body.className.indexOf('has-notice') >= 0,
      sbBottom: sb ? (sb.style.bottom || getComputedStyle(sb).bottom) : null,
    };
  });

  await page.click('#consent-close', { timeout: 3000 }).catch(e => errs.push('CLICK: ' + e.message.split('\n')[0]));
  await page.waitForTimeout(300);

  const after = await page.evaluate(() => {
    const bar = document.getElementById('consent-bar'), sb = document.getElementById('scroll-btns');
    let ls = null; try { ls = String(localStorage.getItem('zx_notice_closed')); } catch (e) { ls = 'THROW'; }
    return {
      visible: bar.getBoundingClientRect().height > 0,
      display: getComputedStyle(bar).display,
      bodyClass: document.body.className.indexOf('has-notice') >= 0,
      sbBottom: sb ? (sb.style.bottom || getComputedStyle(sb).bottom) : null,
      ls: ls,
    };
  });

  // 二次加载：localStorage 已置位 → 应不再显示
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(600);
  const revisit = await page.evaluate(() => {
    const bar = document.getElementById('consent-bar'), sb = document.getElementById('scroll-btns');
    return { visible: bar.getBoundingClientRect().height > 0, bodyClass: document.body.className.indexOf('has-notice') >= 0, sbBottom: sb ? (sb.style.bottom || getComputedStyle(sb).bottom) : null };
  });

  const blocked = Object.keys(before.hits).filter(k => before.hits[k] !== 'consent-close');
  console.log('── ' + label);
  console.log('   点击前: 可见=' + before.visible + ' body类=' + before.bodyClass + ' 滚动按钮bottom=' + before.sbBottom
    + ' 被拦截点=' + (blocked.length ? blocked.join('/') : '无'));
  console.log('   点击后: 可见=' + after.visible + ' display=' + after.display + ' body类=' + after.bodyClass + ' 滚动按钮bottom=' + after.sbBottom + ' ls=' + after.ls.slice(0, 3) + '...');
  console.log('   再访问: 可见=' + revisit.visible + ' body类=' + revisit.bodyClass + ' 滚动按钮bottom=' + revisit.sbBottom);
  const ok = !after.visible && !revisit.visible && blocked.length === 0 && !errs.length;
  console.log('   >>> ' + (ok ? '[PASS]' : '[FAIL]') + (errs.length ? ' 错误:' + errs.join('|') : ''));
  await ctx.close();
  return ok;
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.QA_CHANNEL || 'msedge', headless: true });
  const cases = [
    { label: '1 首页 桌面 顶部（新CSS）', vp: { width: 1280, height: 800 }, scroll: 0, url: '/index.html' },
    { label: '2 首页 桌面 滚动后（新CSS）', vp: { width: 1280, height: 800 }, scroll: 1500, url: '/index.html' },
    { label: '3 首页 窄屏390 滚动后（新CSS）', vp: { width: 390, height: 844 }, scroll: 1500, url: '/index.html' },
    { label: '4 首页 桌面 滚动后（旧CSS模拟）', vp: { width: 1280, height: 800 }, scroll: 1500, url: '/index.html', oldCss: true },
    { label: '5 首页 窄屏390 滚动后（旧CSS模拟）', vp: { width: 390, height: 844 }, scroll: 1500, url: '/index.html', oldCss: true },
    { label: '6 政务页 桌面 滚动后（旧CSS模拟）', vp: { width: 1280, height: 800 }, scroll: 1200, url: '/topics/gov/index.html', oldCss: true },
    { label: '7 搜索页 窄屏390 滚动后（旧CSS模拟）', vp: { width: 390, height: 844 }, scroll: 1200, url: '/topics/search/index.html', oldCss: true },
  ];
  let allOk = true;
  for (const c of cases) { allOk = (await check(browser, c.label, c)) && allOk; }
  await browser.close();
  console.log('\n===== 总体：' + (allOk ? '全部通过' : '存在失败') + ' =====');
})();
