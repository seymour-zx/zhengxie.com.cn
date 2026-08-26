"""生成 directory/engine/ 频道的 self_links.xlsx（搜索引擎导航数据）。

列结构（与根表一致，链接列交错：linkN_name, linkN_url）：
  站序 | 分类 | type | title | desc | media | tags | link1_name | link1_url ... link10_name | link10_url
- type=1 logo 卡；media 留空→安全首字占位（不编造 favicon URL）
- link1=访问官网-域名 / 核实 https 官方域
"""
import os
from openpyxl import Workbook

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(BASE, "directory", "engine", "assets", "xlsx", "self_links.xlsx")

HEADER = ["站序", "分类", "type", "title", "desc", "media", "tags"] + \
         [x for n in range(1, 11) for x in (f"link{n}_name", f"link{n}_url")]

# (分类, 标题, 描述, 域名展示, 官网URL)
rows = [
    ("综合搜索", "Google 搜索", "全球最大的综合搜索引擎", "www.google.com", "https://www.google.com"),
    ("综合搜索", "必应 Bing", "微软综合搜索引擎", "www.bing.com", "https://www.bing.com"),
    ("综合搜索", "百度", "中文综合搜索引擎", "www.baidu.com", "https://www.baidu.com"),
    ("购物", "淘宝", "阿里巴巴旗下购物搜索", "www.taobao.com", "https://www.taobao.com"),
    ("购物", "京东", "自营电商购物平台", "www.jd.com", "https://www.jd.com"),
    ("购物", "拼多多", "拼团购物平台", "mobile.yangkeduo.com", "https://mobile.yangkeduo.com"),
    ("社区知识", "知乎", "中文问答与知识社区", "www.zhihu.com", "https://www.zhihu.com"),
    ("社区知识", "维基百科", "自由开放的网络百科全书", "zh.wikipedia.org", "https://zh.wikipedia.org"),
    ("社区知识", "微信搜一搜", "微信公众号与文章搜索", "weixin.sogou.com", "https://weixin.sogou.com"),
    ("社区知识", "头条搜索", "字节系通用搜索", "so.toutiao.com", "https://so.toutiao.com"),
    ("视频", "哔哩哔哩", "年轻人文化视频社区", "www.bilibili.com", "https://www.bilibili.com"),
    ("视频", "抖音", "短视频内容搜索", "www.douyin.com", "https://www.douyin.com"),
    ("开发", "GitHub", "全球代码托管与搜索", "github.com", "https://github.com"),
    ("开发", "Stack Overflow", "程序员问答社区", "stackoverflow.com", "https://stackoverflow.com"),
    ("开发", "掘金", "开发者技术社区", "juejin.cn", "https://juejin.cn"),
    ("工具", "高德地图", "地图与位置搜索", "www.amap.com", "https://www.amap.com"),
    ("工具", "有道翻译", "词典与翻译", "www.youdao.com", "https://www.youdao.com"),
    ("工具", "网易云音乐", "音乐搜索与收听", "music.163.com", "https://music.163.com"),
]

wb = Workbook()
ws = wb.active
ws.append(HEADER)
for i, (cat, title, desc, domain, url) in enumerate(rows):
    link1_name = f"访问官网 - {domain}"
    # 7 基础列 + link1(2) = 9 个有值；link2..10 共 18 列留空
    row = [i, cat, 1, title, desc, "", "搜索引擎,聚合搜索", link1_name, url] + [""] * 18
    ws.append(row)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
wb.save(OUT)
print(f"wrote {OUT}  (rows={len(rows)})")
