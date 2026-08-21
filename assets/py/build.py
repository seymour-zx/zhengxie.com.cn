# -*- coding: utf-8 -*-
"""
build.py —— 正协导航 · 站点生成器
====================================
读取 assets/xlsx/links.xlsx，生成完整的 index.html。

设计原则（SEO 友好）：
- 所有导航卡片、分类按钮、链接全部内联在静态 HTML 中，不使用 JS 注入；
- 搜索引擎（百度/Google）可直接抓取全部链接与 anchor text；
- JS(main.js) 只做交互增强，禁用 JS 时页面内容完整可读可点。

用法：
    python assets/py/build.py
输出：
    index.html（站点根目录，覆盖更新）

数据表列（links.xlsx 第一行为表头）：
    站序 | 分类 | type | title | desc | media | tags | links
- 站序：数字，卡片按站序从小到大排列
- type：1=4行2列logo卡，2=5行横向封面卡，3=5行纵向封面卡（封面黄金比例 1.618）
- media：合规 URL（http/https + 合法域名/IP/localhost）仅显示图片（异步加载，失败时移除露出红渐变底）；
         空值/不合规 URL 均视为空 → 显示标题首字符文字logo占位（二选一，不叠加）
- tags：英文逗号分隔（如 AI,免费）；分类名自动作为标签行第1个标签
- links：分号分隔链接，逗号分隔"名称与URL"（如 官网,https://x;知乎,https://z）

v4 变更（相对 v3）：
- 分类板块：左 logo(承担「全部」功能) + 中滑道(分类按钮) + 右「本地收藏」按钮
- 筛选板块：1行三段式（当前筛选 + 滑道 + 清除筛选）
- Hero 外搜：百度/Google/必应 主引擎按钮原位不变；下方引擎滑道放更多引擎（电商/视频/知识/开发/社交/音乐/工具/学术）
- 统一滑动行为：所有滑道（分类/筛选/引擎 + 卡片标题/描述/标签/链接行）同一套交互
  —— 只在内容真溢出时接管滚轮为左右滑（页面暂停上下滚），触屏触摸同样激活

v4.1 修订：
- media 合规 URL 校验加严：http/https + 合法主机（域名/IP/localhost），
  不合规一律视为空值 → 首字符文字占位（URL图片 / 文字占位 二选一，不叠加）
- 卡片排序：先按 type（1→2→3），再按站序；不同类型之间插入 grid-break 强制换行，
  不同类型卡片绝不同行显示
- 卡片结构重排：
  · type1 = 4行3列（媒体跨1-2行1列 / 名称1行2列 / 收藏1行3列 / 描述跨2行2-3列 / 标签3行 / 链接4行）
  · type2/3 = 5行2列（媒体跨1行 / 名称2行1列 / 收藏2行2列 / 描述3行 / 标签4行 / 链接5行）
- 卡片收藏按钮改为 SVG 星形（描边金/激活填充金），位置统一固定在名称行右端（grid 布局成员）
- 顶部 logo 保持正方形；未激活态底色改淡化红，激活态正红渐变+金环
- 「本地收藏」按钮改为与 logo 同尺寸正方形、金色系：未点击显示 ★，点击后显示「本地/收藏」两行
"""

import html
import os
import re
import sys
from urllib.parse import urlparse

from openpyxl import load_workbook

# ── 路径 ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
XLSX_PATH = os.path.join(BASE_DIR, "assets", "xlsx", "links.xlsx")
OUT_PATH = os.path.join(BASE_DIR, "index.html")

