# -*- coding: utf-8 -*-
"""从 this.txt 提取金融机构/在线音像的中国站点，并补充外国金融机构与媒体，
生成 8 个频道（bank/insurance/stock/media + world-bank/world-insurance/world-stock/world-media）。
每个频道含 self_meta.json 与 self_links.xlsx，并经自动构建生成页面。
"""
import re
import os
import openpyxl
from openpyxl import Workbook

ROOT = r"D:\Universal Space\zhengxie.com.cn"
TXT = os.path.join(ROOT, "assets", "xlsx", "this.txt")

# ---------- 提取函数 ----------
def extract_block(text, start, end):
    lines = text.split("\n")[start - 1:end - 1]
    cur = None
    rows = []
    for ln in lines:
        lm = re.search(r'class="portal-label"><label[^>]*>([^<]+)</label>', ln)
        if lm:
            cur = lm.group(1)
        am = re.search(r'<a href="([^"]+)"[^>]*>([^<]+)</a>', ln)
        if am and cur:
            title = am.group(2).strip()
            if title:
                rows.append((cur, title, am.group(1)))
    return rows

text = open(TXT, encoding="utf-8").read()
fin = extract_block(text, 368, 481)   # 金融机构
media = extract_block(text, 4, 368)   # 在线音像

# ---------- 分类映射 ----------
BANK_CATS = {"银行", "中央银行", "政策性银行", "国有商业银行", "其他银行"}
MEDIA_CATS = {"直播", "视频", "短视频", "音乐"}

bank_rows = [(c, t, u) for (c, t, u) in fin if c in BANK_CATS]
# 银行 label 自带的那条（招商银行）并入「其他银行」分类下做示例
insurance_rows = [(c, t, u) for (c, t, u) in fin if c == "保险公司"]
stock_rows = []
for (c, t, u) in fin:
    if c == "证券公司":
        stock_rows.append(("证券", t, u))
    elif c == "资产管理公司":
        stock_rows.append(("资管", t, u))

media_rows = [(c, t, u) for (c, t, u) in media if c in MEDIA_CATS]

# ---------- 外国补充（依据公开权威信息整理，非逐一核验） ----------
WORLD_BANK = [
    ("国际银行", "汇丰银行 HSBC", "https://www.hsbc.com/"),
    ("国际银行", "花旗银行 Citi", "https://www.citigroup.com/"),
    ("国际银行", "渣打银行 Standard Chartered", "https://www.sc.com/"),
    ("国际银行", "摩根大通 JPMorgan", "https://www.jpmorgan.com/"),
    ("国际银行", "德意志银行 Deutsche Bank", "https://www.db.com/"),
    ("国际银行", "三菱UFJ银行 MUFG", "https://www.mufg.jp/"),
    ("国际银行", "法国巴黎银行 BNP Paribas", "https://www.bnpparibas.com/"),
    ("国际银行", "巴克莱 Barclays", "https://www.barclays.com/"),
]
WORLD_INSURANCE = [
    ("国际保险", "安联保险 Allianz", "https://www.allianz.com/"),
    ("国际保险", "安盛 AXA", "https://www.axa.com/"),
    ("国际保险", "AIG", "https://www.aig.com/"),
    ("国际保险", "州立农业 State Farm", "https://www.statefarm.com/"),
    ("国际保险", "日本生命 Nissay", "https://www.nissay.co.jp/"),
]
WORLD_STOCK = [
    ("交易所", "纽约证券交易所 NYSE", "https://www.nyse.com/"),
    ("交易所", "纳斯达克 Nasdaq", "https://www.nasdaq.com/"),
    ("交易所", "伦敦证券交易所 LSE", "https://www.lseg.com/"),
    ("交易所", "东京证券交易所 JPX", "https://www.jpx.co.jp/"),
    ("交易所", "香港交易所 HKEX", "https://www.hkex.com.hk/"),
    ("交易所", "新加坡交易所 SGX", "https://www.sgx.com/"),
    ("国际券商", "盈透证券 Interactive Brokers", "https://www.interactivebrokers.com/"),
    ("国际券商", "嘉信理财 Charles Schwab", "https://www.schwab.com/"),
]
WORLD_MEDIA = [
    ("视频", "YouTube", "https://www.youtube.com/"),
    ("视频", "Netflix", "https://www.netflix.com/"),
    ("短视频", "TikTok", "https://www.tiktok.com/"),
    ("直播", "Twitch", "https://www.twitch.tv/"),
    ("音乐", "Spotify", "https://www.spotify.com/"),
    ("音乐", "Apple Music", "https://music.apple.com/"),
    ("音频", "Audible", "https://www.audible.com/"),
]

