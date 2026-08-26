# -*- coding: utf-8 -*-
"""
build_site.py  ——  zhengxie.com.cn 全站静态生成器（单一真值源版）

读取 同目录下的 site_data.xlsx（单一 tab「全量数据」，扁平行模型）：
  - 每一行 = 一个站点（url 非空）= 一条可点链接
  - 同 page_id 的行自动归一个页面；页面级字段取该 page_id 首个非空值
  - 同 card_id 的行自动归一张卡片；卡片级字段取该 card_id 首个非空值
  - url 为空 且 slot_key 非空 = 定义该页某「同位置文本」槽位（如 hero_title / footer_note）
  - attest_card_id 非空 = 本行是挂在某张卡片下的「认证/凭证徽章」（备案号查询/时间戳认证…），
    不是卡片主链接；渲染为该卡片级别的小徽章（整张机构卡一个备案徽章）。一行形状不变，只用此键分组。

输出到同目录 dist/ ：
  - 每个页面的 output_path 对应一个 index.html（相对路径镜像）
  - 根 sitemap.xml

不修改任何线上文件；线上部署由人工在比对无误后复制 dist/ -> 站点根。
"""
import os
import re
import html
import json
from collections import OrderedDict, defaultdict
import openpyxl

BASE_URL = "https://zhengxie.com.cn/"
HERE = os.path.dirname(os.path.abspath(__file__))
XLSX = os.path.join(HERE, "site_data.xlsx")
DIST = os.path.join(HERE, "dist")

PAGE_CSS = """
:root{--bg:#0f1b2d;--panel:#16263d;--panel2:#1d3350;--gold:#c9a45c;--gold2:#e7c987;--txt:#eef3fa;--muted:#9fb0c8;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;background:var(--bg);color:var(--txt);line-height:1.6;}
a{color:inherit;text-decoration:none;}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px;}
header.site{background:linear-gradient(135deg,#0f1b2d,#1d3350);border-bottom:1px solid var(--gold);}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;padding:22px 20px;}
.brand{font-size:20px;font-weight:700;color:var(--gold2);letter-spacing:1px;}
.brand small{display:block;font-size:12px;color:var(--muted);font-weight:400;letter-spacing:0;}
nav.breadcrumb{padding:14px 0;color:var(--muted);font-size:13px;}
nav.breadcrumb a{color:var(--gold);}
.hero{padding:34px 0 10px;}
.hero h1{font-size:30px;color:var(--gold2);}
.hero p{color:var(--muted);margin-top:6px;}
main{padding:24px 0 50px;}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;}
.card{background:var(--panel);border:1px solid #2a3f5e;border-radius:12px;padding:18px;transition:.2s;}
.card:hover{border-color:var(--gold);transform:translateY(-2px);}
.card h2{font-size:17px;color:var(--gold2);margin-bottom:6px;}
.card .desc{color:var(--muted);font-size:13px;margin-bottom:12px;}
.card-attests{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px;padding:0;}
.card-attests li a{font-size:11px;color:var(--muted);border:1px solid #3a5170;border-radius:20px;padding:2px 9px;display:inline-flex;gap:5px;align-items:center;}
.card-attests li a:hover{border-color:var(--gold);color:var(--gold2);}
.card-attests .at-type{color:var(--gold);}
.links{list-style:none;display:flex;flex-direction:column;gap:8px;}
.links > li{background:var(--panel2);border-radius:8px;padding:9px 11px;}
.links > li:hover{background:#24406a;}
.links .lk-top{display:flex;align-items:center;gap:10px;}
.links img{width:20px;height:20px;border-radius:4px;flex:0 0 auto;background:#fff;}
.links .lk-name{font-size:14px;}
.links .lk-meta{margin-left:auto;font-size:11px;color:var(--gold);border:1px solid var(--gold);border-radius:20px;padding:1px 8px;white-space:nowrap;}
.attests{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;padding-left:30px;}
.attests li a{font-size:11px;color:var(--muted);border:1px solid #3a5170;border-radius:20px;padding:2px 9px;display:inline-flex;gap:5px;align-items:center;}
.attests li a:hover{border-color:var(--gold);color:var(--gold2);}
.attests .at-type{color:var(--gold);}
footer.site{border-top:1px solid #2a3f5e;color:var(--muted);font-size:12px;text-align:center;padding:22px 0;}
.empty{padding:40px 0;color:var(--muted);text-align:center;}
"""

def first(d, key, default=""):
    return d.get(key, default) if d.get(key) not in (None, "") else default

