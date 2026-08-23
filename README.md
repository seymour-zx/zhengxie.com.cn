# 正协导航

> **让每一次寻找，都不止于找到**

正协导航是一个**全量收录**的精选站点导航站，覆盖常用入口、AI 智能、资讯媒体、设计创意、开发技术、学习教育、效率工具、影音娱乐等分类。设计风格为**奢华尊贵风**：主色红色系，搭配金色系与白色系，大面积白色背景，大气简洁不压抑。

本仓库是网站的全部源码与数据，**只要有这份 README 就能复现一个完全一样的网站**。

> **⚠️ 操作铁律**：任何设备 / 任何会话对本项目做任何改动前，**必须先读完下方「决策与偏好总览」整章**，并严格遵守各条目的状态标记。改动若与该章冲突即视为错误——先回退、再与用户确认，绝不允许「凭感觉又加一个功能」导致用户重复纠正（此前已发生过：分类计数徽章、暗色偏蓝紫）。

> **🌐 跨设备权威源约定（2026-08-23 指令）**：换设备对话时**只有本 `README.md` 与 `assets/skills/SKILL.md` 两个 md 保证可读**。因此所有"AI 必须遵守的项目规范"必须落在这两个 md 之一，或落在代码里（如 `assets/.build/build_homeplus.py` 顶部 docstring 已内置 `/directory/` 框架约定，即为跨设备权威源）。其它 `docs/*.md`（`docs/` 目录已删除，原 `SUBPAGE_BUILD_DESIGN.md` 内容已并入 build_homeplus.py docstring 与这两 md）**不算跨设备权威源**，不得作为规则的唯一出处。新增/修改项目级规则前先自问："这条在另台设备读得到吗？"读不到就别只放在 docs/ 里。详见 `assets/skills/SKILL.md` 顶部同款约定。

> **📖 动手前必读 SKILL.md（2026-08-23 指令）**：本仓库内的 `assets/skills/SKILL.md` 是**项目内部 SOP（标准作业流程）**，集中了所有构建、目录约定、子页联动、SEO 规则等"AI 必须遵守的规范"。**任何设备 / 任何会话 / 任何维护者（含 AI 团队）开始改动本项目前，必须先打开并读完该 SKILL.md**，再动手。README 只作概览与入口，细节与操作步骤一律以 SKILL.md 为准——避免两处维护漂移、也避免规范随会话丢失。如果进项目时没被明确指向它，请主动寻找仓库内的 `SKILL.md` 先读，再开工。

---

## ⚠️ 决策与偏好总览（任何会话开始优化前必读）

> 本章是项目**唯一权威决策手册**，把「多设备、多次对话中用户表达的想法」沉淀为**标准、可被任何新会话直接照做**的规则。
>
> **状态标记约定（必须掌握）**：
> - ✅ **已锁定 / 采纳（LOCKED）**：用户明确肯定或已定稿的规范，照做即可。
> - ❌ **明确禁止（FORBIDDEN）**：用户明确不要的。⚠️ 禁止项**可讨论不可擅改**：若你认为主流做法更优或更符合需求，可主动提议，但**绝不私自改动**本条目，须等用户确认后才可修改/删除。
> - 🔶 **可接受 / 已试行（ACCEPTABLE）**：未经你明确要求、由我（助理）主动新增的功能或修改，你事后**未明确赞同也未否定**。默认保留但不代表定稿——你不满意可随时退回，本条已注明「改动前原状态」以便回退。
> - ⏳ **待定（讨论过无结论，PENDING）**：曾讨论但未拍板，动手前必须先问用户。
> - 📋 **待办（下一步，BACKLOG）**：优化方向清单；新会话开场应先读此节，并主动提醒用户当前最该推进的一项。
>
> **创新自由度**：未被 ❌ 禁止的事项，我可大胆创新、发散性地新增功能与功效——只要能回退即可。凡属「未经你明确要求、由我主动加入」的，先按 🔶 记录并注明原状态。
> **本章维护规则（保证换设备也能学全）**：你明确要求或肯定的 → 记入 ✅；你明确否定 → 记入 ❌；我主动加且你未表态 → 记入 🔶 并注明原状态；讨论未决 → ⏳；优化想法 → 📋。任何改动都要同步更新本章。

### 1. 设计语言总纲（✅ 已锁定）

- **风格定位**：奢华尊贵风（premium / luxury）。红为主色、金为点缀、白为底，大面积白底，大气简洁不压抑。
- **暗色模式必须复用同一套奢华语言延伸到暗色**，**禁止**偏蓝、偏紫、科技冷淡、廉价渐变。已定暗色配色（除非用户新指令否则不可改）：漆面黑 `#0D0C0E` / 暖炭灰 `#171519` / 亮金 `#E8CB84` / 象牙白 `#EDE8E0`。
- 任何新增 / 改动 UI 都必须服从这套语言；**不得擅自引入新的主色或新的视觉调性**。
- 字体跨浏览器一致基准（`html` 16px + `text-size-adjust:100%` + 表单控件 `font-family:inherit`）不得删除。
- **默认明亮模式**：页面默认渲染为浅色；仅当浏览器本地存储 `zx_theme='dark'`（用户曾手动切换过暗色）时才启用暗色，**不跟随系统偏好**自动变暗。（实现见 build_homeplus.py 的 FOUC 脚本）

### 2. 明确禁止清单（❌ FORBIDDEN — 做了即错）

| 条目                                        | 为什么禁止                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| 分类按钮上的**数量 / 计数徽章**（category count badge） | 与结果计数行重复；用户**跨设备、多次**明确拒绝                                               |
| 在 `self_links.xlsx` 数据表**新增「判断外链 rel / 属性」的列** | 链接行可含多个外链，逐行判断麻烦；外链属性统一由 `build_homeplus.py` 的 `LINK_ATTR_PRESET` 域名白名单决定（见配置章节） |
| 空结果状态的「**清除所有筛选 / 一键清除**」按钮               | 与筛选栏「清除筛选」重复，且会误重置分类；空结果只显示提示文案                                         |
| 暗色模式做成**偏蓝 / 偏紫调**（"科技感"廉价感）              | 已发生一次并重做为金系，禁止复现                                                        |
| 暗色切换按钮**占用置顶吸顶区**                         | 会挤压小屏分类滑道、影响第一印象；切换按钮固定放页脚工具簇                                           |
| 「随机漫步」按钮与文字链接（关于 / 收录申请）**同行摆放**          | 视觉突兀；固定放页脚工具簇，不与文字链接同行                                                  |
| 卡片内容**可被用户框选**                            | `user-select` 必须 `none`，避免误选（链接仍可点）                                     |

### 3. 可接受 / 已试行清单（🔶 ACCEPTABLE — 我主动加、你未表态，可随时退回）

> 以下均为**未经你明确要求、由我主动加入**、你尚未明确赞同或否定的功能。默认保留，但不代表定稿。你不满意时直接说「退回 X」，我按「原状态」恢复即可。

| 条目 | 改动前原状态（可回退到这） |
|------|---------------------------|
| 入场动画（fadeInDown/Up，尊重 reduced-motion） | 无动画，页面瞬时显示 |
| 卡片悬停金色光带扫过 | 无悬停特效 |
| 回到顶部按钮（滚动 >400px 出现） | 无此按钮 |
| 搜索关键词金色高亮 | 关键词仅筛选，不高亮 |
| 随机漫步（页脚随机开一张可见卡） | 无此按钮 |
| 404 完全自包含（内联 CSS/JS） | 404 引用外部 style.css |
| 404 按来源动态返回按钮（依据 `document.referrer`：站内→返回上一页 `history.back()`、外链/搜索引擎跳入→只给「返回正协导航首页」（**不提供"返回来源网站"，避免 JS 跳转伪造 ref 的安全风险**）、直接访问或无可识别来源→返回首页；8 秒自动跳转同源） | 404 仅固定「返回首页」按钮 |
| 卡片外链标签：直角金边胶囊 + 「↗」外跳标记（区别于圆形分类标签） | 12px 灰色虚线下划线小字、无 ↗ |
| 搜索框默认激活 Google（主引擎百度/必应/Google 原位不变，仅初始高亮 Google） | 默认激活百度 |
| 滚动按钮组：4 个独立按钮，按滚动位置只显示 1 个（编号 1 向上 ⬆、2 到顶 ⏫、3 向下 ⬇、4 到底 ⏬） | 单图标固定回顶按钮 |
| 点击循环：3 → 4 → 1 → 2 → 3，每次点击 + 滚动到当前按钮的目标 + 切到下一态图标，点击期间锁住用户输入 + 滚动结束后由 pendingTarget 稳态显示 | 点击 = 固定回顶 |
| 滚动自动判定（按 y vs alignTarget）：贴顶=3、贴底=1、y<alignTarget 上滑=2/下滑=3、y≈alignTarget 上滑=1/下滑=4、y>alignTarget 上滑=1/下滑=4 | 无 |
| alignTarget = firstCard.offsetTop - stickyTop.offsetHeight（第一张可见卡片顶端对齐 sticky 整体块底部） | 无 |
| 滚动期间点击锁：lockUserInput 阻止 wheel/touchmove/keydown，连续点击前 forceUnlock 清掉上一轮残留 handler 避免永久锁定 | 无 |
| 同骨架导航频道页生成器 `assets/.build/build_homeplus.py`：自动扫描 `directory/<name>/`（每个含独立 `assets/xlsx/self_links.xlsx` + 必填 `assets/json/self_meta.json`），套用 S1 骨架生成 `directory/<name>/index.html`；资源引用 `../../assets/`、canonical `/directory/<name>/`、统计代码复用根页；self_meta.json 仅 3 字段（title/description/keywords）+ 根页 ROOT_META 兜底（未自定义字段跟随根页）。示例 `directory/ai/` 已跑通（2026-08-23）。框架约定详见 `assets/.build/build_homeplus.py` 顶部 docstring（跨设备可读） | 无此脚本（频道页需手写或拆根表子集） |

