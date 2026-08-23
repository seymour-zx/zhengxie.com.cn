# 参考来源并入频道页（2026-08-24）

## 完成内容
将「分类依据 / 参考来源」作为「参考」分类写进各频道的 `self_links.xlsx`，由站点自动构建流程（`assets/.build/build_homeplus.py`）渲染到页面，而非手写 HTML。

## 关键修正
- 之前误用手写 HTML 生成频道页；实际站点有自动构建流程（读取 `directory/<频道>/assets/xlsx/self_links.xlsx` 自动生成 `index.html`），手写页会被覆盖。已改用「数据先行」的正确方式。
- 参考来源如实标注「依据公开权威信息整理」，作为「参考」分类卡片呈现（带「参考」筛选标签 + 链接），不参与正常导航但单列可筛。

## 改动文件
- `directory/nav/assets/xlsx/self_links.xlsx` — 追加 2 条参考（CNNIC、工信部备案系统），共 46 卡片
- `directory/gov/assets/xlsx/self_links.xlsx` — 追加 2 条参考（中国政府网、中央编办），共 84 卡片
- `directory/npc/assets/xlsx/self_links.xlsx` — 追加 1 条参考（中国政府网·国家机构），共 2 卡片
- `directory/party/assets/xlsx/self_links.xlsx` — 追加 2 条参考（共产党员网、中国共产党新闻网），共 11 卡片
- `directory/zhengxie/assets/xlsx/self_links.xlsx` — 追加 2 条参考（全国政协网、中央社会主义学院），共 65 卡片
- `directory/world-gov/assets/xlsx/self_links.xlsx` — 追加 2 条参考（CIA Factbook、联合国），共 37 卡片
- 运行 `assets/.build/build_homeplus.py` 重新生成全部频道页（含根页，128 卡片）

## 备份
- 各频道原始 xlsx 已备份至 `.workbuddy_backup_ref/<频道>_self_links.xlsx`

## 复用脚本
- `append_refs.py`：可重跑向各频道追加/更新「参考」分类（已过滤重复，仅增量补齐）。

## 待确认/优化项
- 参考卡片链接标签当前为「官网」，若希望更贴合「参考来源」语义，可将 xlsx 中 links 列名称改为「来源」或「参考」。
- 频道页已含「参考」作为顶部筛选分类之一；若不想让「参考」出现在筛选栏，需改 build_homeplus.py 的渲染逻辑（单独区块而非分类）。
- 旧手写 HTML 已自动被构建覆盖，现为正确版本。
