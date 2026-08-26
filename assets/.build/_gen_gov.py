#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Merge 人大(renmin) + 政务机构(zhengwu) channels into one 政务导航(gov) channel.
Reads both source xlsx as raw row tuples (header + data), concatenates data rows,
renumbers 站序 (col 0) sequentially, writes directory/gov/assets/xlsx/self_links.xlsx.
"""
import os
from openpyxl import load_workbook, Workbook

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = ['renmin', 'zhengwu']
DST = os.path.join(ROOT, 'directory', 'gov', 'assets', 'xlsx', 'self_links.xlsx')

rows = []
header = None
for ch in SRC:
    p = os.path.join(ROOT, 'directory', ch, 'assets', 'xlsx', 'self_links.xlsx')
    wb = load_workbook(p, read_only=True, data_only=True)
    ws = wb.active
    data = list(ws.iter_rows(values_only=True))
    if header is None:
        header = list(data[0])
    rows.extend(data[1:])
    wb.close()

# renumber 站序 (col 0)
out = []
for i, r in enumerate(rows):
    r = list(r)
    r[0] = i
    out.append(r)

wb = Workbook()
ws = wb.active
ws.append(header)
for r in out:
    ws.append(r)
os.makedirs(os.path.dirname(DST), exist_ok=True)
wb.save(DST)
print(f'gov xlsx written: {len(out)} cards (renmin+zhengwu merged), header cols={len(header)}')