> 子页 `pages/about`、`pages/submit` 为既有项目结构（资源相对、内链绝对），非本轮主动新增，仅在此标注其形态，不作改动即可。

> **子页统一形态（目录已于 2026-08-22 末从 `units/` 迁移至 `pages/`）**：手写静态页，`<head>` **不设**全局 referrer meta（与主页/README「不设全局 referrer」规则一致）、FOUC **仅当 `localStorage('zx_theme')==='dark'` 才暗色**（不跟随系统偏好）；资源以相对路径 `../../assets/css/style.css`、`../../assets/images/logo.svg`、`../../assets/js/main.js` **引用根目录共享 assets**（根 assets 为唯一真源，子页不再复制自包含 assets——`build_homeplus.py` 的 `UNIT_PAGES`/`sync_unit_assets` 已于 2026-08-22 移除）；内链绝对 `https://zhengxie.com.cn/...` 且 `target="_self"`。
> **子页新增/调整的具体操作步骤（标准形态 7 要点、页脚模板、全站联动清单、验证步骤、退回方案）已抽离至 `assets/skills/SKILL.md`**——任何会话要新增子页时，先读该 SKILL.md 照做，避免 README 与操作步骤两处维护漂移。

> **隐私政策页（🔶 本次主动新增，可退回）**：`pages/privacy/index.html` 由我据站点真实技术实现起草（含免责声明「AI 辅助生成、非执业律师正式意见」）；内容如实陈述——本站为纯静态站、无后端/无注册、本地收藏存 localStorage 不上传、接入百度统计/GA4/AdSense、不设全局 referrer、外链按优先级规则打开。**改动前原状态**：站内无隐私政策页（页脚无隐私链接、sitemap 无隐私条目）。退回即删 `pages/privacy/`、撤 sitemap/页脚/README 相关行。

> **5 个说明型子页（🔶 2026-08-22 主动新增，可整体退回）**：`pages/contact`（联系我们，含收录/反馈/合作邮箱 seymour.zx@foxmail.com）、`pages/disclaimer`（免责声明，含 AI 辅助生成免责声明）、`pages/guide`（使用指南，讲本地收藏/三维度筛选/集合搜索/URL分享/随机漫步/暗色快捷键）、`pages/sitemap`（站点地图，可视化分类索引+功能页+机器可读 sitemap.xml 入口，分类锚点回首页 `#cat=分类`）、`pages/changelog`（更新日志，按时间倒序记录站点迭代）。形态同隐私页（资源 `../../assets/` 引用根、内链绝对 `_self`、无全局 referrer meta、FOUC 仅本地 dark）；写入 `sitemap.xml`（priority 0.50）、页脚导航统一 11 链接（含「网站全景」「频道导航」）。退回即删对应 5 个 `pages/*/` 目录、撤 sitemap/页脚/README 相关行（具体步骤见 `assets/skills/SKILL.md` 退回方案段）。

> **全站中枢页（🔶 2026-08-22 末主动新增，可退回）**：`pages/overview/index.html`「网站全景」= S2 骨架升级版（全站中枢：架构总览 + 各板块活体切片 + 榜单区块 + 分发中枢）。路径 `/pages/overview/`，页脚链接文本「网站全景」。手动同步 GA4+百度统计双 id（无 AdSense，同 404 策略）；资源 `../../assets/` 引用根、写入 `sitemap.xml`（priority 0.70）。退回即删 `pages/overview/`、撤 sitemap/页脚/README 相关行。旧 `units/` 目录已整体删除（2026-08-22 末）。

### 3.1 专家转介纪律（🚫 任何会话必守，AI 硬边界）

> **用户明示原则**：专业的事找专业的专家，不要浪费时间/资源消耗却结果不达预期。AI 在**工程实现**（静态站结构、build 流程、README/SKILL 维护、统计代码接入）上擅长；在需要**执业资质、第三方平台策略、专业评审**的任务上不擅长且不应越界。
>
> **落入以下任一类任务时，AI 必须主动停止、明确告知用户应咨询对应专家/connector，不得硬做、不得给未经验证的"专业结论"**：
> - **法律合规文本**（隐私政策/免责声明/个保法条文是否达标）→ 执业律师；WorkBuddy 内可询 `同花顺法律AI助手` / `北大法宝·法律智能检索` / `fazhi-law` / `yuandian-mcp 华宇元典` / `pkulaw 北大法宝`
> - **SEO 收录策略 / 统计归因配置**（百度统计 referer、sitemap 优先级对收录影响）→ SEO 实务专家；或百度搜索资源平台 / Google Search Central 官方文档
> - **视觉设计评审**（奢华风是否到位、暗色对比度无障碍 WCAG）→ UI/UX 专家（`ui-ux-pro-max`）或人工设计师
> - **ICP 备案实操 / 国内服务器迁移合规** → 域名服务商（阿里云/腾讯云）官方备案通道 / `腾讯云 CloudBase`
> - **广告收益优化**（AdSense 布局/单价策略）→ Google AdSense 官方帮助中心
>
> AI 仅提供"如实陈述技术实现"的草稿（隐私/免责页已置顶"AI 辅助、非执业律师意见"声明），不自行定稿、不替代专业判断。完整纪律与专家清单见 `assets/skills/SKILL.md`「专家转介纪律」段。

### 3.2 页面骨架总分类（S1–S6，任何内容先归骨架再套模板）

