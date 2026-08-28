# 2026-08-28 scope 改为频道目录路径 · 路径 Bug 修复

## 问题
xlsx 的 `scope` 值改为 `/`、`directory/gov`、`directory/engine`（相对 BASE_DIR 的频道目录路径）后，
`build_homeplus.py` 仍用 `os.path.join(DIRECTORY_ROOT, name)`（DIRECTORY_ROOT="directory"）拼路径，
导致频道页被写到 `directory/directory/gov/index.html`（多一层目录）。用户要求产物为 `directory/gov/index.html`。

## 根因
`DIRECTORY_ROOT` 写死的 `"directory"` 与 scope 值里已包含的 `"directory/gov"` 叠加 → 双重目录。
`scope` 现在本身就是「相对 BASE_DIR 的输出目录路径」，不应再叠加 `DIRECTORY_ROOT`。

## 修复（build_homeplus.py）
- `list_directory_pages()`：返回 `(scope, out, prefix, canonical)`；
  - `out = os.path.join(BASE_DIR, scope, "index.html")`（scope 已是相对目录）
  - `prefix = "../" * 路径段数`（directory/gov → 2 段 → "../../"）
  - `canonical = "/" + scope + "/"`
  - 根页 scope="/" 跳过
- `main()`：根页 `load_meta("/")` + `render_and_write("/", ...)`；频道循环用推导出的 `prefix`
- 移除写死的 `DIR_ASSET_PREFIX` 常量（资源前缀改由 scope 段数推导）
- `load_meta` 默认参数 `"root"` → `"/"`
- 框架约定 docstring（模块头/命名/元信息/canonical/本期不做）同步为 scope 路径语义

## 验证
- 完整构建 `build.py` exit 0；无 `directory/directory/` 再现
- 正确产物：`index.html`、`directory/gov/index.html`、`directory/engine/index.html`
- 三页内容与 scope 改动前基线**逐字节一致**（94007 / 88532 / 95720 B）→ 仅路径逻辑修正，页面内容零变化
- 错误残留 `directory/directory/` 已移入 trash/2026-08-28-scope-bug-artifact/（可回档）

## 答用户疑问
`DIRECTORY_ROOT` 里写死的 `"directory"` 确实不该再用于拼输出路径；频道「目录路径」现由 `scope` 字段
自身承载（其值=相对 BASE_DIR 路径）。`DIRECTORY_ROOT` 仅保留给「清理旧页」时的子目录遍历。
卡片表的 `dir_path` 列仍是预留占位（未参与渲染），目前由 scope 实际承担「输出目录路径」职责。

⏳ 待确认：本次改动（build 脚本 + docstring；xlsx scope 值改动前备份于 backups/2026-08-28-scope-path/）未 git 提交，由用户本地收口。
