#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 directory/gov/ 频道的 self_links.xlsx（政务导航数据，自包含全量生成器）。

架构说明（2026-08-26 重写）：
- 原脚本从 directory/renmin/ 与 directory/zhengwu/ 两个源 xlsx 合并，但该两源已不存在，
  故改为自包含：全部卡片数据内嵌于本文件，与 _gen_engine.py 同模式。
- 列结构（与根表一致，链接列交错：linkN_name, linkN_url）：
  站序 | 分类 | type | title | desc | media | tags | link1_name | link1_url ... link10_name | link10_url
- type=1 logo 卡；media 留空→安全首字占位（不编造 favicon URL）
- link1=访问官网-域名 / 核实 https 官方域
- 合规铁律：政务类仅收录经联网核实的官方域，绝不虚构 URL。
  国家安全部无公开官方门户（仅有 12339 举报平台），按规则跳过不收录。
"""
import os
from openpyxl import Workbook

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(BASE, "directory", "gov", "assets", "xlsx", "self_links.xlsx")

HEADER = ["站序", "分类", "type", "title", "desc", "media", "tags"] + \
         [x for n in range(1, 11) for x in (f"link{n}_name", f"link{n}_url")]

# (分类, 标题, 描述, 域名展示, 官网URL, 标签)
# 全部域名均经联网核实官方域；国家安全部无公开门户，已跳过。
rows = [
    # ───────── 人大（全国 + 4 直辖市 + 22 省 + 5 自治区） ─────────
    ("全国", "全国人民代表大会", "最高国家权力机关，行使国家立法权，官方网站发布法律、公报与常委会信息。",
     "www.npc.gov.cn", "https://www.npc.gov.cn", "人大,全国人大,国家立法"),
    ("直辖市", "北京市人民代表大会常务委员会", "北京市人民代表大会常设机关，发布地方立法、监督与代表工作信息。",
     "www.bjrd.gov.cn", "https://www.bjrd.gov.cn", "人大,北京,直辖市"),
    ("直辖市", "上海市人民代表大会常务委员会", "上海市人民代表大会常设机关，地方立法与监督工作平台。",
     "www.shrd.gov.cn", "https://www.shrd.gov.cn", "人大,上海,直辖市"),
    ("直辖市", "天津市人民代表大会常务委员会", "天津市人民代表大会常设机关，发布地方性法规与监督信息。",
     "www.tjrd.gov.cn", "https://www.tjrd.gov.cn", "人大,天津,直辖市"),
    ("直辖市", "重庆市人民代表大会常务委员会", "重庆市人民代表大会常设机关，地方立法与代表工作平台。",
     "www.cqrd.gov.cn", "https://www.cqrd.gov.cn", "人大,重庆,直辖市"),
    ("省", "河北省人民代表大会常务委员会", "河北省人民代表大会常设机关，发布地方立法、监督与代表履职信息。",
     "www.hbrd.gov.cn", "https://www.hbrd.gov.cn", "人大,河北,省"),
    ("省", "山西省人民代表大会常务委员会", "山西省人民代表大会常设机关，发布地方性法规与监督工作信息。",
     "www.sxpc.gov.cn", "https://www.sxpc.gov.cn", "人大,山西,省"),
    ("省", "辽宁省人民代表大会常务委员会", "辽宁省人民代表大会常设机关，发布地方立法与代表工作信息。",
     "www.lnrd.gov.cn", "https://www.lnrd.gov.cn", "人大,辽宁,省"),
    ("省", "吉林省人民代表大会常务委员会", "吉林省人民代表大会常设机关，发布地方性法规与监督信息。",
     "www.jlrd.gov.cn", "https://www.jlrd.gov.cn", "人大,吉林,省"),
    ("省", "黑龙江省人民代表大会常务委员会", "黑龙江省人民代表大会常设机关，发布地方立法、监督与代表工作信息。",
     "www.hljrd.gov.cn", "https://www.hljrd.gov.cn", "人大,黑龙江,省"),
    ("省", "江苏省人民代表大会常务委员会", "江苏省人民代表大会常设机关，地方立法与监督工作平台。",
     "www.jsrd.gov.cn", "https://www.jsrd.gov.cn", "人大,江苏,省"),
    ("省", "浙江省人民代表大会常务委员会", "浙江省人民代表大会常设机关，发布地方性法规与代表信息。",
     "www.zjrd.gov.cn", "https://www.zjrd.gov.cn", "人大,浙江,省"),
    ("省", "安徽省人民代表大会常务委员会", "安徽省人民代表大会常设机关，发布地方立法与代表履职信息。",
     "www.ahrd.gov.cn", "https://www.ahrd.gov.cn", "人大,安徽,省"),
    ("省", "福建省人民代表大会常务委员会", "福建省人民代表大会常设机关，发布地方性法规与监督工作信息。",
     "www.fjrd.gov.cn", "https://www.fjrd.gov.cn", "人大,福建,省"),
    ("省", "江西省人民代表大会常务委员会", "江西省人民代表大会常设机关，发布地方立法与代表工作信息。",
     "www.jxrd.gov.cn", "https://www.jxrd.gov.cn", "人大,江西,省"),
    ("省", "山东省人民代表大会常务委员会", "山东省人民代表大会常设机关，地方立法与监督工作平台。",
     "www.sdrd.gov.cn", "https://www.sdrd.gov.cn", "人大,山东,省"),
    ("省", "河南省人民代表大会常务委员会", "河南省人民代表大会常设机关，发布地方性法规与监督信息。",
     "www.henanrd.gov.cn", "https://www.henanrd.gov.cn", "人大,河南,省"),
    ("省", "湖北省人民代表大会常务委员会", "湖北省人民代表大会常设机关，地方立法与代表工作平台。",
     "www.hppc.gov.cn", "https://www.hppc.gov.cn", "人大,湖北,省"),
    ("省", "湖南省人民代表大会常务委员会", "湖南省人民代表大会常设机关，发布地方性法规与监督信息。",
     "www.hnrd.gov.cn", "https://www.hnrd.gov.cn", "人大,湖南,省"),
    ("省", "广东省人民代表大会常务委员会", "广东省人民代表大会常设机关，发布地方性法规与监督信息。",
     "www.rd.gd.cn", "https://www.rd.gd.cn", "人大,广东,省"),
    ("省", "海南省人民代表大会常务委员会", "海南省人民代表大会常设机关，发布地方立法、监督与代表工作信息。",
     "www.hainanpc.gov.cn", "https://www.hainanpc.gov.cn", "人大,海南,省"),
    ("省", "四川省人民代表大会常务委员会", "四川省人民代表大会常设机关，发布地方性法规与监督信息。",
     "www.scspc.gov.cn", "https://www.scspc.gov.cn", "人大,四川,省"),
    ("省", "贵州省人民代表大会常务委员会", "贵州省人民代表大会常设机关，发布地方性法规与监督信息。",
     "www.gzrd.gov.cn", "https://www.gzrd.gov.cn", "人大,贵州,省"),
    ("省", "云南省人民代表大会常务委员会", "云南省人民代表大会常设机关，发布地方立法与代表履职信息。",
     "www.ynrd.gov.cn", "https://www.ynrd.gov.cn", "人大,云南,省"),
    ("省", "陕西省人民代表大会常务委员会", "陕西省人民代表大会常设机关，发布地方性法规与监督工作信息。",
     "www.sxrd.gov.cn", "https://www.sxrd.gov.cn", "人大,陕西,省"),
    ("省", "甘肃省人民代表大会常务委员会", "甘肃省人民代表大会常设机关，发布地方立法与代表工作信息。",
     "www.gsrdw.gov.cn", "https://www.gsrdw.gov.cn", "人大,甘肃,省"),
    ("省", "青海省人民代表大会常务委员会", "青海省人民代表大会常设机关，发布地方性法规与监督信息。",
     "www.qhrd.gov.cn", "https://www.qhrd.gov.cn", "人大,青海,省"),
    ("自治区", "内蒙古自治区人民代表大会常务委员会", "内蒙古自治区人民代表大会常设机关，发布地方立法、监督与代表工作信息。",
     "www.nmgrd.gov.cn", "https://www.nmgrd.gov.cn", "人大,内蒙古,自治区"),
    ("自治区", "广西壮族自治区人民代表大会常务委员会", "广西壮族自治区人民代表大会常设机关，发布地方立法与代表履职信息。",
     "www.gxrd.gov.cn", "https://www.gxrd.gov.cn", "人大,广西,自治区"),
    ("自治区", "西藏自治区人民代表大会常务委员会", "西藏自治区人民代表大会常设机关，发布地方立法与监督信息。",
     "www.xizangrd.gov.cn", "https://www.xizangrd.gov.cn", "人大,西藏,自治区"),
    ("自治区", "宁夏回族自治区人民代表大会常务委员会", "宁夏回族自治区人民代表大会常设机关，发布地方性法规与代表工作信息。",
     "www.nxrd.gov.cn", "https://www.nxrd.gov.cn", "人大,宁夏,自治区"),
    ("自治区", "新疆维吾尔自治区人民代表大会常务委员会", "新疆维吾尔自治区人民代表大会常设机关，发布地方立法、监督与代表工作信息。",
     "www.xjpcsc.gov.cn", "https://www.xjpcsc.gov.cn", "人大,新疆,自治区"),

    # ───────── 政务（国务院 + 国家平台 + 25 个有门户的组成部门） ─────────
    ("国务院", "中华人民共和国中央人民政府（国务院）", "国务院官方网站，国家政务总门户，发布政策法规与政务信息。",
     "www.gov.cn", "https://www.gov.cn", "政务,国务院,中央政府"),
    ("国家平台", "国家政务服务平台", "全国统一政务服务平台，提供在线办事、政务服务与效能监督。",
     "gjzwfw.www.gov.cn", "https://gjzwfw.www.gov.cn", "政务,服务平台,在线办事"),
    ("组成部门", "外交部", "主管外交事务，发布外交政策、双边关系与国际交往信息。",
     "www.mfa.gov.cn", "https://www.mfa.gov.cn", "政务,外交,外交部"),
    ("组成部门", "国防部", "中华人民共和国国防部，发布国防政策、军队建设与权威军事信息。",
     "www.mod.gov.cn", "https://www.mod.gov.cn", "政务,国防,国防部"),
    ("组成部门", "国家发展和改革委员会", "宏观经济综合管理，拟订发展战略与规划。",
     "www.ndrc.gov.cn", "https://www.ndrc.gov.cn", "政务,发改委,宏观经济"),
    ("组成部门", "教育部", "主管教育事业与语言文字工作，发布教育政策。",
     "www.moe.gov.cn", "https://www.moe.gov.cn", "政务,教育,教育部"),
    ("组成部门", "科学技术部", "主管科技发展与创新，发布科技政策与研发计划信息。",
     "www.most.gov.cn", "https://www.most.gov.cn", "政务,科技,科技部"),
    ("组成部门", "工业和信息化部", "主管工业与信息化产业发展与行业管理。",
     "www.miit.gov.cn", "https://www.miit.gov.cn", "政务,工信,信息化"),
    ("组成部门", "国家民族事务委员会", "主管民族事务与民族团结进步工作，发布民族政策信息。",
     "www.neac.gov.cn", "https://www.neac.gov.cn", "政务,民委,民族事务"),
    ("组成部门", "公安部", "维护社会治安，主管公安工作。",
     "www.mps.gov.cn", "https://www.mps.gov.cn", "政务,公安,公安部"),
    ("组成部门", "民政部", "主管民政事务、社会救助与社会组织管理。",
     "www.mca.gov.cn", "https://www.mca.gov.cn", "政务,民政,民政部"),
    ("组成部门", "司法部", "主管司法行政、法治建设与法律服务。",
     "www.moj.gov.cn", "https://www.moj.gov.cn", "政务,司法,司法部"),
    ("组成部门", "财政部", "主管国家财政收支与财税政策。",
     "www.mof.gov.cn", "https://www.mof.gov.cn", "政务,财政,财政部"),
    ("组成部门", "人力资源和社会保障部", "主管就业、社保与人事人才工作。",
     "www.mohrss.gov.cn", "https://www.mohrss.gov.cn", "政务,人社,社保"),
    ("组成部门", "自然资源部", "主管自然资源调查、规划与确权登记。",
     "www.mnr.gov.cn", "https://www.mnr.gov.cn", "政务,自然资源,国土"),
    ("组成部门", "生态环境部", "主管生态环境保护的监督管理。",
     "www.mee.gov.cn", "https://www.mee.gov.cn", "政务,生态环境,环保"),
    ("组成部门", "住房和城乡建设部", "主管住房保障与城乡建设，发布建筑市场与市政建设政策。",
     "www.mohurd.gov.cn", "https://www.mohurd.gov.cn", "政务,住建,城乡建设"),
    ("组成部门", "交通运输部", "主管公路、水路、铁路等综合交通运输。",
     "www.mot.gov.cn", "https://www.mot.gov.cn", "政务,交通,运输"),
    ("组成部门", "水利部", "主管水资源管理与水利建设，发布防汛抗旱与河湖治理信息。",
     "www.mwr.gov.cn", "https://www.mwr.gov.cn", "政务,水利,水资源"),
    ("组成部门", "农业农村部", "主管农业农村发展，发布乡村振兴、农业政策与农技信息。",
     "www.moa.gov.cn", "https://www.moa.gov.cn", "政务,农业,农业农村"),
    ("组成部门", "商务部", "主管国内外贸易与国际经贸合作，发布商务政策与市场信息。",
     "www.mofcom.gov.cn", "https://www.mofcom.gov.cn", "政务,商务,对外贸易"),
    ("组成部门", "文化和旅游部", "主管文化事业与旅游发展，发布文旅政策与公共服务信息。",
     "www.mct.gov.cn", "https://www.mct.gov.cn", "政务,文旅,文化旅游"),
    ("组成部门", "国家卫生健康委员会", "主管国民健康与医疗卫生，发布卫生政策与健康服务信息。",
     "www.nhc.gov.cn", "https://www.nhc.gov.cn", "政务,卫健,卫生健康"),
    ("组成部门", "退役军人事务部", "主管退役军人优抚安置与服务保障，维护军人军属权益。",
     "www.mva.gov.cn", "https://www.mva.gov.cn", "政务,退役军人,优抚安置"),
    ("组成部门", "应急管理部", "主管安全生产与应急救援，发布防灾减灾与事故处置信息。",
     "www.mem.gov.cn", "https://www.mem.gov.cn", "政务,应急,安全生产"),
    ("组成部门", "中国人民银行", "中央银行，制定货币政策，维护金融稳定与人民币管理。",
     "www.pbc.gov.cn", "https://www.pbc.gov.cn", "政务,央行,货币政策"),
    ("组成部门", "审计署", "主管国家财政收支审计监督，发布审计结果与整改信息。",
     "www.audit.gov.cn", "https://www.audit.gov.cn", "政务,审计,审计监督"),
]

wb = Workbook()
ws = wb.active
ws.append(HEADER)
for i, (cat, title, desc, domain, url, tags) in enumerate(rows):
    link1_name = f"访问官网 - {domain}"
    # 7 基础列 + link1(2) = 9 个有值；link2..10 共 18 列留空
    row = [i, cat, 1, title, desc, "", tags, link1_name, url] + [""] * 18
    ws.append(row)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
wb.save(OUT)
print(f"wrote {OUT}  (rows={len(rows)})")
