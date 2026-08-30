#!/usr/bin/env node
/**
 * qa-scroll-check.js — 返回顶部 4 按钮回归测试（每次改动 main.js 后必跑）
 *
 * 背景：main.js 是单点脆弱——一个运行时错误 = 整个脚本死 = 滚动按钮/筛选/收藏全废。
 * 造物主 2026-08-30 指出「每次改动都废掉返回顶部 4 个按钮」→ 固化此闸门。
 *
 * 覆盖：
 *   场景 A 现代浏览器：scrollTo({behavior:'smooth'}) 正常 → 4 按钮各点一次
 *   场景 B 老内核（小米 X5/老 Chromium）：scrollTo(options) 抛 TypeError → 降级 scrollTo(0,y)
 *   断言：无运行时错误 / scrollTo 被调用 4 次 / is-active 切换 ≥ 8 次 / 无锁死
 *
 * 用法：node assets/.build/qa-scroll-check.js   （退出码 0=通过，1=失败）
 */
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(BASE, 'index.html'), 'utf-8');
const mainjs = fs.readFileSync(path.join(BASE, 'assets', 'js', 'main.js'), 'utf-8');

// 解析真实 index.html 卡片
const cardInfos = [];
const cardRe = /<article class="([^"]+)"[^>]*data-cat="([^"]*)"[^>]*>([\s\S]*?)<\/article>/g;
let m;
while ((m = cardRe.exec(html)) !== null) cardInfos.push({ cls: m[1], cat: m[2] });

const styleStub = () => ({ removeProperty: () => {}, setProperty: () => {}, cssText: '', getPropertyValue: () => '' });
const cl = { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} };
const domMixin = { setAttribute: () => {}, removeAttribute: () => {}, addEventListener: () => {}, classList: cl, getAttribute: () => null, style: styleStub(), textContent: '', hidden: false };

const domCards = cardInfos.map((c, i) => {
  const el = Object.assign({}, domMixin, {
    hidden: false, textContent: c.cat + ' 描述',
    classList: { contains: (k) => c.cls.includes(k), add: () => {}, remove: () => {}, toggle: () => {} },
    getAttribute: (k) => k === 'data-cat' ? c.cat : null,
    querySelector: () => Object.assign({}, domMixin, { getAttribute: () => 'k' + i }),
    querySelectorAll: () => [], offsetTop: i * 100, offsetHeight: 120,
    getBoundingClientRect: () => ({ top: i * 100, bottom: i * 100 + 120, height: 120 }),
  });
  el.__search = el.textContent;
  return el;
});

function makeEl() {
  return Object.assign({}, domMixin, {
    querySelectorAll: () => [], querySelector: () => null, value: '', appendChild: () => {},
    parentNode: null, closest: () => null, offsetTop: 0, offsetHeight: 60, scrollWidth: 0,
    clientWidth: 0, dataset: {}, focus: () => {}, blur: () => {}, click: () => {}, scrollLeft: 0,
    getBoundingClientRect: () => ({ top: 0, bottom: 60, height: 60 }),
  });
}

function buildEnv(scrollToImpl) {
  const byId = {};
  ['cards-container', 'site-search-input', 'filter-tags', 'fav-toggle', 'theme-toggle', 'random-site',
   'random-bar', 'random-refresh', 'random-exit', 'consent-bar', 'consent-close', 'scroll-btns',
   'engine-search', 'engine-input', 'empty-state', 'filter-tags-track', 'filter-tags-hint',
   'filter-tag-clear', 'category-bar', 'category-track', 'result-count'].forEach(id => byId[id] = makeEl());
  byId['site-search-input'].value = '';
  const activeLog = [];
  const scrollBtns = ['down', 'bottom', 'up', 'top'].map(t => ({
    style: styleStub(),
    classList: { add: () => activeLog.push('A:' + t), remove: () => activeLog.push('R:' + t), contains: () => false },
    getAttribute: (k) => k === 'data-target' ? t : null,
    addEventListener: () => {},
  }));
  byId['scroll-btns'].querySelectorAll = (sel) => sel === '.scroll-btn' ? scrollBtns : [];
  const clickHandlers = {};
  scrollBtns.forEach(b => { b.addEventListener = (ev, fn) => { if (ev === 'click') clickHandlers[b.getAttribute('data-target')] = fn; }; });
  const fakeDoc = {
    getElementById: (id) => byId[id] || null, querySelector: () => null,
    querySelectorAll: (sel) => sel === '.card' ? domCards : [],
    getElementsByTagName: () => [], addEventListener: () => {}, removeEventListener: () => {},
    documentElement: Object.assign({}, domMixin, { style: styleStub(), scrollHeight: 3000 }),
    createElement: () => makeEl(), body: makeEl(), head: makeEl(), title: '', createTextNode: () => ({}),
  };
  const fakeWin = {
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    addEventListener: () => {}, removeEventListener: () => {}, scrollTo: scrollToImpl,
    scrollY: 500, innerHeight: 800, innerWidth: 1200, scrollX: 0, pageYOffset: 500,
    console: console, navigator: { sendBeacon: () => {}, userAgent: '' },
    document: fakeDoc, matchMedia: () => ({ matches: true }),
    IntersectionObserver: function () { this.observe = () => {}; this.disconnect = () => {}; this.unobserve = () => {}; },
    MutationObserver: function () { this.observe = () => {}; this.disconnect = () => {}; },
    location: { href: 'https://zhengxie.com.cn/index.html', hostname: 'zhengxie.com.cn', hash: '', pathname: '/index.html', search: '' },
    history: { pushState: () => {}, replaceState: () => {} },
    Image: function () {}, Blob: function () {}, setTimeout: () => 0, clearTimeout: () => {}, Date,
    requestAnimationFrame: () => 0, performance: { now: () => 0 },
    getComputedStyle: () => ({ getPropertyValue: () => '' }), _hmt: undefined,
  };
  return { fakeDoc, fakeWin, clickHandlers, activeLog };
}

let failed = false;
let calls = [];   // 模块级：scrollToImpl 闭包引用（run 内重置）
function run(name, scrollToImpl) {
  calls = [];
  const env = buildEnv(scrollToImpl);
  try {
    const fn = new Function('document', 'window', 'getComputedStyle', mainjs + '\n//# sourceURL=main.js');
    fn(env.fakeDoc, env.fakeWin, env.fakeWin.getComputedStyle);
    ['down', 'bottom', 'up', 'top'].forEach(t => { env.clickHandlers[t] && env.clickHandlers[t](); });
    const smooth = calls.filter(c => c[0] === 'smooth').length;
    const twoArg = calls.filter(c => c[0] === 'two-arg').length;
    const ok = calls.length === 4 && env.activeLog.length >= 8;
    console.log((ok ? '  ✅ ' : '  ❌ ') + name + ' | scrollTo 调用 ' + calls.length + ' 次（smooth ' + smooth + ' / 降级 ' + twoArg + '）| is-active 切换 ' + env.activeLog.length + ' 次');
    if (!ok) failed = true;
  } catch (e) {
    console.log('  ❌ ' + name + ' | 运行时错误: ' + e.message);
    failed = true;
  }
}

console.log('=== qa-scroll-check：返回顶部 4 按钮回归 ===');
console.log('卡片数:', domCards.length, '| main.js 行数:', mainjs.split('\n').length);
run('场景A 现代浏览器(smooth支持)', function (a, b) {
  if (typeof a === 'object') { calls.push(['smooth', a.top]); return; }
  calls.push(['two-arg', a, b]);
});
run('场景B 老内核(smooth抛错→降级)', function (a, b) {
  if (typeof a === 'object') { throw new TypeError("'smooth' is not a valid enum value"); }
  calls.push(['two-arg', a, b]);
});
console.log(failed ? '\n❌ 回归失败' : '\n✅ 回归通过（退出码 0）');
process.exit(failed ? 1 : 0);