REFS = {
    "bank": [("中国人民银行", "http://www.pbc.gov.cn/", "中国中央银行与银行体系权威发布"),
             ("中央机构编制委员会办公室", "http://www.scopsr.gov.cn/", "金融机构设立与编制的权威核定")],
    "insurance": [("中国银行保险监督管理委员会", "https://www.cbirc.gov.cn/", "保险监管与机构准入权威信息"),
                  ("中国保险行业协会", "https://www.iachina.cn/", "保险行业自律与机构名录")],
    "stock": [("中国证监会", "http://www.csrc.gov.cn/", "证券期货监管与机构名录"),
              ("中国证券业协会", "https://www.sac.net.cn/", "证券公司自律管理与会员信息")],
    "media": [("国家广播电视总局", "https://www.nrta.gov.cn/", "视听节目与网络音视频管理权威"),
              ("中国网络视听节目服务协会", "https://www.cnsav.com/", "网络音视频行业自律组织")],
    "world-bank": [("Bank for International Settlements", "https://www.bis.org/", "国际银行与金融统计权威"),
                   ("The Banker (Financial Times)", "https://www.thebanker.com/", "全球银行排名与名录")],
    "world-insurance": [("IAIS 国际保险监督官协会", "https://www.iaisweb.org/", "国际保险监管与机构索引"),
                        ("Swiss Re Sigma", "https://www.swissre.com/", "全球保险市场统计与机构")],
    "world-stock": [("World Federation of Exchanges", "https://www.world-exchanges.org/", "全球交易所权威名录"),
                    ("IOSCO 国际证监会组织", "https://www.iosco.org/", "证券监管与机构索引")],
    "world-media": [("Motion Picture Association", "https://www.motionpictures.org/", "全球影视与流媒体行业组织"),
                   ("IFPI 国际唱片业协会", "https://www.ifpi.org/", "全球音乐行业与平台索引")],
}

META = {
    "bank": ("银行导航 - 正协导航", "收录中央银行、政策性银行、国有商业银行及其他商业银行官网入口，覆盖国内主要银行机构，一键直达官方服务。", "银行,商业银行,中央银行,政策性银行,网上银行,正协导航"),
    "insurance": ("保险导航 - 正协导航", "收录国内主要保险公司与保险平台官网入口，涵盖人寿、财险、健康险等领域，便于快速访问官方投保与理赔服务。", "保险,保险公司,人寿保险,财险,正协导航"),
    "stock": ("证券导航 - 正协导航", "收录证券公司、证券交易所与资产管理公司官网入口，覆盖证券开户、交易与研究服务，为投资者提供一站式导航。", "证券,券商,证券交易所,资管,正协导航"),
    "media": ("音视频媒体导航 - 正协导航", "收录直播、长视频、短视频与音乐类主流平台，覆盖国内外音视频内容站点，方便一站式观看与收听。", "直播,视频,短视频,音乐,音视频,正协导航"),
    "world-bank": ("外国银行导航 - 正协导航", "收录全球主要国际银行与跨国银行集团官网入口，作为外国金融机构导航板块，便于跨境金融查询。", "外国银行,国际银行,跨境金融,正协导航"),
    "world-insurance": ("外国保险导航 - 正协导航", "收录全球主要国际保险集团官网入口，作为外国金融机构导航板块，便于跨国保险查询。", "外国保险,国际保险,正协导航"),
    "world-stock": ("外国证券导航 - 正协导航", "收录全球主要证券交易所与国际券商官网入口，作为外国金融导航板块，便于跨境投资查询。", "外国证券,交易所,国际券商,正协导航"),
    "world-media": ("外国音视频媒体导航 - 正协导航", "收录全球主流流媒体、短视频、音乐与音频平台官网入口，作为外国媒体导航板块。", "外国媒体,流媒体,短视频,音乐,正协导航"),
}

ORDER = ["bank", "insurance", "stock", "media", "world-bank", "world-insurance", "world-stock", "world-media"]

DATA = {
    "bank": bank_rows,
    "insurance": insurance_rows,
    "stock": stock_rows,
    "media": media_rows,
    "world-bank": WORLD_BANK,
    "world-insurance": WORLD_INSURANCE,
    "world-stock": WORLD_STOCK,
    "world-media": WORLD_MEDIA,
}


def write_channel(ch):
    base = os.path.join(ROOT, "directory", ch)
    os.makedirs(os.path.join(base, "assets", "json"), exist_ok=True)
    os.makedirs(os.path.join(base, "assets", "xlsx"), exist_ok=True)
    # self_meta.json
    title, desc, kw = META[ch]
    meta = {
        "title": META[ch][0],
        "description": META[ch][1],
        "keywords": META[ch][2],
    }
    import json
    with open(os.path.join(base, "assets", "json", "self_meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    # self_links.xlsx
    wb = Workbook()
    ws = wb.active
    ws.title = "links"
    ws.append(["站序", "分类", "type", "title", "desc", "media", "tags", "links"])
    seq = 0
    for (cat, title, url) in DATA[ch]:
        seq += 1
        ws.append([seq, cat, 1, title, "", "", "", f"官网,{url}"])
    for (name, url, note) in REFS[ch]:
        seq += 1
        ws.append([seq, "参考", 3, name, note, "", "", f"来源,{url}"])
    wb.save(os.path.join(base, "assets", "xlsx", "self_links.xlsx"))
    print(f"{ch}: 站点 {len(DATA[ch])} + 参考 {len(REFS[ch])} = {seq}")


for ch in ORDER:
    write_channel(ch)

print("全部频道生成完成")
