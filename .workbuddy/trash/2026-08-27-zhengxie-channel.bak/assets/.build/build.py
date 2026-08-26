# -*- coding: utf-8 -*-
"""
build.py —— 正协导航 · 构建编排入口
====================================
统一构建入口：按顺序执行各子任务，让「一次命令 = 全站最新」。

执行顺序：
    1. build_homeplus.py   生成导航产品页（根 index.html + directory/<name>/index.html）
    2. collect_meta.py     采集全站 index.html 的 title/keywords/description，导出 SEO 报告 xlsx

设计：
    - 两个子任务都默认执行，无开关；如需只生成页面，可直接跑 build_homeplus.py。
    - 任一步骤失败即中断并保留非零退出码，避免「表面成功、实际漏跑」。
    - 子脚本均基于自身 __file__ 定位仓库根，故此处无需关心 cwd。

用法：
    python assets/.build/build.py
"""

import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def run_step(script_name, step_label):
    script = os.path.join(HERE, script_name)
    if not os.path.isfile(script):
        sys.stderr.write("✗ 缺少子脚本：%s\n" % script)
        return False
    print("\n%s  ▶ 执行 %s" % ("=" * 4, step_label))
    print("    命令：python %s" % script)
    try:
        # 子脚本用 sys.executable 保证与当前解释器一致；cwd 设为仓库根以贴近手动运行习惯
        proc = subprocess.run(
            [sys.executable, script],
            cwd=os.path.dirname(HERE),  # zhengxie.com.cn/
            check=False,
        )
    except OSError as e:
        sys.stderr.write("✗ 启动失败 %s：%s\n" % (script_name, e))
        return False
    if proc.returncode != 0:
        sys.stderr.write("✗ %s 执行失败（退出码 %d），已中止后续步骤。\n" % (step_label, proc.returncode))
        return False
    print("    ✓ %s 完成" % step_label)
    return True


def main():
    print("正协导航 · 构建编排开始")
    steps = [
        ("build_homeplus.py", "生成导航产品页（根页 + 频道页）"),
        ("collect_meta.py", "采集 SEO 元信息并导出 xlsx 报告"),
    ]
    for i, (script_name, label) in enumerate(steps, 1):
        if not run_step(script_name, label):
            sys.stderr.write(
                "\n✗✗✗ 构建中断：第 %d/%d 步「%s」失败，后续未执行。\n"
                "    请先修复该步骤后再重新运行 build.py。\n" % (i, len(steps), label)
            )
            sys.exit(1)
    print("\n" + "=" * 40)
    print("✓ 全部 %d 个构建步骤成功完成。" % len(steps))
    print("=" * 40)


if __name__ == "__main__":
    main()
