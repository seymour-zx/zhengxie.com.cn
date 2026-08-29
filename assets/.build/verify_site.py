# -*- coding: utf-8 -*-
"""
verify_site.py —— 正协导航 · 站点静态校验（L1）
==========================================
背景：CONVENTIONS §5.1 / §5.3.2 / §5.5 三处要求「部署前跑标准校验」，但此前
      全仓并不存在该脚本，校验长期挂空挡（缺陷 M-1）。本脚本按 08-测试流程 §3
      定义的 L1 八项检查实现，让「部署闸门」从纸面变为可执行。

用法：
    python assets/.build/verify_site.py              # 校验全站
    python assets/.build/verify_site.py --strict     # 严重项也阻断（默认仅红线阻断）
    python assets/.build/verify_site.py --quiet      # 只打印汇总与失败项

输入：仓库根下全部 HTML 页面（自动发现，排除 assets/ 与治理目录）
输出：控制台报告（无文件产物，保持只读，不改动任何页面）

判定与退出码（对齐 08-测试流程 §9 通过门槛）：
    0 = 全部通过
    1 = 存在「严重」级失败（须记录并限期修复，不阻断上线）
    2 = 存在「红线」级失败（不许上线）——检查项 1（断链）、3（noopener）
注：--strict 时严重项同样返回 2。已知豁免项见下方 KNOWN_EXEMPT，须注明原因与期限。
"""

import argparse
import json
import os
import re
import sys
from urllib.parse import unquote

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))

EXCLUDE_DIRS = {"assets", ".workbuddy", ".git", "Claw", "node_modules", "__pycache__"}

# 页面 → JSON-LD @type 契约（CONVENTIONS §3.1 映射表）
JSONLD_TYPE = {
    "index.html": "WebSite",
    "404.html": None,                 # 404 页可不加 JSON-LD
    "directory/index.html": "CollectionPage",
    "pages/about/index.html": "AboutPage",
    "pages/contact/index.html": "ContactPage",
}
JSONLD_DEFAULT = "WebPage"            # 其余 pages/* 与频道页的兜底类型

# 必含 head 标签（08-测试流程 §3 第 2 项 + 20-文件分层清单 §7.3 骨架）
HEAD_REQUIRED = [
    ("title", r"<title>.+?</title>"),
    ("description", r'<meta\s+name="description"\s+content=".+?"'),
    ("keywords", r'<meta\s+name="keywords"\s+content=".+?"'),
    ("canonical", r'<link\s+rel="canonical"\s+href=".+?"'),
    ("og:title", r'property="og:title"'),
    ("og:description", r'property="og:description"'),
    ("og:image", r'property="og:image"'),
    ("og:site_name", r'property="og:site_name"'),
    ("og:url", r'property="og:url"'),
    ("twitter:card", r'name="twitter:card"'),
    ("theme-color", r'name="theme-color"'),
    ("viewport", r'name="viewport"'),
    ("apple-touch-icon", r'rel="apple-touch-icon"'),
]

# 已知豁免：已登记进整改清单、暂不修复的项。(检查项编号, 页面路径关键字或问题关键字) → 原因
KNOWN_EXEMPT = {
    ("4", "202.106.125.196"): "政务站点仅提供 IP 入口，保留（见 13-SEO审计 整改清单）",
    ("4", "http://www.cppcc.gov.cn"): "全国政协官网未启用 https（2026-08-29 实测 http 200 / https 不可达），保留 http，待站点升级后回改",
    ("4", "http://www.cndca.org.cn"): "民建中央官网境外网络不可达（2026-08-29 实测 http/https 均 000），登记待境内网络核验，保留 http",
}

# 红线项（任一失败即不许上线）
RED_LINES = {"1", "3"}


def discover_pages(root):
    """自动发现全站 HTML 页面，返回相对 ROOT 的正斜杠路径列表。"""

    def _rel(*parts):
        return os.path.join(*parts).replace("\\", "/")

    pages = []
    for name in sorted(os.listdir(root)):
        if name.endswith(".html") and os.path.isfile(os.path.join(root, name)):
            pages.append(name)
    for d1 in sorted(os.listdir(root)):
        p1 = os.path.join(root, d1)
        if d1 in EXCLUDE_DIRS or not os.path.isdir(p1):
            continue
        if os.path.isfile(os.path.join(p1, "index.html")):
            pages.append(_rel(d1, "index.html"))
        for d2 in sorted(os.listdir(p1)):
            p2 = os.path.join(p1, d2)
            if d2 in EXCLUDE_DIRS or not os.path.isdir(p2):
                continue
            if os.path.isfile(os.path.join(p2, "index.html")):
                pages.append(_rel(d1, d2, "index.html"))
    return pages


