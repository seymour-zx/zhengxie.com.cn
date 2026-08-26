#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""同步 B16 星形 sprite 改造到当前已生成的 HTML 页面。

- 在 <body> 后注入一次 STAR_SPRITE（与 build_homeplus.py 中的 STAR_SPRITE 完全一致）
- 把每卡内联的收藏星形 <svg>…</svg> 替换为 <use href="#zx-fav-star">
- 幂等：已含 zx-fav-star 的文件跳过
- 不重跑 build_homeplus.py，避免覆盖 index.html 上手改的 A1/A4 等内容
"""
import re
import glob

SPRITE = (
    '<svg width="0" height="0" aria-hidden="true" focusable="false" '
    'style="position:absolute;width:0;height:0;overflow:hidden">'
    '<symbol id="zx-fav-star" viewBox="0 0 24 24">'
    '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 '
    '9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="none" stroke="currentColor" '
    'stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>'
    '</symbol></svg>'
)
NEW_FAV = '<svg aria-hidden="true" focusable="false"><use href="#zx-fav-star"></use></svg>'

FILES = ['index.html'] + sorted(glob.glob('directory/*/index.html'))

for f in FILES:
    with open(f, encoding='utf-8') as fh:
        html = fh.read()
    if 'zx-fav-star' in html:
        print(f'{f}: SKIP (already synced)')
        continue
    # 1) 注入 sprite（<body> 后）
    html = re.sub(r'<body>', '<body>\n' + SPRITE, html, count=1)
    # 2) 替换收藏按钮内联 svg
    n = len(re.findall(r'<button[^>]*class="card__fav"', html))
    html = re.sub(
        r'(<button[^>]*class="card__fav"[^>]*>)(.*?)(</button>)',
        lambda m: m.group(1) + NEW_FAV + m.group(3),
        html,
        flags=re.S,
    )
    with open(f, 'w', encoding='utf-8') as fh:
        fh.write(html)
    print(f'{f}: injected sprite + replaced {n} fav buttons')
print('DONE')
