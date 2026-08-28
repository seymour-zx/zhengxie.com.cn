# 修复：homeplus 读 xlsx 改为读第一个 tab（2026-08-28）

## 故障现象
`build_homeplus.py` 运行时 `raise ValueError`（退出码 1），根页 `index.html` 未生成。

## 根因
`self_links.unified.xlsx` 含 2 个 tab：
- tab0 `Sheet` = 英文卡片数据（192 行，表头 `row_seq/dir_path/cat_name/card_title/...`）
- tab1 `all_cppcc` = 中文政协机构名录（3338 行，表头 `序号/全称/级别/...`）

脚本原用 `wb.active` 读**活动表**，而中文名录表恰好被设为活动表 → 读到中文表头，缺 `row_seq/cat_name/card_title` → 抛错。

`self_meta.unified.xlsx` 当时已正常（用户已自行恢复），1 个 tab `元信息`，英文表头 + 3 行频道 + `enabled`。

## 改动（assets/.build/build_homeplus.py）
1. 4 处 `ws = wb.active` → `ws = wb.worksheets[0]`（806/968/1024/1069 行），两份 xlsx 统一读**第一个 tab**。
2. 日志标签 `f"directory/{dir_path}"` → `dir_path`（消除 `directory/directory/engine` 重复显示；实际写出路径本就正确）。

## 验证
- `py_compile` OK；全量 build `EXIT=0`。
- 产物：根页 65 卡（94056B）/ engine 67 卡（95720B，与基线一致）/ gov 59 卡（88532B，与基线一致）。
- 无 `directory/directory/` 嵌套目录；三页均含 `</html>`。

## 备份与纪律
- 改前快照：`backups/2026-08-28-read-first-tab/`（MANIFEST + build_homeplus.py）。
- 两份 xlsx 由用户自行处理（英文卡片置于 tab0），本会话未改动数据文件。
- 未 git 提交（Git 全停令），由用户本地收口。

## 备注（非阻断）
- 构建时 `safe-delete` 警告为**沙箱无回收站**噪声，回退覆盖已成功；在用户本机 Windows 有回收站时不会出现。如需干净日志，可把清理改为 `os.replace` 静默覆盖（待定）。