> **分类原则（重要）**：本站是"以导航为主、但会包罗所有静态页面形态的综合站"。因此**不按内容主题分类**（那样无穷无尽），而按**页面骨架契约**分类——由「生成方式 × 布局范式 × 资源引用 × SEO 角色」四维决定。
>
> **骨架可演进原则（用户 2026-08-22 明示）**：新页面**优先归集**已有骨架；但当某类内容在形态/契约/SEO 角色上确实无法被现有骨架覆盖、且对网站长远发展有利时，**应新增骨架（S7、S8…）**。骨架本身可随产品演进而**升级改版**（如本站立项即把 S2 从"门户首页"升级为"全站中枢页·网站全景"）。不预设骨架数量上限，但每次新增/升级都须写入本章并同步 `assets/skills/SKILL.md`。
>
> **六大骨架（当前版，S2 已升级）**：
> | 骨架 | 名称 | 布局范式 | 生成方式 | 现有实例 | 未来可装 |
> |------|------|---------|---------|---------|---------|
> | **S1** | 导航产品页 | 卡片 Grid + 三维度筛选 + 集合搜索（sticky 吸顶） | build_homeplus.py 生成根页 + 自动扫描 `directory/` 生成同骨架频道页 | `index.html`（根域 `/`，引流核心，不动） | 细分导航频道页（`/directory/ai/` 等，由 build_homeplus.py 自动扫描生成） |
> | **S2** | 全站中枢页（网站全景） | **中枢型**：架构总览 + 各板块活体切片（真实部分内容）+ 榜单区块 + 分发中枢 | 手写或 build | `pages/overview/`（页脚链接文本「网站全景」） | 全站大脑/心脏/脊柱式总览，用户"逛+发现"入口 |
> | **S3** | 说明信息页 | 单栏静态说明，无长文排版 | 手写自包含 | about / contact / guide / sitemap / changelog | 帮助中心、FAQ、单页介绍 |
> | **S4** | 合规页 | 同 S3 同构 + 「AI 辅助、非执业律师意见」声明 + 专家复核标记 | 手写自包含 | privacy / disclaimer | 服务条款、Cookie 政策 |
> | **S5** | 功能入口页 | 表单 / 提交 / 交互型 | 手写自包含 | submit | 订阅、反馈、登录入口 |
> | **S6** | 文章 / 内容页 | 列表索引 + 详情（长文 + 插图 + 上一篇/下一篇） | 手写或 build | （暂无） | 博客、日记、文档站、教程、新闻 |
>
> **S2 全站中枢页（网站全景）详细契约**：
> - **定位**：非"入口/眼耳口"，而是全站**大脑/心脏/脊柱/中枢神经**——用户在此**了解整体架构**（导航产品有什么、博客有什么、其他推荐板块）、**看见各板块活体切片**（非"点击进入"四字，而是真实部分内容：导航前几个分类、博客最新 3 篇、榜单 Top5）、**看全局榜单**、并**分发**去各板块。与 S1（根域导航产品页，服务"用"）形成互补双核心：S1 服务"用工具"，S2 服务"逛+发现"。
> - **四大区块**：①架构总览区（可视化展示站点所有板块及关系，如站点神经系统图）；②各板块活体切片区（每板块展示真实部分内容 + 去向链接）；③榜单区块（收录榜单 TopN + 访问量榜单 TopN）；④分发中枢（每切片明确去向，中枢本身可停留消费）。可加品牌理念区（一句话定位）。
> - **路径与命名**：路径 `/pages/overview/`（属 S3/S4/S5 同级说明型目录 `pages/` 下的中枢页，符合"中枢整合全站"定位），各页 `<a>` 链接文本统一为「网站全景」（与 S1 的"首页/导航"文本区分，不与"导航站"概念混淆）；canonical 指向 `https://zhengxie.com.cn/pages/overview/`。
> - **榜单 S7 预留（升级口）**：榜单**当前留在 S2 内**作区块；当维度增多、常更新、需分页/筛选/全量查看时，**升为独立骨架 S7「榜单/排行页」**（路径如 `/rank/`），从 S2 榜单块"更多"跳转看全量完整排行。触发条件达成前不新增，达成后写入本章并同步 SKILL.md。
> - **数据来源（⏳ PENDING）**：架构总览/活体切片/榜单的数据从哪来（导航分类提取 `index.html` 的 `data-cat` / 博客未来从 S6 / 榜单需 build 扩展或手动维护），待用户拍板，不擅自决定。
>
> **骨架通用技术契约（全部骨架共用，不可违反）**：资源引用——根页用 `assets/...`，子页（`pages/*/`）用 `../../assets/...` **指向根目录唯一 assets 真源**（子页不再自包含、不再复制 assets，`build_homeplus.py` 的 `UNIT_PAGES`/`sync_unit_assets` 已于 2026-08-22 移除）；内链绝对 `https://zhengxie.com.cn/...` 且 `target="_self"`；`<head>` **不设**全局 referrer meta；FOUC **仅当 `localStorage('zx_theme')==='dark'` 才暗色**（不跟随系统）；页脚导航统一 11 链接（含「网站全景」「频道导航」） + 备案号注释占位；`canonical` / `robots` / `description` 齐备；奢华红金白视觉语言（暗色金系，禁蓝紫）。
>
> **各骨架差异点（骨架特有契约）**：
> - **S1**：唯一由 build_homeplus.py 生成（根 `index.html` + 自动扫描 `directory/<name>/index.html`）；页脚 11 链接（含「网站全景」「频道导航」）由 `build_homeplus.py` 首页模板控制（非手写）；含统计/广告代码注入；卡片按 type 分组分行（见「页面与交互说明」章）。`directory/<name>/` 框架约定见 `assets/.build/build_homeplus.py` 顶部 docstring（跨设备可读）。
> - **S2 / S6 若由 build 生成**：需新增 build 模板定义骨架（目前 build 仅支持 S1，手写子页直接引用 `../../assets/` 即可）；**纯手写时**直接套 `assets/skills/SKILL.md` 中对应骨架模板。
> - **S4**：正文置顶法律免责声明；内容涉及个保法/效力条款时**触发专家转介纪律**（不替代执业律师）。
> - **S6**：详情页用 `<article>` 语义 + 阅读排版（行宽约 70ch、段落间距、`figure/figcaption` 插图）；列表页 `articles/index.html` 做索引（标题+摘要+日期+封面）；可选 RSS `feed.xml`、分页、标签归档；长文页仍沿用全局页脚 11 链接（含「频道导航」「网站全景」）与视觉语言。
> - **S6 内容属性规范（2026-08-22 拍板，锁死）**：
>   - **目录语义边界**：`blog/` = 本站原创 + 转载正文（长文入此）；`news/` = 挂**别人网站文章链接**的索引页（**不放正文**，feed 并入 news）；`journal/` = 日记；`units/` 已弃用、**禁用于内容集合**。三者均与导航产品目录（`pages/`、`directory/`）语义隔离，不混淆。`directory/` = 同骨架导航产品频道页（S1 实例，由 build 从各目录专属 `self_links.xlsx` 生成，非根表子集）。
>   - **文件命名约定**：`self_` 前缀 = 某页面/功能**独享**的数据文件（不与其他页面共享）。当前独享文件：`assets/xlsx/self_links.xlsx`（根页数据源）、`directory/<name>/assets/xlsx/self_links.xlsx`（目录页数据源）、`assets/json/self_meta.json`（根页页面级信息）、`directory/<name>/assets/json/self_meta.json`（目录页页面级信息，3 字段 title/description/keywords）。全站共享文件不加 `self_`（如 `assets/json/manifest.json`、`assets/xlsx/link-policy.json`）。
>   - **原创 / 转载标识**：每篇详情页头部显式标注「原创 / 转载」徽标（如 `<span class="badge badge--original">原创</span>` / `<span class="badge badge--repost">转载</span>`）。**转载必做**：正文内文首或文末注明原作者、出处链接、转载日期；版权合规属专家转介范畴（见 3.1 节），AI 只出草稿不替用户定论。
>   - **参考来源区**：长文文末统一用 `<section class="references"><ol><li><a href="..." target="_blank" rel="noopener">来源标题</a></li></ol></section>` 列出引用/参考链接（外链 `noopener`，不发权重）；无来源可不显此区。
>
> **新增内容决策流**：用户提出新页面 → 先判「属哪一已有骨架」→ 套该骨架模板 → 走 `assets/skills/SKILL.md` 对应联动清单。**若现有骨架都无法覆盖且对长远有利** → 与用户确认后**新增骨架编号（S7+）**并写入本章与 SKILL.md，不得私自套错骨架或擅自锁死"不新增"。

### 4. 讨论过无结论清单（⏳ PENDING — 动手前先问）

| 议题                                                               | 现状                                            |
| ---------------------------------------------------------------- | --------------------------------------------- |
| 换域名时 `pages/about`、`pages/submit` 的 canonical 与内链仍是**字面量**，需手动替换 | 是否把子页也纳入 `build_homeplus.py` 模板统一管理？待用户拍板              |
| 国内访问 GitHub Pages 不稳定                                            | 是否迁移到国内 CDN / Vercel / Netlify？待用户拍板（见可选部署方案） |
| 分类在导航栏的默认排序 / 隐藏逻辑                                               | 暂无定论，维持「按数据自动生成」现状                            |

### 5. 优化方向待办（📋 BACKLOG — 新会话开场先读并主动提醒）

> 助理须知：开始任何一轮优化前，先读本节，找出尚未完成的 `P0/P1` 项，**主动用一句话提醒用户「下一步建议做 X」**，等用户确认后再动手；不要闷头自己做或重复已完成的项。

