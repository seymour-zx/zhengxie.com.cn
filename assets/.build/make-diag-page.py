#!/usr/bin/env python3
# 生成声明条/滚动按钮诊断副本页（assets/.build/diag-index.html）
# 用法: python assets/.build/make-diag-page.py
# 然后在浏览器打开 http://127.0.0.1:8899/assets/.build/diag-index.html
# 页面会自动扫描底部区域，标出拦截点击/悬停的覆盖元素，并收集 JS/资源错误
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
src = (ROOT / "index.html").read_text(encoding="utf-8")

DIAG = r"""
<div id="diag-overlay" style="position:fixed;top:0;left:0;right:0;max-height:55vh;overflow:auto;background:#fff;color:#111;z-index:2147483647;font:13px/1.55 Consolas,monospace;padding:12px 16px;border-bottom:5px solid #c00;box-shadow:0 2px 12px rgba(0,0,0,.3);">
  <b style="color:#c00;">[诊断副本] 此红块只会出现在 diag-index.html，不会出现在正式页面</b>
  <div id="diag-out">扫描中…（如出现请先等待 1-2 秒）</div>
  <button id="diag-copy" style="margin:8px 0;padding:6px 16px;font-size:14px;cursor:pointer;">复制报告 JSON</button>
  <span style="color:#666;">把复制内容或截图发给 agent 即可定位拦截者</span>
</div>
<script>
(function () {
  var jsErrors = [];
  window.addEventListener('error', function (e) {
    if (e.target && e.target !== window && e.target.tagName) {
      jsErrors.push('资源加载失败: ' + (e.target.src || e.target.href || e.target.tagName));
    } else if (e.message) {
      jsErrors.push(e.message + ' @ ' + (e.filename || '') + ':' + (e.lineno || ''));
    }
  }, true);

  function tagOf(el) {
    if (!el) return 'null';
    var s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.className && typeof el.className === 'string') s += '.' + el.className.split(/\s+/).filter(Boolean).join('.');
    return s;
  }
  function sampleRect(r, nx, ny) {
    var counts = {}, total = 0;
    for (var ix = 1; ix <= nx; ix++) {
      for (var iy = 1; iy <= ny; iy++) {
        var el = document.elementFromPoint(r.left + r.width * ix / (nx + 1), r.top + r.height * iy / (ny + 1));
        if (!el) continue;
        var k = tagOf(el);
        counts[k] = (counts[k] || 0) + 1;
        total++;
      }
    }
    return { counts: counts, total: total };
  }
  function run() {
    var W = innerWidth, H = innerHeight;
    var bar = document.getElementById('consent-bar');
    var btn = document.getElementById('consent-close');
    var sb = document.getElementById('scroll-btns');
    var killers = [];

    /* 1. 声明条矩形内采样：白名单外命中 = 覆盖者 */
    var barScan = null;
    if (bar) {
      barScan = sampleRect(bar.getBoundingClientRect(), 12, 3);
      Object.keys(barScan.counts).forEach(function (k) {
        if (!/consent-bar|consent-close|official-banner/.test(k)) killers.push('声明条区域被 ' + k + ' 覆盖 x' + barScan.counts[k]);
      });
    }
    /* 2. 关闭按钮矩形内采样 */
    var btnScan = null;
    if (btn) {
      btnScan = sampleRect(btn.getBoundingClientRect(), 3, 3);
      Object.keys(btnScan.counts).forEach(function (k) {
        if (!/consent-close/.test(k)) killers.push('关闭按钮被 ' + k + ' 覆盖 x' + btnScan.counts[k]);
      });
    }
    /* 3. 可见滚动按钮矩形内采样 */
    var sbScan = null;
    var activeBtn = sb && sb.querySelector('.scroll-btn.is-active');
    if (activeBtn) {
      sbScan = sampleRect(activeBtn.getBoundingClientRect(), 3, 3);
      Object.keys(sbScan.counts).forEach(function (k) {
        if (!/scroll-btn|scroll-btns|^svg$|^path$/.test(k)) killers.push('滚动按钮被 ' + k + ' 覆盖 x' + sbScan.counts[k]);
      });
    } else {
      killers.push('滚动按钮均不可见（无 is-active）—— main.js 可能未运行，见 JS 错误列表');
    }
    /* 4. 底部 200px 粗扫 + 高 z-index 元素 + iframe 清单 */
    var bottomScan = {};
    for (var x = 25; x < W; x += 50) {
      for (var y = Math.max(0, H - 200); y < H; y += 20) {
        var el = document.elementFromPoint(x, y);
        if (!el) continue;
        var k = tagOf(el);
        bottomScan[k] = (bottomScan[k] || 0) + 1;
      }
    }
    var fixedList = [];
    document.querySelectorAll('*').forEach(function (el) {
      var cs = getComputedStyle(el);
      var z = parseInt(cs.zIndex, 10);
      if ((cs.position === 'fixed' || cs.position === 'sticky' || cs.position === 'absolute') && (z >= 50 || cs.position === 'fixed')) {
        var r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.bottom > H - 260 && r.top < H && el.id !== 'diag-overlay' && !el.closest('#diag-overlay')) {
          fixedList.push({ el: tagOf(el), z: cs.zIndex, pe: cs.pointerEvents, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], opacity: cs.opacity });
        }
      }
    });
    var iframes = [];
    document.querySelectorAll('iframe').forEach(function (f) {
      var r = f.getBoundingClientRect();
      iframes.push({ src: (f.src || '').slice(0, 120), rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], z: getComputedStyle(f).zIndex });
    });

    var report = {
      url: location.href, ua: navigator.userAgent, viewport: [W, H],
      supportsHas: CSS.supports('selector(body:has(div))'),
      jsErrors: jsErrors,
      consentBar: { exists: !!bar, visible: bar ? bar.getBoundingClientRect().height > 0 : false, rect: bar ? (function () { var r = bar.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; })() : null, scan: barScan },
      closeBtnScan: btnScan,
      scrollBtnScan: sbScan,
      bottomScan: bottomScan,
      highZElements: fixedList,
      iframes: iframes,
      killers: killers
    };

    var d = document.getElementById('diag-out');
    var html = '<div>URL: ' + location.href + '</div>'
      + '<div>UA: ' + navigator.userAgent + '</div>'
      + '<div>视口: ' + W + 'x' + H + '　:has() 支持: <b>' + report.supportsHas + '</b></div>';
    if (jsErrors.length) {
      html += '<div style="background:#fff3cd;border:2px solid #c90;padding:8px;margin:8px 0;"><b>⚠ JS/资源错误（' + jsErrors.length + '）：</b><pre>' + jsErrors.join('\n') + '</pre></div>';
    }
    if (killers.length) {
      html += '<div style="background:#ffe3e3;border:2px solid #c00;padding:8px;margin:8px 0;font-size:15px;"><b>⚠ 发现拦截者（点击/悬停被它们吃掉）：</b><br><b style="color:#c00;">' + killers.join('<br>') + '</b></div>';
    } else {
      html += '<div style="background:#e3ffe3;border:2px solid #0a0;padding:8px;margin:8px 0;font-size:15px;"><b>✓ 未发现覆盖层</b>：声明条/关闭按钮/滚动按钮的采样全部命中白名单。若仍点不动，问题在 JS 运行环境（看上方的 JS 错误列表），或在 Edge 设置/扩展阻止了脚本。</div>';
    }
    html += '<details style="margin:6px 0;"><summary>声明条区域采样明细</summary><pre>' + JSON.stringify(barScan, null, 2) + '</pre></details>';
    html += '<details style="margin:6px 0;"><summary>底部 200px 粗扫</summary><pre>' + JSON.stringify(bottomScan, null, 2) + '</pre></details>';
    html += '<details style="margin:6px 0;"><summary>高 z-index / fixed 元素清单（' + fixedList.length + '）</summary><pre>' + JSON.stringify(fixedList, null, 2) + '</pre></details>';
    html += '<details style="margin:6px 0;"><summary>iframe 清单（' + iframes.length + '）</summary><pre>' + JSON.stringify(iframes, null, 2) + '</pre></details>';
    d.innerHTML = html;
    document.getElementById('diag-copy').onclick = function () {
      var b = this;
      try { navigator.clipboard.writeText(JSON.stringify(report, null, 2)); b.textContent = '已复制到剪贴板'; }
      catch (e) { b.textContent = '复制失败，请手动全选'; }
    };
  }
  if (document.readyState === 'complete') setTimeout(run, 800);
  else window.addEventListener('load', function () { setTimeout(run, 1200); });
})();
</script>
"""

# 诊断页位于 assets/.build/ 子目录，所有 assets/ 相对路径需回退两级，否则 CSS/JS 404（页面完全无样式）
out = src.replace('"assets/', '"../../assets/')
out = out.replace("</body>", DIAG + "\n</body>")
if "diag-overlay" in src:
    raise SystemExit("index.html 已含诊断块，拒绝重复注入")
dst = ROOT / "assets" / ".build" / "diag-index.html"
dst.write_text(out, encoding="utf-8")
print("written:", dst)
