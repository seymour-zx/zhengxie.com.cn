# -*- coding: utf-8 -*-
"""第 45 棒（数据分析专家）交付 · 政务区零广告审计门闸（构建期 CI 用）。
用法：python audit_ad_placement.py
政策（2026-08-29 用户已决 · 采纳 #44 §5.3 放宽）：
  广告「band」位于卡片网格之外（hero 内 / 网格后 footer 前）即视为合规；
  真正违规 = 广告标记出现在「卡片网格区域（<main>...</main>）」之内。
  故本门闸只统计 <main> 区域内的广告标记；页级 band 不计入。
逻辑：抓取 GOV_PAGES → 取 <main> 区域 → 统计 adsbygoogle/data-ad-slot/ad--top|bottom/google_ad_client
      出现次数；网格内必须 = 0 才 PASS。退出码 1 = 有失败页（CI 阻断）。
可扩展：把 GOV_PAGES 换成本地构建产物路径即可接入 build 后校验。
"""
import sys, re, urllib.request

AD_PATTERNS = [r'adsbygoogle', r'data-ad-slot', r'class="ad ad--(top|bottom)"', r'google_ad_client']
GOV_PAGES = {
    "home (政协/民主党派网格)": "https://zhengxie.com.cn/",
    "about (可信声明页)": "https://zhengxie.com.cn/pages/about/",
    "disclaimer (免责页)": "https://zhengxie.com.cn/pages/disclaimer/",
}

def grid_region(html):
    """只取卡片网格区域（<main>...</main>）；无 main 时回退全页。
    放宽规则：页级 band（hero 内 / 网格后）不算政务区广告。"""
    m = re.search(r'<main.*?</main>', html, re.S | re.I)
    return m.group(0) if m else html

def count_ads(html):
    region = grid_region(html)
    return sum(len(re.findall(p, region, re.I)) for p in AD_PATTERNS)

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "ignore")

def main():
    print("=== 政务区零广告审计门闸（放宽规则：仅统计 <main> 网格内广告标记）===")
    results = {}
    for name, url in GOV_PAGES.items():
        try:
            html = fetch(url)
        except Exception as e:
            results[name] = {"error": str(e)}
            continue
        results[name] = {"ad_markers_in_grid": count_ads(html), "pass": count_ads(html) == 0}
    fails = []
    for name, r in results.items():
        if "error" in r:
            print(f"[ERR ] {name}: {r['error']}")
            fails.append(name)
        else:
            status = "PASS" if r["pass"] else "FAIL"
            if not r["pass"]:
                fails.append(name)
            print(f"[{status}] {name}: 网格内广告标记数={r['ad_markers_in_grid']}")
    print("\n政务区（网格内）零广告闸门：" + ("全部通过 ✅" if not fails else f"存在失败页 ❌ -> {fails}"))
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