- [x] **P0** 暗色模式重做为奢华金系（v6 已完成）
- [x] **P0** 移除分类计数徽章、空结果清除按钮；暗色切换移页脚；随机漫步移页脚（已完成）
- [x] **P1** 新增 5 个说明型子页：contact/disclaimer/guide/sitemap/changelog（2026-08-22 完成，sitemap/页脚/README 同步；子页统一引用根 `../../assets/`）
- [ ] **P1** 将 `pages/about`、`pages/submit` 纳入 `build_homeplus.py` 模板，消除换域名时手动替换字面量（依赖第 4 节待定项决策）
- [ ] **P1** 评估并决策 GitHub Pages 国内访问稳定性问题（是否迁移 CDN）
- [x] **P1** 清理开发残留：`test.html`（根目录测试页，已删）、`units/`（旧过渡页+占位，已整体删除，2026-08-22 末）；全站 `/overview/` 已统一改 `/pages/overview/`、`units/` 引用清零
- [ ] **P2** 用 `check_links.py` 定期跑死链检测，维护 `link_report.txt`
- [ ] **P2** 移动端体验复核（一行 2 卡、滑道触屏左右滑、暗色切换可达性）
- [ ] **P3** 视需要扩充 `self_links.xlsx` 分类与卡片数据
- [x] **P2** 目录树补全：README「目录结构」补 `directory/`（含 `<name>/` 子目录、`assets/`、`index.html` 由 build_homeplus.py 生成）与 `assets/json/`（self_meta.json + manifest.json）
- [x] **P2** 手写 `directory/index.html` 汇总/门户页（按决策属手写、非 build 任务，2026-08-23 已建，复用 .card 样式 + CollectionPage JSON-LD，两频道卡用绝对路径指向 /directory/ai/ 与 /directory/zhengxie/）
- [ ] **P2** 扩展 `check_links.py` 覆盖 `directory/*/self_links.xlsx` 死链检测（当前仅扫描根表）
- [x] **P2** 首屏大图压图（2026-08-23）：3 张站内图 `12377-3-04/07/08.png` 转 WebP（**必须保留 RGBA 透明通道**，否则透明 logo 被填黑失真），合计 1998KB → ~37KB；数据源 `assets/xlsx/self_links.xlsx` 的 media 列三行已改 `.webp`（改在持久数据源，下次 build 不覆盖）
- [x] **P2** 性能优化（2026-08-23）：`main.js` 搜索框 `input` 加 150ms 防抖 + 初始化预缓存卡片搜索串（不再每次按键 live 读 128 卡 textContent）；`build_homeplus.py` `<head>` 改用 `preload` + `<noscript>` 加载 CSS
- [ ] **P1** 替换 21 张 `picsum.photos` 随机占位图（CRITICAL：随机风景图替代真实 logo，不符「精选收录」定位；应改回真实 favicon 或文字占位）
- [x] **P1** `sitemap.xml` 补充 `directory/*` 子页条目（`directory/` 0.70、`directory/ai/` 0.60、`directory/zhengxie/` 0.70，共 3 条；`directory/ai/`、`directory/zhengxie/` 已由 build 生成，2026-08-23 完成）
- [ ] **P2** 死链检测 `link_report.txt` 已过期（停在 2026-08-20）；`check_links.py` 仅扫根表、漏检 `directory/` 与 `picsum.photos`，需定期跑 + 扩展扫描
- [ ] **P2** 删除 `assets/images/12377-3-04/07/08.png` 原图（已转 WebP，原 png 占 ~2MB 且无人引用，破坏性操作需用户拍板）

---

## 目录结构

```
正协导航/
├── index.html               站点主页/导航产品页（由 build_homeplus.py 生成，静态渲染，SEO 友好，根域 /）
├── README.md                本手册
├── 404.html                 错误页（自包含、按来源动态返回、含 GA4+百度统计、无 AdSense）
├── .gitignore               屏蔽构建产物（assets/*/__pycache__/、__pycache__/、*.pyc），防字节码泄露与仓库污染
├── robots.txt               爬虫规则：Disallow 整个 /assets/ 后用 Allow 白名单放出 css/js/images（不暴露内部目录名）
├── sitemap.xml              搜索引擎站点地图（首页 + pages/* + directory/*）
├── directory/               导航频道页（S1 实例；`ai/`、`zhengxie/` 由 build_homeplus.py 自动扫描各 `directory/<name>/` 生成 index.html；`directory/index.html` 为手写汇总/门户页，非 build 生成）
│   ├── index.html           手写汇总/门户页（频道导航入口，复用 .card 样式，CollectionPage JSON-LD）
│   ├── ai/index.html        示例频道页（AI智能，2026-08-23 跑通，6 张卡片）
│   └── zhengxie/index.html  政协专题频道页（2026-08-23 跑通，55 张卡片）
├── pages/                   说明/合规/功能型子页（原 units/，2026-08-22 末迁移；S2/S3/S4/S5 均归此）
│   ├── overview/index.html  网站全景（全站中枢页 S2，2026-08-22 末由根 overview/ 移入）
│   ├── about/index.html      关于本站（S3 手写静态页，资源相对、内链绝对）
│   ├── submit/index.html     收录申请（S5）
│   ├── privacy/index.html    隐私政策（S4，2026-08-22 新增）
│   ├── contact/index.html    联系我们（S3，2026-08-22 新增）
│   ├── disclaimer/index.html 免责声明（S4，2026-08-22 新增）
│   ├── guide/index.html      使用指南（S3，2026-08-22 新增）
│   ├── sitemap/index.html    站点地图（S3，2026-08-22 新增）
│   └── changelog/index.html  更新日志（S3，2026-08-22 新增）
└── assets/
    ├── css/
    │   └── style.css        全站样式（奢华红金白、响应式 Grid）
    ├── js/
    │   └── main.js          交互增强（三维度筛选 / 本地收藏 / 引擎搜索 / 统一滑动）
    ├── .build/
    │   ├── build.py          构建编排入口（依次调用 build_homeplus.py + collect_meta.py）
    │   ├── build_homeplus.py 导航产品页生成器（根 index.html + directory/<name>/index.html）
    │   ├── collect_meta.py   SEO 元信息采集（全站 index.html 的 title/keywords/description → xlsx）
    │   ├── check_links.py   死链检测，输出 link_report.txt
    │   └── link_report.txt  死链检测报告（运行 check_links.py 后生成）
    ├── images/
    │   ├── logo.svg         站点 Logo（红底金字方形，正协/导航 两行）
    │   └── 12377-3-04/07/08.webp  卡片媒体图（原 png 已转 WebP 并保留透明通道；原 png 待删，见 BACKLOG）
    ├── json/
    │   ├── self_meta.json   根页页面级信息（title/description/keywords，仅 3 字段）
    │   └── manifest.json    PWA 清单
    ├── xlsx/
    │   └── self_links.xlsx  根页独享数据源（前缀 self_ 表示独享；维护时只需编辑这个文件）
    └── skills/
        ├── SKILL.md         项目内 SOP：子页新增全流程 + 专家转介纪律（操作步骤类，与本章决策规范互补；换设备时读此文件照做）
        └── IMAGE_OPTIMIZATION.md  图片压图规范（技术备忘，非权威源；权威规则见 SKILL.md「图片资源规范」段）
```

---

## 快速开始（本地预览）

本项目为纯静态站，无构建框架，但生成 index.html 依赖 Python 3.9+ 与 openpyxl。

```bash
# 1. 安装依赖（只需一次）
pip install openpyxl

# 2. 构建全站（编排入口：依次运行 build_homeplus.py 生成导航页 + collect_meta.py 导出 SEO 报告）
#    只想要生成页面、跳过 SEO 报告时，可直接跑：python assets/.build/build_homeplus.py
python assets/.build/build.py

# 3. 本地预览（任意静态服务器均可，如）
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```

> 直接用浏览器双击打开 index.html 也可以预览，但部分浏览器对 `file://` 下加载外部脚本有限制，推荐用本地服务器方式预览。

---

## 站点配置（换域名只改一处）

`assets/.build/build_homeplus.py` 顶部「站点配置」区集中了所有跨页一致的设置，改域名/外链策略**只动这一处**：

- `SITE_DOMAIN`：站点域名（末尾无斜杠）。`index.html` 的 `canonical` / `og:url` / `og:image` / JSON-LD / `SearchAction` 及页脚内链均由它生成。
- **全链接属性规则**（集中配置，全项目通用含子页；手工增删只改 `build_homeplus.py` 顶部常量）：按**优先级** `同域 > 同族 > 营销 > 评论 > 暴露 > 默认` 匹配链接主机名（主机 == 域名 或 以 `.域名` 结尾，含所有子域）：
  - `SAME_DOMAIN_ATTR = 'target="_self"'`：同主域（`zhengxie.com.cn` 及其子域），**原地打开**，发 Referer、传权重。
  - `SAME_FAMILY_ATTR = 'target="_blank" rel="noopener"'`：同族（`zhengxie.info` 等），新标签 + 仅隔离 opener（发 Referer、传权重）。
  - `MARKETING_ATTR = 'target="_blank" rel="sponsored noopener noreferrer nofollow"'`：营销站点（**当前预设空集 `MARKETING = []`**，待后续按需要增删；未配置前相关域名走默认）。
  - `UGCCOMMENT_ATTR = 'target="_blank" rel="ugc noopener noreferrer nofollow"'`：评论社媒（**当前预设空集 `UGCCOMMENT = []`**，待后续按需要增删；未配置前相关域名走默认）。
  - `EXPOSED_ATTR = 'target="_blank" rel="noopener" referrerpolicy="origin"'`：暴露/公开（备案号 `beian.miit.gov.cn`、政务官方 `.gov.cn` 等需暴露来源；**dofollow（无 `nofollow`，传权重）**；`referrerpolicy="origin"` 仅发送源站 origin，不暴露完整路径）。
  - `DEFAULT_LINK_ATTR = 'target="_blank" rel="nofollow noopener noreferrer"'`：其余一切外链（新标签 + 不传权重 + **不暴露来源**；因带 `noreferrer`，百度统计/GA4 对这类外跳收不到 Referer，但站内统计与卡片图片不受影响）。
  - 命中逻辑在 `link_attr(url)` 中按上述优先级短路；`EXT_LINK = EXPOSED_ATTR` 供备案号等固定外链复用。手工增删：改对应常量域名列表即可，无需动 xlsx。