# ── 搜索引擎清单（key, 显示名, 搜索URL, 是否主引擎） ──
# 主引擎（百度/Google/必应）原位不变（搜索框上方按钮）；其余进下方引擎滑道。
# 引擎清单改动只改此处一处即可（按钮与 data-url 均由此生成）。
ENGINES = [
    ("baidu",       "百度",          "https://www.baidu.com/s?wd=",                    True),
    ("google",      "Google",        "https://www.google.com/search?q=",               True),
    ("bing",        "必应",          "https://www.bing.com/search?q=",                 True),
    ("taobao",      "淘宝",          "https://s.taobao.com/search?q=",                False),
    ("jd",          "京东",          "https://search.jd.com/Search?keyword=",         False),
    ("pdd",         "拼多多",        "https://mobile.yangkeduo.com/search_result.html?search_key=", False),
    ("zhihu",       "知乎",          "https://www.zhihu.com/search?q=",               False),
    ("baike",       "百度百科",      "https://baike.baidu.com/item/",                  False),
    ("wiki",        "维基百科",      "https://zh.wikipedia.org/w/index.php?search=",   False),
    ("bilibili",    "B站",           "https://search.bilibili.com/all?keyword=",       False),
    ("douyin",      "抖音",          "https://www.douyin.com/search/",                False),
    ("github",      "GitHub",        "https://github.com/search?q=",                  False),
    ("stackoverflow", "Stack Overflow", "https://stackoverflow.com/search?q=",       False),
    ("juejin",      "掘金",          "https://juejin.cn/search?query=",                False),
    ("weibo",       "微博",          "https://s.weibo.com/weibo?q=",                   False),
    ("weixin",      "微信搜一搜",    "https://weixin.sogou.com/weixin?type=2&query=",  False),
    ("toutiao",     "头条搜索",      "https://so.toutiao.com/search?keyword=",         False),
    ("music163",    "网易云音乐",    "https://music.163.com/#/search/m/?s=",           False),
    ("youdao",      "有道翻译",      "https://dict.youdao.com/search?q=",             False),
    ("amap",        "高德地图",      "https://www.amap.com/search/?query=",           False),
    ("scholar",     "Google Scholar", "https://scholar.google.com/scholar?q=",         False),
]

# ── 解析函数 ──────────────────────────────────────────


def parse_tags(raw):
    """tags 用英文逗号分隔，去空去重，保持顺序"""
    seen = []
    for t in str(raw or "").split(","):
        t = t.strip()
        if t and t not in seen:
            seen.append(t)
    return seen


def parse_links(raw):
    """links 用 ; 分链接、用 , 分"名称与URL"；纯URL 时名称=URL"""
    items = []
    for part in str(raw or "").split(";"):
        part = part.strip()
        if not part:
            continue
        if "," in part:
            name, url = part.split(",", 1)
        else:
            name, url = part, part
        name, url = name.strip(), url.strip()
        if url:
            items.append((name or url, url))
    return items


_DOMAIN_RE = re.compile(
    r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+"
    r"[a-zA-Z]{2,}$"
)
_IP_RE = re.compile(r"^\d{1,3}(?:\.\d{1,3}){3}$")


def is_url(s):
    """合规 URL：http/https 协议 + 合法主机（域名 / IP / localhost）。
    不合规（裸域名、无主机、其他协议等）一律视为空值 → 文字占位。"""
    s = (s or "").strip()
    try:
        u = urlparse(s)
    except ValueError:
        return False
    if u.scheme not in ("http", "https") or not u.netloc:
        return False
    host = u.netloc.rsplit("@", 1)[-1].split(":")[0].strip("[]")
    if host.lower() == "localhost" or _IP_RE.match(host):
        return True
    return bool(_DOMAIN_RE.match(host))


def first_char(title):
    """取标题首字符做文字logo；英文首字母大写"""
    s = (title or "").strip()
    if not s:
        return "站"
    ch = s[0]
    return ch.upper() if ch.isascii() and ch.isalpha() else ch


def build_media(media, title):
    """媒体区：URL→仅图片（异步加载，失败移除图片露出红渐变底）；
    空/非URL→仅标题首字符文字logo占位（不再与图片叠加）"""
    if is_url(media):
        src = html.escape(media.strip(), quote=True)
        return (f'<div class="card__media">'
                f'<img class="card__media-img" src="{src}" alt="" '
                f'loading="lazy" decoding="async" referrerpolicy="no-referrer" '
                f'onerror="this.remove()"></div>')
    fb = html.escape(first_char(title))
    return (f'<div class="card__media">'
            f'<span class="card__media-fallback" aria-hidden="true">{fb}</span></div>')


