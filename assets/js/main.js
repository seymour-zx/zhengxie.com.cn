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
      if (show) { visible++; }
    });
    /* 结果计数：无筛选显示总数，有筛选显示「当前显示 X / N」 */
    if (resultCount) {
      var filtering = activeCat !== 'all' || filterTags.length > 0 || kw || showFav;
      if (filtering) {
        resultCount.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 个站点';
      } else {
        resultCount.textContent = '共 ' + cards.length + ' 个站点';
      }
      resultCount.classList.toggle('is-empty', filtering && visible === 0);
    }
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
  engineForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var kw = engineInput.value.trim();
    if (!kw || !currentEngineUrl) { return; }
    window.open(currentEngineUrl + encodeURIComponent(kw), '_blank', 'noopener');
  });

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

  /* ── 初始化 ── */
  /* 还原各卡片星标态（localStorage） */
  var cardFavBtns = Array.prototype.slice.call(document.querySelectorAll('.card__fav'));
  cardFavBtns.forEach(function (btn) {
    setFavUI(btn, !!favs[btn.getAttribute('data-key')]);
  });
  updateFavToggleStar();
  renderTags();
  applyFilter();
})();