- ~~`UNIT_PAGES` / `UNIT_ASSET_DIRS`~~：**已于 2026-08-22 移除**。原用途是 build 时把根 `assets/{css,js,images}` 同步进各子页独立 `assets/` 使其自包含；现改为子页以 `../../assets/...` 直接引用根目录共享 assets，根 assets 为唯一真源，不再复制（详见骨架通用技术契约与 `assets/skills/SKILL.md`）。

> **Referer 策略（重要）**：**不设**全局 `<meta name="referrer" content="no-referrer">`（它会让百度统计后台显示"referer 被禁用"，收不到来源站）。仅在**卡片图片**上用 `referrerpolicy="no-referrer"` 单独压制（防图片防盗链）；卡片外链 / 引擎跳转默认**发 Referer**。
> 约定：站内**资源**（css/js/images）——根页用 `assets/...`、子页用 `../../assets/...`（均指向根目录唯一 assets 真源，子页不再有独立 assets 目录）；**内链**（页与页之间）一律用 `SITE_DOMAIN` 生成的完整绝对路径，且按 `SAME_DOMAIN_ATTR` 原地打开（`target="_self"`）；**外链**按上表优先级匹配属性（注：政务官方 `.gov.cn` 经 EXPOSED 桶输出 **dofollow**，传权重，强化政协/政务垂类主题信号；其余外链仍默认 `nofollow`）。
> 注意：`pages/about`、`pages/submit` 是手写静态页（非 build 生成），其 canonical 与内链里的域名是字面量；换域名时这两处需另行替换（或直接把子页也纳入 build 模板，后续可议）。原 `units/` 目录已于 2026-08-22 末整体删除并迁移至 `pages/`，相关旧路径描述见 v5 变更记录已标注。

### 全链接规则使用情况汇总（搜索框 / 引擎跳转 / assets 引用 / 卡片链接 / 卡片外链接 / 备案号 / 子页）

| 链接位置 | 类型 | target / rel（实际写入） | 说明 |
|----------|------|--------------------------|------|
| 站内搜索框（Hero 站内搜索） | 站内 JS 筛选，无外跳 | 无 `<a>` | 仅在站内过滤卡片，不发起外链 |
| 集合搜索（Hero 引擎跳转，如百度/Google/微博） | 外跳到搜索引擎结果页 | **定死、不走 `link_attr()` 全套规则**：JS 用 `window.open(url, '_blank', 'noopener')` 打开（仅 `noopener`，不带 `noreferrer`/`nofollow`/`sponsored`/`ugc`/`referrerpolicy`），所有引擎行为一致且**会发送 Referer**。此为有意保留的现态（用户确认不改 py） | 与卡片外链规则**不同源**，属独立硬编码路径 |
| assets 引用（css/js/images 静态资源） | 站内资源 | 相对路径 `assets/...`，无 target/rel | 同域加载，不涉及外链策略 |
| 卡片图片（`<img>` 媒体） | 外站图片 | `referrerpolicy="no-referrer"`（仅此项压制 Referer） | 防图片防盗链；其余外链不发此属性 |
| 卡片外链接（links 列逐条） | 外链 | 按优先级 `同域>同族>营销>评论>暴露>默认` 命中；同域 `_self`、同族 `noopener`、营销 `sponsored…`（空集暂未启用）、评论 `ugc…`（空集暂未启用）、暴露 `noopener` + `referrerpolicy="origin"`（**dofollow，传权重**）、默认 `nofollow noopener noreferrer` | 全项目统一，含子页（子页无卡片，但规则通用） |
| 页脚备案号（beian.miit.gov.cn） | 外链（暴露） | **当前为注释占位、不渲染**：项目托管于 GitHub Pages，无 ICP 备案，故首页模板与子页（about/submit/privacy）**均不显示**备案链接；代码保留 `粤ICP备XXXXXXXX号` 占位与暴露属性，待迁移国内服务器完成备案后取消注释即可（届时属性为 `target="_blank" rel="noopener" referrerpolicy="origin"`，**dofollow**，暴露来源 origin） | 迁移前不可点击、不可见 |
| 页脚/导航内链（首页/频道导航/关于/收录申请等） | 内链（同域） | `target="_self"`（原地打开，发 Referer、传权重） | 由 `SITE_DOMAIN` 生成绝对路径（如「频道导航」指向 `/directory/`）；全站页脚现含 **11 条**统一导航链接（含新增「频道导航」与「网站全景」） |
| 子页 about/submit/privacy 内链与正文链接 | 内链（同域） | `target="_self"` | 手写静态页已显式标注，与首页一致；隐私页为标准合规文本、含 AI 免责声明 |

---

## 数据维护（核心工作流）

**只需编辑 `assets/xlsx/self_links.xlsx`，不需要改任何代码。**

### 数据表列说明