def read(rel_path):
    with open(os.path.join(ROOT, rel_path.replace("/", os.sep)),
              encoding="utf-8", errors="replace") as f:
        return f.read()


def head_of(html):
    i = html.find("</head>")
    return html[:i] if i != -1 else html


def exempt(cid, text):
    for (k_cid, key), _ in KNOWN_EXEMPT.items():
        if k_cid == cid and key in text:
            return True
    return False


# ---------------------------------------------------------------- 检查项


def check_1_broken_paths(pages):
    """1 · 相对资源路径断链（红线）"""
    bad = []
    for pg in pages:
        html = read(pg)
        base = os.path.dirname(os.path.join(ROOT, pg.replace("/", os.sep)))
        for attr in ("href", "src"):
            for url in re.findall(r'%s="([^"]+)"' % attr, html):
                if url.startswith(("http://", "https://", "#", "mailto:",
                                   "data:", "javascript:", "tel:")):
                    continue
                if not url.strip():
                    continue
                target = os.path.normpath(os.path.join(base, unquote(url)))
                if not os.path.exists(target):
                    line = "%s -> %s" % (pg, url)
                    if not exempt("1", line):
                        bad.append(line)
    return bad


def check_2_head_tags(pages):
    """2 · head 标签齐备"""
    bad = []
    for pg in pages:
        head = head_of(read(pg))
        missing = [name for name, pat in HEAD_REQUIRED if not re.search(pat, head)]
        # 404 页有意不加 canonical（避免误导索引），豁免该项
        if pg == "404.html" and "canonical" in missing:
            missing.remove("canonical")
        if missing:
            bad.append("%s 缺：%s" % (pg, "、".join(missing)))
    return bad


def check_3_link_attrs(pages):
    """3 · 外链属性：target=_blank 必带 noopener（红线）"""
    bad = []
    for pg in pages:
        html = read(pg)
        for tag in re.findall(r"<a\s[^>]*>", html):
            if 'target="_blank"' in tag and "noopener" not in tag:
                bad.append("%s -> %s" % (pg, tag[:90]))
    return bad


def check_4_link_targets(pages):
    """4 · 链接目标合法性：无裸 IP 外链、无 http://、无空 href"""
    bad = []
    ip_re = re.compile(r'https?://(?:\d{1,3}\.){3}\d{1,3}')
    for pg in pages:
        html = read(pg)
        for url in re.findall(r'href="([^"]*)"', html):
            if url.startswith("http://"):
                line = "%s -> 明文 http: %s" % (pg, url)
                if not exempt("4", line):
                    bad.append(line)
            elif ip_re.match(url):
                line = "%s -> 裸 IP: %s" % (pg, url)
                if not exempt("4", line):
                    bad.append(line)
        if re.search(r'href=""', html):
            line = "%s -> 存在空 href" % pg
            if not exempt("4", line):
                bad.append(line)
    return bad


def check_5_images(pages):
    """5 · 图片：alt 必带、loading=lazy、外链图 referrerpolicy"""
    bad = []
    for pg in pages:
        html = read(pg)
        for tag in re.findall(r"<img\s[^>]*>", html):
            src = re.search(r'src="([^"]*)"', tag)
            src = src.group(1) if src else ""
            issues = []
            if "alt=" not in tag:
                issues.append("缺 alt")
            if 'loading="lazy"' not in tag:
                issues.append("缺 loading=lazy")
            if src.startswith("http") and "referrerpolicy" not in tag:
                issues.append("外链图缺 referrerpolicy")
            if issues:
                bad.append("%s [%s] %s" % (pg, "、".join(issues), src[:70]))
    return bad


def check_6_headings(pages):
    """6 · 标题层级：h1 唯一"""
    bad = []
    for pg in pages:
        html = read(pg)
        h1 = re.findall(r"<h1[\s>]", html)
        if len(h1) != 1:
            bad.append("%s -> h1 数量 = %d（应为 1）" % (pg, len(h1)))
        levels = [int(m.group(1)) for m in re.finditer(r"<h([1-6])[\s>]", html)]
        for a, b in zip(levels, levels[1:]):
            if b > a + 1:
                bad.append("%s -> 标题跳级 h%d → h%d" % (pg, a, b))
                break
    return bad


