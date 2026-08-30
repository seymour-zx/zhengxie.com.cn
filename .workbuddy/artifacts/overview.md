# 前端流畅性修复总览（2026-08-31）

## 范围
`assets/js/main.js`（交互核心）、`assets/css/style.css`（已审阅，配合）、`pages/*`（CSS 版本对齐）。

## 三个根因与修复

### 1. 滑道滑不动（主因 A）
**现象**：鼠标悬停在分类/标签/链接滑道（真溢出、显示 grab 光标）上滚动滚轮，整页卡住无法上下滚。
**根因**：全局 `wheel` 监听对 `is-scrollable` 元素**无条件** `preventDefault()`，即使滑道已到横向边界仍吞掉竖向滚轮。
**修复**：`main.js` wheel 处理改为「仅当滑道能朝滚动方向继续横滑时才劫持；到边界则交还页面」；并支持 trackpad 横向 `deltaX`。

### 2. 点击按钮无反应 / 滑不动（主因 B）
**现象**：点「返回顶部」4 按钮之一后，页面最长 8 秒内滚轮/触摸/键盘滚动被全局拦截，像“冻死”。
**根因**：`lockUserInput()` 在每次点击时全局 `preventDefault` 拦截输入，靠 8s 兜底定时器解锁；若本次滚动几乎不动，解锁要等满 8s。
**修复**：删除全局输入锁（`clickLock/lockUserInput/forceUnlock/pendingUnlock/__zxScrollUnlockTimer`）。点击只做 `safeScrollTo` + `showTarget`，位置同步交由 `scroll` 事件的 `syncScroll` 自然完成。**无任何锁可死**。T6 的 smooth→two-arg 降级保留。

### 3. 桌面无法拖拽滑道
**现象**：CSS 给了 `grab/grabbing` 光标暗示可拖，但无拖拽实现。
**修复**：新增单例拖拽横向滚动（仅 3 个 document 级监听），作用于 `is-scrollable` 的 `.track`/`.card__tags`/`.card__links`；触屏仍走原生 pan-x；拖动 >6px 才视为拖拽并抑制本次 click，避免误点分类/标签/链接。

## 跨文件一致性
- `pages/*` 9 个信息页原引用旧 CSS 缓存戳 `?v=1834b4c7`，与 `index/topics` 的 `15849494` 不一致 → 回访者拿到陈旧样式。已统一为 `15849494`。
- `pages/*` 仍不加载 `main.js`（无声明条/浮动滚动按钮/暗色切换）——一致性待办，本次未扩范围。

## 验证
- `node assets/.build/qa-scroll-check.js` → ✅ 两场景均通过（退出码 0）。
- `node --check assets/js/main.js` → ✅ 语法 OK。
- 无残留对已删变量（`clickLock/pendingUnlock/...`）的引用。

## ⚠️ 需造物主确认
第 2 项移除了 MEMORY.md 铁律「T6/小米：先锁后滚」里的**锁机制**。新方案无锁、永不冻结，但字面偏离「先锁后滚」。若认可，请同步把 T6 改为：safeScrollTo 必须 smooth→降级兜底；滚动按钮不锁用户输入、位置由 scroll 事件自然同步。
