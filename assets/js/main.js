/* ============================================================
   正协导航 main.js —— 交互增强（渐进增强原则）  v4.1
   ------------------------------------------------------------
   页面所有卡片/链接/分类/引擎均为静态 HTML（build.py 生成，SEO 友好）；
   本脚本只做交互，禁用 JS 时页面内容依然完整可读可点。

   功能：
   1. 分类筛选：左 logo=全部（点击重置分类）；分类按钮只显示该分类卡片；
      分类维度与关键词维度、星标维度三维度相互独立（AND 叠加）
   2. 站内搜索：实时筛选，回车/点卡片标签生成筛选标签（×删除）
   3. 清除筛选：只清关键词，不影响分类与本地收藏
   4. 本地收藏：卡片 SVG 星标 toggle（aria-pressed 控制 CSS 填充），存 localStorage；
      顶部方形「本地收藏」按钮（未点击★/点击后显示文字）toggle 只显示已星标卡片
   5. Hero 集合搜索引擎：主引擎按钮(原位) + 下方引擎滑道，单选激活，
      提交跳转当前激活引擎结果页（读 data-url）
   6. 统一滑动行为：所有滑道（分类/筛选/引擎）+ 卡片四类行（标题/描述/标签/链接）
      —— 只在内容真溢出时接管滚轮为左右滑（页面暂停上下滚），触屏触摸同样激活
   ============================================================ */
