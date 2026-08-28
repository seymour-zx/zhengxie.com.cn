# self_links.dir_path 孤儿行拦截 —— 实施概览（2026-08-28）

## 用户两条铁律
1. **`self_meta.unified.xlsx` 的 `dir_path` 决定创建什么页面**
2. **`self_links.unified.xlsx` 的 `dir_path`，若 `self_meta.unified.xlsx` 中没有 → 跳过该行**

## 结论
- **规则 1：已满足（无需改动）。** `list_directory_pages()` 的频道清单**只**来自 `self_meta.unified.xlsx` 的非根 `dir_path` 行；根页 `index.html` 硬编码生成。即「页面由 meta 定义」。
- **规则 2：本次新增强制。** 此前 `load_rows` 仅按 `dir_path` 过滤，**不与 meta 交叉校验**——若有人在 `self_links` 里写了 meta 未定义的频道，孤儿卡片会照常进入页面。现已加白名单拦截。

## 改动（均在 `assets/.build/build_homeplus.py`）
1. 新增 `meta_dir_paths()`：读 `self_meta.unified.xlsx` 全部「归一化」`dir_path` 集合（含根 `/`），作为合法频道白名单。
2. `load_rows(...)` 增加可选参数 `valid_dir_paths`：给定时，行归一化后若 `dir_path` 不在白名单内 → **跳过该行**。
3. `render_and_write(...)` 透传 `valid_dir_paths`。
4. `main()` 计算一次白名单（并额外 `.add("/")`，保证根卡片恒渲染），传给根页与所有目录页渲染。

### 关键设计
- `valid_dir_paths` **默认 `None`** → `check_links.py` 等全量排查调用**不受影响**，仍读取全部行（含孤儿行，便于发现脏数据）。**仅 build 主路径启用过滤。**
- 根页 `"` 恒为合法：`main()` 硬编码生成根页，故即便 meta 缺 `/` 行，根卡片仍渲染（避免根页丢全部卡片）。

## 验证
- `py_compile` 通过；全量 `build_homeplus.py` 零回归：根页 65 / engine 67 / gov 59 张卡片。
- 单元测试：临时副本追加 `directory/orphan` 行 →
  - 带白名单 `load_rows`：孤儿行数 = **0**（被跳过 ✅）
  - 不带白名单：孤儿行数 = **1**（全量模式保留，check_links 行为不变 ✅）
  - 合法 `directory/gov` 行 = 59（不受影响 ✅）

## 改动文件 / 备份
- 改动：`assets/.build/build_homeplus.py`（运行前已快照至 `.workbuddy/backups/2026-08-28-links-meta-guard/build_homeplus.py` + MANIFEST）。
- 数据现状：meta 三值 `/`、`directory/gov`、`directory/engine`；self_links 仅引用此三值，**当前无孤儿行**，本次为防御性强制。
- ⚠️ **未 git 提交**（Git 全停令），由用户本地收口。

## ⏳ 待确认（延续历史 D-2~D-10）
D-2 候选字段｜D-3 台账接入｜D-4 GA4 去留｜D-5 备案｜D-6 百度站长｜D-7 扩省节奏｜D-8 功能排期｜D-9 MEMORY 瘦身｜D-10 git 提交。
