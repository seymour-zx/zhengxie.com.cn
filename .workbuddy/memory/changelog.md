# 项目迭代卡摘要（changelog）

> 性质：L1 按需读（被 MEMORY/用户点名才读）。本文件是 2026-08-21/22/24 三天流水日志的**精炼迭代卡**；原日志 `2026-08-21.md`/`2026-08-22.md` 已提炼删除（回档于 `.workbuddy/backups/backup_logs_remove_20260824_1430/`），`2026-08-24.md` 已精简保留。
> 用途：快速回看"哪一轮做了什么决策/锁死什么"，不翻全量流水。详细实现见回档或 `2026-08-24.md`。

## 设计语言与暗色模式（已锁死）
- 暗色 = 近黑暖漆面黑 `#0D0C0E` + 暖炭灰 `#171519` + 亮金 `#E8CB84` + 象牙白 `#EDE8E0`，**禁止蓝紫**。（v6 第八轮）
- 默认明亮模式：仅当 `localStorage='dark'` 才暗色，不跟随系统。（v6 第八轮）
- 404 页 FOUC 仅本地 dark 才暗色，无全局 `referrer` meta。（第十五/十六轮）

## 链接属性规则（build.py 域名白名单，已锁死）
- 优先级短路：同域 `_self` → 同族 `noopener` → 营销 `sponsored…` → 评论 `ugc…` → 暴露 `nofollow noopener` + `referrerpolicy=origin` → 默认 `nofollow noopener noreferrer`。
- 全部由 `build.py` 的 `LINK_ATTR_PRESET` 域名白名单决定，增删只改 py 一处。（第九/十轮）
- 全站**不设**全局 `<meta name="referrer" no-referrer>`（仅卡片 `<img>` 保留 `referrerpolicy=no-referrer` 防防盗链）。（第九轮）

## 外链/内链/资源路径约定
- 内链 = 绝对域名 `https://zhengxie.com.cn/...`；资源 = 相对路径。
- 根页 `assets/...`、子页 `../../assets/...`（均指向根唯一真源，本地 file:// 也能加载）。（第十六轮子页改造）
- 换域名只改 `build.py` 的 `SITE_DOMAIN` 一处。（第四轮）

## 页面骨架 S1–S6（+可演进）
- S1 导航产品页（build 生成）/ S2 全站中枢页「网站全景」`/pages/overview/` / S3 说明信息页 / S4 合规页 / S5 功能入口 / S6 文章页。
- **骨架可演进**：优先归集已有骨架，确有利则新增 S7+；不私增编号。（第二十/二十一轮）
- 博客/日记一律走 S6，不塞 S3/about。（第二十一轮）

## 目录结构（已定稿）
- `pages/` 统辖 S2/S3/S4/S5 全部说明/中枢/合规/功能页（含 overview）；导航频道用 `directory/<name>/`（S1 实例）。
- `units/`、`test.html` 开发残留已清。（第二十三轮）

## 备案号策略
- GitHub Pages 托管，无 ICP 备案；备案号 HTML 注释占位不渲染，迁移国内服务器后取消注释即用。（第十二/十三轮）

## 专家转介纪律（硬边界）
- 5 类必须转专家：法律合规 / SEO 收录策略 / 视觉设计评审 / ICP 备案 / 广告收益。AI 仅做技术草稿，不下专业结论。（第十九轮 → 现 CONVENTIONS.md 第二节）

## 2026-08-24 当日关键动作
- **身份软链重建**：C盘 4 身份文件 → D盘空间内软链，跨设备身份/记忆同步恢复。
- **SEO 结构化**：sitemap 补全至 26 条；全站 JSON-LD（WebSite/WebPage/CollectionPage/AboutPage/ContactPage）+ BreadcrumbList。
- **面包屑下移**：从页面顶部 → 底部广告位②上方（样式：12px、金色上边线、`/` 分隔、当前项红）。回档 `backup_breadcrumb_bottom_20260824_1151/`。
- **流程与执行纪律**：建立四阶段迭代环 + 同步强制规则（堵"约定≠同步"断层，补 add 漏跟踪日志）。
- **文件治理**：合并 `dev-process-plan.md` + `execution-rules.md` 进 `CONVENTIONS.md` 第五节「流程与执行」并删两独立 md；立 MEMORY 为首读锚点（三级读取 L0/L1/L2）；提炼本 changelog（原日志保留）。
- **待办（未展开）**：备份纪律沉淀（孤儿备份/命名/是否可删的判断标准）——用户明确"留着后期讨论，现在不讨论、不临时增 md"。
- **待定**：`index.html` 等 build 产物是否进 Git（当前已在仓库，策略歧义）。

## 已知遗留（BACKLOG）
- `pages/` 子页 assets 已改 `../../assets/` 引用；无未清残留。
- 营销/评论域名预设 `MARKETING = []` / `UGCCOMMENT = []` 待增删。（第十轮）
- 榜单（收录榜/访问榜）数据 PENDING，预留 S7 升级口。（第二十一轮）
