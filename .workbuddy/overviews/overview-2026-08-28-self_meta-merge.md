# 概览：self_meta.json 合并为 self_meta.unified.xlsx

## 做了什么
按用户指令，将散落在 3 处的 `self_meta.json`（根页 + gov 频道 + engine 频道）合并为单一真值源
`assets/xlsx/self_meta.unified.xlsx`，并改造 `build_homeplus.py` 改为从该 xlsx 按 `scope` 读取页面元信息。

## 关键改动
- **新增单一真值源** `assets/xlsx/self_meta.unified.xlsx`
  - 列：`scope | title | description | keywords | channel_intro`
  - 行：root / gov / engine（root、gov 带 `channel_intro`；engine 无，回退 description）
- **build_homeplus.py 改造**
  - 新增 `META_XLSX_PATH` 常量
  - `load_meta(scope)` 改为从 xlsx 按 scope 读取（取代原 `load_meta(json_path)` 读 json）
  - `list_directory_pages()` 改为从元信息 xlsx 的非 root scope 行枚举频道（频道由元信息表定义），不再扫描散落 json
  - `main()` 根页 `load_meta("root")`；目录页按元信息行生成，缺 title/desc/keywords 则跳过
  - 删除冗余 `is_empty_meta / is_empty_xlsx / _file_empty`（原 json 专属逻辑）
  - 修复 `render_and_write` 跳过分支引用未定义变量 `xlsx_path` 的潜在 bug（改为 `UNIFIED_XLSX_PATH`）
  - 文件内权威 docstring（元信息约定 / 命名约定 / 生成流程 / 本期不做）同步更新
- **冗余 json 处置**：3 份 `self_meta.json` 移入 `trash/2026-08-28-self_meta-merge.bak/`（软删可回档），改前快照存 `backups/2026-08-28-meta-merge/`

## 验证结果
- 改动前 baseline 比对：根页 / engine / gov 三页生成 HTML **逐字节一致**（94007 / 95720 / 88532 字节），元信息与导航数据零变化
- 删除 json 后重跑 `build.py`（含 collect_meta）→ 退出码 0，证明脚本已完全不依赖 json
- 全站活跃 `self_meta.json` 数量 = 0

## 待用户拍板
- ① 本次改动未 git 提交（Git 全停令，由用户本地收口）
- ② `collect_meta.py` 仍会 walk 进 `.workbuddy/trash/` 把历史快照页计入 SEO 报告（既有行为，是否排除 trash 待定）
- ③ D-2~D-10 历史遗留待拍板