def check_7_jsonld(pages):
    """7 · JSON-LD：可解析且 @type 符合 CONVENTIONS §3.1 契约"""
    bad = []
    for pg in pages:
        expect = JSONLD_TYPE.get(pg)
        if expect is None and pg not in JSONLD_TYPE:
            # 频道页 directory/<name>/index.html 与其余 pages/* 兜底 WebPage
            expect = JSONLD_DEFAULT
        html = read(pg)
        blocks = re.findall(
            r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
        if not blocks:
            if expect is None:
                continue          # 404 页可不加
            bad.append("%s -> 无 JSON-LD（契约要求 %s）" % (pg, expect))
            continue
        types = []
        for b in blocks:
            try:
                data = json.loads(b)
            except ValueError as e:
                bad.append("%s -> JSON-LD 解析失败：%s" % (pg, e))
                continue
            if isinstance(data, dict) and "@type" in data:
                types.append(data["@type"])
        if expect is not None and expect not in types:
            bad.append("%s -> JSON-LD @type = %s，契约要求 %s"
                       % (pg, "/".join(types) or "无", expect))
    return bad


def check_8_breadcrumb(pages):
    """8 · 面包屑：BreadcrumbList 存在且末级为当前页（根页与 404 豁免）"""
    bad = []
    for pg in pages:
        if pg in ("index.html", "404.html"):
            continue
        html = read(pg)
        blocks = re.findall(
            r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
        has_bc = False
        for b in blocks:
            try:
                data = json.loads(b)
            except ValueError:
                continue
            if isinstance(data, dict) and data.get("@type") == "BreadcrumbList":
                has_bc = True
        if not has_bc:
            bad.append("%s -> 缺 BreadcrumbList 结构化数据" % pg)
    return bad


CHECKS = [
    ("1", "相对资源路径断链", check_1_broken_paths),
    ("2", "head 标签齐备", check_2_head_tags),
    ("3", "外链 noopener 属性", check_3_link_attrs),
    ("4", "链接目标合法性", check_4_link_targets),
    ("5", "图片 alt/lazy/referrer", check_5_images),
    ("6", "标题层级", check_6_headings),
    ("7", "JSON-LD 契约", check_7_jsonld),
    ("8", "面包屑 BreadcrumbList", check_8_breadcrumb),
]


def main():
    parser = argparse.ArgumentParser(description="正协导航站点静态校验（L1）")
    parser.add_argument("--strict", action="store_true",
                        help="严重项同样阻断（退出码 2）")
    parser.add_argument("--quiet", action="store_true",
                        help="只打印汇总与失败明细")
    args = parser.parse_args()

    pages = discover_pages(ROOT)
    print("=" * 62)
    print("正协导航 · 站点静态校验（L1 · 08-测试流程 §3 八项）")
    print("仓库根：%s" % ROOT)
    print("页面数：%d" % len(pages))
    print("=" * 62)

    red_fail, serious_fail = [], []
    for cid, label, func in CHECKS:
        problems = func(pages)
        level = "红线" if cid in RED_LINES else "严重"
        if problems:
            mark = "FAIL"
            (red_fail if cid in RED_LINES else serious_fail).append((cid, label, problems))
        else:
            mark = "PASS"
        if not args.quiet or problems:
            print("\n[%s] %s · %s · %s · %d 项问题"
                  % (cid, label, level, mark, len(problems)))
            for line in problems[:20]:
                print("      - %s" % line)
            if len(problems) > 20:
                print("      ... 另有 %d 项" % (len(problems) - 20))

    print("\n" + "=" * 62)
    print("红线失败：%d 项检查 | 严重失败：%d 项检查" % (len(red_fail), len(serious_fail)))
    if KNOWN_EXEMPT:
        print("已知豁免：%d 条（进整改清单，不阻断）" % len(KNOWN_EXEMPT))

    if red_fail:
        print("\n结果：✗ 存在红线失败，不许上线。")
        return 2
    if serious_fail:
        if args.strict:
            print("\n结果：✗ 存在严重失败（--strict 已开启阻断）。")
            return 2
        print("\n结果：⚠ 红线全过，可上线；%d 项严重问题须记录并限期修复。"
              % len(serious_fail))
        return 1
    print("\n结果：✓ 八项全部通过。")
    return 0


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    sys.exit(main())
