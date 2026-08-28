# 概览：build_homeplus.py 增加 scope 归一化卫哨

## 动因
用户质疑 5 种 scope 写法（`directory/gov`、`/directory/gov/`、`/directory/gov`、`directory/gov/`、`//directory///gov//`）是否等价。
实测当前代码用原始字符串处理 scope，结果**不等价**：前导 `/` 会被 `os.path.join` 当作绝对路径、丢弃 BASE_DIR、把页面写到项目外；canonical 拼接产生双斜杠畸形 URL；行匹配因精确比较导致尾斜杠不匹配。

## 改动（4 条规则，用户拍板）
在 `_merge_meta` 之后新增 `_normalize_scope(raw)` 与常量 `_EMPTY_SCOPE_SENTINELS` / `_WIN_RESERVED` / `_ILLEGAL_NAME_CHARS`：

1. **空值 / 哨兵文本**（none/null/nil/na/n-a/nan）→ 跳过（视为「无 scope」行）
2. **归一化**：仅去首尾斜杠 → 干净相对路径；**不折叠内部 `//`**（按用户明确要求）
3. **拒绝非法**：含 `..` 穿越 / 非法文件名字符 / Windows 保留名
4. **安全网**：归一化后拼到 BASE_DIR 必须仍在项目内（`os.path.commonpath` 比对，跨盘 ValueError 兜底拒绝）

**根 `/` 特判**：去首尾斜杠会把根变空，特判保留为 `/`，否则根页元信息丢失。

接入点：`load_rows`、`load_meta`、`list_directory_pages` 三处均改用归一化后的 scope（行级跳过空值/非法，查询 scope 也归一化）。

## 验证
- 单元 15 例全过：根保留、5 变体正确归一化、空/哨兵/`..`/保留名/非法字符/跨盘 全部拦截为 None。
- 全量 `build.py` 三页 HTML 与改动前基线**逐字节一致**（94007 / 88532 / 95720 B）——数据零变化，仅新增防护逻辑。

## 受影响文件
- 改动：`assets/.build/build_homeplus.py`
- 备份：`.workbuddy/backups/2026-08-28-scope-normalize/`（含 MANIFEST + 脚本快照）

## 待确认
- 本次改动未 git 提交（Git 全停令），由用户本地收口。
