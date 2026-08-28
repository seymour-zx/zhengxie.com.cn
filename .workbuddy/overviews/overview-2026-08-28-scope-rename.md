# 概览：scope 键改名为 dir_path（与列表字段对应）

## 改动动机
统一真值源的 `scope` 列虽名为"作用域"，实际装载的是"相对 BASE_DIR 的频道目录路径"（值如 `/`、`directory/gov`）。名实不符，且卡片表早有预留的空 `dir_path` 列、代码也有 `DIR_PATH="dir_path"` 占位常量——用户拍板将列名与代码键统一为 `dir_path`。

## 数据层（两张 xlsx）
- `self_links.unified.xlsx`：`scope` 列 → `dir_path`；删除预留的空 `dir_path` 列（删除前非空校验 = 0 单元格，无数据损失）。
- `self_meta.unified.xlsx`：`scope` 列 → `dir_path`。
- 改名后无重名列。

## 代码层（build_homeplus.py，受控整词替换）
- 删除占位常量 `DIR_PATH="dir_path" # 预留占位`；`SCOPE="scope"` → `DIR_PATH="dir_path"`（唯一定义）。
- dict 键访问 `r.get(SCOPE)` / `rr[SCOPE]` / 过滤比较全部改用 `DIR_PATH`。
- 函数参数与局部变量 `scope` → `dir_path`：`load_rows` / `load_meta` / `render_and_write` / `list_directory_pages`。
- `header.index("scope")` → `header.index("dir_path")`；两处 `if "scope" not in header` 同步。
- 内部标识符：`_normalize_scope`→`_normalize_dir_path`、`_EMPTY_SCOPE_SENTINELS`→`_EMPTY_DIR_PATH_SENTINELS`、`rscope`→`rdir_path`、`scope_idx`→`dir_path_idx`。
- 故意保留 HTML 微数据属性 `itemscope`（面包屑标记，不可改）。

## 验证（零回归）
- `py_compile` 通过。
- 全量 `build.py`：根页 / engine / gov 三页 HTML 与改动前基线**逐字节一致**（94007 / 95720 / 88532 字节）。
- 路径正确：`index.html`、`directory/gov/index.html`、`directory/engine/index.html`；无 `directory/directory` 残留。

## 文件
- 改动：`assets/.build/build_homeplus.py`、`assets/xlsx/self_links.unified.xlsx`、`assets/xlsx/self_meta.unified.xlsx`
- 改前快照：`.workbuddy/backups/2026-08-28-scope-rename/`（含 MANIFEST）

## 待用户拍板
- 本次改动未 git 提交（Git 全停令），由用户本地收口。
- D-2~D-10 历史遗留仍待拍板。
