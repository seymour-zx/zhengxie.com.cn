# self_links.xlsx 统一表头改造 · 映射与缺口清单

> 文档管家（KdocsDocButler）整理 · 2026-08-27
> 目的：把 3 个在用 `self_links.xlsx` 的表头**统一命名**，让你一眼看出「现有字段」与「候选字段清单里要加的字段」之间的缺口。

## 0. 当前在用数据底座现状

| 区段 | 源文件 | 数据行 | 表头列 |
|------|--------|--------|--------|
| 政协（root） | `assets/xlsx/self_links.xlsx` | 65 | 27 |
| 搜索引擎（engine） | `directory/engine/assets/xlsx/self_links.xlsx` | 18 | 27 |
| 人大/政府（gov） | `directory/gov/assets/xlsx/self_links.xlsx` | 59 | 27 |

- 3 个文件**表头完全一致**（27 列），因此统一改造只需一套映射。
- 链接采用**宽表**结构：`link1_name/link1_url … link10_name/link10_url`（每卡最多 10 个链接，每个链接只有「名称+URL」两列）。
- 页面级信息（标题/关键词/描述）**不在 self_links 里**，来自各频道的 `self_meta.json`，本清单不展开。

## 1. 统一表头映射表（旧 → 新 → 候选字段 → 状态）

| 旧表头 | 统一表头 | 对应候选字段（见《候选字段清单》） | 状态 |
|--------|----------|------------------------------------|------|
| 站序 | `row_seq` | `row_id`（人工编号）+ 排序权重 `card_order` | 🟡 部分对齐：仅顺序号，排序权重候选未单列/已删 |
| 分类 | `cat_id` | `cat_id` | ✅ 已对齐 |
| type | `card_layout` | （候选未单列，建议保留） | 🟡 候选未收：卡片版式 1/2/3，非数据类型 |
| title | `card_title` | `card_title` | ✅ 已对齐 |
| desc | `card_desc` | `card_desc` | ✅ 已对齐 |
| media | `card_media` | `card_media` | ✅ 已对齐 |
| tags | `card_tags` | `card_tags` | ✅ 已对齐 |
| link1_name | `link_1_name` | 长表 `name` | 🔶 结构不同（宽→长，见 §3） |
| link1_url | `link_1_url` | 长表 `url` | 🔶 结构不同 |
| … | `link_2..10_name/url` | 同上 | 🔶 结构不同 |

> 已生成的统一副本（原文件未动）：
> `d:\Universal Space\zhengxie.com.cn\.workbuddy\staging\self_links_unified\self_links.{root,engine,gov}.unified.xlsx`
> 每个表头单元格带**批注**（中文含义 + 对应候选字段）。

## 2. 缺口分析：候选要、但 self_links 没有的字段

按层级列出。**这就是「要增加什么」的清单**——你逐条勾选即可定稿 schema。

### 2.1 页面级（self_links 完全缺失，原在 self_meta.json）
| 候选字段 | 含义 | 圆桌来源 |
|----------|------|----------|
| `page_id` | 页面目录名=生成路径 | #10/#38 |
| `page_title` | 页面 meta title | #3/#38 |
| `page_keywords` | 页面 meta keywords | #3 |
| `page_description` | 页面 meta description | #3/#38 |
| `slot_header_text` / `slot_header_enabled` | 页头槽位文本/开关 | #9/#38 |
| `slot_footer_text` / `slot_footer_enabled` | 页脚槽位文本/开关 | #9/#38 |

### 2.2 卡片级（部分缺失）
| 候选字段 | 含义 | 圆桌来源 | 备注 |
|----------|------|----------|------|
| `card_id` | 卡片归组主键 | #38 | 候选启用为归组键（一卡多链接） |
| `card_order` | 卡片排序权重 | 11 棒提议 | ⚠️ 你之前删除，圆桌高频要 |
| `verification_type` | 认证类型（备案/时间） | 多棒 | 你之前定"卡片级、拍平只留 1 个" |
| `verification_name` | 认证名称（预留） | — | 预留 |
| `verification_url` | 认证链接 | — | 如 beian.miit.gov.cn |
| `verification_desc` | 认证 hover 描述 | — | — |
| `verification_enabled` | 认证渲染开关 | — | true=渲染 |

### 2.3 链接级（每链接应补齐，现仅 name+url）
| 候选字段 | 含义 | 圆桌来源 | 备注 |
|----------|------|----------|------|
| `link_id` | 链接唯一键 | #38 | 用于比对 |
| `desc` | 链接描述 | 多棒 | 🔥 现完全缺失 |
| `media` | 链接级 favicon | #38 | 现只有卡片级 `card_media` |
| `tags` | 链接标签 | — | ⚠️ 你之前删除 |
| `source_type` | 来源徽章（official/S/A/B…） | #5/#31 | 🔥 现缺失，渲染成徽章 |
| `verify_date` | **备案核验时间**（你举例的重点） | 18 棒 | 🔥 最高频提议之一 |
| `verify_channel` | 核验渠道（whois/ICP/官方公告） | #21/#38 | 🔥 现缺失 |
| `verify_by` | 核验责任人 | 5 棒 | ⚠️ 你之前删除，圆桌要 |
| `link_status` | active/dead（dead 不渲染） | #22/#38 | 🔥 死链治理 |
| `review_cycle` | 复核周期（天） | #28/#38 | 🔥 新鲜度 |
| `region` | 地域 | 6 棒 | ⚠️ 你之前删除，圆桌要 |
| `created_at` / `updated_at` | 创建/更新时间 | #38 | 维护留痕 |

### 2.4 治理校验层（非数据列，属发布闸门）
- `SCHEMA.md`：数据字典/录入规范（#39 文档管家）
- 域名白名单 / `source_type` 枚举：录入即强制（#36 世界圣经）
- 数据完整度 SLA：缺 `desc`/缺 `verify_date`/缺 favicon 的卡不能上线（#22/#23）

## 3. 最关键的结构差异（决定你怎么加字段）

self_links 是**宽表**（一卡一行，链接横铺 10 对）；候选 32 列是**长表**（一行 = 一个链接，靠 `card_id` 归组）。

- 若保持宽表：链接级字段（`desc`/`source_type`/`verify_date`…）只能再加 `link_N_desc`/`link_N_source_type`… 成对扩展，最多 10 链接，且每链接字段要复制 10 遍——**不 scalable**。
- 若转长表（推荐，与圆桌一致）：每个链接一行，链接级字段天然单列，一卡多链接用 `card_id` 归组，A 范式（中央网信办 3 链接）自然成立。

> 建议：本次只做「表头统一命名」（宽表内重命名，0 结构变动，便于你对比）；
> 是否转长表 + 加 §2 的字段，等你勾选后我再落地到新的 `site_data.xlsx`。

## 4. 待你决策（勾选后我执行）
- [ ] 卡片级是否恢复 `card_order` / `verification_*`
- [ ] 链接级要加哪些：`desc` `media` `tags` `source_type` `verify_date` `verify_channel` `verify_by` `link_status` `review_cycle` `region` `created_at` `updated_at`
- [ ] 页面级是否并进同一张表（还是保留 self_meta.json 分离）
- [ ] 是否转长表（推荐）
- [ ] 是否保留 `card_layout`（版式 1/2/3）
