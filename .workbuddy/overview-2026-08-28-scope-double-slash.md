# 概览：scope 含连续斜杠 `//` 判为非法（2026-08-28）

## 改动背景
用户确认 `directory///gov` 与 `directory/gov` 在磁盘上落点相同、仅可能导致卡片缺失，遂拍板：
**含连续斜杠 `//` 的 scope 视为非法字符，跳过不读**。此规则覆盖上一条「不折叠内部 `//`」方案。

## 核心改动（`assets/.build/build_homeplus.py`）
- 在 `_normalize_scope` 中，**去首尾斜杠之前**新增拦截：
  ```python
  if "//" in s:
      return None
  ```
- 关键修正点：若放在 `s.strip("/")` 之后，开头的 `//`（如 `//directory/gov`）会被 `str.strip("/")`
  剥掉而**漏判**成 `directory/gov`；前置拦截确保任何位置的 `//` 都被拒。
- 文档同步：顶部注释头规则 2 改「仅去首尾斜杠」、规则 3 增「含 `//` 连续斜杠（视为非法字符）」；
  docstring 注明此覆盖先前的「不折叠 `//`」方案。

## 验证（零回归）
- 单元 14 例全过：根 `/` 保留；单斜杠 `/directory/gov`、`directory/gov/` 正常归一化；
  4 种 `//` 形态（`directory///gov`、`//directory/gov`、`//directory///gov//`、`directory/gov//`）全部返回 `None`；
  `..`/非法字符/Windows 保留名/空值/哨兵 全部 `None`。
- 全量 `build.py` 三页 HTML 与改动前基线**逐字节一致**（94007 / 88532 / 95720 B）。
- 无 `directory/directory/` 错误路径，正确产物 `index.html`、`directory/gov/index.html`、`directory/engine/index.html`。

## 文件
- 改动：`assets/.build/build_homeplus.py`
- 改前快照：`.workbuddy/backups/2026-08-28-scope-double-slash/`（含 MANIFEST）

## 待确认
1. 本次改动未 git 提交（Git 全停令），由用户本地收口。
2. D-2~D-10 历史遗留仍待拍板。