| 列     | 必填 | 说明                                                                                                                                                                                                                                                          |
| ----- | -- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 站序    | 是  | 数字，卡片排序为**先按 type（1→2→3），再按站序从小到大**；不同类型的卡片自动分行显示，绝不同行                                                                                                                                                                                                      |
| 分类    | 是  | 分类名。站点会自动按此列**动态生成分类按钮**（按站序首现顺序），改分类列并重新 build 即可新增/重排分类                                                                                                                                                                                                   |
| type  | 是  | 卡片结构：`1`=4行3列 logo 卡，`2`=5行2列横向封面卡，`3`=5行2列纵向封面卡                                                                                                                                                                                                            |
| title | 是  | 网站名称（英文首字母自动大写用于占位 logo）                                                                                                                                                                                                                                    |
| desc  | 否  | 一句话描述                                                                                                                                                                                                                                                       |
| media | 否  | 媒体区（**列内用英文逗号 `,` 分隔**，向后兼容旧数据）。语法：`URL`=仅图片（红底容器，失败移除露红底）；`URL,颜色`=图片容器内铺该背景色（给**矢量/透明 logo 衬底**，不改容器红底，解决 logo 与红容器不搭/看不清）；`颜色值`(#rgb / rgb() / rgba() / hsl() / transparent / 常见颜色名)=纯色块占位（无图模式）；`合法色,任何尾巴`=纯色块（忽略尾巴）；`字符,颜色`=文字占位+自定义底色；空/其它=标题首字符+红渐变底兜底。**颜色值示例**：`#FFFFFF`、`#3A7BD5`、`rgb(58,123,213)`、`rgba(0,0,0,.5)`、`hsl(210,80%,50%)`、`transparent`、`red`。<br>**降级原则（脏数据不崩站）**：① `URL,非法色/空` → **退化为纯图**（保留 URL，不丢图）；② `非法色 / 纯文本 / 缺参 rgb(1,2) / 非法 hex #ZZZ` → 兜底首字符+红底；③ 任何颜色语句非法都**不进 style**、不丢图、不报错。仅按**第一个逗号**分割，颜色值内自带逗号如 `rgba(0,0,0,.5)` 不受影响。合规 URL 定义：以 `http(s)://` 开头且主机名合法（域名/IP/localhost） |
| tags  | 否  | 标签，**英文逗号 `,` 分隔**（如 `AI,免费`）。分类名会由 build_homeplus.py **自动作为标签行第 1 个标签**，无需在此填写                                                                                                                                                                                      |
| links | 否  | 相关链接，**分号 `;` 分链接、逗号 `,` 分"名称与URL"**（如 `官网,https://x.com;知乎,https://www.zhihu.com/search?q=x`）。卡片第 4/5 行链接标签即由此生成。外链属性策略（target/rel）**不由本表决定**，而由 `build_homeplus.py` 的 `LINK_ATTR_PRESET` 按**链接域名**自动匹配（见下方约定）                                                      |

> ⚠️ 注意：单元格里一律使用**英文半角逗号 `,`** 与**英文分号 `;`** 作为分隔符，不要用中文全角符号。

> ⚠️ **媒体图片格式**：`media` 列图片**统一用 WebP**（体积小、支持透明）；**必须保留透明通道（RGBA）**——透明 logo / 图标转图时若误用 `RGB` 会被填成黑底、与原图完全不同。压图步骤、命令与常见坑见 `assets/skills/IMAGE_OPTIMIZATION.md`（技术备忘）。

### 数据维护流程（三件事）

```bash
# 1. 编辑 self_links.xlsx（增删改行、改站序、改分类、改标签/链接）

# 2. 重新生成站点
python assets/.build/build.py

# 3. 检查死链（可选，推荐定期跑）
python assets/.build/check_links.py          # 检查全部
python assets/.build/check_links.py --limit 5   # 只查前 5 条，快速测试
# 结果写入 assets/.build/link_report.txt
```

然后提交推送到 GitHub，GitHub Pages 自动更新。

---

## 页面与交互说明

### 页面骨架（自上而下 8 块）

| #   | 块                                | 说明                                                                                                                                                                                                  |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `<header class="hero">`          | 大 Logo「正协导航」+ slogan + **集合搜索引擎**：主引擎按钮（百度/Google/必应，原位）+ 搜索框 + 下方**引擎滑道**（淘宝/京东/知乎/B站/GitHub 等多类引擎，单选切换，回车跳转外搜）                                                                                    |
| 2   | `<aside class="ad ad--top">`     | Google 广告位 ①                                                                                                                                                                                        |
| 3   | `<nav class="category-nav">`     | **三段式**：左方形文字 Logo（红系，承担「全部」功能，点击重置分类；**文字随状态切换**：激活=全部选中时显示品牌名「正协/导航」+正红渐变+金环，未激活=已选某分类时显示「全部」二字引导返回+淡红渐变）+ 中分类滑道（各分类按钮，h2 即分类标题）+ 右方形「本地收藏」按钮（金色系：无收藏显示空心 ☆，有收藏（≥1 个）显示实心 ★；点击后显示「本地/收藏」两行文字并加金环） |
| 4   | `<section class="site-search">`  | **站内搜索框**（筛选站内卡片）                                                                                                                                                                                   |
| 4.5 | `<section class="result-count">` | **结果计数行**（搜索框与筛选标签行之间）：无筛选显示「共 N 张卡片」；有筛选显示「当前显示 X / N 张卡片」；0 结果时红色加粗提醒。静态渲染总数（SEO 友好），JS 随筛选实时更新                                                                                                   |
| 5   | `<section class="filter-tags">`  | **三段式 1 行**：左「当前筛选：」+ 中筛选标签滑道（× 删除）+ 右「清除筛选」（只清关键词）                                                                                                                                                 |

> 第 3–5 块（含 4.5 结果计数行）包在同一个 `<div class="sticky-top">` 容器内，**整体 sticky 吸顶**：页面向下滚动时，分类导航 + 站内搜索 + 结果计数 + 筛选标签始终固定在页面顶部。
>   
> | 6 | `<main class="cards-container">` | 导航卡片容器（Grid 直接装全部卡片，无 section 包裹） |
>   
> | 7 | `<aside class="ad ad--bottom">` | Google 广告位 ② |
>   
> | 8 | `<footer class="footer">` | 版权声明 + 必要链接（关于/收录申请/备案号） |

### 三种卡片结构

| 结构     | 布局                                                                                                                 | 封面比例                       |
| ------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| type 1 | **4 行 3 列**：第 1-2 行第 1 列 = 图片（跨两行）；第 1 行第 2 列 = 名称、第 3 列 = 收藏按钮；第 2 行第 2-3 列 = 描述（跨两列）；第 3 行 = 标签按钮行；第 4 行 = 链接标签行 | logo 方形                    |
| type 2 | **5 行 2 列**：第 1 行 = 封面（跨两列）/ 第 2 行 = 名称 + 收藏按钮 / 第 3 行 = 描述 / 第 4 行 = 标签按钮行 / 第 5 行 = 链接标签行                        | **横向，宽:高 = 1.618:1**（黄金比例） |
| type 3 | **5 行 2 列**：同 type 2                                                                                               | **纵向，宽:高 = 1:1.618**（黄金比例） |

> 三种类型在页面中**按 type 分组分行显示**（1 组 → 2 组 → 3 组，组间由 build_homeplus.py 插入的隐形 `grid-break` 强制换行），不同类型的卡片绝不出现在同一行。

**通用约束（三类卡片一致）**：

- 三类卡片均有**收藏按钮**（内联 SVG 星形，描边金；收藏后填充金色），**位置统一固定在名称行右端**（grid 布局成员，不再浮动叠加），点击可收藏/取消收藏，存 localStorage（同浏览器非无痕模式下次打开仍在）。
- 名称、描述、标签、链接**必有**（内容为空也占位，保持格式统一），且**只占一行**，超出部分截断隐藏（不换行）。**四类行全部为横向滚动**（名称/描述行不用省略号，超长内容滚动查看）。
- 名称、描述、标签、链接四类行内容超出时进入「可滚动」状态：**鼠标悬停该行 → 行高亮（金色描边提示），滚轮上下滑动被接管为左右滚动该行内容，页面不再上下滚动**；**触屏设备触摸该行时同样高亮激活**，手指左右滑动即可滚动。
- **置顶区整体 sticky**：分类导航栏、站内搜索框、筛选标签区三块包在同一个 sticky 容器中，页面向下滚动时始终吸附在页面顶部。
- 卡片内所有内容**不可被用户选择**（`user-select: none`），避免误框选文本；链接仍可正常点击跳转。
- 标签行第 1 个标签固定为**该卡片的分类名**（build_homeplus.py 自动添加）。

### 交互逻辑

- **三维度筛选（AND 叠加）**：分类维度（`activeCat`）× 关键词维度（`filterTags`）× 本地收藏维度（`showFav`），三者同时满足的卡片才显示。
  - **分类**：点击左 Logo = 重置为「全部」（显示所有卡片）；点击分类按钮 = 只显示该分类卡片。**不生成筛选标签**。
  - **关键词**：站内搜索输入即实时筛选；**回车**将关键词固化为筛选标签；点卡片内任意文字标签，等同于一次站内搜索（生成对应筛选标签）。多个标签为**叠加（AND）**&#x5173;系。
  - **本地收藏**：点卡片名称行右端的星形按钮（描边金 → 填充金）收藏；点顶部方形「本地收藏」按钮 → 切换「只显示已收藏卡片」开关。顶部按钮的星标随收藏数变化：**0 个收藏 = 空心 ☆，≥1 个 = 实心 ★**（收藏/取消实时切换）。
  - **独立性**：「清除筛选」只清关键词，**不影响**分类与收藏状态；点 Logo 重置只动分类，**不影响**关键词与收藏。
- **结果计数**：搜索框与筛选标签行之间显示当前命中数。无筛选 → 「共 N 张卡片」；任一维度生效（分类/关键词/收藏开关/输入框有字）→ 「当前显示 X / N 张卡片」；X=0 时红色加粗提醒放宽条件。
- **集合搜索（Hero）**：百度/Google/必应为主引擎按钮（原位），下方引擎滑道含淘宝/京东/知乎/B站/GitHub 等多类引擎；点任意引擎设为激活（红底高亮），输入关键词回车 → 新窗口打开该引擎结果页。
- **统一滑动行为**：所有滑道（分类滑道 / 筛选滑道 / 引擎滑道）与卡片四类行（标题/描述/标签/链接）**同一套交互**——只在内容真溢出时接管滚轮为左右滑（页面暂停上下滚），触屏触摸同样激活。不溢出时滚轮照常滚页面。
- **本地收藏持久化**：同浏览器 + 非无痕模式 + 未清站点数据 → 星标下次打开仍在；**不跨设备/浏览器同步**（静态站无后端）；无痕模式关闭即清；清"浏览痕迹"勾选站点数据会一并清掉。
- **SEO 友好**：所有卡片、链接、分类按钮均静态渲染在 HTML 中（build_homeplus.py 生成），不依赖 JS 注入；禁用 JS 时页面内容依然完整可读可点。

### 响应式

- 手机（<768px）：一行 **2** 个卡片
- 平板（768–1023px）：一行 **3** 个卡片
- 桌面（≥1024px）：一行 **4** 个卡片
- 页面容器最大宽度 **1200px** 居中，桌面不会铺满整屏
- 视口高度使用 `100dvh` 类适配，卡片 Grid 使用 `min-width:0` 防溢出

---

## 部署（GitHub Pages + 自有域名）

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "正协导航初始版本"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 2. 开启 GitHub Pages

仓库 → **Settings → Pages**：

- Source 选择 `Deploy from a branch`
- Branch 选择 `main` / `/ (root)`
- Save 后等待 1-2 分钟，访问 `https://<用户名>.github.io/<仓库名>/` 验证。

### 3. 绑定自有域名 zhengxie.com.cn

1. 在仓库 **Settings → Pages → Custom domain** 填写 `zhengxie.com.cn`，Save（GitHub 会自动生成 CNAME 文件并签发 HTTPS）。
2. 到域名服务商（如阿里云/腾讯云）的 DNS 解析，添加记录：

| 主机记录 | 类型    | 值                 |
| ---- | ----- | ----------------- |
| @    | CNAME | `<用户名>.github.io` |
| www  | CNAME | `<用户名>.github.io` |

1. 等待 DNS 生效（几分钟到几小时），访问 `https://zhengxie.com.cn` 验证。GitHub 会自动配置 HTTPS 证书（在 Pages 设置页勾选 Enforce HTTPS）。

> 常见问题：
>
> - HTTPS 证书签发需 1~24 小时，若显示 "DNS check failed"，先确认 CNAME 记录已生效（`nslookup zhengxie.com.cn`）。
> - 国内访问 GitHub Pages 可能不稳定，如遇问题可换用国内 CDN 或 Vercel/Netlify（详见下文「可选的部署方案」）。

### 4. 上线检查清单

- [ ] `python assets/.build/build.py` 已重新生成并推送最新 index.html
- [ ] 卡片按 type 分组分行显示（1 组 → 2 组 → 3 组，不同类型不同行）
- [ ] 首页分类按钮（点 Logo=全部）、站内搜索、标签筛选均正常
- [ ] 本地收藏：点卡片星形按钮（描边金→填充金），点顶部金色方形「本地收藏」按钮（★→「本地/收藏」文字）只显示已收藏卡片
- [ ] 顶部收藏按钮星标：清空收藏显示空心 ☆，收藏任意一个后变实心 ★
- [ ] 结果计数行：无筛选显示「共 N 张卡片」，筛选后显示「当前显示 X / N」，0 结果红色提醒
- [ ] 左 Logo：方形（非圆形）、未选中淡红底、选中正红+金环
- [ ] 引擎滑道：切换引擎，输入关键词回车跳转对应结果页
- [ ] 各滑道/行内容超出时，悬停滚轮可左右滚动（页面暂停）
- [ ] 移动端一行 2 个、平板 3 个、桌面 4 个卡片
- [ ] 字体跨浏览器一致：`html` 显式 16px 基准 + `text-size-adjust: 100%` + 表单控件 `font-family: inherit`（style.css 顶部，勿删）
- [ ] 卡片1 媒体容器 48×48（桌面/手机统一），文字 logo 24px（v4.4.3 用户指定）
- [ ] 图标加载失败处显示文字 logo 占位，不破版
- [ ] 统计与广告代码已上线生效（GA4 / 百度统计×2 / AdSense，均已接入真实 ID，见对应章节）
- [ ] 两个广告位 slot 已分开（顶部 `5952548493` / 底部 `4856101005`），AdSense 后台可分位查看收益
- [ ] 备案号已按实际填写（国内域名需 ICP 备案）

---

## 统计与广告（已接入真实代码）

> 以下代码均写在 `build_homeplus.py` 的 `PAGE_TEMPLATE` 中（改动后需重新 `python assets/.build/build.py`），由生成器写入 `index.html` 的 `<head>`。

### 百度统计（双站点代码，已接入）

两个站点代码（com.cn 主站 + info 站）合并注入，IDs 维护在 `build_homeplus.py` 的 `PAGE_TEMPLATE` 百度统计脚本数组 `ids` 里（顺序：com.cn 站 `2f4df5057c929092e36a0d6357e35261` → info 站 `70e38224e5ebd850150b00a19835a25f`）。更换媒体资源时同步改该数组并重新 `python assets/.build/build.py`。

### Google Analytics GA4（已接入 `G-B880S4NQVK`）

标准 gtag.js 片段，ID 出现两处（`gtag/js?id=` 与 `gtag('config', …)`），更换媒体资源时两处同步改。

### Google AdSense（已接入 `ca-pub-6434243103158481`）

**结构**：加载器脚本（`adsbygoogle.js?client=…`）在 `<head>` 中**仅此一份** async 加载；页面有 2 个广告位（Hero 之后 `ad--top`、Footer 之前 `ad--bottom`），每个含 `<ins>` + `push({})`。

**布局原则（重要）**：广告容器 `max-width: 1400px` 居中，**左右零 margin / 零 padding、无任何包裹样式**，撑满可用宽度给 Google 全宽响应式广告最大的尺寸选择空间（小屏 = 整个视口宽；Google 响应式展示广告单元最大宽 1200px，1400 上限留余量）。只保留上下间距（桌面 1.5rem / 手机 1rem）与右上「广告」小字标签（合规要求）。**不要给 `.ad` 加任何水平方向的 margin/padding/border**。

**Slot 分位（已落实）**：顶部广告位 `ad--top` 使用 `data-ad-slot="5952548493"`，底部广告位 `ad--bottom` 使用 `data-ad-slot="4856101005"`——两个独立广告单元，AdSense 后台报告可分位查看各自的展示量与收益。更换单元时只改 `build_homeplus.py` 模板中对应 `data-ad-slot` 的值并重新生成。

### 隐私与 Referer 策略（已内置）

- **不设**全局 `<meta name="referrer" content="no-referrer">`（会让百度统计后台显示"referer 被禁用"，收不到来源站）；仅卡片图片用 `referrerpolicy="no-referrer"` 单独压制。卡片外链 / 引擎跳转默认**发 Referer**。
- 卡片链接按 `link_attr()` 优先级 `同域>同族>营销>评论>暴露>默认` 匹配属性：同域 `target="_self"`、同族 `noopener`、营销 `sponsored noopener noreferrer nofollow`、评论 `ugc noopener noreferrer nofollow`、暴露 `noopener referrerpolicy="origin"`（**dofollow，传权重**，见「站点配置」章节与汇总表）、默认 `nofollow noopener noreferrer`。
- 该策略对 GA4 / 百度统计 / AdSense **无影响**（一方统计不走 Referer 头；AdSense 靠脚本读取页面 URL 投放；默认外链发 Referer 反而利于百度统计来源归因）。

### 404 页面统计接入（与主页一致，不含广告）

`404.html` 为手写自包含静态页（内联 CSS/JS，不依赖 `build_homeplus.py` 生成）。其 `<head>` 已注入与主页**完全相同**的 GA4（`G-B880S4NQVK`）与百度统计（双 id `2f4df5057c929092e36a0d6357e35261` + `70e38224e5ebd850150b00a19835a25f`）脚本，**但刻意不放 AdSense 广告位**（404 为错误页，不应展示广告）。改统计 ID 时，需**手动同步** `404.html` 与 `build_homeplus.py` 模板两处（子页手写、非 build 生成，故无自动同步）。

---

## 可选的部署方案（对比）

| 平台                              | 优点                   | 注意事项                |
| ------------------------------- | -------------------- | ------------------- |
| GitHub Pages                    | 免费、与仓库一体、自动 HTTPS    | 国内访问稳定性一般           |
| Vercel / Netlify                | 全球 CDN、自动 HTTPS、拖拽部署 | 国内访问一般，免费额度充足       |
| 国内对象存储 + CDN（阿里云 OSS / 腾讯云 COS） | 国内访问快                | 需要备案，需手动配置静态托管与 CDN |

本项目是纯静态站，以上平台均可直接部署 `正协导航/` 文件夹内容（入口为 `index.html`）。

---

## 常见问题（FAQ）

**Q1：改了 xlsx 但页面没变化？**
  
需重新运行 `python assets/.build/build.py` 并推送，浏览器强刷（Ctrl+F5）。

**Q2：图片显示成红色底大字？**
  
这是**文字 logo 占位**的预期表现。出现条件：media 为空或**不是合规 URL**（合规 = `http://` / `https://` 开头 + 合法域名/IP/localhost 主机名，如裸域名 `example.com/x.png` 不合规；图片加载失败时不再显示占位文字，而是露出红色渐变底）。若不想要占位效果，在 media 列填上可访问的合规图片 URL 即可。

**Q3：标签/链接太长看不到？分类滑道/筛选滑道/引擎滑道超出屏幕？**
  
所有可滑道（分类滑道、筛选滑道、引擎滑道 + 卡片的标题/描述/标签/链接四类行）行为完全一致：**只在内容真溢出时**，鼠标悬停该滑道/行 → 金色高亮，滚轮上下滑动被接管为左右滚动该行内容，页面不再上下滚动；触屏设备触摸该行同样高亮激活，手指左右滑动。内容不溢出时滚轮照常滚动页面。

**Q4：想调整卡片顺序？**
  
改「站序」列的数字即可。注意排序规则是**先按 type（1→2→3）分组，再按站序从小到大**——站序只在同类型卡片内部生效，不同类型的卡片永远分行显示。

**Q5：新增一个分类？**
  
在任意行的「分类」列填一个新分类名，build 后分类按钮自动出现（按站序首现位置排列）。

**Q6：不想让某个分类出现在导航栏？**
  
把所有该分类行的「分类」列改名或删除即可，分类按钮按数据自动生成。

**Q7：想增删搜索引擎？**
  
搜索引擎清单在 `assets/.build/build_homeplus.py` 顶部的 `ENGINES` 列表里（每项含 key / 显示名 / 搜索 URL / 是否主引擎）。增删或调序后，主引擎（百度/Google/必应）保持原位（搜索框上方），其余进下方引擎滑道。改完跑 `python assets/.build/build.py` 重新生成即可。

**Q8：本地收藏没了？**
  
本地收藏存于浏览器 `localStorage`，不跨设备/浏览器。以下情况会丢失：换了浏览器或设备、用了无痕模式、清"浏览痕迹"时勾选了"站点数据/Cookie"。这些是纯前端静态站的固有限制。

---

## 技术要点备忘

- 生成器 `build_homeplus.py`：`openpyxl` 读取 → 排序（**先 type 1→2→3，再站序**）→ 分类去重生成按钮 → 三类卡片模板渲染（type 变化处插入 `grid-break` 强制换行）→ 全部内容内联进静态 HTML（HTML 实体转义，防注入）。media 列经**合规 URL 校验**（`urllib.parse` 解析 scheme + 主机名正则），不合规视为空值走文字占位。
- 样式 `style.css`：CSS 变量定义红金白配色（含 `--red-soft` 淡红 / `--gold-deep` 深金）；`grid-template-columns: repeat(2/3/4, 1fr)` 实现响应式；type1 为 4 行 3 列、type2/3 为 5 行 2 列的 `grid-template-areas` 布局（收藏按钮为 grid 成员固定在名称行右端）；`aspect-ratio: 1.618/1` 与 `1/1.618` 实现黄金比例封面；`user-select:none` 防误选；`overflow-x:auto` 实现横向滚动；卡片收藏星为内联 SVG（CSS 按 `aria-pressed` 切换描边/填充）。
- 交互 `main.js`：**三维度筛选**（`activeCat` 分类 / `filterTags` 关键词 / `showFav` 本地收藏）AND 叠加，相互独立；事件委托（星标按钮用 `closest` 命中，兼容内嵌 SVG 点击目标）；`hidden` 属性控制显隐；本地收藏存 `localStorage('zx_favs')`；引擎按钮带 `data-url`，单选激活后提交跳转；**结果计数**（`applyFilter` 统计可见数，更新 `#result-count`）；**顶部收藏星**（按 `favs` 键数切换 ☆/★）。
- **CSS 优先级注意**：左 Logo 按钮同时带 `category-nav__logo` 与 `category-btn` 两个类，`.category-btn` 的 `border-radius:999px`、`background:transparent` 若声明在后会覆盖 logo 样式（曾导致 logo 显示为圆形白底）。logo 样式块必须放在 `.category-btn` 系列**之后**。
- **统一滑动行为**：`.track` 滑道 + 卡片四类行共用 `is-scrollable` 检测（`scrollWidth > clientWidth` 才标记）+ 悬停/触摸金色高亮 + `wheel` 事件转横向滚动（`passive:false`，只在真溢出时接管）。
- SEO：`h1`=正协导航（Hero）、`h2`=各分类按钮、`h3`=各卡片名，标题层级完整；meta description / OG 标签齐备；所有链接静态可爬。

---

## v5 变更记录（2026-08）

### SEO 与元数据

- `robots.txt` 策略：`User-agent: *` + `Sitemap`；**先 `Disallow: /assets/`（兜底屏蔽整个内部目录，含构建脚本 `.build/`、数据源 `xlsx/`、配置 `json/`、技能 `skills/`），再用 `Allow` 白名单放出站点运行必需的公开资源**：`Allow: /assets/css/`、`Allow: /assets/js/`、`Allow: /assets/images/`。**关键：robots.txt 中不出现任何具体内部目录名（如 `.build`），避免向外界指路**；根 `ads.txt` 在 `/assets/` 之外，仍可公开抓取（AdSense 授权必需）。
  - **公开资源必须放行**：`assets/{css,js,images}` 是站点运行必需的公开静态资源（子页经 `../../assets/` 引用同一份根资源）。整体 `Disallow: /assets/` 后，必须用 `Allow` 白名单把它们放回来——CSS/JS 被禁会影响富媒体渲染，图片（logo/卡片图）被禁会丢失 Google 图片搜索与 `og:image` 社交预览；且 `<link>/<script>` 引用的资源本就不会进搜索结果。GitHub Pages 不支持 `X-Robots-Tag` 自定义响应头，故无法对资源文件做 `noindex`，维持"Disallow 兜底 + Allow 白名单"即可。
- 新增 `sitemap.xml`（首页 + about + submit；**现状（2026-08-23）已扩展为 13 条**：首页 + 9 个 pages/* + 3 个 directory/*，详见仓库内 `sitemap.xml`）
- 新增 `manifest.json`（PWA 基础支持）
- `<head>` 新增：`canonical`、`og:image`、`og:site_name`、`twitter:card`、`theme-color`（light/dark 双值）、`apple-touch-icon`、`preconnect`（GA / AdSense / 百度统计）
- 新增 JSON-LD 结构化数据（`WebSite` + `SearchAction`，帮助搜索引擎理解站点搜索功能）
- 关键词扩充（增加"政协"、"导航网站"等）
- 404 页面重构：品牌风格 + 8 秒后自动跳转首页 + SEO 可读内容（非纯 JS 跳转）

### UI / 视觉设计

- **暗色模式**：CSS 变量 `[data-theme="dark"]` 覆盖，跟随系统偏好 + 手动切换 + localStorage 持久化，加载前同步设置防闪烁(FOUC)
- 页面入场动画（fadeInDown / fadeInUp / fadeIn，`prefers-reduced-motion` 尊重）
- 卡片悬停金色光带扫过效果
- 回到顶部按钮（滚动 >400px 显示，平滑滚动）
- 空结果状态（图标 + 提示文案，无清除按钮，避免与筛选栏「清除筛选」重复、避免误重置分类）
- 无障碍 skip-to-content 链接
- 打印样式（隐藏交互元素，3 列布局，避免卡片跨页断裂）
- Footer 重构（flex 布局，品牌 + 链接 + 随机漫步按钮）

### 功能 / 交互增强

- **键盘快捷键**：`/` 聚焦站内搜索，`Esc` 清除并失焦
- **暗色模式切换**：按钮移入页脚工具簇（不再占用置顶区，避免小屏挤压分类滑道、影响第一印象）
- **URL hash 同步**：`#cat=AI智能&q=百度` 格式分享筛选状态；防抖 `pushState` 写入历史，浏览器前进/后退可在筛选状态间切换
- **搜索高亮**：匹配关键词在标题/描述中以金色背景高亮
- **空结果状态**：0 结果时显示提示文案（无清除按钮，避免重置分类）
- **随机漫步**：Footer 新增「随机漫步」按钮，随机打开一张当前可见的卡片
- **回到顶部**：长页面滚动后一键返回顶部

### 项目结构

- 子页目录化：`pages/about/index.html`（关于本站）、`pages/submit/index.html`（收录申请）；子页资源/链接均用根相对路径（`../../assets/`、`/pages/...`），clean URL 如 `/pages/about/`。**注：原 `units/` 路径为 2026-08-22 前的旧结构，已于 2026-08-22 末整体迁移至 `pages/` 并删除 `units/`，当前以 `pages/` 为准。**
- 重构 `404.html`（品牌风格 + 可读内容 + 延迟跳转）
- Footer 链接结构化为「版权 + 导航 + 工具簇（随机漫步 + 暗色切换）」
- 新增「随机漫步」按钮（位于页脚工具簇，不再与文字链接同行）
- ~~`units/1/index.html` 为旧占位页~~：**已于 2026-08-22 末随 `units/` 整体删除**

### 技术要点备忘（v5 补充）

- 暗色模式实现：`<html data-theme="dark">` 属性 + CSS 变量覆盖；加载前内联 `<script>` 同步读取 localStorage / 系统偏好，避免 FOUC；切换按钮在**页脚工具簇**，`aria-pressed` 状态同步
- 暗色配色（v6 重做）：近黑暖调漆面黑 `#0D0C0E` + 暖炭灰 `#171519` + 亮金 `#E8CB84` + 象牙白 `#EDE8E0`，尊贵奢华、简约大气，摒弃旧版偏蓝紫调
- URL hash 格式：`#cat=分类名&q=关键词1,关键词2`；多关键词用**明文逗号**拼接（不做 `encodeURIComponent` 转 `%2C`，避免复制/新标签打开异常）；防抖 `pushState` 写入历史（连续操作只一条记录），`hashchange`/`popstate` 触发 `syncFromHash` 还原，浏览器前进/后退可在筛选状态间切换；还原期间用 `replaceState` 不打断历史栈
- 搜索高亮：`highlightCard()` 保存 `data-orig` 原文，每次筛选时从原文重新生成 `<mark>` 标签，避免重复包裹
- 结果计数措辞：「站点」→「条目」→「卡片」（卡片可对应电影 / 书 / 人 / 公司，链接行也可能多个外链，「站点」不概括；最终用「卡片」贴合卡片式 UI 且同样不预设内容类型）

---

© 2026 正协导航 · 让每一次寻找，都不止于找到