def build_tags(category, tags):
    """标签行：分类名自动放第1位，其余标签随后（去重）"""
    parts = [
        f'<button type="button" class="card__tag card__tag--cat" '
        f'data-tag="{html.escape(category, quote=True)}">{html.escape(category)}</button>'
    ]
    for t in tags:
        if t == category:
            continue
        parts.append(
            f'<button type="button" class="card__tag" '
            f'data-tag="{html.escape(t, quote=True)}">{html.escape(t)}</button>'
        )
    return '<div class="card__tags">' + "".join(parts) + "</div>"


def build_links(links):
    parts = []
    for name, url in links:
        # nofollow：不传递权重（导航站大量外链的稳妥做法）
        # noopener：新标签页打开时隔离 window.opener（安全）
        # noreferrer：跳转不发送 Referer，目标站不知访客来自本站
        parts.append(
            f'<a class="card__link" href="{html.escape(url, quote=True)}" '
            f'target="_blank" rel="nofollow noopener noreferrer">{html.escape(name)}</a>'
        )
    return '<div class="card__links">' + "".join(parts) + "</div>"


FAV_SVG = (
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
    '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 '
    '9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'
)


def build_card(row):
    """按 type 生成三类卡片结构之一（v4.1：收藏按钮为 SVG 星，位于名称行右端）"""
    t = str(row.get("type") or "").strip()
    cls = {"1": "card--t1", "2": "card--t2", "3": "card--t3"}.get(t, "card--t2")
    category = str(row.get("分类") or "").strip()
    title = row.get("title") or ""
    desc = row.get("desc") or ""

    media_html = build_media(row.get("media"), title)
    tags_html = build_tags(category, parse_tags(row.get("tags")))
    parsed_links = parse_links(row.get("links"))
    links_html = build_links(parsed_links)

    # 星标 key：取首个链接 URL（最稳定），无链接则退回标题
    fav_key = parsed_links[0][1] if parsed_links else (title or category or "card")
    fav_key_esc = html.escape(fav_key, quote=True)

    return (
        f'<article class="card {cls}" data-cat="{html.escape(category, quote=True)}">'
        f"{media_html}"
        f'<h3 class="card__title">{html.escape(title)}</h3>'
        f'<button type="button" class="card__fav" data-key="{fav_key_esc}" '
        f'aria-label="收藏/取消收藏" aria-pressed="false">{FAV_SVG}</button>'
        f'<p class="card__desc">{html.escape(desc)}</p>'
        f"{tags_html}{links_html}"
        f"</article>"
    )


def load_rows():
    """读取 xlsx 全部数据行。
    v4.1 排序：先按 type（1→2→3，非法排最后），再按站序从小到大。"""
    wb = load_workbook(XLSX_PATH, read_only=True, data_only=True)
    ws = wb.active
    rows = []
    header = None
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if row is None or all(c is None for c in row):
            continue
        if i == 0:
            header = [str(c).strip() if c is not None else "" for c in row]
            continue
        rec = {}
        for idx, col in enumerate(header):
            rec[col] = row[idx] if idx < len(row) else None
        if rec.get("站序") is None and rec.get("title") is None:
            continue
        rows.append(rec)
    wb.close()

    def type_order(r):
        t = str(r.get("type") or "").strip()
        return {"1": 1, "2": 2, "3": 3}.get(t, 9)

    def order_key(r):
        try:
            return (type_order(r), int(r.get("站序") or 0))
        except (TypeError, ValueError):
            return (type_order(r), 10**9)
    rows.sort(key=order_key)
    return rows


def build_category_buttons(rows):
    """分类按钮：按站序首现顺序去重。
    v4：「全部」不再作为列表按钮——由左置 logo 承担全部功能。"""
    seen = []
    for r in rows:
        c = str(r.get("分类") or "").strip()
        if c and c not in seen:
            seen.append(c)
    parts = []
    for c in seen:
        parts.append(
            f'<li><h2><button type="button" class="category-btn" '
            f'data-cat="{html.escape(c, quote=True)}">{html.escape(c)}</button></h2></li>'
        )
    return "".join(parts)


