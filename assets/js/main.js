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
    /* 量出任务栏/系统 UI 高度作安全底边距：最大化时窗口底边常被任务栏覆盖，
       声明条/滚动按钮若贴底会被"吃掉"（Edge 实测关闭钮点不到、悬停不触发）。
       屏幕物理高 − 可用高 = 任务栏高；兜底 40px 覆盖常见任务栏尺寸。 */
    function taskbarInset() {
      var tb = 0;
      try { if (screen.height && screen.availHeight) tb = Math.max(0, screen.height - screen.availHeight); } catch (e) {}
      return Math.max(tb, 40);
    }
    function setInsetVar() {
      try { document.documentElement.style.setProperty('--taskbar-inset', taskbarInset() + 'px'); } catch (e) {}
    }
    /* on: 声明条显示时额外加其高度避让；无论开关都叠加任务栏安全底边距，
       避免重新最大化后滚动按钮落回任务栏遮挡带（关闭钮失效） */
    function liftScrollBtns(on) {
      var sb = document.getElementById('scroll-btns');
      if (!sb) return;
      var inset = taskbarInset(), base = window.innerWidth <= 639 ? 16 : 24;
      sb.style.bottom = ((on ? (bar.offsetHeight || 0) : 0) + inset + base) + 'px';
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
    setInsetVar();  // 初始化即写入安全底边距变量（即使后续隐藏也先写）
    if (ts && (Date.now() - ts) <= EXP) { hideBar(); return; }
    if (bar.hidden || bar.style.display === 'none') { hideBar(); return; }
    try { document.body.classList.add('has-notice'); } catch (e) {}
    liftScrollBtns(true);
    window.addEventListener('resize', function () {
      setInsetVar();
      if (!bar.hidden) { liftScrollBtns(true); } else { liftScrollBtns(false); }
    });
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
  /* 卡片内 desc / title 元素缓存（懒建一次，之后复用）。
     展开/复位路径原本每次都对每张卡执行 querySelector，
     337 张卡 × 每次复位 = 674 次 DOM 查询。 */
  function getDesc(card) {
    if (card.__desc === undefined) { card.__desc = card.querySelector('.card__desc'); }
    return card.__desc;
  }
  function getTitle(card) {
    if (card.__title === undefined) { card.__title = card.querySelector('.card__title'); }
    return card.__title;
  }

  /* 性能（2026-08-31）：预计算每张卡的静态信息，避免每次筛选重复计算。
     原实现在 applyFilter 里对每张卡做 querySelector('.card__fav') 与
     textContent.toLowerCase()，337 张卡 × 每次按键 = 每敲一个字符
     就多出 337 次 DOM 查询与 337 次长字符串小转换。卡片内容静态，
     初始化算一次即可：
       __search      —— 可搜索纯文本（保留原字段，供外部/调试使用）
       __searchLower —— 小写副本（匹配时直接用，不再逐次转换）
       __favKey      —— 收藏键（不再是每次 querySelector）
       __etype       —— 可展开类型 t1/t2/t3（不再是每次三重 classList 判断）
       __shown       —— 上一轮显隐结果（用于脏检查，只写状态真变的卡） */
  cards.forEach(function (card, cardIdx) {
    card.__search = card.textContent;
    card.__searchLower = card.__search.toLowerCase();
    var fb = card.querySelector('.card__fav');
    card.__favKey = fb ? fb.getAttribute('data-key') : '';
    card.__etype = getCardExpandType(card);
    card.__shown = !card.hidden;
    card.__zxIdx = cardIdx;
  });

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
  /* 返回某关键词的完整匹配集合（含自身与互为别名的词），用于站内筛选。
     性能（2026-08-31）：结果按关键词缓存。原实现在 textMatches 里被调用
     「卡片数 × 关键词数」次（337 × 3 ≈ 1000 次），每次都遍历 ALIASES 的
     8 个键重建数组；别名词表是常量，同一关键词的结果永远相同。 */
  var ALIAS_CACHE = {};
  function aliasSet(kw) {
    kw = (kw || '').trim().toLowerCase();
    if (!kw) { return []; }
    if (ALIAS_CACHE[kw]) { return ALIAS_CACHE[kw]; }
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
    ALIAS_CACHE[kw] = set;
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

  /* ── 应用筛选：分类 AND 关键词 AND 本地收藏（含输入框实时关键词） ──
     性能（2026-08-31）重写：严格分阶段，杜绝「写→读→写→读」造成的强制同步布局。
       阶段 1  纯计算；只写「状态真变了」的卡（脏检查：337 次无谓 display 切换降到实际变化数）
       阶段 2  复位展开态（当前无卡处于展开态时整段跳过）
       阶段 3  几何读取：只测「本次显隐变化 且 当前在视口内」的卡
       阶段 4  高亮：只重写「高亮签名变了」的卡
     原实现在阶段 1 的循环里直接穿插 highlightCard 的 innerHTML 写入，
     末尾又全量调 refreshScrollable 读 678 个元素的几何量，形成典型的
     写读交替 → 每敲一个字符至少 2 次全文档强制重排。 */
  function applyFilter() {
    var kw = siteInput.value.trim();
    var visible = 0;
    var activeKeywords = filterTags.slice();
    if (kw && activeKeywords.indexOf(kw) === -1) { activeKeywords.push(kw); }
    var hlSig = activeKeywords.join('\u0001');
    var changed = [];
    var toHighlight = [];

    /* 阶段 1：计算 + 只写变化项（此阶段不得读取任何几何属性） */
    cards.forEach(function (card) {
      var catOk = activeCat === 'all' || card.getAttribute('data-cat') === activeCat;
      var text = card.__searchLower;          // 预计算的小写副本，不再逐次转换
      var kwOk = true;
      for (var i = 0; i < filterTags.length; i++) {
        if (!textMatches(text, filterTags[i])) { kwOk = false; break; }
      }
      if (kwOk && kw && !textMatches(text, kw)) { kwOk = false; }
      var favOk = !showFav || !!favs[card.__favKey];
      var show = catOk && kwOk && favOk;
      if (card.__shown !== show) {
        card.__shown = show;
        card.hidden = !show;
        changed.push(card);
      }
      if (show) {
        visible++;
        if (card.__hlSig !== hlSig) { card.__hlSig = hlSig; toHighlight.push(card); }
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

    /* 阶段 2：任何筛选状态变更（切换分类/关键词/收藏/标签）后，卡片名称与描述
       复位为默认折叠态，保证视图一致（同一行卡片不再因之前展开而高低不齐）。 */
    resetExpandCollapsed();

    /* 阶段 3：复检溢出标记。只处理本次显隐变化且当前在视口内的卡——
       视口外的卡由 IntersectionObserver 在进入视口时补测，避免对
       content-visibility 跳过的卡片强行读 scrollWidth（那会抵消懒渲染收益）。 */
    if (changed.length) { queueRowCheck(changed); }

    /* 阶段 4：高亮（写 DOM 子树，必须排在所有几何读取之后，不打断批处理） */
    for (var h = 0; h < toHighlight.length; h++) {
      highlightCard(toHighlight[h], activeKeywords);
    }
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
    /* 只复检筛选标签滑道本身：标签增删不改变任何卡片的显隐，
       没必要连带检测 337 张卡片的行宽（原实现在这里全量 refreshScrollable）。 */
    markRows(standaloneRows);
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
    var type = card.__etype;                    // 初始化时已缓存，不再三重 classList 判断
    if (!type) { return []; }
    var top = Math.round(card.getBoundingClientRect().top);
    /* 连续读取 getBoundingClientRect 中间不夹写操作，浏览器只需布局一次 */
    var out = [];
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (c.hidden || c.__etype !== type) { continue; }
      if (Math.round(c.getBoundingClientRect().top) === top) { out.push(c); }
    }
    return out;
  }
  /* 惰性测量：算出「这批卡片完整展示需要多少行」。
     性能（2026-08-31）：原 precomputeLines / precomputeTitleLines 在初始化时
     对全部 337 张卡逐一执行「写 3 个样式 → 读 scrollHeight → 写回」，
     每张卡都触发一次全文档强制同步布局（desc + title 合计 674 次），
     且这段同步代码跑完才允许用户交互——这是首屏卡死的第一根因。
     改为：只在用户真的点开某一行时才测量，且只测那一行的 3~4 张卡；
     并采用「先批量写 → 再集中读 → 最后批量还原」三段式，
     一次展开操作只触发 1 次布局（原为 4 次）。
     结果按卡缓存；容器宽度变化（resize/换方向）时清空缓存下次重测。
     kind: 'desc' 测描述行，'title' 测标题行。 */
  function measureRows(list, kind) {
    var isDesc = kind === 'desc';
    var field = isDesc ? '__fullLines' : '__fullTitleLines';
    var sel = isDesc ? '.card__desc' : '.card__title';
    var pend = [];
    var i, el, c;
    /* 阶段 1：只写，不读 */
    for (i = 0; i < list.length; i++) {
      c = list[i];
      if (c[field] !== undefined) { continue; }          // 已测过，直接复用
      el = c.querySelector(sel);
      if (!el) {
        c[field] = isDesc ? 1 : defaultTitleLines(c);
        continue;
      }
      /* 必须 height:auto 且不设 --lines，否则 CSS 的
         .is-expanded{height:calc(var(--lines)*1.5em)} 会按 --lines 把盒子撑高，
         scrollHeight 量到的就是被撑的高度（旧 bug = 999 行的来源）。 */
      el.__pWS = el.style.whiteSpace;
      el.__pH = el.style.height;
      el.style.whiteSpace = 'normal';
      el.style.height = 'auto';
      if (!isDesc) {
        el.__pLC = el.style.getPropertyValue('-webkit-line-clamp');
        el.style.setProperty('-webkit-line-clamp', '999');
      }
      pend.push({ c: c, el: el });
    }
    if (!pend.length) { return; }
    /* 阶段 2：集中读（一次布局即可满足本批全部读取） */
    for (i = 0; i < pend.length; i++) {
      var cs = getComputedStyle(pend[i].el);
      pend[i].lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.5) || 1;
      pend[i].h = pend[i].el.scrollHeight;
    }
    /* 阶段 3：批量还原样式 + 写回结果 */
    for (i = 0; i < pend.length; i++) {
      var p = pend[i];
      p.el.style.whiteSpace = p.el.__pWS || '';
      p.el.style.height = p.el.__pH || '';
      if (!isDesc) { p.el.style.setProperty('-webkit-line-clamp', p.el.__pLC || ''); }
      p.c[field] = Math.max(1, Math.round(p.h / p.lh));
    }
  }
  /* 是否有卡正处于展开态：resetExpandCollapsed 的脏检查开关。
     原实现每次 applyFilter 都无条件遍历 337 张卡做复位，而绝大多数时候
     根本没有任何卡被展开——加这个开关后可整段跳过。 */
  var anyExpanded = false;

  function setRowLines(rowCards, n) {
    if (n > 1) { anyExpanded = true; }
    rowCards.forEach(function (c) {
      var d = getDesc(c);
      if (d) {
        d.style.setProperty('--lines', String(n));
        d.classList.toggle('is-expanded', n > 1);
        d.setAttribute('aria-expanded', n > 1 ? 'true' : 'false');
      }
      c.setAttribute('data-row-lines', String(n));
    });
  }
  /* 标题行数测量已并入 measureRows(list, 'title')，不再单独预计算。 */
  /* 设置同行所有标题的行数（CSS --title-lines 变量驱动；>2 视为展开态，给 aria 与 class） */
  function setRowTitleLines(rowCards, n) {
    if (rowCards.length && n > defaultTitleLines(rowCards[0])) { anyExpanded = true; }
    rowCards.forEach(function (c) {
      var t = getTitle(c);
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
    /* 惰性测量：首次展开这一行时才测（只测同行的 3~4 张，结果按卡缓存） */
    measureRows(rowCards, 'desc');
    /* 同行「内容最多的那张」完整需要多少行 → 全行统一展示该值 */
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
    /* 同上：惰性测量本行标题行数 */
    measureRows(rowCards, 'title');
    var def = defaultTitleLines(rowCards[0] || card);   /* 类型1=2 行、类型2/3=1 行（折叠默认） */
    /* 同行「标题内容最多的那张」完整需要多少行 → 全行统一展示该值 */
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
    /* 脏检查：压根没有卡处于展开态时，337 张卡的全量遍历直接跳过。
       原实现每次 applyFilter 都无条件执行这一段（337 × 3 次属性写），
       而它被 applyFilter 与搜索框 focus 高频调用。 */
    if (!anyExpanded) { return; }
    anyExpanded = false;
    expandableCards.forEach(function (card) {
      var d = getDesc(card);
      if (d) {
        d.style.removeProperty('--lines');
        d.classList.remove('is-expanded');
        d.setAttribute('aria-expanded', 'false');
      }
      card.removeAttribute('data-row-lines');
      var t = getTitle(card);
      if (t) {
        t.style.removeProperty('--title-lines');
        t.classList.remove('is-expanded');
        t.setAttribute('aria-expanded', 'false');
      }
      card.removeAttribute('data-title-lines');
    });
  }
  /* 重新初始化：先全部收起 → 清空「完整行数」缓存。
     行数随容器宽度变化，旧值不能沿用；但【不在这里重测】——
     重测推迟到下次真正展开时惰性执行，避免 resize / 转屏时
     再次触发 674 次全文档强制重排（原实现正是在这里重测的）。 */
  function recomputeExpandLines() {
    resetExpandCollapsed();
    expandableCards.forEach(function (card) {
      card.__fullLines = undefined;
      card.__fullTitleLines = undefined;
    });
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
  /* 类型1/2/3 的标题/描述是「点击展开」交互，不作为横向滚动行：
     排除后不会被标 is-scrollable，避免悬停时滚轮被接管、显示抓取光标。 */
  function isScrollRow(el) {
    var c = el.closest ? el.closest('.card') : null;
    if (c && c.__etype && (el.classList.contains('card__title') || el.classList.contains('card__desc'))) { return false; }
    return true;
  }
  /* 预建「卡片 → 其滚动行」映射：只查一次，之后复用。
     原实现每次检测都遍历全局 ~678 个元素再逐个 closest('.card')。 */
  cards.forEach(function (card) {
    var rows = card.querySelectorAll(SCROLL_ROW_SEL);
    var keep = [];
    for (var i = 0; i < rows.length; i++) { if (isScrollRow(rows[i])) { keep.push(rows[i]); } }
    card.__rows = keep;
  });
  /* 不属于任何卡片的独立滑道（分类滑道 / 筛选标签滑道 / 引擎滑道等，数量很少） */
  var standaloneRows = Array.prototype.slice.call(document.querySelectorAll(SCROLL_ROW_SEL))
    .filter(function (el) { return !(el.closest && el.closest('.card')); });

  function markRows(rows) {
    for (var i = 0; i < rows.length; i++) {
      var el = rows[i];
      /* 隐藏卡片（被筛选掉）的行宽为 0：既不检测也不清除标记，
         防止卡片重新显示后标记丢失导致滚轮左右滑失效 */
      if (el.clientWidth === 0) { continue; }
      el.classList.toggle('is-scrollable', el.scrollWidth > el.clientWidth + 1);
    }
  }
  /* 只检测指定卡片的行（增量） */
  function refreshScrollableFor(list) {
    var rows = [], i, j;
    for (i = 0; i < list.length; i++) {
      var r = list[i].__rows;
      if (!r) { continue; }
      for (j = 0; j < r.length; j++) { rows.push(r[j]); }
    }
    if (rows.length) { markRows(rows); }
  }
  /* 全量检测（含视口外卡片）：仅保留给极少数必须的场景，正常路径走 queueRowCheck */
  function refreshScrollable() {
    markRows(standaloneRows);
    refreshScrollableFor(cards);
  }

  /* ── 视口感知：只给「进入视口」的卡片做溢出检测 ──
     必要性：读取 scrollWidth 会强制浏览器完成该卡片的布局与渲染。
     CSS 已启用 content-visibility: auto（视口外卡片跳过渲染），
     若这里仍对全部 337 张卡读几何，等于把懒渲染的收益又全部吃掉。
     故：视口内的立即检测，视口外的交给 IntersectionObserver 进入时补测。 */
  var inView = [];              // 按 __zxIdx 记录，含 300px 预取提前量
  var rowObserver = null;
  if ('IntersectionObserver' in window) {
    rowObserver = new window.IntersectionObserver(function (entries) {
      var toCheck = [];
      for (var i = 0; i < entries.length; i++) {
        var en = entries[i], c = en.target;
        if (en.isIntersecting) {
          inView[c.__zxIdx] = true;
          if (c.__rowPending) { c.__rowPending = false; toCheck.push(c); }
        } else {
          inView[c.__zxIdx] = false;
        }
      }
      if (toCheck.length) { refreshScrollableFor(toCheck); }
    }, { rootMargin: '300px 0px' });
    cards.forEach(function (c) { rowObserver.observe(c); });
  }
  /* 入队待检测：视口内立即做，视口外标记等进入视口时补测。
     无 IntersectionObserver（老内核）时退化为「全部立即检测」，即旧行为。 */
  function queueRowCheck(list) {
    var now = [], i;
    for (i = 0; i < list.length; i++) {
      var c = list[i];
      if (!rowObserver || inView[c.__zxIdx]) { now.push(c); }
      else { c.__rowPending = true; }
    }
    if (now.length) { refreshScrollableFor(now); }
  }

  /* 初始化 / load / resize：只检测独立滑道 + 视口内卡片。
     原实现这三处都全量遍历 678 个元素读几何，是首屏与转屏卡顿的来源之一。 */
  function refreshVisibleRows() {
    markRows(standaloneRows);
    queueRowCheck(cards);
  }
  refreshVisibleRows();
  window.addEventListener('load', refreshVisibleRows);   // 字体/布局稳定后复检
  window.addEventListener('resize', refreshVisibleRows);

  /* 触屏：触摸时激活 UI，结束后移除。
     改为 document 级事件委托：原实现给 ~678 个元素各挂 3 个监听（约 2034 个），
     初始化耗时且全部常驻内存。 */
  var touchActiveEl = null;
  function clearTouchActive() {
    if (touchActiveEl) { touchActiveEl.classList.remove('is-touch-active'); touchActiveEl = null; }
  }
  document.addEventListener('touchstart', function (e) {
    var el = e.target.closest ? e.target.closest(SCROLL_ROW_SEL) : null;
    if (el && el.classList.contains('is-scrollable')) {
      clearTouchActive();
      touchActiveEl = el;
      el.classList.add('is-touch-active');
    }
  }, { passive: true });
  document.addEventListener('touchend', clearTouchActive, { passive: true });
  document.addEventListener('touchcancel', clearTouchActive, { passive: true });

  /* 鼠标：悬停在内容真溢出的滑道/行上时，滚轮改为对应方向滑动（阻止页面上下滚动）。
     性能（2026-08-31）：滚轮目标改由 pointerover 预先缓存。
     原实现在 document 上以 { passive: false } 常驻监听，每次滚轮都要
     e.target.closest() 走一遍祖先链；而 passive:false 会让浏览器无法把
     滚动交给合成线程，必须等这段 JS 跑完才能滚，低端机上直接体现为掉帧。
     现在 wheel 处理器只做一次缓存命中判断；触屏设备根本不触发
     pointerover / wheel，这段在移动端是零成本。 */
  var wheelTarget = null;
  function resolveWheelTarget(t) {
    var el = t && t.closest ? t.closest(SCROLL_ROW_SEL) : null;
    if (el && !isScrollRow(el)) { el = null; }
    return (el && el.classList.contains('is-scrollable')) ? el : null;
  }
  document.addEventListener('pointerover', function (e) {
    wheelTarget = resolveWheelTarget(e.target);
  }, { passive: true });
  document.addEventListener('pointerout', function () { wheelTarget = null; }, { passive: true });
  document.addEventListener('wheel', function (e) {
    /* 缓存未命中时（如页面刚加载鼠标已停在滑道上）兜底解析一次 */
    var el = wheelTarget || resolveWheelTarget(e.target);
    if (!el) { return; }
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
  }, { passive: false });

  /* 桌面拖拽横向滚动（满足 .track 的 grab/grabbing 光标语义；触屏已由原生 pan-x 承接）。
     单例管理：全部是 document 级监听 + 事件委托。
     性能（2026-08-31）：pointerdown 原本逐个绑到 ~678 个滚动行上，
     现改为一个 document 委托，监听器总数从约 2700 个降到 4 个。
     仅在真溢出(is-scrollable)时启用；拖动超阈值才视为拖拽并抑制本次 click，
     避免误触发分类/标签/链接的点击行为。 */
  (function () {
    var active = null, startX = 0, startLeft = 0, moved = false;
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') { return; }   // 触屏用原生 touch 滚动
      if (e.pointerType === 'mouse' && e.button !== 0) { return; }
      var el = e.target.closest ? e.target.closest(SCROLL_ROW_SEL) : null;
      if (!el || !isScrollRow(el) || !el.classList.contains('is-scrollable')) { return; }
      active = el; moved = false; startX = e.clientX; startLeft = el.scrollLeft;
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
      var text = card.__searchLower;            // 复用预计算的小写副本
      var kwOk = true;
      var i;
      for (i = 0; i < filterTags.length; i++) {
        if (!textMatches(text, filterTags[i])) { kwOk = false; break; }
      }
      if (kwOk && kw && !textMatches(text, kw)) { kwOk = false; }
      var favOk = !showFav || !!favs[card.__favKey];   // 复用缓存的收藏键
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
    /* 必须同步 __shown：applyFilter 靠它与上一轮比对来做脏检查，
       若这里只改 hidden 而不更新 __shown，退出随机后筛选会算出「状态未变」
       而跳过写入，导致卡片显隐错乱。 */
    cards.forEach(function (c) { c.hidden = true; c.__shown = false; });
    pick.forEach(function (c) { c.hidden = false; c.__shown = true; });
    // UI：显示随机条，隐藏分类标签 + 本地收藏按钮（随机模式不筛选收藏）
    if (randomBar) { randomBar.hidden = false; }
    document.querySelectorAll('.category-btn').forEach(function (b) { b.style.display = 'none'; });
    document.querySelectorAll('.category-nav__fav').forEach(function (b) { b.style.display = 'none'; });
    inRandom = true;
    // 结果计数：随机漫步状态（手动更新，不用 applyFilter，防止按分类/搜索覆盖随机选择）
    if (resultCount) { resultCount.textContent = '随机漫步：' + pick.length + ' 张卡片'; }
  }

  function exitRandom() {
    cards.forEach(function (c) { c.hidden = false; c.__shown = true; });
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
  /* 类型1/2/3 名称/描述：可达性（role / tabindex / aria）+ 键盘交互（Enter / 空格）。
     性能（2026-08-31）：键盘交互改为事件委托。原实现给每张卡的 title 与 desc
     各挂一个 keydown（337 × 2 = 674 个监听器），现在整个容器只有一个。
     role / tabindex / aria 这类静态属性仍在初始化时一次性写好（不触发布局）。 */
  expandableCards.forEach(function (card) {
    var title = getTitle(card);
    var desc = getDesc(card);
    if (title) {
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      title.setAttribute('aria-expanded', 'false');
    }
    if (desc) {
      desc.setAttribute('role', 'button');
      desc.setAttribute('tabindex', '0');
      desc.setAttribute('aria-expanded', 'false');
    }
  });
  if (cardsContainer) {
    cardsContainer.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') { return; }
      var t = e.target;
      var card = t.closest ? t.closest('.card') : null;
      if (!card || card.hidden || !card.__etype) { return; }
      if (t.classList.contains('card__title')) { e.preventDefault(); toggleTitleExpand(card); }
      else if (t.classList.contains('card__desc')) { e.preventDefault(); toggleDescExpand(card); }
    });
  }
  /* 「完整行数」不再于初始化时全量预计算——改由 measureRows 在用户首次展开
     某一行时惰性测量。原 precomputeLines() + precomputeTitleLines() 会在启动时
     同步触发 674 次全文档强制重排，是首屏可交互时间被推迟的首要原因。 */
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
    var io = new window.IntersectionObserver(function (entries) {
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
    var readObs = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          readObs.disconnect();
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    readObs.observe(sentinel);
  })();
})();
