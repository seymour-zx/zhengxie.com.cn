# -*- coding: utf-8 -*-
"""
build_homeplus.py —— miniworld 页面生成器（第 8 步，片段化拼装版）
================================================================
读 cards.unified.xlsx + pages.unified.xlsx → 生成全部导航产品页（首页/专题页/专题导航 hub）。

片段化拼装（契约 03 §二，D-16）：
- 页面 = 骨架 + 片段，全部由 pages.unified.xlsx 字段驱动，**py 无页面特判**
- 片段：head 元信息（自动）/ GA4（stat_ga4）/ 百度统计（stat_baidu）/ 广告位（ad_slots）/ 搜索框（search_box）/ 导语（channel_intro_enabled+channel_intro）/ 卡片区（dir_path）/ footer / 首次访问声明条

xlsx 读取健壮性（契约 02 §一·B）：
- 读第一个 tab / 自动识别表头行 / 列乱序不影响 / 额外列安全

排序（契约 02 §二，与旧世界一致）：
- 分类按钮 = 分类名首次出现顺序；卡片 = 先 card_layout（type 1→2→3）再 row_seq；py 不重排

用法：
    python assets/.build/build_homeplus.py
"""
import os
import re
import sys
import json
import hashlib
import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(os.path.dirname(HERE))      # 新世界根
XLSX = os.path.join(BASE, "assets", "xlsx")
CARDS = os.path.join(XLSX, "cards.unified.xlsx")
PAGES = os.path.join(XLSX, "pages.unified.xlsx")

SITE_DOMAIN = "https://zhengxie.com.cn"
BRAND = "正协导航"
SLOGAN = "让每一次寻找，都不止于找到"

# ── 资源版本戳（内容 hash，防浏览器缓存不同步——2026-08-30 造物主拍板方案 A）──
def asset_ver(abs_path):
    """取文件内容 md5 前 8 位作版本号；文件不可读返回 '0'。"""
    try:
        return hashlib.md5(open(abs_path, "rb").read()).hexdigest()[:8]
    except OSError:
        return "0"

CSS_VER = asset_ver(os.path.join(BASE, "assets", "css", "style.css"))
JS_VER = asset_ver(os.path.join(BASE, "assets", "js", "main.js"))

# ── 广告位片段库（契约 03 §七：编号 = 片段索引；新增需 AdSense 后台建单元拿 slot）──
AD_SLOTS = {
    1: ('<aside class="ad ad--top" aria-label="广告">'
        '<p class="ad__label">广告</p>'
        '<ins class="adsbygoogle" style="display:block" '
        'data-ad-client="ca-pub-6434243103158481" data-ad-slot="5952548493" '
        'data-ad-format="auto" data-full-width-responsive="true"></ins>'
        '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script></aside>'),
    2: ('<aside class="ad ad--bottom" aria-label="广告">'
        '<p class="ad__label">广告</p>'
        '<ins class="adsbygoogle" style="display:block" '
        'data-ad-client="ca-pub-6434243103158481" data-ad-slot="4856101005" '
        'data-ad-format="auto" data-full-width-responsive="true"></ins>'
        '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script></aside>'),
}
AD_LOADER = ('<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
             '?client=ca-pub-6434243103158481" crossorigin="anonymous"></script>')
GA4_SCRIPT = ('<script async src="https://www.googletagmanager.com/gtag/js?id=G-B880S4NQVK"></script>'
              '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}'
              'gtag("js",new Date());gtag("config","G-B880S4NQVK");</script>')
BAIDU_SCRIPT = ('<script>var _hmt=_hmt||[];(function(){var hm=document.createElement("script");'
                'hm.src="https://hm.baidu.com/hm.js?2f4df5057c929092e36a0d6357e35261";'
                'var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s);})();</script>')
FOUC = ('<script>(function(){try{var t=localStorage.getItem("zx_theme");'
        'if(t==="dark"){document.documentElement.setAttribute("data-theme","dark");}}catch(e){}})();</script>')

# 首次访问声明条 JS 已收敛到 assets/js/main.js（单一真源，2026-08-31 造物主决议）。
# 不再内联进 HTML：消除与 main.js 的重复维护，并去除内联脚本的 CSP 隐患。
# 收敛后声明条逻辑仅由 main.js 顶部 IIFE 负责（详见 assets/js/main.js 第 13 节）。


def read_xlsx(path):
    """读 xlsx 第一个 tab，自动识别表头行，返回 (header, rows)，rows 为 dict 列表。"""
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.worksheets[0]
    it = ws.iter_rows(values_only=True)
    header = None
    rows = []
    for r in it:
        if not r or all(c is None for c in r):
            continue
        vals = ["" if v is None else v for v in r]
        # 自动识别表头行：含关键列名
        keys = [str(v).strip().lower() for v in vals if v != ""]
        if header is None:
            if any(k in ("row_seq", "dir_path") for k in keys):
                header = [str(v).strip() for v in vals]
                continue
            continue
        if len(vals) < len(header):
            vals = vals + [""] * (len(header) - len(vals))
        rows.append({header[i]: vals[i] for i in range(len(header)) if header[i]})
    wb.close()
    return header, rows


