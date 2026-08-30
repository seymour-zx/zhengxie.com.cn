/* ============================================================
   正协导航 main.js —— 交互增强（渐进增强原则）  v4.1
   ------------------------------------------------------------
   页面所有卡片/链接/分类/引擎均为静态 HTML（build_homeplus.py 生成，SEO 友好）；
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

  /* ── 0. 首次访问声明条（D-18 + 30 天有效期）── 单一真源 + 顶部优先执行：
        原 HTML 内联 NOTICE_SCRIPT 已于 2026-08-31 移除，声明条逻辑仅在本文件维护（避免重复 + 消除内联 CSP 隐患）。
        置于 main.js 大 IIFE 最前：即便后续功能代码抛未捕获错误，本段已先执行，声明条仍会初始化（不被连累）。
        不依赖 :has()；按声明条实测高度内联计算滚动按钮避让，旧 CSS 同样生效。 */
  (function () {
    var bar = document.getElementById('consent-bar');
    var btn = document.getElementById('consent-close');
    if (!bar) return;
    var EXP = 30 * 24 * 60 * 60 * 1000, ts = 0;
    function liftScrollBtns(on) {
      var sb = document.getElementById('scroll-btns');
      if (!sb) return;
      if (!on) { sb.style.bottom = ''; return; }
      var base = window.innerWidth <= 639 ? 16 : 24;
      sb.style.bottom = ((bar.offsetHeight || 0) + base) + 'px';
    }
    function hideBar() {
      bar.hidden = true;
      bar.style.display = 'none';
      try { document.body.classList.remove('has-notice'); } catch (e) {}
      liftScrollBtns(false);
    }
    function closeBar() {
      hideBar();
      try { localStorage.setItem('zx_notice_closed', String(Date.now())); } catch (e) {}
    }
    try { var raw = localStorage.getItem('zx_notice_closed'); if (raw && /^\d{13}$/.test(raw)) ts = parseInt(raw, 10); } catch (e) {}
    if (ts && (Date.now() - ts) <= EXP) { hideBar(); return; }
    if (bar.hidden || bar.style.display === 'none') { hideBar(); return; }
    try { document.body.classList.add('has-notice'); } catch (e) {}
    liftScrollBtns(true);
    window.addEventListener('resize', function () { if (!bar.hidden) { liftScrollBtns(true); } });
    if (btn) btn.addEventListener('click', closeBar);
  })();

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
  var emptyState = document.getElementById('empty-state');
  var randomBtn = document.getElementById('random-site');
  var randomBar = document.getElementById('random-bar');
  var randomRefresh = document.getElementById('random-refresh');
  var randomExit = document.getElementById('random-exit');

  /* 百度统计兜底注入：页面未自带 snippet（window._hmt 不存在）时加载，避免重复 */
  var ZX_BAIDU_TONGJI_ID = '2f4df5057c929092e36a0d6357e35261';  // 百度统计站点 ID（与 build 注入 snippet 同一 ID）
  (function loadBaiduTongji() {
    if (!ZX_BAIDU_TONGJI_ID || window._hmt) { return; }
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://hm.baidu.com/hm.js?' + encodeURIComponent(ZX_BAIDU_TONGJI_ID);
    var first = document.getElementsByTagName('script')[0];
    if (first && first.parentNode) { first.parentNode.insertBefore(s, first); }
    else { (document.head || document.documentElement).appendChild(s); }
  })();

  var catBtns = Array.prototype.slice.call(document.querySelectorAll('.category-btn'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  /* 可整行联动展开的类型1/2/3卡片（类型4 等 2×N 栅格不参与） */
  var expandableCards = cards.filter(function (c) {
    return c.classList.contains('card--t1') || c.classList.contains('card--t2') || c.classList.contains('card--t3');
  });
  /* 取卡片的「可展开类型」（t1/t2/t3），非此类返回 null */
  function getCardExpandType(card) {
    if (!card) { return null; }
    if (card.classList.contains('card--t1')) { return 't1'; }
    if (card.classList.contains('card--t2')) { return 't2'; }
    if (card.classList.contains('card--t3')) { return 't3'; }
    return null;
  }
  /* 名称折叠态默认行数：类型1 = 2 行（与 48px 图标平行）；类型2/3 = 1 行（用户指定）。 */
  function defaultTitleLines(card) {
    return getCardExpandType(card) === 't1' ? 2 : 1;
  }

  /* 性能：预计算每张卡的可搜索文本（标题+描述+分类等纯文本），
     避免 applyFilter 每次按键都 live 读取 128 张卡的 textContent。
     卡片内容静态，init 时算一次即可。 */
  cards.forEach(function (card) { card.__search = card.textContent; });

  /* 防抖：最后一次触发后 wait 毫秒才执行 fn（用于搜索框逐键输入）。
     只延迟"筛选动作"——输入框里的字不会丢，applyFilter 跑时读的是实时 value。 */
  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

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

  /* ── 站内搜索：同义词别名增强（B15） ──
     搜「办理」应命中含「政务服务 / 办事」的卡片；搜「官网」应命中「官方入口」等。
     字典为可扩展示例，正式词表见 D2「用户语言 ↔ 站点语言对照表」。 */
  var ALIASES = {
    '办理': ['政务服务', '办事', '政务服务平台', '网上办理'],
    '官网': ['官方入口', '官方网站', '官方站'],
    '政府': ['政务', '行政', '机关'],
    '办事': ['政务服务', '办理', '政务服务平台'],
    '搜索': ['检索', '查找'],
    '工具': ['软件', '平台', '应用'],
    '学习': ['教育', '课程', '培训'],
    '视频': ['影音', '影视', '播放']
  };
  /* 返回某关键词的完整匹配集合（含自身与互为别名的词），用于站内筛选 */
  function aliasSet(kw) {
    kw = (kw || '').trim().toLowerCase();
    if (!kw) { return []; }
    var set = [kw];
    Object.keys(ALIASES).forEach(function (k) {
      if (k === kw) {
        ALIASES[k].forEach(function (a) {
          a = a.toLowerCase();
          if (set.indexOf(a) === -1) { set.push(a); }
        });
      } else if (ALIASES[k].indexOf(kw) !== -1) {
        /* 反向：搜索词本身是某词的别名（如搜「办事」也命中「办理」卡片） */
        if (set.indexOf(k.toLowerCase()) === -1) { set.push(k.toLowerCase()); }
      }
    });
    return set;
  }
  /* 大小写不敏感 + 别名匹配（B3 + B15），text 已 lowercased */
  function textMatches(text, kw) {
    var set = aliasSet(kw);
    for (var i = 0; i < set.length; i++) {
      if (text.indexOf(set[i]) !== -1) { return true; }
    }
    return false;
  }

  /* ── 应用筛选：分类 AND 关键词 AND 本地收藏（含输入框实时关键词） ── */
  function applyFilter() {
    var kw = siteInput.value.trim();
    var visible = 0;
    var activeKeywords = filterTags.slice();
    if (kw && activeKeywords.indexOf(kw) === -1) { activeKeywords.push(kw); }
    cards.forEach(function (card) {
      var catOk = activeCat === 'all' || card.getAttribute('data-cat') === activeCat;
      var text = card.__search.toLowerCase();   // 预计算文本已为纯文本，直接小写（B3 大小写不敏感）
      var kwOk = true;
      var i;
      for (i = 0; i < filterTags.length; i++) {
        if (!textMatches(text, filterTags[i])) { kwOk = false; break; }
      }
      if (kwOk && kw && !textMatches(text, kw)) { kwOk = false; }
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
    /* 任何筛选状态变更（切换分类/关键词/收藏/标签）后，卡片名称与描述
       复位为默认折叠态，保证视图一致（同一行卡片不再因之前展开而高低不齐）。 */
    resetExpandCollapsed();
    /* 显隐变化 + 复位后复检溢出标记（卡片从隐藏恢复显示时 clientWidth 从 0 恢复，
       且名称/描述收起后宽度可能变化，必须重新检测，否则滚轮接管失效） */
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
  siteInput.addEventListener('input', debounce(applyFilter, 150));
  siteInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (siteInput.value.trim()) { addTag(siteInput.value); } else { applyFilter(); }
    }
  });
  /* 点击/聚焦内部搜索框：卡片名称与描述复位为默认折叠态（即便尚未输入，纯点击也复位，
     与切换分类/筛选保持一致的视图行为） */
  siteInput.addEventListener('focus', resetExpandCollapsed);

  /* ── 类型1/2/3 描述「整行联动」展开（简化版）：
     点同行任意一张 → 全行统一展示「同行内容最多的那张」完整需要的行数；
     再点任意一张 → 收回 1 行。
     行 = 视觉同一行(getBoundingClientRect().top 相同)的同类型(1/2/3)卡片；
     每张卡"完整内容行数"在初始化时一次性预计算(存 card.__fullLines)，点击时只比对数组取最大值。 */
  function getRowCards(card) {
    var type = getCardExpandType(card);
    if (!type) { return []; }
    var top = Math.round(card.getBoundingClientRect().top);
    return cards.filter(function (c) {
      return !c.hidden && getCardExpandType(c) === type &&
             Math.round(c.getBoundingClientRect().top) === top;
    });
  }
  /* 预计算：每张类型1卡片「展示全部需要多少行」，存到 card.__fullLines。
     只在初始化做一次（点击时直接比对，不再临时改 DOM 测量 → 避免 line-clamp 折叠 bug + 省性能）。 */
  function precomputeLines() {
    expandableCards.forEach(function (card) {
      var desc = card.querySelector('.card__desc');
      if (!desc) { card.__fullLines = 1; return; }
      var cs = getComputedStyle(desc);
      var lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.5);
      if (!lh) { card.__fullLines = 1; return; }
      /* 临时进入「完整展示」态测量真实内容行数（仅初始化一次）。
         关键：必须 height:auto 且不设 --lines，否则 CSS 的 .is-expanded{height:calc(var(--lines)*1.5em)}
         会按 --lines 把盒子撑高，scrollHeight 量到的就是那个被撑的高度（旧 bug=999 行的来源）。 */
      var prevWhiteSpace = desc.style.whiteSpace;
      var prevHeight = desc.style.height;
      var wasExpanded = desc.classList.contains('is-expanded');
      desc.style.whiteSpace = 'normal';
      desc.style.height = 'auto';
      var h = desc.scrollHeight;
      desc.style.whiteSpace = prevWhiteSpace || '';
      desc.style.height = prevHeight || '';
      if (!wasExpanded) { desc.classList.remove('is-expanded'); }
      card.__fullLines = Math.max(1, Math.round(h / lh));
    });
  }
  function setRowLines(rowCards, n) {
    rowCards.forEach(function (c) {
      var d = c.querySelector('.card__desc');
      if (d) {
        d.style.setProperty('--lines', String(n));
        d.classList.toggle('is-expanded', n > 1);
        d.setAttribute('aria-expanded', n > 1 ? 'true' : 'false');
      }
      c.setAttribute('data-row-lines', String(n));
    });
  }
  /* 预计算：每张类型1卡片「标题展示全部需要多少行」，存到 card.__fullTitleLines（与描述数组同理）。
     测量时临时解除 line-clamp 限制（white-space:normal + height:auto + -webkit-line-clamp:999）测真实内容高，测完还原。 */
  function precomputeTitleLines() {
    expandableCards.forEach(function (card) {
      var title = card.querySelector('.card__title');
      if (!title) { card.__fullTitleLines = defaultTitleLines(card); return; }
      var cs = getComputedStyle(title);
      var lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.5);
      if (!lh) { card.__fullTitleLines = defaultTitleLines(card); return; }
      var prevWS = title.style.whiteSpace;
      var prevH = title.style.height;
      var prevLC = title.style.getPropertyValue('-webkit-line-clamp');
      title.style.whiteSpace = 'normal';
      title.style.height = 'auto';
      title.style.setProperty('-webkit-line-clamp', '999');
      var h = title.scrollHeight;
      title.style.whiteSpace = prevWS || '';
      title.style.height = prevH || '';
      title.style.setProperty('-webkit-line-clamp', prevLC || '');
      card.__fullTitleLines = Math.max(1, Math.round(h / lh));
    });
  }
  /* 设置同行所有标题的行数（CSS --title-lines 变量驱动；>2 视为展开态，给 aria 与 class） */
  function setRowTitleLines(rowCards, n) {
    rowCards.forEach(function (c) {
      var t = c.querySelector('.card__title');
      if (t) {
        t.style.setProperty('--title-lines', String(n));
        t.classList.toggle('is-expanded', n > 2);
        t.setAttribute('aria-expanded', n > 2 ? 'true' : 'false');
      }
      c.setAttribute('data-title-lines', String(n));
    });
  }
  function toggleDescExpand(card) {
    if (!card || card.hidden) { return; }
    var rowCards = getRowCards(card);
    if (!rowCards.length) { return; }
    /* 同行「内容最多的那张」完整需要多少行 → 全行统一展示该值（直接比对预计算数组，不临时测 DOM） */
    var maxLines = 1;
    rowCards.forEach(function (c) {
      var n = c.__fullLines || 1;
      if (n > maxLines) { maxLines = n; }
    });
    var current = parseInt((rowCards[0] || card).getAttribute('data-row-lines') || '1', 10);
    setRowLines(rowCards, current === maxLines ? 1 : maxLines);
  }
  function toggleTitleExpand(card) {
    if (!card || card.hidden) { return; }
    var rowCards = getRowCards(card);
    if (!rowCards.length) { return; }
    var def = defaultTitleLines(rowCards[0] || card);   /* 类型1=2 行、类型2/3=1 行（折叠默认） */
    /* 同行「标题内容最多的那张」完整需要多少行 → 全行统一展示该值（直接比对预计算数组，不临时测 DOM） */
    var maxLines = def;
    rowCards.forEach(function (c) {
      var n = c.__fullTitleLines || def;
      if (n > maxLines) { maxLines = n; }
    });
    var current = parseInt((rowCards[0] || card).getAttribute('data-title-lines') || String(def), 10);
    setRowTitleLines(rowCards, current === maxLines ? def : maxLines);
  }
  /* 宽度/方向变化 → 所有类型1卡片收回到 1 行（描述行归 1 + 标题也收起展开态），清空旧行数标记 */
  function resetExpandCollapsed() {
    expandableCards.forEach(function (card) {
      var d = card.querySelector('.card__desc');
      if (d) {
        d.style.removeProperty('--lines');
        d.classList.remove('is-expanded');
        d.setAttribute('aria-expanded', 'false');
      }
      card.removeAttribute('data-row-lines');
      var t = card.querySelector('.card__title');
      if (t) {
        t.style.removeProperty('--title-lines');
        t.classList.remove('is-expanded');
        t.setAttribute('aria-expanded', 'false');
      }
      card.removeAttribute('data-title-lines');
    });
  }
  /* 重新初始化：先全部收起 → 再按当前宽度重算「完整行数」数组（行数随容器宽度变化，必须重测） */
  function recomputeExpandLines() {
    resetExpandCollapsed();
    precomputeLines();
    precomputeTitleLines();
  }

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
    /* 类型1/2/3 卡片：名称区→整行联动展名；描述区→整行联动展描述 */
    var targetCard = e.target.closest ? e.target.closest('.card') : null;
    if (targetCard && !targetCard.hidden && getCardExpandType(targetCard)) {
      var onDesc = e.target.closest('.card__desc');
      var onTitle = e.target.closest('.card__title');
      if (onDesc || onTitle) {
        e.preventDefault();
        if (onDesc) { toggleDescExpand(targetCard); }
        else { toggleTitleExpand(targetCard); }
        return;
      }
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
  if (favToggle) {   // B2 判空：目录/子页若无此按钮也不致脚本崩溃
    favToggle.addEventListener('click', function () {
      showFav = !showFav;
      favToggle.classList.toggle('active', showFav);
      favToggle.setAttribute('aria-pressed', showFav ? 'true' : 'false');
      applyFilter();
    });
  }

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
  var SCROLL_ROW_SEL = '.track, .card__title, .card__desc, .card__tags, .card__links, .card__sources';
  var scrollRows = Array.prototype.slice.call(document.querySelectorAll(SCROLL_ROW_SEL));
  /* 类型1 名称/描述改为「点击展开」交互，不再作为横向滚动行：
     排除后不会被标 is-scrollable，避免悬停时滚轮被接管、显示抓取光标。 */
  scrollRows = scrollRows.filter(function (el) {
    var c = el.closest('.card');
    if (!c || !getCardExpandType(c)) { return true; }
    return !(el.classList.contains('card__title') || el.classList.contains('card__desc'));
  });

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

  /* 鼠标：悬停在内容真溢出的滑道/行上时，滚轮改为对应方向滑动（阻止页面上下滚动） */
  document.addEventListener('wheel', function (e) {
    /* 横向滑道：滚轮 → 左右滑 */
    var el = e.target.closest ? e.target.closest(SCROLL_ROW_SEL) : null;
    /* 类型1/2/3 名称区/描述区是点击展开（非滚动行），忽略 → 页面正常上下滚动 */
    if (el) {
      var wcard = el.closest('.card');
      if (wcard && getCardExpandType(wcard) && (el.classList.contains('card__title') || el.classList.contains('card__desc'))) { el = null; }
    }
    if (el && el.classList.contains('is-scrollable')) {
      var max = el.scrollWidth - el.clientWidth;
      if (max <= 1) { return; }   // 无横向溢出 → 页面正常滚动
      /* trackpad 横向手势走 deltaX，普通鼠标竖向滚轮走 deltaY */
      var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      var atStart = el.scrollLeft <= 0;
      var atEnd = el.scrollLeft >= max - 1;
      /* 已到横向边界：竖向滚轮交还页面，否则鼠标悬停该滑道时整页“滑不动”（旧 bug） */
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) { return; }
      e.preventDefault();
      el.scrollLeft += delta;
    }
  }, { passive: false });

  /* 桌面拖拽横向滚动（满足 .track 的 grab/grabbing 光标语义；触屏已由原生 pan-x 承接）。
     单例管理：仅 3 个 document 级监听，避免给每个滑道挂大量监听。
     仅在真溢出(is-scrollable)时启用；拖动超阈值才视为拖拽并抑制本次 click，
     避免误触发分类/标签/链接的点击行为。 */
  (function () {
    var active = null, startX = 0, startLeft = 0, moved = false;
    scrollRows.forEach(function (el) {
      el.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') { return; }   // 触屏用原生 touch 滚动
        if (e.pointerType === 'mouse' && e.button !== 0) { return; }
        if (!el.classList.contains('is-scrollable')) { return; }
        active = el; moved = false; startX = e.clientX; startLeft = el.scrollLeft;
      });
    });
    document.addEventListener('pointermove', function (e) {
      if (!active) { return; }
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) { moved = true; }
      active.scrollLeft = startLeft - dx;
    }, { passive: true });
    document.addEventListener('pointerup', function () {
      if (!active) { return; }
      var el = active; active = null;
      if (moved) {
        /* 拖拽结束抑制本次 click，避免误点分类/标签/链接 */
        var stop = function (ev) { ev.preventDefault(); ev.stopPropagation(); };
        el.addEventListener('click', stop, true);
        setTimeout(function () { el.removeEventListener('click', stop, true); }, 0);
      }
      moved = false;
    }, { passive: true });
    document.addEventListener('pointercancel', function () { active = null; moved = false; }, { passive: true });
  })();

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
      /* 主题切换埋点：验证“暗色偏好人群”留存 / 复访假设（圆桌 #26 / #20 / #22） */
      try {
        if (window.gtag) { window.gtag('event', 'theme_switch', { from_theme: current ? 'dark' : 'light', to_theme: next }); }
        if (window._hmt) { window._hmt.push(['_trackEvent', 'theme', 'switch', next, 1]); }
      } catch (err) {}
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
    /* 兼容滚动（造物主 2026-08-30 三次迭代定案）：
       1. 小米老内核（X5<61）不认 behavior:'smooth' → 抛 TypeError → 降级两参数
       2. CSS scroll-behavior:smooth 会让 window.scrollTo 完全失效（真根因，已从 CSS 移除）
       3. 部分环境 JS smooth 启动被吞（headless/个别浏览器）→ 120ms 未动则降级立即滚动
       原则：任何环境按钮都必须有效果；smooth 只是体验加分，失效即降级。 */
    var safeScrollTo = function (top) {
      var startY = window.scrollY;
      try {
        window.scrollTo({ top: top, behavior: 'smooth' });
        /* smooth 启动检测：120ms 内 scrollY 未变化且目标距当前位置 > 2px → 降级立即滚动
           （覆盖 smooth 被静默吞掉、未抛错的场景，如 CSS smooth 冲突残留/headless 虚拟时间） */
        if (Math.abs(startY - top) > 2) {
          setTimeout(function () {
            if (window.scrollY === startY) { window.scrollTo(0, top); }
          }, 120);
        }
      } catch (e) { window.scrollTo(0, top); }
    };
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

    var syncScroll = function () {
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

    /* 滚动结束检测：连续 100ms y 不变视为滚动结束，重算应显示的按钮 */
    var scrollEndTimer = null;
    var onScrollEnd = function () {
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(syncScroll, 100);
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
             不锁用户输入：滚动交给 safeScrollTo 统一接管（含 smooth→降级），
             失败也无锁可死；按钮位置同步交由 scroll 事件的 syncScroll 自然完成，
             彻底消除旧版“点击后页面最长冻结 8s”的卡死问题。 */
          var cur = btn.getAttribute('data-target');
          var next = clickCycleNext(cur);
          if (cur === 'up' || cur === 'down') {
            lastDir = (cur === 'up') ? 'up' : 'down';
            lastY = window.scrollY;
          }
          try {
            if (cur === 'top') safeScrollTo(0);
            else if (cur === 'bottom') safeScrollTo(bottomYAbs());
            else safeScrollTo(alignTarget());
          } catch (e) { /* 滚动异常不影响后续交互 */ }
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
  /* 文本经 Python html.escape 写入源 HTML，浏览器 textContent 会解码回 < & 等字符；
     高亮重插时必须先转义（仅保留 <mark> 包裹），否则含 < 或 & 的内容会被当作
     HTML 重新解析，导致标签破损甚至注入。 */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* 搜索高亮（B1 修复）：旧实现用连续 replace 把已插入的 <mark> 文本二次匹配，
     搜「k」「mark」等会产生 <mar<mark>k</mark>> 这类破损标签。
     新实现：一次性合并所有关键词为正则，命中处用「非字母占位符（\uE000..\uE001）」包裹，
     最后再统一替换为 <mark>；占位符不含任何字母，绝不会被关键词二次命中。 */
  function highlightCard(card, keywords) {
    var targets = card.querySelectorAll('.card__title, .card__desc');
    targets.forEach(function (el) {
      var orig = el.getAttribute('data-orig');
      if (!orig) {
        orig = el.textContent;
        el.setAttribute('data-orig', orig);
      }
      if (!keywords.length) { el.textContent = orig; return; }
      var escaped = escapeHtml(orig);
      var patterns = [];
      keywords.forEach(function (kw) {
        kw = (kw || '').trim();
        if (!kw) { return; }
        var ek = escapeHtml(kw).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (ek) { patterns.push(ek); }
      });
      if (!patterns.length) { el.textContent = orig; return; }
      var re = new RegExp('(' + patterns.join('|') + ')', 'gi');
      var map = [];
      var out = escaped.replace(re, function (m) {
        var token = '' + map.length + '';
        map.push(m);
        return token;
      });
      out = out.replace(/(\d+)/g, function (_, i) { return '<mark>' + map[+i] + '</mark>'; });
      el.innerHTML = out;
    });
  }

  /* ── 12. 随机漫步：当前筛选池（含广告卡，不分普通/广告）数量加权随机类型 → 随机 2 行（行内同 type）；用户自选，不跳转 ── */
  var RANDOM_LINES = 2;        // 随机卡行数（当前筛选池，含广告卡）
  var inRandom = false;

  function cardType(c) {
    if (c.classList.contains('card--t2')) { return '2'; }
    if (c.classList.contains('card--t3')) { return '3'; }
    return '1';
  }

  function groupByType(pool) {
    var g = { '1': [], '2': [], '3': [] };
    pool.forEach(function (c) { g[cardType(c)].push(c); });
    return g;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* 当前筛选状态下的可见卡（与 applyFilter 同条件；广告卡同池参与，不分普通/广告） */
  function getVisibleCards() {
    var kw = siteInput.value.trim();
    var visible = [];
    cards.forEach(function (card) {
      var catOk = activeCat === 'all' || card.getAttribute('data-cat') === activeCat;
      var text = card.__search.toLowerCase();
      var kwOk = true;
      var i;
      for (i = 0; i < filterTags.length; i++) {
        if (!textMatches(text, filterTags[i])) { kwOk = false; break; }
      }
      if (kwOk && kw && !textMatches(text, kw)) { kwOk = false; }
      var favBtn = card.querySelector('.card__fav');
      var favOk = !showFav || !!(favBtn && favs[favBtn.getAttribute('data-key')]);
      if (catOk && kwOk && favOk) { visible.push(card); }
    });
    return visible;
  }

  /* 一行数量：桌面 4 / 平板 3 / 移动 2（与 CSS grid 列数一致） */
  function getRowSize() {
    try {
      if (window.matchMedia('(min-width: 1024px)').matches) { return 4; }
      if (window.matchMedia('(min-width: 768px)').matches) { return 3; }
    } catch (e) { /* 无 matchMedia 时退回移动端 */ }
    return 2;
  }

  /* 数量加权随机选类型：类型数量越多越可能被选中（不做任何排除——造物主 2026-08-30 拍板，排除会拔高少数类型） */
  function weightedTypePick(candidates, group) {
    var total = 0, i;
    for (i = 0; i < candidates.length; i++) { total += group[candidates[i]].length; }
    if (!total) { return candidates[0]; }
    var r = Math.random() * total;
    for (i = 0; i < candidates.length; i++) {
      r -= group[candidates[i]].length;
      if (r < 0) { return candidates[i]; }
    }
    return candidates[candidates.length - 1];
  }

  /* 随机取 n 行：按数量加权随机一个卡片类型 → 从该类型随机取 n 行（行内同 type；不足取全部 → 1~n*size 张） */
  function pickLines(group, n, size) {
    var allTypes = ['1', '2', '3'].filter(function (t) { return group[t].length > 0; });
    if (!allTypes.length) { return { type: null, cards: [] }; }   // 池空（如筛选无结果）→ 空批
    var t = weightedTypePick(allTypes, group);
    return { type: t, cards: shuffle(group[t]).slice(0, n * size) };
  }

  function enterRandom() {
    var rowSize = getRowSize();
    // 当前筛选池（含广告卡）数量加权随机类型 → 随机 2 行
    var group = groupByType(getVisibleCards());
    var picked = pickLines(group, RANDOM_LINES, rowSize);
    var pick = picked.cards;
    // 显示随机卡，隐藏其余（不调 applyFilter，随机模式锁定）
    cards.forEach(function (c) { c.hidden = true; });
    pick.forEach(function (c) { c.hidden = false; });
    // UI：显示随机条，隐藏分类标签 + 本地收藏按钮（随机模式不筛选收藏）
    if (randomBar) { randomBar.hidden = false; }
    document.querySelectorAll('.category-btn').forEach(function (b) { b.style.display = 'none'; });
    document.querySelectorAll('.category-nav__fav').forEach(function (b) { b.style.display = 'none'; });
    inRandom = true;
    // 结果计数：随机漫步状态（手动更新，不用 applyFilter，防止按分类/搜索覆盖随机选择）
    if (resultCount) { resultCount.textContent = '随机漫步：' + pick.length + ' 张卡片'; }
  }

  function exitRandom() {
    cards.forEach(function (c) { c.hidden = false; });
    if (randomBar) { randomBar.hidden = true; }
    document.querySelectorAll('.category-btn').forEach(function (b) { b.style.display = ''; });
    document.querySelectorAll('.category-nav__fav').forEach(function (b) { b.style.display = ''; });
    inRandom = false;
    applyFilter();
  }

  if (randomBtn) {
    randomBtn.addEventListener('click', function () { enterRandom(); });
  }
  if (randomRefresh) {
    randomRefresh.addEventListener('click', function () { enterRandom(); });
  }
  if (randomExit) {
    randomExit.addEventListener('click', function () { exitRandom(); });
  }

  /* ── 初始化 ── */
  /* 还原各卡片星标态（localStorage） */
  var cardFavBtns = Array.prototype.slice.call(document.querySelectorAll('.card__fav'));
  cardFavBtns.forEach(function (btn) {
    setFavUI(btn, !!favs[btn.getAttribute('data-key')]);
  });
  /* 类型1/2/3 名称/描述：可达性 + 键盘交互（Enter / 空格），与点击行为一致 */
  expandableCards.forEach(function (card) {
    var title = card.querySelector('.card__title');
    var desc = card.querySelector('.card__desc');
    if (title) {
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      title.setAttribute('aria-expanded', 'false');
      title.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          toggleTitleExpand(card);
        }
      });
    }
    if (desc) {
      desc.setAttribute('role', 'button');
      desc.setAttribute('tabindex', '0');
      desc.setAttribute('aria-expanded', 'false');
      desc.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          toggleDescExpand(card);
        }
      });
    }
  });
  /* 初始化即预计算各类型1卡「完整行数」，点击展开时只比对数组取最大值（不再临时测 DOM） */
  precomputeLines();
  precomputeTitleLines();
  /* 防抖：屏幕/容器宽度变化（换屏幕方向、桌面浏览器放大缩小等）→ 所有卡片归 1 行 + 重算数组，避免旧宽度下算出的行数在新宽度下错位 */
  var t1ResizeTimer = null;
  function onViewportMetricChange() {
    if (t1ResizeTimer) { clearTimeout(t1ResizeTimer); }
    t1ResizeTimer = setTimeout(recomputeExpandLines, 200);
  }
  window.addEventListener('resize', onViewportMetricChange);
  window.addEventListener('orientationchange', onViewportMetricChange);
  updateFavToggleStar();
  renderTags();
  applyFilter();
  syncFromHash();

  /* ── 13. 埋点：广告位曝光/点击（仅 slot 位置，不含广告内容） ── */
  (function () {
    var adEls = Array.prototype.slice.call(document.querySelectorAll('.ad'));
    if (!adEls.length || !('IntersectionObserver' in window)) { return; }
    function slotOf(cls) {
      return /ad--top/.test(cls) ? 'top' : (/ad--bottom/.test(cls) ? 'bottom' : 'other');
    }
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var cls = en.target.className || '';
        if (en.isIntersecting && !seen[cls]) {
          seen[cls] = true;
        }
      });
    }, { threshold: 0.5 });
    adEls.forEach(function (el) {
      io.observe(el);
      var slot = slotOf(el.className || '');
      el.addEventListener('click', function () { /* 广告点击（打点已移除，D-16） */ });
    });
  })();

  /* ── 14. 埋点：about 页浏览/阅读（整站级可信载体触达） ── */
  (function () {
    var aboutArticle = document.querySelector('.about-content');
    if (!aboutArticle) { return; }
    if (!('IntersectionObserver' in window)) { return; }
    var sentinel = document.createElement('div');
    sentinel.setAttribute('data-zx-read-sentinel', '1');
    aboutArticle.appendChild(sentinel);
    var readObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          readObs.disconnect();
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    readObs.observe(sentinel);
  })();
})();
