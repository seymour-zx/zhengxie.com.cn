# 概览：两张真值源新增行级总开关 `enabled`

## 决策（用户拍板）
- 在两表各加**同一字段名** `enabled`：语义同构（"本行是否参与读取/输出"），沿用 dir_path 跨表同名的既有约定，可复用同一段卫哨。
- 规则：`True`/真值 → 读取；`False` / 空值 / 其他 → **不读取**。
- 真值集合（大小写不敏感，精确匹配）：`true` / `1` / `yes` / `y` / `是` / `on`。

## 数据层改动
- `assets/xlsx/self_meta.unified.xlsx`：末列加 `enabled`，3 行全 `True`。
- `assets/xlsx/self_links.unified.xlsx`：末列加 `enabled`，191 行全 `True`。
- 后续关停任意频道/卡片：把对应行 `enabled` 改为 `False` 或留空即可。

## 代码层改动（assets/.build/build_homeplus.py）
- 新增 `ENABLED = "enabled"` 常量 + 并入 `HEADER_NORMALIZE` 恒等映射。
- 新增 `_is_enabled(cell)` 与 `_TRUE_TOKENS`。
- 三处拦截：
  1. `meta_dir_paths()` → 跳过 enabled=False 频道（不进白名单）。
  2. `load_meta()` → 非根频道 enabled=False 视为无元信息行（返回 `{}`）。
  3. `load_rows()` → 跳过 enabled=False 卡片。
- `list_directory_pages()` 同步加开关：enabled=False 频道不列入清单、不创建空目录。
- **根页豁免**：`dir_path="/"` 永不被 enabled 关闭（白名单恒含 `/`、`load_meta("/")` 不做开关检查），保证站点入口常驻。

## 验证结果
- 语法检查通过；全量 build 零回归：根页 65 / engine 67 / gov 59 张卡片。
- 单元测试全过：
  - 根页 `enabled=False` → 仍正常生成。
  - `directory/gov` 频道 `enabled=False` → 白名单 + `list_directory_pages` + `load_meta` 三重拦截，不生成页。
  - 卡片 `enabled=False` → `load_rows` 跳过（gov 59→58）。
  - `_is_enabled` 15 例真值判定正确。

## 备份与纪律
- 改前快照：`backups/2026-08-28-enabled-guard/`（MANIFEST + build_homeplus.py + 两张 xlsx）。
- 按 Git 全停令**未提交**，由用户本地收口。

## 待确认（延续历史 D-2~D-10）
D-2 候选字段｜D-3 台账接入｜D-4 GA4 去留｜D-5 备案｜D-6 百度站长｜D-7 扩省节奏｜D-8 功能排期｜D-9 MEMORY 瘦身｜D-10 git 提交。
