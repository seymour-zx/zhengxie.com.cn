# self_meta 读取增强：表头行自动检测 + 列乱序/无关列容忍（2026-08-28）

## 背景：澄清「功能是否被删」
用户质疑「原先 py 读取 xlsx 的 ① 自动检测表头行 ② 列可乱序 ③ 可插无关列」是否被删除。核查当前脚本结论：
- **② 列乱序、③ 插入无关列**：一直支持、**未被删**。三个读取函数均按列名 `header.index("列名")` 定位（非按位置），多余列/乱序列天然忽略。
- **① 自动检测表头行**：仅 `load_rows`（self_links 卡片表）有 v4.2 逻辑（扫前 20 行首个含语义键的行）；`load_meta` / `meta_dir_paths` / `list_directory_pages`（self_meta 元信息表）原本就**固定读第 1 行**，此功能在这三函数里**本就无**（非删除，是设计如此）。

## 增强内容
新增共用辅助函数（供 self_meta 三个读取函数共用，对齐 load_rows）：
```python
def _locate_header_row(all_rows, required_keys, max_scan=20):
    for idx, row in enumerate(all_rows[:max_scan]):
        cells = [str(c).strip() if c is not None else "" for c in row]
        norm_keys = {HEADER_NORMALIZE.get(c, c) for c in cells if c}
        if required_keys <= norm_keys:
            return idx
    return None
```
- `load_meta` / `meta_dir_paths` / `list_directory_pages` 原先写死的 `header = [... for c in all_rows[0]]` + `if "dir_path" not in header: return` 全部替换为 `_locate_header_row(all_rows, {DIR_PATH})`，数据遍历起点由 `all_rows[1:]` 改为 `all_rows[header_idx + 1:]`。
- 列乱序/无关列本已通过 `header.index` 支持，本次一并对齐，使 self_meta 与 self_links 鲁棒性一致。

## 验证（全部通过）
- 语法：`py_compile` OK。
- T1 回归：用备份的正常 self_meta（无 enabled 列、表头第 1 行）→ 白名单 `{"/","directory/gov","directory/engine"}`、频道数 2、根/gov title 正确 ✅
- T2 鲁棒：构造「表头在第 3 行 + 列乱序 + 插入无关列（zzz_extra/garbage）」副本 → 自动定位第 3 行、三个函数全部正确读取 ✅
- T3 开关：构造「含 enabled 列 + 表头第 2 行」且 gov=False → 自动定位第 2 行、白名单排除 gov（仅剩 `/`+engine）✅

## 文件与纪律
- 改动：`assets/.build/build_homeplus.py`（+`_locate_header_row`，三函数接入）。
- 备份：`backups/2026-08-28-meta-header-autodetect/`（MANIFEST + 改前快照）。
- **未 git 提交**（Git 全停令，由用户本地收口）。

## ⚠️ 与「homeplus 不生成」的关系
本轮仅增强代码鲁棒性。**当前 `self_meta.unified.xlsx` 整文件已被清空（10 列全 None）**，仍需恢复数据文件才能让 homeplus 正常生成子页。恢复方案（待用户确认）：从 `backups/2026-08-28-enabled-guard/self_meta.unified.xlsx` 恢复 5 列数据，并补 `enabled=True` 列。增强后即使表头不在第 1 行、列乱序也能读，但空文件仍读不出——根因是文件损坏，非代码。