def load(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active
    headers = [ws.cell(row=1, column=c).value for c in range(1, ws.max_column + 1)]
    records = []
    for r in range(2, ws.max_row + 1):
        rec = {}
        for h in headers:
            v = ws.cell(row=r, column=headers.index(h) + 1).value
            if v is not None and str(v).strip() != "":
                rec[h] = v
        if rec:
            records.append(rec)
    return headers, records

def build_model(records):
    pages = OrderedDict()
    cards = OrderedDict()
    links = []
    attestations = defaultdict(list)
    for rec in records:
        # 认证行：attest_card_id 非空 + 有 url -> 挂在某张卡片下（无需 page_id，优先处理避免被 pid 守卫跳过）
        a_cid = rec.get("attest_card_id")
        url = rec.get("url")
        if a_cid and url:
            attestations[str(a_cid)].append({
                "name": first(rec, "name"),
                "url": url,
                "tags": first(rec, "tags"),
                "desc": first(rec, "desc"),
            })
            continue
        pid = rec.get("page_id")
        if not pid:
            continue
        if pid not in pages:
            pages[pid] = {
                "page_id": pid,
                "page_title": first(rec, "page_title"),
                "page_keywords": first(rec, "page_keywords"),
                "page_description": first(rec, "page_description"),
                "page_type": first(rec, "page_type", "channel"),
                "output_path": first(rec, "output_path", pid + "/index.html"),
                "parent_id": first(rec, "parent_id"),
                "page_sort": rec.get("page_sort", 999),
                "page_status": first(rec, "page_status", "active"),
                "slots": {},
            }
        sk = rec.get("slot_key")
        if sk and not rec.get("url"):
            if str(rec.get("slot_enabled", "true")).lower() != "false":
                pages[pid]["slots"][sk] = first(rec, "slot_text")
        cid = rec.get("card_id")
        if cid and cid not in cards:
            cards[cid] = {
                "card_id": cid,
                "page_id": pid,
                "card_title": first(rec, "card_title"),
                "card_desc": first(rec, "card_desc"),
                "card_tags": first(rec, "card_tags"),
                "card_order": rec.get("card_order", 999),
                "card_status": first(rec, "card_status", "active"),
            }
        url = rec.get("url")
        # 主链接行：url 非空 + 有 card_id
        if url and cid:
            links.append({
                "link_id": first(rec, "link_id"),
                "card_id": cid,
                "page_id": pid,
                "name": first(rec, "name"),
                "url": url,
                "desc": first(rec, "desc"),
                "media": first(rec, "media"),
                "tags": first(rec, "tags"),
                "link_order": rec.get("link_order", 999),
                "source_type": first(rec, "source_type"),
                "link_status": first(rec, "link_status", "active"),
            })
    page_cards = defaultdict(list)
    for c in cards.values():
        page_cards[c["page_id"]].append(c)
    for pid in page_cards:
        page_cards[pid].sort(key=lambda c: (c["card_order"], c["card_id"]))
    card_links = defaultdict(list)
    for l in links:
        card_links[l["card_id"]].append(l)
    for cid in card_links:
        card_links[cid].sort(key=lambda l: (l["link_order"], l["link_id"]))
    return pages, page_cards, card_links, attestations

def rel_prefix(output_path):
    depth = output_path.count("/")
    return ("../" * depth) if depth > 0 else ""

def render_link_li(l):
    if l["link_status"] == "dead":
        return ""
    icon = ""
    if l["media"]:
        icon = f'<img src="{html.escape(l["media"])}" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
    badge = f'<span class="lk-meta">{html.escape(l["source_type"])}</span>' if l["source_type"] else ""
    return f'''<li><div class="lk-top"><a href="{html.escape(l["url"])}" target="_blank" rel="noopener">{icon}<span class="lk-name">{html.escape(l["name"])}</span></a>{badge}</div></li>'''

def render_card(c, card_links, attestations):
    links_html = "".join(render_link_li(l) for l in card_links.get(c["card_id"], []))
    desc = f'<div class="desc">{html.escape(c["card_desc"])}</div>' if c["card_desc"] else ""
    atts = attestations.get(c["card_id"], [])
    att_html = ""
    if atts:
        pills = []
        for a in atts:
            typ = f'<span class="at-type">{html.escape(a["tags"])}</span>' if a["tags"] else ""
            title = html.escape(a["desc"]) if a["desc"] else html.escape(a["name"])
            pills.append(f'<li><a href="{html.escape(a["url"])}" target="_blank" rel="noopener" title="{title}">{typ}{html.escape(a["name"])}</a></li>')
        att_html = f'<ul class="card-attests">{"".join(pills)}</ul>'
    return f'''<article class="card">
  <h2>{html.escape(c["card_title"])}</h2>
  {att_html}
  {desc}
  <ul class="links">{links_html}</ul>
</article>'''

def jsonld(page, page_cards, card_links):
    graph = [{
        "@type": "WebSite",
        "name": page["page_title"],
        "url": BASE_URL + page["output_path"],
        "description": page["page_description"],
    }]
    for c in page_cards.get(page["page_id"], []):
        ls = [l for l in card_links.get(c["card_id"], []) if l["link_status"] != "dead"]
        if not ls:
            continue
        urls = [l["url"] for l in ls]
        org = {"@type": "Organization", "name": c["card_title"], "url": urls[0]}
        if len(urls) > 1:
            org["sameAs"] = urls
        if c["card_desc"]:
            org["description"] = c["card_desc"]
        graph.append(org)
    return {"@context": "https://schema.org", "@graph": graph}

def render_page(page, page_cards, card_links, attestations):
    prefix = rel_prefix(page["output_path"])
    title = page["page_title"] or page["page_id"]
    desc = page["page_description"]
    kw = page["page_keywords"]
    crumb = ""
    if page["parent_id"]:
        parent = pages.get(page["parent_id"])
        pname = parent["page_title"] if parent else page["parent_id"]
        ppath = parent["output_path"] if parent else ""
        crumb = f'<nav class="breadcrumb wrap"><a href="{html.escape(prefix+ppath)}">首页</a> / {html.escape(pname)} / {html.escape(title)}</nav>'
    else:
        crumb = f'<nav class="breadcrumb wrap">首页 / {html.escape(title)}</nav>'
    hero_title = page["slots"].get("hero_title")
    hero = f'<section class="hero wrap"><h1>{html.escape(title)}</h1><p>{html.escape(hero_title)}</p></section>' if hero_title else f'<section class="hero wrap"><h1>{html.escape(title)}</h1></section>'
    cs = page_cards.get(page["page_id"], [])
    if cs:
        cards_html = "".join(render_card(c, card_links, attestations) for c in cs)
        main = f'<main class="wrap"><div class="cards">{cards_html}</div></main>'
    else:
        main = '<main class="wrap"><div class="empty">本页暂无卡片数据（可在 site_data.xlsx 继续追加 card_id / url 行）。</div></main>'
    footer_note = page["slots"].get("footer_note", "本站为独立第三方导航，与收录站点无隶属关系。")
    ld = jsonld(page, page_cards, card_links)
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
{("<meta name=\"keywords\" content=\""+html.escape(kw)+"\">") if kw else ""}
<style>{PAGE_CSS}</style>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body>
<header class="site"><div class="wrap"><div class="brand">正协导航<small>独立第三方导航 · 人民政协与民主党派官方入口</small></div></div></header>
{crumb}
{hero}
{main}
<footer class="site">{html.escape(footer_note)}</footer>
</body>
</html>'''

def main():
    os.makedirs(DIST, exist_ok=True)
    headers, records = load(XLSX)
    global pages
    pages, page_cards, card_links, attestations = build_model(records)
    # 校验孤儿认证（attest_card_id 须对应存在的卡片）
    card_ids = {c["card_id"] for v in page_cards.values() for c in v}
    orphan_att = [(k, v) for k, v in attestations.items() if k not in card_ids]
    written = []
    for pid, page in pages.items():
        if page["page_status"] != "active":
            continue
        out_abs = os.path.join(DIST, page["output_path"])
        os.makedirs(os.path.dirname(out_abs), exist_ok=True)
        with open(out_abs, "w", encoding="utf-8") as f:
            f.write(render_page(page, page_cards, card_links, attestations))
        written.append(page["output_path"])
    locs = [f"  <url><loc>{html.escape(BASE_URL + p['output_path'])}</loc></url>" for p in pages.values() if p["page_status"] == "active"]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(locs) + "\n</urlset>\n"
    with open(os.path.join(DIST, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(sm)
    # 反向提醒：含 official 链接的卡片尚未挂任何认证（卡片级）
    official_no_att = []
    for cid in card_ids:
        ls = card_links.get(cid, [])
        has_official = any(l["source_type"] == "official" for l in ls)
        if has_official and not attestations.get(cid):
            official_no_att.append(cid)
    print(f"源表列数: {len(headers)} | 数据行: {len(records)}")
    print(f"页面: {len(pages)} | 卡片: {sum(len(v) for v in page_cards.values())} | 主链接: {sum(len(v) for v in card_links.values())} | 认证徽章: {sum(len(v) for v in attestations.values())}")
    print(f"已生成 {len(written)} 个页面 + sitemap.xml 至: {DIST}")
    if orphan_att:
        print("⚠ 孤儿认证(attest_link_id 无对应链接):", orphan_att)
    if official_no_att:
        print(f"⚠ 以下含 official 链接的卡片尚未挂认证(建议补 attest_card_id 行): {official_no_att}")
    for w in written:
        print("  +", w)

if __name__ == "__main__":
    main()
