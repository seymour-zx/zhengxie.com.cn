# -*- coding: utf-8 -*-
"""第 45 棒（数据分析专家）配套分析：验证方案功效对比 + 数据完整度量化。
运行：managed python analysis_45.py  (cwd = 站点根目录)
输出：① 组间 n=10/arm vs 组内 n=24 的功效曲线（PNG） ② cards.unified.xlsx 完整度表
"""
import math, json
from collections import Counter
from pathlib import Path

ROOT = Path("D:/Universal Space/zhengxie.com.cn")
OUT = ROOT / ".workbuddy" / "agent-review-survey"

def power_between(n_per_arm, d, alpha=0.05):
    """两独立样本 t 检验（等方差已知近似）功效。n_per_arm = 每组样本。"""
    za = 1.959963985
    z = d * math.sqrt(n_per_arm / 2.0) - za
    return 0.5 * (1 + math.erf(z / math.sqrt(2)))

def power_within(n, d, r=0.5, alpha=0.05):
    """配对（组内）t 检验功效。dz = d / sqrt(2(1-r))。"""
    za = 1.959963985
    dz = d / math.sqrt(2 * (1 - r))
    z = dz * math.sqrt(n) - za
    return 0.5 * (1 + math.erf(z / math.sqrt(2)))

print("=" * 70)
print("PART A · 验证方案功效对比（#40 组间 n=20 vs #41 组内 n=24）")
print("=" * 70)
print(f"{'Cohen d':>8} | {'#40 组间 10/arm':>18} | {'#41 组内 n=24':>16} | 结论")
print("-" * 64)
for d in [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]:
    pb = power_between(10, d)
    pw = power_within(24, d)
    verdict = "组内明显更优" if pw - pb > 0.15 else ("组内较优" if pw > pb else "相当")
    print(f"{d:>8.1f} | {pb:>17.2%}        | {pw:>15.2%}     | {verdict}")

# #40 实测指标推演：信任评分差 ≥1.0（1–5 李克特）。d 取决于标准差 SD。
print("\n#40 实测指标「信任评分差 ≥1.0」按不同 SD 换算 d 后的功效：")
for sd in [0.8, 1.0, 1.2, 1.4]:
    d = 1.0 / sd
    pb = power_between(10, d)
    pw = power_within(24, d)
    print(f"  SD={sd:.1f} → d={d:.2f} | #40 组间={pb:.1%} | #41 组内={pw:.1%}")

print("\n注：α=0.05 双尾；组内相关 r 取 0.5（典型重复测量）。功效 ≥0.8 视为可检出。")

# ---------- 画图 ----------
try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    ds = [i / 100 for i in range(25, 96, 5)]  # 0.25..0.95
    pb = [power_between(10, d) for d in ds]
    pw = [power_within(24, d) for d in ds]
    fig, ax = plt.subplots(figsize=(7.2, 4.2))
    ax.plot(ds, pb, "o-", color="#9E1B22", label="#40 组间 A/B (10/arm, n=20)")
    ax.plot(ds, pw, "s-", color="#1F6FB2", label="#41 组内 (n=24, r=0.5)")
    ax.axhline(0.8, ls="--", color="#555", lw=1)
    ax.text(0.26, 0.82, "功效 0.80 线", color="#555", fontsize=9)
    ax.set_xlabel("Cohen' d（效应量）")
    ax.set_ylabel("统计功效 (Power)")
    ax.set_title("验证方案检出力对比：组间 n=20 vs 组内 n=24")
    ax.legend(fontsize=9, loc="lower right")
    ax.set_ylim(0, 1.02)
    ax.grid(alpha=0.3)
    png = OUT / "第2轮-验证功效对比-2026-08-29.png"
    fig.savefig(png, dpi=130, bbox_inches="tight")
    print(f"\n[PNG] 已保存：{png}")
except Exception as e:
    print(f"\n[跳过 PNG] matplotlib 不可用：{e}")

print("\n" + "=" * 70)
print("PART B · 数据完整度量化（cards.unified.xlsx，#38 口径复核）")
print("=" * 70)
try:
    import openpyxl
    f = ROOT / "assets" / "xlsx" / "cards.unified.xlsx"
    wb = openpyxl.load_workbook(f, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    wb.close()
    header = list(rows[0])
    data = rows[1:]
    n = len(data)
    ci = {name: i for i, name in enumerate(header)}
    print(f"总行数 = {n}  列数 = {len(header)}")
    print("列名：", header)
    miss = {}
    for c in header:
        j = ci[c]
        m = sum(1 for r in data if r[j] is None or str(r[j]).strip() == "")
        miss[c] = m
        print(f"  {c:<14} 缺失 {m:>4}/{n} = {m/n*100:5.1f}%")
    for key in ("cat", "category", "分类"):
        if key in ci:
            cnt = Counter(str(r[ci[key]]) for r in data)
            print("分类分布：", dict(cnt.most_common()))
            break
except Exception as e:
    print(f"[跳过] 读取 xlsx 失败：{e}")