def load_pages():
    _, rows = read_xlsx(PAGES)
    pages = {}
    for r in rows:
        dp = str(r.get("dir_path") or "").strip()
        if dp:
            pages[dp] = r
    return pages


def load_cards():
    _, rows = read_xlsx(CARDS)
    return rows


def val(r, k, default=""):
    v = r.get(k)
    return default if v is None or v == "" else str(v).strip()


def int_val(r, k, default=0):
    try:
        return int(r.get(k) or default)
    except (ValueError, TypeError):
        return default


# ── 片段生成 ──────────────────────────────────────────────

def frag_head(page, dp, has_ad, rel="", pages=None):
    """head 元信息（自动生成：title/meta/OG/Twitter/JSON-LD/canonical 同源联动）"""
    title = val(page, "title") or f"{BRAND} - {SLOGAN}"
    desc = val(page, "description")
    kws = val(page, "keywords")
    canonical = SITE_DOMAIN + ("/" if dp == "/" else "/" + dp + "/")
    jsonld = build_jsonld(page, dp, canonical, pages)
    pre = []
    if val(page, "stat_ga4") in ("True", "1", "true"):
        pre.append('<link rel="preconnect" href="https://www.googletagmanager.com">')
    if val(page, "stat_baidu") in ("True", "1", "true"):
        pre.append('<link rel="preconnect" href="https://hm.baidu.com">')
    if has_ad:
        pre.append('<link rel="preconnect" href="https://pagead2.googlesyndication.com">')
    return f"""  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="referrer" content="no-referrer">
  <meta name="description" content="{esc(desc)}">
  <meta name="keywords" content="{esc(kws)}">
  <meta name="author" content="{BRAND}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{canonical}">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{SITE_DOMAIN}/assets/images/logo.svg">
  <meta property="og:site_name" content="{BRAND}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{esc(title)}">
  <meta name="twitter:description" content="{esc(desc)}">
  <meta name="theme-color" content="#9E1B22" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#1E1B1F" media="(prefers-color-scheme: dark)">
  <link rel="manifest" href="{rel}assets/json/manifest.json">
  <link rel="stylesheet" href="{rel}assets/css/style.css?v={CSS_VER}">
  <link rel="icon" type="image/svg+xml" href="{rel}assets/images/logo.svg">
  <link rel="apple-touch-icon" href="{rel}assets/images/logo.svg">
  {FOUC}
  {''.join(pre)}
  {GA4_SCRIPT if val(page, 'stat_ga4') in ('True', '1', 'true') else ''}
  {BAIDU_SCRIPT if val(page, 'stat_baidu') in ('True', '1', 'true') else ''}
  {AD_LOADER if has_ad else ''}
  <title>{esc(title)}</title>
""" + "".join(f'  <script type="application/ld+json">{b}</script>\n' for b in jsonld)


def build_jsonld(page, dp, canonical, pages=None):
    """返回 JSON-LD 块列表（每块一个 <script>）。"""
    title = val(page, "title") or BRAND
    desc = val(page, "description")
    if dp == "/":
        return [json.dumps({
            "@context": "https://schema.org", "@type": "WebSite",
            "name": title, "url": canonical, "description": desc,
            "potentialAction": {"@type": "SearchAction",
                                "target": canonical + "?q={search_term_string}",
                                "query-input": "required name=search_term_string"},
        }, ensure_ascii=False)]
    if dp == "topics":
        # 对齐旧世界频道导航 hub：CollectionPage + mainEntity ItemList（专题列表）+ BreadcrumbList
        order = ["/", "topics/gov", "topics/search"]
        labels = {"/": "政协专题", "topics/gov": "政务导航", "topics/search": "搜索工具"}
        items = []
        pos = 1
        for d in order:
            if pages and d in pages:
                items.append({"@type": "ListItem", "position": pos, "name": labels.get(d, d),
                              "url": SITE_DOMAIN + ("/" if d == "/" else "/" + d + "/")})
                pos += 1
        hub_ld = json.dumps({
            "@context": "https://schema.org", "@type": "CollectionPage",
            "name": title, "url": canonical, "description": desc,
            "isPartOf": {"@type": "WebSite", "name": BRAND, "url": SITE_DOMAIN + "/"},
            "mainEntity": {"@type": "ItemList", "numberOfItems": len(items), "itemListElement": items},
        }, ensure_ascii=False)
        bc_hub = json.dumps({"@context": "https://schema.org", "@type": "BreadcrumbList",
                             "itemListElement": [
                                 {"@type": "ListItem", "position": 1, "name": "首页", "item": SITE_DOMAIN + "/"},
                                 {"@type": "ListItem", "position": 2, "name": "专题导航", "item": canonical},
                             ]}, ensure_ascii=False)
        return [hub_ld, bc_hub]
    # 专题页：WebPage + BreadcrumbList（面包屑：首页 › 专题导航 › 本专题）
    page = json.dumps({"@context": "https://schema.org", "@type": "WebPage",
                       "name": title, "url": canonical, "description": desc,
                       "isPartOf": {"@type": "WebSite", "name": BRAND,
                                    "url": SITE_DOMAIN + "/"}}, ensure_ascii=False)
    topic_name = title.split(" - ")[0]
    bc = json.dumps({"@context": "https://schema.org", "@type": "BreadcrumbList",
                     "itemListElement": [
                         {"@type": "ListItem", "position": 1, "name": "首页", "item": SITE_DOMAIN + "/"},
                         {"@type": "ListItem", "position": 2, "name": "专题导航", "item": SITE_DOMAIN + "/topics/"},
                         {"@type": "ListItem", "position": 3, "name": topic_name, "item": canonical},
                     ]}, ensure_ascii=False)
    return [page, bc]