def build_engine_buttons():
    """生成主引擎按钮(原位) + 引擎滑道按钮(v4 新增)。
    每个按钮带 data-engine 与 data-url，JS 据此单选激活与跳转。"""
    primary_parts = []
    track_parts = []
    for i, (key, label, url, is_primary) in enumerate(ENGINES):
        active = ' class="active" aria-pressed="true"' if (is_primary and i == 0) else ' aria-pressed="false"'
        btn = (
            f'<button type="button" data-engine="{html.escape(key)}" '
            f'data-url="{html.escape(url, quote=True)}"{active}>'
            f'{html.escape(label)}</button>'
        )
        if is_primary:
            primary_parts.append(btn)
        else:
            track_parts.append(btn)
    return "\n        ".join(primary_parts), "\n        ".join(track_parts)


def build_page(category_buttons, cards_html, engine_primary, engine_track, total_cards):
    """组装完整 index.html（静态模板，占位符替换）"""
    return (
        PAGE_TEMPLATE.replace("{{CATEGORY_BUTTONS}}", category_buttons)
        .replace("{{CARDS}}", cards_html)
        .replace("{{ENGINE_PRIMARY}}", engine_primary)
        .replace("{{ENGINE_TRACK}}", engine_track)
        .replace("{{TOTAL_CARDS}}", str(total_cards))
    )


