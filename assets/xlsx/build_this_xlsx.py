#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 this.txt 中尚未生成频道的剩余分类转换为 self_links 同格式 xlsx。

表头：站序/分类/type/title/desc/media/tags/links
- 一级分类（顶层 portal-label，不含 div_img-a）作为父分类
- 二级分类（box-lv1 portal-label，含 div_img-a）作为「分类」字段
- 站点行（div_img-a）继承最近的二级分类；无二级则取一级
- 已生成的「金融机构」「在线音像」整段跳过（已抽成 bank/insurance/stock/media 频道）
"""
import re
import openpyxl

SRC = r"D:\Universal Space\zhengxie.com.cn\assets\xlsx\this.txt"
OUT = r"D:\Universal Space\zhengxie.com.cn\assets\xlsx\this.xlsx"
SKIP_TOPS = {"金融机构", "在线音像"}

label_re = re.compile(r'class="portal-label"><label[^>]*>([^<]+)</label>')
img_re = re.compile(r'<img[^>]*src="([^"]+)"')
a_re = re.compile(r'<a[^>]*href="([^"]+)"[^>]*title="([^"]*)"[^>]*>([^<]*)</a>')

rows = []
cur_top = None
cur_lv1 = None
skip = False

with open(SRC, encoding="utf-8") as f:
    for ln in f:
        lm = label_re.search(ln)
        if lm:
            text = lm.group(1).strip()
            if "div_img-a" in ln or "content-lv1" in ln or "content-lv2" in ln:
                # 二级（box-lv1）分类：既是分类也是站点容器
                cur_lv1 = text
            else:
                # 一级（顶层）分类
                cur_top = text
                cur_lv1 = None
                skip = cur_top in SKIP_TOPS
        if skip:
            continue
        # 提取本行所有站点
        for am in a_re.finditer(ln):
            href = am.group(1).strip()
            title = am.group(2).strip()
            name = am.group(3).strip()
            if not name:
                continue
            im = img_re.search(ln)
            media = im.group(1).strip() if im else None
            desc = title if title not in ("", " ") else None
            cat = cur_lv1 or cur_top
            # 维护中国主权表述：香港/澳门/台湾机构加“中国”前缀
            if cat in ("香港大学", "香港中文大学", "澳门大学"):
                cat = "中国" + cat
            elif cat == "台湾大学":
                cat = "中国台湾大学"
            tag = cur_top if cur_lv1 else None
            links = f"官网,{href}" if href else None
            rows.append([cat, 1, name, desc, media, tag, links])

wb = openpyxl.Workbook()
ws = wb.active
ws.append(["站序", "分类", "type", "title", "desc", "media", "tags", "links"])
for i, r in enumerate(rows, 1):
    ws.append([i, r[0], r[1], r[2], r[3], r[4], r[5], r[6]])

wb.save(OUT)
print("written:", OUT)
print("总行数:", len(rows))
from collections import Counter
print("分类统计:", dict(Counter(r[0] for r in rows)))