def frag_search_box():
    """集合搜索框：还原旧世界 engine 页结构（hero__search + hero__engines 主引擎 + hero__searchrow + track 更多引擎滑道）。
    main.js 用 [data-engine] 绑定 + #engine-input，类名必须匹配旧 CSS。"""
    main_engines = [
        ("baidu", "https://www.baidu.com/s?wd=", "百度", False),
        ("google", "https://www.google.com/search?q=", "Google", True),
        ("bing", "https://www.bing.com/search?q=", "必应", False),
    ]
    more_engines = [
        ("taobao", "https://s.taobao.com/search?q=", "淘宝"),
        ("jd", "https://search.jd.com/Search?keyword=", "京东"),
        ("pdd", "https://mobile.yangkeduo.com/search_result.html?search_key=", "拼多多"),
        ("zhihu", "https://www.zhihu.com/search?q=", "知乎"),
        ("baike", "https://baike.baidu.com/item/", "百度百科"),
        ("wiki", "https://zh.wikipedia.org/w/index.php?search=", "维基百科"),
        ("bilibili", "https://search.bilibili.com/all?keyword=", "B站"),
        ("douyin", "https://www.douyin.com/search/", "抖音"),
        ("github", "https://github.com/search?q=", "GitHub"),
        ("stackoverflow", "https://stackoverflow.com/search?q=", "Stack Overflow"),
        ("juejin", "https://juejin.cn/search?query=", "掘金"),
        ("weibo", "https://s.weibo.com/weibo?q=", "微博"),
        ("weixin", "https://weixin.sogou.com/weixin?type=2&query=", "微信搜一搜"),
        ("toutiao", "https://so.toutiao.com/search?keyword=", "头条搜索"),
        ("music163", "https://music.163.com/#/search/m/?s=", "网易云音乐"),
        ("youdao", "https://dict.youdao.com/search?q=", "有道翻译"),
        ("amap", "https://www.amap.com/search/?query=", "高德地图"),
        ("scholar", "https://scholar.google.com/scholar?q=", "Google Scholar"),
    ]
    main_html = "".join(
        f'<button type="button" data-engine="{k}" data-url="{esc(u)}"'
        f'{" class=\"active\"" if act else ""} aria-pressed="{"true" if act else "false"}">{esc(n)}</button>'
        for k, u, n, act in main_engines
    )
    more_html = "".join(
        f'<button type="button" data-engine="{k}" data-url="{esc(u)}" aria-pressed="false">{esc(n)}</button>'
        for k, u, n in more_engines
    )
    return f"""    <form class="hero__search" id="engine-search" action="#" role="search" aria-label="集合搜索">
      <div class="hero__engines" role="tablist" aria-label="主搜索引擎">
        {main_html}
      </div>
      <div class="hero__searchrow">
        <input type="search" id="engine-input" placeholder="输入关键词，搜索全网" autocomplete="off">
        <button type="submit">搜一下</button>
      </div>
      <div class="track hero__engines-track" role="tablist" aria-label="更多引擎">
        {more_html}
      </div>
    </form>
"""


def frag_intro(page):
    enabled = val(page, "channel_intro_enabled") in ("True", "1", "true")
    content = val(page, "channel_intro")
    if enabled and content:
        return f'    <section class="channel-intro" aria-label="专题介绍">\n      <p class="channel-intro__desc">{esc(content)}</p>\n    </section>\n'
    return ""


def frag_ads(slot_numbers):
    """按插槽 CSS 类拆分顶部/底部广告片段：含 ad--bottom 类 → 底部，其余 → 顶部。
    返回 (top_html, bottom_html)；无对应插槽时返回空串。
    修复：原实现把 slot 1/2 拼成一段只插在顶部，导致 ad--bottom 也跑到页面上部。"""
    top, bottom = [], []
    for n in slot_numbers:
        if n not in AD_SLOTS:
            continue
        frag = "  " + AD_SLOTS[n]
        (bottom if "ad--bottom" in AD_SLOTS[n] else top).append(frag)
    return ("\n".join(top) + "\n" if top else "",
            "\n".join(bottom) + "\n" if bottom else "")


