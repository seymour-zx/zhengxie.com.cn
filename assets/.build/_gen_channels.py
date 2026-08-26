# -*- coding: utf-8 -*-
"""一次性生成 人大(renmin) / 政务机构(zhengwu) 两个频道的 self_links.xlsx + self_meta.json。
数据源：用户「联网查官方站」已核实官方域（均 .gov.cn / 官方域，未编造）。
运行：python assets/.build/_gen_channels.py
"""
import os
import json
from openpyxl import Workbook

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DIR = os.path.join(BASE, "directory")

HEADER = ["站序", "分类", "type", "title", "desc", "media", "tags"]
for n in range(1, 11):
    HEADER += [f"link{n}_name", f"link{n}_url"]


def write_xlsx(name, rows):
    d = os.path.join(DIR, name, "assets", "xlsx")
    os.makedirs(d, exist_ok=True)
    wb = Workbook()
    ws = wb.active
    ws.append(HEADER)
    for r in rows:
        ws.append(r)
    out = os.path.join(d, "self_links.xlsx")
    wb.save(out)
    print(f"写 xlsx: {out}  ({len(rows)} 行)")


def write_meta(name, meta):
    d = os.path.join(DIR, name, "assets", "json")
    os.makedirs(d, exist_ok=True)
    out = os.path.join(d, "self_meta.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print(f"写 meta: {out}")


def row(seq, cat, title, desc, link_name, link_url, tags):
    # 站序, 分类, type, title, desc, media, tags, [link1..10 name/url]
    base = [seq, cat, 1, title, desc, "", tags]
    links = []
    for n in range(1, 11):
        if n == 1:
            links += [link_name, link_url]
        else:
            links += [None, None]
    return base + links


# ───────── 人大频道 (renmin) ─────────
renmin_rows = [
    row(0, "全国", "全国人民代表大会",
        "最高国家权力机关，行使国家立法权，官方网站发布法律、公报与常委会信息。",
        "访问官网 - www.npc.gov.cn", "https://www.npc.gov.cn", "人大,全国人大,国家立法"),
    row(1, "直辖市", "北京市人民代表大会常务委员会",
        "北京市人民代表大会常设机关，发布地方立法、监督与代表工作信息。",
        "访问官网 - www.bjrd.gov.cn", "https://www.bjrd.gov.cn", "人大,北京,直辖市"),
    row(2, "直辖市", "上海市人民代表大会常务委员会",
        "上海市人民代表大会常设机关，地方立法与监督工作平台。",
        "访问官网 - www.shrd.gov.cn", "https://www.shrd.gov.cn", "人大,上海,直辖市"),
    row(3, "直辖市", "天津市人民代表大会常务委员会",
        "天津市人民代表大会常设机关，发布地方性法规与监督信息。",
        "访问官网 - www.tjrd.gov.cn", "https://www.tjrd.gov.cn", "人大,天津,直辖市"),
    row(4, "直辖市", "重庆市人民代表大会常务委员会",
        "重庆市人民代表大会常设机关，地方立法与代表工作平台。",
        "访问官网 - www.cqrd.gov.cn", "https://www.cqrd.gov.cn", "人大,重庆,直辖市"),
    row(5, "省", "广东省人民代表大会常务委员会",
        "广东省人民代表大会常设机关，发布地方性法规与监督信息。",
        "访问官网 - www.rd.gd.cn", "https://www.rd.gd.cn", "人大,广东,省"),
    row(6, "省", "江苏省人民代表大会常务委员会",
        "江苏省人民代表大会常设机关，地方立法与监督工作平台。",
        "访问官网 - www.jsrd.gov.cn", "https://www.jsrd.gov.cn", "人大,江苏,省"),
    row(7, "省", "浙江省人民代表大会常务委员会",
        "浙江省人民代表大会常设机关，发布地方性法规与代表信息。",
        "访问官网 - www.zjrd.gov.cn", "https://www.zjrd.gov.cn", "人大,浙江,省"),
    row(8, "省", "山东省人民代表大会常务委员会",
        "山东省人民代表大会常设机关，地方立法与监督工作平台。",
        "访问官网 - www.sdrd.gov.cn", "https://www.sdrd.gov.cn", "人大,山东,省"),
    row(9, "省", "四川省人民代表大会常务委员会",
        "四川省人民代表大会常设机关，发布地方性法规与监督信息。",
        "访问官网 - www.scspc.gov.cn", "https://www.scspc.gov.cn", "人大,四川,省"),
    row(10, "省", "湖北省人民代表大会常务委员会",
        "湖北省人民代表大会常设机关，地方立法与代表工作平台。",
        "访问官网 - www.hppc.gov.cn", "https://www.hppc.gov.cn", "人大,湖北,省"),
    row(11, "省", "河南省人民代表大会常务委员会",
        "河南省人民代表大会常设机关，发布地方性法规与监督信息。",
        "访问官网 - www.henanrd.gov.cn", "https://www.henanrd.gov.cn", "人大,河南,省"),
]

renmin_meta = {
    "title": "人大导航 - 正协导航",
    "description": "正协导航旗下人大专题：汇集全国人民代表大会及各省（区、市）人民代表大会常务委员会官方入口，方便快速访问权威立法与监督信息平台。本站为独立第三方，与任何官方机构无隶属关系。",
    "keywords": "人大,人民代表大会,全国人大常委会,全国人大,地方人大,省人大,直辖市人大,人大官网,人大网站导航",
    "channel_intro": "本频道汇集全国人民代表大会与各省、自治区、直辖市人民代表大会常务委员会官方网站入口，覆盖立法、监督、代表工作等权威信息，助您直达各级人大权威发布平台。",
}

# ───────── 政务机构频道 (zhengwu) ─────────
zhengwu_rows = [
    row(0, "国务院", "中华人民共和国中央人民政府（国务院）",
        "国务院官方网站，国家政务总门户，发布政策法规与政务信息。",
        "访问官网 - www.gov.cn", "https://www.gov.cn", "政务,国务院,中央政府"),
    row(1, "国家平台", "国家政务服务平台",
        "全国统一政务服务平台，提供在线办事、政务服务与效能监督。",
        "访问官网 - gjzwfw.www.gov.cn", "https://gjzwfw.www.gov.cn", "政务,服务平台,在线办事"),
    row(2, "组成部门", "国家发展和改革委员会",
        "宏观经济综合管理，拟订发展战略与规划。",
        "访问官网 - www.ndrc.gov.cn", "https://www.ndrc.gov.cn", "政务,发改委,宏观经济"),
    row(3, "组成部门", "教育部",
        "主管教育事业与语言文字工作，发布教育政策。",
        "访问官网 - www.moe.gov.cn", "https://www.moe.gov.cn", "政务,教育,教育部"),
    row(4, "组成部门", "财政部",
        "主管国家财政收支与财税政策。",
        "访问官网 - www.mof.gov.cn", "https://www.mof.gov.cn", "政务,财政,财政部"),
    row(5, "组成部门", "公安部",
        "维护社会治安，主管公安工作。",
        "访问官网 - www.mps.gov.cn", "https://www.mps.gov.cn", "政务,公安,公安部"),
    row(6, "组成部门", "民政部",
        "主管民政事务、社会救助与社会组织管理。",
        "访问官网 - www.mca.gov.cn", "https://www.mca.gov.cn", "政务,民政,民政部"),
    row(7, "组成部门", "司法部",
        "主管司法行政、法治建设与法律服务。",
        "访问官网 - www.moj.gov.cn", "https://www.moj.gov.cn", "政务,司法,司法部"),
    row(8, "组成部门", "人力资源和社会保障部",
        "主管就业、社保与人事人才工作。",
        "访问官网 - www.mohrss.gov.cn", "https://www.mohrss.gov.cn", "政务,人社,社保"),
    row(9, "组成部门", "自然资源部",
        "主管自然资源调查、规划与确权登记。",
        "访问官网 - www.mnr.gov.cn", "https://www.mnr.gov.cn", "政务,自然资源,国土"),
    row(10, "组成部门", "生态环境部",
        "主管生态环境保护的监督管理。",
        "访问官网 - www.mee.gov.cn", "https://www.mee.gov.cn", "政务,生态环境,环保"),
    row(11, "组成部门", "交通运输部",
        "主管公路、水路、铁路等综合交通运输。",
        "访问官网 - www.mot.gov.cn", "https://www.mot.gov.cn", "政务,交通,运输"),
    row(12, "组成部门", "工业和信息化部",
        "主管工业与信息化产业发展与行业管理。",
        "访问官网 - www.miit.gov.cn", "https://www.miit.gov.cn", "政务,工信,信息化"),
]

zhengwu_meta = {
    "title": "政务机构导航 - 正协导航",
    "description": "正协导航旗下政务机构专题：汇集国务院、国家政务服务平台及国务院组成部门官方网站入口，直达权威政务与在线办事平台。本站为独立第三方，与任何官方机构无隶属关系。",
    "keywords": "政务机构,国务院,政务服务平台,政府部门,部委,政务官网,政务网站导航,在线政务",
    "channel_intro": "本频道汇集国务院、国家政务服务平台及主要国务院组成部门官方网站入口，覆盖宏观政策、民生办事与行业监管等权威政务信息，助您一键直达官方政务平台。",
}

if __name__ == "__main__":
    write_xlsx("renmin", renmin_rows)
    write_meta("renmin", renmin_meta)
    write_xlsx("zhengwu", zhengwu_rows)
    write_meta("zhengwu", zhengwu_meta)
    print("完成：两个频道数据已生成。")