# ── 页面模板 ──
PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- 全站不发送 Referer：外站（图片源/被链接站点/搜索引擎）无法得知访客来自 zhengxie.com.cn。
       对 GA4 / 百度统计 / AdSense 均无影响（一方统计不走 Referer 头；AdSense 靠脚本读页面 URL 投放）。 -->
  <meta name="referrer" content="no-referrer">
  <title>正协导航 - 让每一次寻找，都不止于找到</title>
  <meta name="description" content="正协导航：全量收录的精选站点导航，覆盖常用入口、AI智能、资讯媒体、设计创意、开发技术、学习教育、效率工具、影音娱乐等分类，让每一次寻找，都不止于找到。">
  <meta name="keywords" content="正协导航,网址导航,网站导航,AI工具,效率工具,政协,导航网站">
  <meta name="author" content="正协导航">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://zhengxie.com.cn/">
  <!-- 社交分享 -->
  <meta property="og:title" content="正协导航 - 让每一次寻找，都不止于找到">
  <meta property="og:description" content="全量收录的精选站点导航，覆盖AI智能、资讯媒体、设计创意、开发技术、学习教育等分类。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://zhengxie.com.cn/">
  <meta property="og:image" content="https://zhengxie.com.cn/assets/images/logo.svg">
  <meta property="og:site_name" content="正协导航">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="正协导航 - 让每一次寻找，都不止于找到">
  <meta name="twitter:description" content="全量收录的精选站点导航。">
  <!-- PWA / 移动端 -->
  <meta name="theme-color" content="#9E1B22" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0D0C0E" media="(prefers-color-scheme: dark)">
  <link rel="manifest" href="manifest.json">
  <!-- 图标 -->
  <link rel="icon" type="image/svg+xml" href="assets/images/logo.svg">
  <link rel="apple-touch-icon" href="assets/images/logo.svg">
  <!-- 性能：预连接外部资源 -->
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <link rel="preconnect" href="https://pagead2.googlesyndication.com">
  <link rel="preconnect" href="https://hm.baidu.com">
  <link rel="dns-prefetch" href="https://www.googletagmanager.com">
  <link rel="stylesheet" href="assets/css/style.css">
  <!-- 暗色模式：在 CSS 加载前同步设置，避免闪烁(FOUC)。优先级：localStorage > 系统偏好 -->
  <script>
    (function(){try{var t=localStorage.getItem('zx_theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();
  </script>
  <!-- JSON-LD 结构化数据：帮助搜索引擎理解站点类型与搜索功能 -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "正协导航",
    "alternateName": "正协导航 - 让每一次寻找，都不止于找到",
    "url": "https://zhengxie.com.cn/",
    "description": "全量收录的精选站点导航",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://zhengxie.com.cn/?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
  </script>

  <!-- ═══ 统计（GA4 + 百度统计×2，双域名各一份） ═══ -->
  <!-- Google Analytics GA4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-B880S4NQVK"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-B880S4NQVK');
  </script>
  <!-- 百度统计（com.cn 站 + info 站，两个站点代码合并注入） -->
  <script>
  var _hmt = _hmt || [];
  (function() {
    var ids = ["2f4df5057c929092e36a0d6357e35261", "70e38224e5ebd850150b00a19835a25f"];
    var s = document.getElementsByTagName("script")[0];
    for (var i = 0; i < ids.length; i++) {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?" + ids[i];
      s.parentNode.insertBefore(hm, s);
    }
  })();
  </script>
  <!-- ═══ Google AdSense 加载器（全页仅此一份，async 不阻塞渲染） ═══ -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6434243103158481"
          crossorigin="anonymous"></script>
</head>
<body>
  <!-- 无障碍：跳到主内容 -->
  <a href="#cards-container" class="skip-link">跳到主内容</a>

  <!-- ═══ 第1行块：Hero 区 ═══ -->
  <header class="hero">
    <h1 class="hero__logo">正协导航</h1>
    <p class="hero__slogan">让每一次寻找，都不止于找到</p>
    <!-- 集合搜索引擎：主引擎按钮(原位) + 输入行 + 下方引擎滑道(扩展) -->
    <form class="hero__search" id="engine-search" action="#" role="search" aria-label="集合搜索">
      <div class="hero__engines" role="tablist" aria-label="主搜索引擎">
        {{ENGINE_PRIMARY}}
      </div>
      <div class="hero__searchrow">
        <input type="search" id="engine-input" placeholder="输入关键词，搜索全网" autocomplete="off">
        <button type="submit">搜一下</button>
      </div>
      <div class="track hero__engines-track" role="tablist" aria-label="更多引擎">
        {{ENGINE_TRACK}}
      </div>
    </form>
  </header>

  <!-- ═══ 第2行块：Google 广告位①（全宽自适应：左右零留白，撑满可用宽度给 Google 选择） ═══ -->
  <aside class="ad ad--top" aria-label="广告">
    <p class="ad__label">广告</p>
    <!-- Google AdSense 自适应展示广告（顶部专用单元，slot 与底部分开便于分位统计收益） -->
    <ins class="adsbygoogle" style="display:block"
         data-ad-client="ca-pub-6434243103158481"
         data-ad-slot="5952548493"
         data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </aside>

  <!-- ═══ 置顶区（整体 sticky 吸顶）：第3-5行块 ═══ -->
  <div class="sticky-top">

  <!-- ═══ 第3行块：分类导航（左 logo=全部 + 中滑道 + 右本地收藏） ═══ -->
  <nav class="category-nav" aria-label="分类筛选">
    <div class="wrap category-nav__inner">
      <button type="button" class="category-nav__logo category-btn active" data-cat="all" aria-pressed="true" aria-label="全部">
        <!-- 两份文字静态渲染，CSS 按激活态切换：激活(=全部选中)=品牌名；未激活(已选分类)显示「全部」引导返回。
             禁用 JS 时静态 HTML 带 active → 显示品牌名，SEO 无损。 -->
        <span class="logo__brand" aria-hidden="true"><span>正协</span><span>导航</span></span>
        <span class="logo__all" aria-hidden="true">全部</span>
      </button>
      <ul class="category-nav__list track">
        {{CATEGORY_BUTTONS}}
      </ul>
      <button type="button" class="category-nav__fav" id="fav-toggle" aria-pressed="false" aria-label="本地收藏">
        <span class="category-nav__fav-star" aria-hidden="true">☆</span>
        <span class="category-nav__fav-text" aria-hidden="true"><span>本地</span><span>收藏</span></span>
      </button>
    </div>
  </nav>

  <!-- ═══ 第4行块：页面内搜索框（筛选站内卡片） ═══ -->
  <section class="site-search" aria-label="站内筛选">
    <div class="wrap">
      <input type="search" id="site-search-input"
             placeholder="在正协导航内筛选：标题 / 描述 / 网址关键词，回车添加筛选标签"
             autocomplete="off">
    </div>
  </section>

  <!-- ═══ 第4.5行块：结果计数（搜索框与筛选标签行之间，静态渲染总数，JS 动态更新） ═══ -->
  <section class="result-count wrap" aria-label="筛选结果统计">
    <p class="result-count__text" id="result-count">共 {{TOTAL_CARDS}} 张卡片</p>
  </section>

  <!-- ═══ 第5行块：筛选标签区（1行三段式：当前筛选 + 滑道 + 清除筛选） ═══ -->
  <section class="filter-tags wrap" id="filter-tags" aria-label="筛选标签">
    <span class="filter-tags__hint" id="filter-tags-hint">当前筛选：</span>
    <div class="track filter-tags__track" id="filter-tags-track">
      <!-- 标签 chip 由 main.js 动态插入，例：
      <span class="filter-tag"><span class="filter-tag__text">AI</span><button class="filter-tag__del" aria-label="删除该标签">×</button></span> -->
    </div>
    <button type="button" class="filter-tag__clear" id="filter-tag-clear" hidden>清除筛选</button>
  </section>

  </div><!-- /sticky-top -->

  <!-- ═══ 第6行块：导航卡片容器（build.py 生成，全部静态渲染，Grid 响应式） ═══ -->
  <main class="cards-container wrap" id="cards-container">
    {{CARDS}}
  </main>

  <!-- 空结果状态（JS 控制显隐） -->
  <div class="empty-state" id="empty-state" hidden>
    <div class="empty-state__icon" aria-hidden="true">
      <svg viewBox="0 0 64 64" width="48" height="48"><circle cx="28" cy="28" r="18" fill="none" stroke="currentColor" stroke-width="2"/><line x1="42" y1="42" x2="54" y2="54" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </div>
    <p class="empty-state__text">没有找到匹配的结果，换个关键词或分类试试</p>
  </div>

  <!-- ═══ 第7行块：Google 广告位②（底部专用单元：slot 与顶部分开，AdSense 后台可分位统计收益） ═══ -->
  <aside class="ad ad--bottom" aria-label="广告">
    <p class="ad__label">广告</p>
    <!-- Google AdSense 自适应展示广告 -->
    <ins class="adsbygoogle" style="display:block"
         data-ad-client="ca-pub-6434243103158481"
         data-ad-slot="4856101005"
         data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </aside>

  <!-- ═══ 第8行块：Footer ═══ -->
  <footer class="footer">
    <div class="footer__inner wrap">
      <p class="footer__copyright">© 2026 正协导航 · 让每一次寻找，都不止于找到</p>
      <nav class="footer__nav" aria-label="页脚导航">
        <a href="./">首页</a>
        <a href="units/about/">关于本站</a>
        <a href="units/submit/">收录申请</a>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">粤ICP备XXXXXXXX号</a>
      </nav>
      <div class="footer__tools">
        <button type="button" class="footer__random" id="random-site">随机漫步</button>
        <button type="button" class="theme-toggle" id="theme-toggle" aria-label="切换深色/浅色模式" aria-pressed="false">
          <svg class="theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>
          <svg class="theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </div>
    </div>
  </footer>

  <!-- 回到顶部按钮 -->
  <button type="button" class="back-to-top" id="back-to-top" aria-label="回到顶部" hidden>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor"/></svg>
  </button>

  <script src="assets/js/main.js" defer></script>
</body>
</html>
"""


def build_cards(rows):
    """生成全部卡片 HTML。v4.1：type 变化处插入 grid-break 强制换行，
    不同类型的卡片绝不在同一行显示。"""
    parts = []
    prev_type = None
    for r in rows:
        t = str(r.get("type") or "").strip()
        if prev_type is not None and t != prev_type:
            parts.append('<div class="grid-break" aria-hidden="true"></div>')
        prev_type = t
        parts.append(build_card(r))
    return "".join(parts)


def main():
    rows = load_rows()
    if not rows:
        sys.exit("错误：links.xlsx 中没有数据行。")
    print(f"读取 {len(rows)} 条记录")
    category_buttons = build_category_buttons(rows)
    cards = build_cards(rows)
    engine_primary, engine_track = build_engine_buttons()
    page = build_page(category_buttons, cards, engine_primary, engine_track, len(rows))
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(page)
    cats = [str(r.get("分类") or "").strip() for r in rows]
    print("已生成:", OUT_PATH)
    print("分类:", " / ".join(dict.fromkeys(cats)))
    print("type 分布:", {t: sum(1 for r in rows if str(r.get('type')).strip() == t) for t in ('1', '2', '3')})
    print(f"引擎: {len(ENGINES)} 个（主{sum(1 for e in ENGINES if e[3])} + 滑道{sum(1 for e in ENGINES if not e[3])}）")


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    main()