def frag_category_nav(categories, active="all"):
    """分类导航：还原旧世界结构——category-nav__inner + logo 双文字 + ul.category-nav__list.track 滑道（id=category-bar，main.js 依赖）+ 文本星标 fav + random-bar。
    结构与旧世界 index.html 一致，main.js / style.css 继承自旧世界，类名必须匹配。"""
    btns = []
    for c in categories:
        btns.append(f'<li><h2><button type="button" class="category-btn" data-cat="{esc(c)}" aria-pressed="false">{esc(c)}</button></h2></li>')
    return """  <nav class="category-nav" aria-label="分类筛选">
    <div class="wrap category-nav__inner">
      <button type="button" class="category-nav__logo category-btn active" data-cat="all" aria-pressed="true" aria-label="全部">
        <span class="logo__brand" aria-hidden="true"><span>""" + esc(BRAND.split("导航")[0]) + """</span><span>导航</span></span>
        <span class="logo__all" aria-hidden="true">全部</span>
      </button>
      <ul class="category-nav__list track" id="category-bar">""" + "\n".join("        " + b for b in btns) + """
      </ul>
      <button type="button" class="category-nav__fav" id="fav-toggle" aria-pressed="false" aria-label="本地收藏">
        <span class="category-nav__fav-star" aria-hidden="true">☆</span>
        <span class="category-nav__fav-text" aria-hidden="true"><span>本地</span><span>收藏</span></span>
      </button>
    </div>
    <div class="random-bar" id="random-bar" hidden>
      <span>🎲 随机漫步</span>
      <button type="button" class="random-btn" id="random-refresh">换一批</button>
      <button type="button" class="random-btn random-btn--ghost" id="random-exit">退出</button>
    </div>
  </nav>
"""


def frag_scroll_btns():
    """滚动按钮组：4 个独立按钮（up/top/down/bottom），按滚动位置只显示 1 个。
    还原旧世界结构（id=scroll-btns，main.js 依赖 data-target 循环切换）。"""
    return """  <!-- 滚动按钮组：4 个独立按钮，按滚动位置只显示 1 个 -->
  <div class="scroll-btns" id="scroll-btns">
    <button type="button" class="scroll-btn scroll-btn--up" data-target="up" aria-label="向上滚到分类容器下方">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor"/>
      </svg>
    </button>
    <button type="button" class="scroll-btn scroll-btn--top" data-target="top" aria-label="到顶部">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 2.5h18v2h-18z" fill="currentColor"/>
        <path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor"/>
      </svg>
    </button>
    <button type="button" class="scroll-btn scroll-btn--down" data-target="down" aria-label="向下滚到分类容器下方">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20l-8-8h5v-8h6v8h5z" fill="currentColor"/>
      </svg>
    </button>
    <button type="button" class="scroll-btn scroll-btn--bottom" data-target="bottom" aria-label="到底部">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20l-8-8h5v-8h6v8h5z" fill="currentColor"/>
        <path d="M3 19.5h18v2h-18z" fill="currentColor"/>
      </svg>
    </button>
  </div>
"""


def frag_star_sprite():
    return ('<svg width="0" height="0" aria-hidden="true" focusable="false" '
            'style="position:absolute;width:0;height:0;overflow:hidden">'
            '<symbol id="zx-fav-star" viewBox="0 0 24 24">'
            '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 '
            '9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="none" stroke="currentColor" '
            'stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></symbol></svg>')


def parse_tags(raw):
    """tags 用英文逗号分隔，去空去重，保持顺序"""
    seen = []
    for t in str(raw or "").split(","):
        t = t.strip()
        if t and t not in seen:
            seen.append(t)
    return seen


def collect_links(c):
    """从 linkN_name/linkN_url 组读取链接（url 非空才计入；name 缺省回退 url）。
    按 link1→linkN 顺序，保证第 1 组优先作收藏 key / JSON-LD 首项。"""
    items = []
    for n in range(1, 11):
        name = val(c, f"link_{n}_name")
        url = val(c, f"link_{n}_url")
        if url:
            items.append((name or url, url))
    return items


