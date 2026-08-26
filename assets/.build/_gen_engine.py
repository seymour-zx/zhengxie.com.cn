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
    ("综合搜索", "Google 搜索", "全球索引量最大的多语综合搜索，学术、地图、翻译等延伸服务齐全", "www.google.com", "https://www.google.com"),
    ("综合搜索", "必应 Bing", "微软旗下综合搜索，深度集成 Windows 与 Copilot AI 智能应答", "www.bing.com", "https://www.bing.com"),
    ("综合搜索", "百度", "中文网页与语义理解见长，贴吧、知道、百科构成内容生态闭环", "www.baidu.com", "https://www.baidu.com"),
    ("购物", "淘宝", "电商商品与店铺检索，支持销量、价格、信用筛选与直播带货", "www.taobao.com", "https://www.taobao.com"),
    ("购物", "京东", "自营与品牌电商检索，以物流时效与正品保障为特色的购物搜索", "www.jd.com", "https://www.jd.com"),
    ("购物", "拼多多", "低价拼团模式下的商品搜索，下沉市场供给与农货丰富", "mobile.yangkeduo.com", "https://mobile.yangkeduo.com"),
    ("社区知识", "知乎", "高质量中文问答社区，专业答主长文与观点检索入口", "www.zhihu.com", "https://www.zhihu.com"),
    ("社区知识", "维基百科", "非营利的协作百科，引用可追溯、跨语言词条互链", "zh.wikipedia.org", "https://zh.wikipedia.org"),
    ("社区知识", "微信搜一搜", "检索公众号文章、视频号与朋友圈内容，封闭生态内搜索", "weixin.sogou.com", "https://weixin.sogou.com"),
    ("社区知识", "头条搜索", "基于字节推荐算法的通用搜索，信息流与热点聚合", "so.toutiao.com", "https://so.toutiao.com"),
    ("视频", "哔哩哔哩", "ACG 与 UP 主视频检索，弹幕文化与番剧社区入口", "www.bilibili.com", "https://www.bilibili.com"),
    ("视频", "抖音", "短视频内容搜索，按热点与挑战标签分发与发现", "www.douyin.com", "https://www.douyin.com"),
    ("开发", "GitHub", "代码仓库与开源项目检索，支持 Issue、PR 与代码全文搜索", "github.com", "https://github.com"),
    ("开发", "Stack Overflow", "编程报错与技术方案问答检索，按投票质量排序", "stackoverflow.com", "https://stackoverflow.com"),
    ("开发", "掘金", "前端、客户端与后端技术文章、教程与专栏检索", "juejin.cn", "https://juejin.cn"),
    ("工具", "高德地图", "POI 地点、路线与实时路况检索，含打车与周边服务", "www.amap.com", "https://www.amap.com"),
    ("工具", "有道翻译", "中英及多语词典与整句翻译，支持文档与网页翻译", "www.youdao.com", "https://www.youdao.com"),
    ("工具", "网易云音乐", "歌曲、歌单与歌词检索推荐，以乐评社区为特色", "music.163.com", "https://music.163.com"),
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