(function () {
  'use strict';

  var cardsContainer = document.getElementById('cards-container');
  var siteInput = document.getElementById('site-search-input');
  var tagsWrap = document.getElementById('filter-tags');
  var tagsTrack = document.getElementById('filter-tags-track');
  var hint = document.getElementById('filter-tags-hint');
  var clearBtn = document.getElementById('filter-tag-clear');
  var engineForm = document.getElementById('engine-search');
  var engineInput = document.getElementById('engine-input');
  var favToggle = document.getElementById('fav-toggle');
  var resultCount = document.getElementById('result-count');
  var favToggleStar = favToggle ? favToggle.querySelector('.category-nav__fav-star') : null;
  var themeToggle = document.getElementById('theme-toggle');
  var backToTop = document.getElementById('back-to-top');
  var emptyState = document.getElementById('empty-state');
  var randomBtn = document.getElementById('random-site');

  var catBtns = Array.prototype.slice.call(document.querySelectorAll('.category-btn'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));

  /* ── 状态：分类 / 关键词 / 本地收藏 三维度独立 ── */
  var activeCat = 'all';        // 分类维度（logo=全部 / 分类按钮，不生成标签）
  var filterTags = [];          // 关键词维度（搜索框/卡片标签生成，可清除）
  var showFav = false;          // 本地收藏维度（fav-toggle 控制）

  /* ── 本地收藏持久化（localStorage） ──
     同浏览器 + 非无痕 + 未清站点数据 → 下次打开星标仍在；
     不跨设备/浏览器同步；无痕模式关闭即清；清"浏览痕迹"勾选站点数据会一并清掉。 */
  var FAV_KEY = 'zx_favs';
  var favs = {};
  try { favs = JSON.parse(localStorage.getItem(FAV_KEY) || '{}') || {}; } catch (e) { favs = {}; }
  function saveFavs() {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) { /* 隐私模式可能失败，静默 */ }
  }
  /* v4.1：星标为内联 SVG，样式由 CSS 按 aria-pressed 属性切换填充，
     此处只负责切换属性值。 */
  function setFavUI(btn, isFav) {
    btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
  }

  /* 顶部「本地收藏」按钮星标：有收藏（≥1）显示实心 ★，无收藏显示空心 ☆ */
  function updateFavToggleStar() {
    if (!favToggle || !favToggleStar) { return; }
    var count = Object.keys(favs).length;
    favToggleStar.textContent = count > 0 ? '★' : '☆';
    favToggle.setAttribute('aria-label', count > 0 ? '本地收藏（' + count + ' 个）' : '本地收藏');
  }

  /* ── 应用筛选：分类 AND 关键词 AND 本地收藏（含输入框实时关键词） ── */
  function applyFilter() {
    var kw = siteInput.value.trim();
    var visible = 0;
    var activeKeywords = filterTags.slice();
    if (kw && activeKeywords.indexOf(kw) === -1) { activeKeywords.push(kw); }
    cards.forEach(function (card) {
      var catOk = activeCat === 'all' || card.getAttribute('data-cat') === activeCat;
      var text = card.textContent;
      var kwOk = true;
      var i;
      for (i = 0; i < filterTags.length; i++) {
        if (text.indexOf(filterTags[i]) === -1) { kwOk = false; break; }
      }
      if (kwOk && kw && text.indexOf(kw) === -1) { kwOk = false; }
      var favBtn = card.querySelector('.card__fav');
      var favOk = !showFav || !!(favBtn && favs[favBtn.getAttribute('data-key')]);
      var show = catOk && kwOk && favOk;
      card.hidden = !show;
      if (show) {
        visible++;
        highlightCard(card, activeKeywords);
      }
    });
    /* 结果计数：无筛选显示总数，有筛选显示「当前显示 X / N」 */
    if (resultCount) {
      var filtering = activeCat !== 'all' || filterTags.length > 0 || kw || showFav;
      if (filtering) {
        resultCount.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 张卡片';
      } else {
        resultCount.textContent = '共 ' + cards.length + ' 张卡片';
      }
      resultCount.classList.toggle('is-empty', filtering && visible === 0);
    }
    /* 空结果状态 */
    if (emptyState) {
      emptyState.hidden = visible > 0;
    }
    /* URL hash 同步 */
    updateHash();
    /* 显隐变化后立即复检溢出标记（卡片从隐藏恢复显示时，
       clientWidth 从 0 恢复正常，必须重新检测，否则滚轮接管失效） */
    refreshScrollable();
  }

  /* ── 渲染筛选标签 chips（插入中间滑道） ── */
  function renderTags() {
    var old = tagsTrack.querySelectorAll('.filter-tag');
    Array.prototype.forEach.call(old, function (el) { el.remove(); });

    filterTags.forEach(function (word) {
      var chip = document.createElement('span');
      chip.className = 'filter-tag';

      var text = document.createElement('span');
      text.className = 'filter-tag__text';
      text.textContent = word;

      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'filter-tag__del';
      del.setAttribute('aria-label', '删除筛选：' + word);
      del.textContent = '×';

      chip.appendChild(text);
      chip.appendChild(del);
      tagsTrack.appendChild(chip);
    });

    hint.hidden = filterTags.length === 0;
    clearBtn.hidden = filterTags.length === 0;
    refreshScrollable();
  }

  function addTag(word) {
    word = (word || '').trim();
    if (!word) { return; }
    if (filterTags.indexOf(word) === -1) {
      filterTags.push(word);
    }
    renderTags();
    applyFilter();
  }

  function clearTags() {
    filterTags = [];
    siteInput.value = '';
    renderTags();
    applyFilter();
  }

  /* ── 1. 分类筛选（logo=全部 / 分类按钮，不生成筛选标签） ── */
  catBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeCat = btn.getAttribute('data-cat');
      catBtns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilter();
    });
  });

  /* ── 2. 站内搜索：实时筛选 + 回车固化标签 ── */
  siteInput.addEventListener('input', applyFilter);
  siteInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (siteInput.value.trim()) { addTag(siteInput.value); } else { applyFilter(); }
    }
  });

  /* 卡片内：星标按钮（内含 SVG，用 closest 命中）+ 文字标签按钮点击（事件委托） */
  cardsContainer.addEventListener('click', function (e) {
    var favBtn = e.target.closest ? e.target.closest('.card__fav') : null;
    /* 星标按钮：toggle 本地收藏，不影响其他行为 */
    if (favBtn) {
      e.preventDefault();
      e.stopPropagation();
      var key = favBtn.getAttribute('data-key');
      var isFav = !!favs[key];
      if (isFav) { delete favs[key]; } else { favs[key] = true; }
      setFavUI(favBtn, !isFav);
      saveFavs();
      updateFavToggleStar();
      applyFilter();
      return;
    }
    var t = e.target;
    /* 文字标签按钮点击 = 站内搜索（生成筛选标签） */
    if (t.classList && t.classList.contains('card__tag')) {
      e.preventDefault();
      addTag(t.getAttribute('data-tag'));
    }
  });

  /* ── 3. 筛选标签区：单个删除 / 清除筛选（不影响分类与收藏） ── */
  tagsWrap.addEventListener('click', function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains('filter-tag__del')) {
      var chip = t.closest('.filter-tag');
      if (chip) {
        var word = chip.querySelector('.filter-tag__text').textContent;
        var idx = filterTags.indexOf(word);
        if (idx !== -1) { filterTags.splice(idx, 1); }
        chip.remove();
        renderTags();
        applyFilter();
      }
    } else if (t.id === 'filter-tag-clear') {
      clearTags();
    }
  });

  /* ── 4. 本地收藏开关（第三维度） ── */
  favToggle.addEventListener('click', function () {
    showFav = !showFav;
    favToggle.classList.toggle('active', showFav);
    favToggle.setAttribute('aria-pressed', showFav ? 'true' : 'false');
    applyFilter();
  });

  /* ── 5. Hero 集合搜索引擎（主引擎按钮 + 下方滑道，单选激活） ── */
  var engineBtns = Array.prototype.slice.call(document.querySelectorAll('[data-engine]'));
  var currentEngineUrl = '';
  function setActiveEngine(btn) {
    engineBtns.forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    currentEngineUrl = btn.getAttribute('data-url') || '';
  }
  var initEngine = document.querySelector('[data-engine].active') || engineBtns[0];
  if (initEngine) { currentEngineUrl = initEngine.getAttribute('data-url') || ''; }
  engineBtns.forEach(function (b) {
    b.addEventListener('click', function () { setActiveEngine(b); });
  });
  // directory 频道页无集合搜索框（已替换为专题介绍块），此处需空值保护
  if (engineForm && engineInput) {
    engineForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var kw = engineInput.value.trim();
      if (!kw || !currentEngineUrl) { return; }
      window.open(currentEngineUrl + encodeURIComponent(kw), '_blank', 'noopener');
    });
  }

  /* ── 6. 统一滑动行为（所有滑道 + 卡片四类行） ──
     - 内容确实超出（scrollWidth > clientWidth）时标记 is-scrollable；
     - 鼠标悬停在该滑道/行 → UI 变化（金色高亮提示），滚轮上下滑动被接管为
       左右滑动该行内容，页面不再上下滚动；
     - 触屏设备 → 触摸该滑道/行时激活同样的 UI 变化，手指左右滑动滚动（原生）。 */
  var SCROLL_ROW_SEL = '.track, .card__title, .card__desc, .card__tags, .card__links';
  var scrollRows = Array.prototype.slice.call(document.querySelectorAll(SCROLL_ROW_SEL));

  function refreshScrollable() {
    scrollRows.forEach(function (el) {
      /* 隐藏卡片（被筛选掉）的行宽为 0：既不检测也不清除标记，
         防止卡片重新显示后标记丢失导致滚轮左右滑失效 */
      if (el.clientWidth === 0) { return; }
      el.classList.toggle('is-scrollable', el.scrollWidth > el.clientWidth + 1);
    });
  }
  refreshScrollable();
  window.addEventListener('load', refreshScrollable);   // 字体/布局稳定后复检
  window.addEventListener('resize', refreshScrollable);

  /* 触屏：触摸时激活 UI，结束后移除 */
  scrollRows.forEach(function (el) {
    el.addEventListener('touchstart', function () {
      if (el.classList.contains('is-scrollable')) { el.classList.add('is-touch-active'); }
    }, { passive: true });
    el.addEventListener('touchend', function () { el.classList.remove('is-touch-active'); });
    el.addEventListener('touchcancel', function () { el.classList.remove('is-touch-active'); });
  });

  /* 鼠标：悬停在内容真溢出的滑道/行上时，滚轮改为左右滑动（阻止页面上下滚动） */
  document.addEventListener('wheel', function (e) {
    var el = e.target.closest ? e.target.closest(SCROLL_ROW_SEL) : null;
    if (el && el.classList.contains('is-scrollable')) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  /* ── 7. 暗色模式切换（localStorage 持久化） ── */
  if (themeToggle) {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'dark';
      var next = current ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('zx_theme', next); } catch (e) {}
      themeToggle.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    });
  }

  /* ── 8. 键盘快捷键 ── */
  /* / → 聚焦站内搜索；Esc → 清除搜索框并失焦 */
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== siteInput && document.activeElement !== engineInput) {
      var tag = (document.activeElement.tagName || '').toLowerCase();
      if (tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        siteInput.focus();
        siteInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    if (e.key === 'Escape' && document.activeElement === siteInput) {
      siteInput.value = '';
      siteInput.blur();
      applyFilter();
    }
  });

  /* ── 9. 滚动按钮：4 个独立按钮，按滚动位置只显示 1 个 ──
     编号 1 向上 ⬆  → 点击 → scrollTo(alignTarget)
     编号 2 到顶 ⏫ → 点击 → scrollTo(0)
     编号 3 向下 ⬇  → 点击 → scrollTo(alignTarget)
     编号 4 到底 ⏬ → 点击 → scrollTo(bottomY)
     滚动时根据当前 y vs alignTarget 决定显示哪个按钮：
       y ≈ bottomY → 向上（编号 1）
       y ≈ 0 → 到顶（编号 2）
       y < alignTarget → 向下（编号 3）
       y > alignTarget → 向上（编号 1） */
  var scrollBtns = document.getElementById('scroll-btns');
  if (scrollBtns) {
    var catBar = document.getElementById('category-bar');
    var stickyTop = document.querySelector('.sticky-top');   // 分类容器所在的 sticky 整体块
    var EPS = 0.5;
    var bottomYAbs = function () {
      return document.documentElement.scrollHeight - window.innerHeight;
    };
    /* 第一个可见卡片（filter hidden 后的 cards[0]）。
       若全部被筛选隐藏则返回 null，规则退化为只用 lastDir。 */
    var firstCard = function () {
      for (var i = 0; i < cards.length; i++) {
        if (!cards[i].hidden) return cards[i];
      }
      return null;
    };
    /* alignTarget：让第一张卡片顶端对齐分类容器（sticky 整体块）底部。
       即 y = firstCard.offsetTop - stickyTop.offsetHeight
       （sticky 容器 offsetTop + offsetHeight = 它的文档绝对底部位置，
         用户从下方滚回来时，y 滚到 firstCard.offsetTop - stickyTop.offsetHeight，
         此时 firstCard.top 刚好等于 stickyTop 视觉高度，第一张卡片顶端贴着分类容器底） */
    var alignTarget = function () {
      var fc = firstCard();
      if (!fc || !stickyTop) return 0;
      return Math.max(0, fc.offsetTop - stickyTop.offsetHeight);
    };
    var btns = scrollBtns.querySelectorAll('.scroll-btn');
    /* 点击循环顺序：3(向下) → 4(到底) → 1(向上) → 2(到顶) → 3 */
    var clickCycleNext = function (cur) {
      var order = ['down', 'bottom', 'up', 'top'];
      var idx = order.indexOf(cur);
      return order[(idx + 1) % order.length];
    };
    var showTarget = function (target) {
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].getAttribute('data-target') === target) {
          btns[i].classList.add('is-active');
        } else {
          btns[i].classList.remove('is-active');
        }
      }
    };

    /* 滚动自动判定显示哪个按钮 */
    var lastDir = 'down';
    var lastY = window.scrollY;
    var clickLock = false;        // 点击触发的滚动期间锁住用户输入与 syncScroll
    var pendingTarget = null;     // 滚动结束后应显示的目标（点击循环 next）
    var pendingUnlock = null;     // 滚动结束后解除锁定的函数

    var lockUserInput = function () {
      /* 阻止用户滚动输入；返回 unlock 函数用于解除监听。
         注：每次调用都生成新 handler 引用，但 unlock 时只移除这一组。
         连续点击时若前一次 unlock 尚未触发，新调用会覆盖 pendingUnlock，
         导致旧 handler 残留。修复：每次 lock 前先调用旧 unlock 清场。 */
      var wheelHandler = function (e) { e.preventDefault(); };
      var touchHandler = function (e) { e.preventDefault(); };
      var keyHandler = function (e) {
        var keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'];
        if (keys.indexOf(e.key) !== -1) e.preventDefault();
      };
      window.addEventListener('wheel', wheelHandler, { passive: false });
      window.addEventListener('touchmove', touchHandler, { passive: false });
      window.addEventListener('keydown', keyHandler, { passive: false });
      return function unlock() {
        window.removeEventListener('wheel', wheelHandler);
        window.removeEventListener('touchmove', touchHandler);
        window.removeEventListener('keydown', keyHandler);
      };
    };
    /* 在新一次 lock 前，强制清理旧的锁（避免残留 handler 永久锁定）。 */
    var forceUnlock = function () {
      if (pendingUnlock) { pendingUnlock(); pendingUnlock = null; }
      clickLock = false;
      pendingTarget = null;
      if (scrollEndTimer) { clearTimeout(scrollEndTimer); scrollEndTimer = null; }
    };

    var syncScroll = function () {
      if (clickLock) {
        // 锁定期间：不重算 lastDir（保留用户预期方向）
        var y = window.scrollY;
        lastY = y;   // 只更新 lastY，不更新 lastDir
        return;
      }
      var y = window.scrollY;
      lastDir = (y > lastY) ? 'down' : (y < lastY ? 'up' : lastDir);
      lastY = y;
      var botY = bottomYAbs();
      if (Math.abs(y - botY) <= EPS) { showTarget('up'); return; }   // 贴底 → 向上
      if (y <= EPS) { showTarget('down'); return; }                  // 贴顶 → 向下（编号3）
      var fc = firstCard();
      if (!fc || !stickyTop) {
        showTarget(lastDir === 'up' ? 'up' : 'down');
        return;
      }
      var fcTop = fc.getBoundingClientRect().top;
      var stickyBot = stickyTop.getBoundingClientRect().bottom;
      var atAlign = Math.abs(fcTop - stickyBot) <= EPS;   // 第一张卡片顶端正好对齐 sticky 底
      if (fcTop > stickyBot) {
        // y < alignTarget（卡片还在 sticky 下方，未对齐）
        if (lastDir === 'up') showTarget('top');   // 上滑 → 到顶
        else showTarget('down');                   // 下滑 → 向下
      } else if (atAlign) {
        // y ≈ alignTarget（卡片顶端正好贴着 sticky 底）
        if (lastDir === 'down') showTarget('bottom');   // 下滑 → 到底
        else showTarget('up');                           // 上滑 → 向上
      } else {
        // y > alignTarget（卡片已被 sticky 遮盖）
        if (lastDir === 'down') showTarget('bottom');   // 下滑 → 到底
        else showTarget('up');                           // 上滑 → 向上
      }
    };

    /* 滚动结束检测：连续 100ms y 不变视为滚动结束 */
    var scrollEndTimer = null;
    var onScrollEnd = function () {
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(function () {
        clickLock = false;
        // 解除用户输入锁定
        if (pendingUnlock) { pendingUnlock(); pendingUnlock = null; }
        // 滚动结束：直接显示点击循环稳态（pendingTarget），不再让 syncScroll 重算
        if (pendingTarget) {
          showTarget(pendingTarget);
          pendingTarget = null;
        } else {
          syncScroll();
        }
      }, 100);
    };

    window.addEventListener('scroll', function () {
      onScrollEnd();
    }, { passive: true });
    syncScroll();

    /* 点击按钮：根据 data-target 滚到对应目标，不切其他按钮。
       滚动后 syncScroll 会按新位置重新判定显示。 */
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', (function (btn) {
        return function () {
          /* 点击循环切图标 + 滚动到当前按钮的目标。
             点 1(向上) → 滚到 alignTarget + 显示 2(到顶)
             点 2(到顶) → 滚到 0           + 显示 3(向下)
             点 3(向下) → 滚到 alignTarget + 显示 4(到底)
             点 4(到底) → 滚到 bottomY     + 显示 1(向上)
             连续点击时先 forceUnlock 清掉上一轮的锁，避免 handler 残留。 */
          var cur = btn.getAttribute('data-target');
          var next = clickCycleNext(cur);
          forceUnlock();   // 清掉上一轮残留的锁 + 计时器
          clickLock = true;
          pendingTarget = next;
          if (cur === 'up' || cur === 'down') {
            lastDir = (cur === 'up') ? 'up' : 'down';
            lastY = window.scrollY;
          }
          pendingUnlock = lockUserInput();
          if (cur === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
          else if (cur === 'bottom') window.scrollTo({ top: bottomYAbs(), behavior: 'smooth' });
          else window.scrollTo({ top: alignTarget(), behavior: 'smooth' });
          showTarget(next);
        };
      })(btns[i]));
    }
  }

  /* ── 10. URL hash 同步筛选状态 ── */
  /* 支持 #cat=AI智能 或 #cat=AI智能&q=百度 或 #cat=AI智能&q=百度,谷歌 格式，方便分享筛选后的视图。
     多个关键词用「明文逗号」拼接（不做 encodeURIComponent 转换，否则逗号变成 %2C，
     在复制/新标签打开时行为异常）。 */
  var skipPush = false;   // 还原 hash 期间置 true：用 replaceState 而非 pushState，避免污染历史栈
  function syncFromHash() {
    var hash = window.location.hash.slice(1);
    if (!hash) { return; }
    var params = {};
    hash.split('&').forEach(function (pair) {
      var kv = pair.split('=');
      /* 值保持原始（仅键解码）：逗号分隔的多标签在下方按 ',' 切分后各自 decode */
      if (kv[0] && kv[1] !== undefined) { params[decodeURIComponent(kv[0])] = kv[1]; }
    });
    skipPush = true;
    if (params.cat) {
      var btn = document.querySelector('.category-btn[data-cat="' + CSS.escape(decodeURIComponent(params.cat)) + '"]');
      if (btn) { btn.click(); }
    }
    if (params.q) {
      /* 多个关键词以逗号拼接，逐个还原为筛选标签（修复此前整体作为一个标签的 bug） */
      params.q.split(',').forEach(function (t) {
        t = t.trim();
        if (t) { addTag(decodeURIComponent(t)); }
      });
    }
    skipPush = false;
  }
  var hashTimer = null;
  function updateHash() {
    var parts = [];
    if (activeCat !== 'all') { parts.push('cat=' + encodeURIComponent(activeCat)); }
    if (filterTags.length > 0) { parts.push('q=' + filterTags.map(encodeURIComponent).join(',')); }
    var hash = parts.length ? '#' + parts.join('&') : '';
    if (window.location.hash === hash) { return; }
    if (skipPush) {
      /* 还原 hash 期间：立即 replaceState，不打断浏览器前进/后退历史 */
      history.replaceState(null, '', hash || window.location.pathname);
      return;
    }
    /* 防抖：连续输入/切换只写入一次历史记录，
       浏览器前进/后退即可在筛选状态之间切换（hashchange 触发 syncFromHash 还原） */
    if (hashTimer) { clearTimeout(hashTimer); }
    hashTimer = setTimeout(function () {
      if (window.location.hash !== hash) {
        history.pushState(null, '', hash || window.location.pathname);
      }
    }, 300);
  }
  window.addEventListener('hashchange', syncFromHash);

  /* ── 11. 搜索高亮 ── */
  function highlightCard(card, keywords) {
    var targets = card.querySelectorAll('.card__title, .card__desc');
    targets.forEach(function (el) {
      var orig = el.getAttribute('data-orig');
      if (!orig) {
        orig = el.textContent;
        el.setAttribute('data-orig', orig);
      }
      if (!keywords.length) { el.textContent = orig; return; }
      var html = orig;
      keywords.forEach(function (kw) {
        if (!kw) { return; }
        var re = new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        html = html.replace(re, '<mark>$1</mark>');
      });
      el.innerHTML = html;
    });
  }

  /* ── 12. 随机漫步：随机打开一张卡片 ── */
  if (randomBtn) {
    randomBtn.addEventListener('click', function () {
      var visibleCards = cards.filter(function (c) { return !c.hidden; });
      if (!visibleCards.length) { return; }
      var pick = visibleCards[Math.floor(Math.random() * visibleCards.length)];
      var link = pick.querySelector('.card__link');
      if (link) { window.open(link.href, '_blank', 'noopener'); }
    });
  }

  /* ── 初始化 ── */
  /* 还原各卡片星标态（localStorage） */
  var cardFavBtns = Array.prototype.slice.call(document.querySelectorAll('.card__fav'));
  cardFavBtns.forEach(function (btn) {
    setFavUI(btn, !!favs[btn.getAttribute('data-key')]);
  });
  updateFavToggleStar();
  renderTags();
  applyFilter();
  syncFromHash();
})();