_DOMAIN_RE = re.compile(r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$")
_IP_RE = re.compile(r"^\d{1,3}(?:\.\d{1,3}){3}$")


def is_url(s):
    """合规 URL：http/https + 合法主机（域名/IP/localhost）。不合规视为空 → 文字占位。"""
    s = (s or "").strip()
    if not s.startswith(("http://", "https://")):
        return False
    rest = s.split("://", 1)[1].split("/", 1)[0].split("?", 1)[0].split("#", 1)[0]
    host = rest.rsplit("@", 1)[-1].split(":")[0].strip("[]").lower()
    if host == "localhost" or _IP_RE.match(host):
        return True
    return bool(_DOMAIN_RE.match(host))


def first_char(title):
    """取标题首字符做文字 logo；英文首字母大写"""
    s = (title or "").strip()
    if not s:
        return "站"
    ch = s[0]
    return ch.upper() if ch.isascii() and ch.isalpha() else ch


_COLOR_RE = re.compile(
    r"^\s*("
    r"#[0-9a-fA-F]{3,8}"
    r"|rgba?\s*\([^)]*\)"
    r"|hsla?\s*\([^)]*\)"
    r"|transparent"
    r")\s*$"
)
_NAMED_COLORS = {
    "transparent", "black", "white", "red", "green", "blue", "yellow", "orange",
    "purple", "gray", "grey", "cyan", "magenta", "pink", "brown", "lime",
    "navy", "teal", "silver", "gold", "maroon", "olive", "aqua", "fuchsia",
}


def is_color(s):
    """判是否为 CSS 合法颜色值（#hex/rgb()/rgba()/hsl()/hsla()/transparent/常见颜色名）。"""
    s = (s or "").strip()
    if not s:
        return False
    m = _COLOR_RE.match(s)
    if not m:
        return s.lower() in _NAMED_COLORS
    grp = m.group(1)
    if grp.startswith("#") or grp == "transparent":
        return True
    # rgb/rgba/hsl/hsla：校验参数范围
    inner = grp[grp.find("(") + 1:grp.rfind(")")]
    parts = [p.strip() for p in inner.split(",") if p.strip() != ""]
    if len(parts) not in (3, 4):
        return False
    try:
        for i, p in enumerate(parts):
            if i == 3:  # alpha
                if not (0.0 <= float(p) <= 1.0):
                    return False
            elif p.endswith("%"):
                if not (0 <= int(p[:-1]) <= 100):
                    return False
            else:
                if grp.startswith("hsl"):
                    if not (0 <= int(p) <= 360):
                        return False
                elif not (0 <= int(p) <= 255):
                    return False
    except ValueError:
        return False
    return True


# ── 外链属性预设（继承旧世界：同主域/同族/营销/评论/公开/默认）──
SAME_DOMAIN_ATTR = 'target="_self"'  # 同主域站：原地打开
SAME_FAMILY_ATTR = 'target="_blank" rel="noopener"'
MARKETING_ATTR = 'target="_blank" rel="sponsored noopener noreferrer nofollow"'
UGCCOMMENT_ATTR = 'target="_blank" rel="ugc noopener noreferrer nofollow"'
EXPOSED_ATTR = 'target="_blank" rel="noopener" referrerpolicy="origin"'  # 政务官方：公开来源、传递权重
DEFAULT_LINK_ATTR = 'target="_blank" rel="nofollow noopener noreferrer"'
SAME_FAMILY = ["zhengxie.info", "zhengxie.com.cn"]
MARKETING = []
UGCCOMMENT = []
EXPOSED = ["beian.miit.gov.cn", "gov.cn"]  # .gov.cn 全覆盖（含 www/cppcc/各省市）


def link_attr(url):
    """同主域 → 原地打开；命中预设域名 → 对应属性；均未命中 → DEFAULT（nofollow）。"""
    try:
        host = (url or "").split("://", 1)[-1].split("/", 1)[0]
        host = host.rsplit("@", 1)[-1].split(":")[0].strip("[]").lower()
    except Exception:
        return DEFAULT_LINK_ATTR
    if not host:
        return DEFAULT_LINK_ATTR
    site_host = SITE_DOMAIN.split("://", 1)[-1].split("/", 1)[0].split(":")[0].lower()
    if host == site_host or host.endswith("." + site_host):
        return SAME_DOMAIN_ATTR
    for d in SAME_FAMILY + MARKETING + UGCCOMMENT + EXPOSED:
        d = d.lower().strip()
        if d and (host == d or host.endswith("." + d)):
            if d in SAME_FAMILY:
                return SAME_FAMILY_ATTR
            if d in MARKETING:
                return MARKETING_ATTR
            if d in UGCCOMMENT:
                return UGCCOMMENT_ATTR
            return EXPOSED_ATTR
    return DEFAULT_LINK_ATTR


def build_media(media, title):
    """卡片图区：5 形态（与旧世界一致）——纯URL图 / URL+色衬底 / 纯色块 / 字符+色 / 标题首字兜底 fallback"""
    raw = (media or "").strip()
    if "," in raw:
        head, _, tail = raw.partition(",")
        head, tail = head.strip(), tail.strip()
    else:
        head, tail = raw, ""
    img_tpl = ('<div class="card__media">'
               '<img class="card__media-img" src="{src}" alt="" '
               'loading="lazy" decoding="async" referrerpolicy="no-referrer" '
               'onerror="this.remove()"></div>')
    if is_url(head) and not tail:
        return img_tpl.format(src=esc(head))
    if is_url(head) and tail and is_color(tail):
        return ('<div class="card__media" style="background:{bg}">'
                '<img class="card__media-img" src="{src}" alt="" '
                'loading="lazy" decoding="async" referrerpolicy="no-referrer" '
                'onerror="this.remove()"></div>').format(bg=esc(tail), src=esc(head))
    if is_url(head):
        return img_tpl.format(src=esc(head))
    if is_color(head):
        return ('<div class="card__media card__media--color" '
                'style="background:{bg}"></div>').format(bg=esc(head))
    if tail and is_color(tail):
        return ('<div class="card__media" style="background:{bg}">'
                '<span class="card__media-fallback">{ch}</span></div>').format(bg=esc(tail), ch=esc(head))
    return ('<div class="card__media">'
            '<span class="card__media-fallback" aria-hidden="true">{fb}</span></div>').format(fb=esc(first_char(title)))


def build_tags(category, tags):
    """标签行：分类名自动放第 1 位，其余标签随后（去重）——按钮可点击筛选"""
    parts = [f'<button type="button" class="card__tag card__tag--cat" '
             f'data-tag="{esc(category)}">{esc(category)}</button>']
    for t in tags:
        if t == category:
            continue
        parts.append(f'<button type="button" class="card__tag" '
                     f'data-tag="{esc(t)}">{esc(t)}</button>')
    return '<div class="card__tags">' + "".join(parts) + "</div>"


def build_links(links):
    """卡片外链：按域名匹配属性（link_attr）+ 箭头；无链接 → 空 div 占位（与旧世界一致）。
    造物主拍板：无链接卡「空行占位就行」，不加任何提示文字（如暂无网址），备注列由造物主在 xlsx 自加。"""
    if not links:
        return '<div class="card__links"></div>'
    parts = []
    for name, url in links:
        attr = link_attr(url)
        parts.append(f'<a class="card__link" href="{esc(url)}" '
                     f'{attr}>{esc(name)}<span class="card__link-arrow" aria-hidden="true">↗</span></a>')
    return '<div class="card__links">' + "".join(parts) + "</div>"


FAV_SVG = '<svg aria-hidden="true" focusable="false"><use href="#zx-fav-star"></use></svg>'


def frag_card(c):
    """卡片渲染：对齐旧世界 build_card（type 类 / media 5 形态 / tags 按钮 / links 属性+箭头 / fav key 规则）
    + 新世界新增：is_ad 广告标识（True=广告卡）。无链接卡 = 空行占位（与旧世界一致，不加提示文字，造物主拍板）。"""
    t = val(c, "card_title")
    d = val(c, "card_desc")
    cat = val(c, "cat_name")
    layout = val(c, "card_layout", "1")
    cls = {"1": "card--t1", "2": "card--t2", "3": "card--t3"}.get(layout, "card--t2")
    is_ad = val(c, "is_ad") in ("True", "1", "true")
    media_html = build_media(val(c, "card_media"), t)
    tags_html = build_tags(cat, parse_tags(val(c, "card_tags")))
    links = collect_links(c)
    links_html = build_links(links)
    # 收藏 key：有链接用首个 URL（最稳）；无链接回退 标题#row_seq
    if links:
        fav_key = links[0][1]
    else:
        fav_key = f"{(t or cat or 'card')}#{val(c, 'row_seq')}"
    ad_label = '<span class="card__ad-label">广告</span>' if is_ad else ""
    return (f'    <article class="card {cls}{" card--ad" if is_ad else ""}" data-cat="{esc(cat)}">'
            f'{ad_label}{media_html}'
            f'<h3 class="card__title">{esc(t)}</h3>'
            f'<button type="button" class="card__fav" data-key="{esc(fav_key)}" '
            f'aria-label="收藏/取消收藏" aria-pressed="false">{FAV_SVG}</button>'
            f'<p class="card__desc">{esc(d)}</p>'
            f'{tags_html}{links_html}'
            f'</article>\n')


def frag_consent_bar():
    return """  <div class="official-banner" id="consent-bar" role="note" aria-label="声明">
    <p class="official-banner__text">本站为独立第三方导航站，与任何官方机构无隶属关系、无官方授权；收录链接仅作索引聚合，不代表本站立场或担保。</p>
    <button type="button" class="official-banner__close" id="consent-close" aria-label="关闭">×</button>
  </div>
"""


def frag_footer(rel="", show_random=True):
    tools = ""
    if show_random:
        tools += '        <button type="button" class="footer__random" id="random-site">随机漫步</button>\n'
    tools += '''        <button type="button" class="theme-toggle" id="theme-toggle" aria-label="切换深色/浅色模式" aria-pressed="false">
          <svg class="theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>
          <svg class="theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>'''
    return f"""  <footer class="footer">
    <div class="footer__inner wrap">
      <p class="footer__copyright">© 2026 {BRAND} · {SLOGAN}</p>
      <nav class="footer__nav" aria-label="页脚导航">
        <a target="_self" href="{SITE_DOMAIN}/">首页</a>
        <a target="_self" href="{SITE_DOMAIN}/topics/">专题导航</a>
        <a target="_self" href="{SITE_DOMAIN}/pages/overview/">网站全景</a>
        <a target="_self" href="{SITE_DOMAIN}/pages/guide/">使用指南</a>
        <a target="_self" href="{SITE_DOMAIN}/pages/submit/">收录申请</a>
        <a target="_self" href="{SITE_DOMAIN}/pages/about/">关于本站</a>
        <a target="_self" href="{SITE_DOMAIN}/pages/contact/">联系我们</a>
        <a target="_self" href="{SITE_DOMAIN}/pages/privacy/">隐私政策</a>
        <a target="_self" href="{SITE_DOMAIN}/pages/disclaimer/">免责声明</a>
        <a target="_self" href="{SITE_DOMAIN}/pages/sitemap/">站点地图</a>
        <a target="_self" href="{SITE_DOMAIN}/pages/changelog/">更新日志</a>
      </nav>
      <div class="footer__tools">
{tools}      </div>
    </div>
  </footer>
"""


def esc(s):
    s = str(s)
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


# ── 页面组装 ──────────────────────────────────────────────

def build_page(dp, page, cards, categories, pages):
    """生成页面：分类按钮只显示本页分类（首次出现顺序）；topics hub 页罗列专题。"""
    # 相对路径前缀（本地 file:// 与 GitHub Pages 根/子路径均兼容，对齐旧世界相对路径规范）
    depth = 0 if dp in ("/", "") else len(dp.split("/"))
    rel = ("../" * depth) if depth else ""
    has_ad = bool(page.get("ad_slots"))
    slot_numbers = []
    if has_ad:
        for part in str(page.get("ad_slots") or "").split(","):
            p = part.strip()
            if p.isdigit():
                slot_numbers.append(int(p))
    search_box = frag_search_box() if val(page, "search_box") in ("True", "1", "true") else ""
    intro = frag_intro(page)
    ads_top, ads_bottom = frag_ads(slot_numbers)
    # 卡片区分组渲染：先 type 再 row_seq；本页分类 = 本页卡片 cat 首次出现顺序
    page_cards = [c for c in cards if val(c, "dir_path") == dp]
    page_cards.sort(key=lambda c: (int_val(c, "card_layout", 99), int_val(c, "row_seq", 0)))
    page_cats = []
    for c in page_cards:
        cat = val(c, "cat_name")
        if cat and cat not in page_cats:
            page_cats.append(cat)
    # topics hub 页：完全独立的频道导航页（channel-grid/channel-card，不走统一模板）
    if dp == "topics":
        return build_topics_hub(page, pages, rel)
    else:
        # 卡片渲染：type 变化处插入 grid-break 强制换行（契约 02：type 1→2→3 分行；与旧世界 build_cards 一致）
        parts = []
        prev_type = None
        for c in page_cards:
            t = val(c, "card_layout", "1")
            if prev_type is not None and t != prev_type:
                parts.append('<div class="grid-break" aria-hidden="true"></div>')
            prev_type = t
            parts.append(frag_card(c))
        cards_html = "".join(parts)
        nav = frag_category_nav(page_cats)
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
{frag_head(page, dp, bool(slot_numbers), rel, pages)}</head>
<body>
  {frag_star_sprite()}
  <a href="#cards-container" class="skip-link">跳到主内容</a>
  {frag_consent_bar()}
  <header class="hero">
    <h1 class="hero__logo">{BRAND}</h1>
    <p class="hero__slogan">{SLOGAN}</p>
{search_box}{intro}  </header>
{ads_top}  <div class="sticky-top">
{nav}    <section class="site-search" aria-label="站内筛选">
      <div class="wrap">
        <input type="search" id="site-search-input" placeholder="在正协导航内筛选：标题 / 描述 / 分类 / 标签" autocomplete="off">
      </div>
    </section>
    <section class="result-count wrap" aria-label="筛选结果统计">
      <p class="result-count__text" id="result-count">共 {len(page_cards)} 张卡片</p>
    </section>
    <section class="filter-tags wrap" id="filter-tags" aria-label="筛选标签">
      <span class="filter-tags__hint" id="filter-tags-hint">当前筛选：</span>
      <div class="track filter-tags__track" id="filter-tags-track"></div>
      <button type="button" class="filter-tag__clear" id="filter-tag-clear" hidden>清除筛选</button>
    </section>
  </div>
  <main class="cards-container wrap" id="cards-container" aria-label="卡片列表">
{cards_html}  </main>
  <div class="empty-state" id="empty-state" hidden><p class="empty-state__text">没有找到匹配的结果，换个关键词或分类试试</p></div>
{ads_bottom}{frag_footer(rel)}
{frag_scroll_btns()}
  <script src="{rel}assets/js/main.js?v={JS_VER}"></script>
</body>
</html>
"""
    return html


CHANNEL_CSS = """<style>
    .channel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .channel-card {
      display: flex; flex-direction: column; align-items: flex-start;
      background: var(--bg, #fff);
      border: 1px solid var(--gold, #C9A227);
      border-top: 4px solid var(--red, #9E1B22);
      border-radius: 12px; padding: 28px 24px;
      text-decoration: none; color: inherit;
      transition: transform .18s ease, box-shadow .18s ease;
    }
    .channel-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(158,27,34,.16);
    }
    .channel-card__icon {
      width: 52px; height: 52px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--serif, serif); font-size: 26px; font-weight: 700;
      color: #fff; background: linear-gradient(135deg, #9E1B22, #C0392B);
      margin-bottom: 16px;
    }
    .channel-card__title {
      font-family: var(--serif, serif); font-size: 22px; color: var(--red, #9E1B22);
      margin: 0 0 10px;
    }
    .channel-card__desc {
      font-size: 14px; line-height: 1.8; color: var(--text-sub, #555);
      margin: 0 0 18px; flex: 1;
    }
    .channel-card__more {
      font-size: 14px; font-weight: 600; color: var(--gold-deep, #A8841A);
    }
    .channel-card:hover .channel-card__more { color: var(--red, #9E1B22); }
  </style>"""


HUB_THEME_SCRIPT = """  <script>
    (function () {
      var themeToggle = document.getElementById('theme-toggle');
      if (!themeToggle) return;
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      themeToggle.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme') === 'dark';
        var next = current ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('zx_theme', next); } catch (e) {}
        themeToggle.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
      });
    })();
  </script>"""


def build_topics_hub(page, pages, rel):
    """专题导航 hub：完全还原旧世界频道导航页（channel-grid/channel-card + 独立 main，不走统一模板）。
    旧 hub 页 = hero + 标题区 + channel-grid（首字图标卡）+ 非官方声明 + footer；head 内联 channel 样式。"""
    dp = "topics"
    head = frag_head(page, dp, False, rel, pages) + "\n" + CHANNEL_CSS
    order = ["/", "topics/gov", "topics/search"]
    labels = {"/": "政协专题", "topics/gov": "政务导航", "topics/search": "搜索工具"}
    icons = {"/": "协", "topics/gov": "政", "topics/search": "搜"}
    descs = {
        "/": "政协与民主党派官方入口，按层级与组织分类陈列，链接直达官网、域名可见。",
        "topics/gov": "全国人民代表大会及地方各级人大，与国务院、国家政务服务平台及主要组成部门的官方入口，覆盖立法监督、宏观政策、民生办事与行业监管等权威政务信息，一键直达官方平台。",
        "topics/search": "聚合全网搜索工具入口：在站内一键调用 Google、必应、百度等检索，并收录购物、社区、开发、知识等各类搜索工具。",
    }
    cards = []
    for d in order:
        if d in pages:
            url = SITE_DOMAIN + ("/" if d == "/" else "/" + d + "/")   # 页面导航内链 = 完整 URL（造物主拍板 B 方案）
            cards.append(f"""      <a class="channel-card" href="{url}">
        <div class="channel-card__icon" aria-hidden="true">{icons.get(d, '站')}</div>
        <h3 class="channel-card__title">{labels.get(d, d)}</h3>
        <p class="channel-card__desc">{descs.get(d, '')}</p>
        <span class="channel-card__more">进入频道 →</span>
      </a>""")
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
{head}</head>
<body>
  {frag_star_sprite()}
  <a href="#main-content" class="skip-link">跳到主内容</a>

  <header class="hero">
    <h1 class="hero__logo">{BRAND}</h1>
    <p class="hero__slogan">{SLOGAN}</p>
  </header>

  <main class="wrap" id="main-content" style="padding: 48px 16px 60px; max-width: 960px;">
    <section style="text-align:center; margin-bottom: 40px;">
      <h2 style="font-family: var(--serif); font-size: 32px; color: var(--red); margin: 0 0 12px;">专题导航</h2>
      <p style="font-size: 15px; color: var(--text-sub); line-height: 1.8; max-width: 640px; margin: 0 auto;">
        正协导航按主题划分独立专题，每个专题汇集一类权威官方入口。以下为当前已上线的专题：
      </p>
    </section>

    <div class="channel-grid">
{chr(10).join(cards)}
    </div>

    <p style="font-size: 13px; color: var(--text-sub); text-align:center; margin-top: 36px; line-height: 1.8;">
      本站为独立第三方导航站，与任何官方机构无隶属关系。收录链接仅作索引聚合，不代表本站立场或担保。
    </p>
  </main>

{frag_footer(rel, show_random=False)}
{HUB_THEME_SCRIPT}
</body>
</html>
"""


def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  生成 {os.path.relpath(path, BASE)} ({len(content)} 字节)")


def main():
    print("=" * 50)
    print("miniworld build_homeplus（片段化拼装）")
    pages = load_pages()
    cards = load_cards()
    print(f"页面配置: {list(pages.keys())} | 卡片: {len(cards)}")
    # 分类顺序：cards 中 cat_name 首次出现顺序（按 dir_path 分组内）
    categories = []
    for c in cards:
        cat = val(c, "cat_name")
        if cat and cat not in categories:
            categories.append(cat)
    # 生成各页面
    for dp, page in pages.items():
        html = build_page(dp, page, cards, categories, pages)
        if dp == "/":
            write(os.path.join(BASE, "index.html"), html)
        elif dp == "topics":
            write(os.path.join(BASE, "topics", "index.html"), html)
        else:
            write(os.path.join(BASE, *dp.split("/"), "index.html"), html)
    # 手写页 css 版本戳注入（幂等：仅当 href 无 ?v= 时替换，不碰正文）
    old_css = 'href="../../assets/css/style.css"'
    new_css = f'href="../../assets/css/style.css?v={CSS_VER}"'
    for pg in sorted(os.listdir(os.path.join(BASE, "pages"))):
        idx = os.path.join(BASE, "pages", pg, "index.html")
        if not os.path.isfile(idx):
            continue
        s = open(idx, encoding="utf-8").read()
        if old_css in s:
            open(idx, "w", encoding="utf-8").write(s.replace(old_css, new_css))
            print(f"  版本戳注入: pages/{pg}/index.html")
    print("=" * 50)
    print("生成完成。")


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    main()
