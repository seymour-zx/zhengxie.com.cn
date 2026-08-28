# SCHEMA.md · self_links 数据字典与录入规范

> 文档管家（KdocsDocButler）起草 · 2026-08-27
> 本文是 `self_links.xlsx` 的**单一事实来源（single source of truth）**：字段含义、录入规则、维护铁律都在这里，xlsx 表头批注是本文的精简版。

## 1. 文件清单（在用）

| 区段 | 文件 | 数据行 | 列数 |
|------|------|--------|------|
| 政协 | `assets/xlsx/self_links.xlsx` | 65 | 27（原）→ 154（统一副本） |
| 搜索引擎 | `directory/engine/assets/xlsx/self_links.xlsx` | 18 | 同上 |
| 人大/政府 | `directory/gov/assets/xlsx/self_links.xlsx` | 59 | 同上 |

> 3 个文件表头结构一致。统一副本在 `.workbuddy/staging/self_links_unified/self_links.{root,engine,gov}.unified.xlsx`（原文件未动）。

## 2. 结构说明

- **宽表**：一行 = 一张卡片；链接横铺为 `link_1_* … link_10_*`（每卡最多 10 链接）。
- 卡片级字段（row_seq…verification_enabled）每卡 1 个值；链接级字段每链接 1 个值，按 `link_N_` 前缀区分第 N 个链接。
- 页面级信息（page_title/keywords/description/slot）**不在本表**，来自各频道 `self_meta.json`。

## 3. 字段字典

### 3.1 卡片级（每卡一行）
| 字段 | 类型 | 含义 / 录入规则 |
|------|------|----------------|
| `row_seq` | int | 人工顺序号，页面内排序用。 |
| `cat_id` | str | 分类键（政协/民革/全国/直辖市…）。 |
| `card_layout` | 1/2/3 | 卡片版式（非数据类型）。 |
| `card_title` | str | 卡片标题（网站/机构/人名/书名/电影名/意见皆可）。 |
| `card_desc` | str | 卡片描述。 |
| `card_media` | str | **图标/配图录入字段，见 §4 多识别规则**。 |
| `card_tags` | str | 卡片标签，逗号分隔。 |
| `card_id` | str | 卡片归组主键；同 id 多行=一卡多链接（A 范式）。建议 `区段_序号`。 |
| `card_order` | int | 排序权重，越小越前；空则按 row_seq。 |
| `verification_type` | str | 认证类型：备案认证 / 域名时间认证 / 官方认证。 |
| `verification_name` | str | 认证名称（预留，一般留空）。 |
| `verification_url` | url | 认证链接（如 beian.miit.gov.cn）。 |
| `verification_desc` | str | 认证 hover 描述。 |
| `verification_enabled` | bool | true=渲染徽章；空/非真=不渲染。 |

### 3.2 链接级（每链接一行，前缀 `link_N_`）
| 字段 | 含义 |
|------|------|
| `link_N_name` | 第 N 链接显示名。 |
| `link_N_url` | 第 N 链接地址。 |
| `link_N_desc` | 链接描述。 |
| `link_N_media` | 链接级 favicon（覆盖卡片级 card_media）。 |
| `link_N_tags` | 链接标签，逗号分隔。 |
| `link_N_source_type` | 来源徽章：official / S / A / B / C / D。 |
| `link_N_verify_date` | **备案/核验时间**（如 2000-01-01）——你举例的「备案检验时间」。 |
| `link_N_verify_channel` | 核验渠道：whois / ICP / 官方公告。 |
| `link_N_verify_by` | 核验责任人。 |
| `link_N_link_status` | active / dead（dead 不渲染）。 |
| `link_N_review_cycle` | 复核周期（天）。 |
| `link_N_region` | 地域（北京/全国…）。 |
| `link_N_created_at` | 创建时间。 |
| `link_N_updated_at` | 更新时间。 |

## 4. `card_media` 多识别录入规则（重点）

卡片图片录入文本特殊，存在多种识别情况，维护时按以下规则：

| 录入值 | 识别为 | 渲染行为 |
|--------|--------|----------|
| **空值**（留空） | 无图标 | 用「文字首字」占位（如「政」「人」）。 |
| **颜色值** `#RRGGBB` 或 `red`/`green` | 底色 | 图标底色 + 反白文字；可另指定文字色。 |
| **指定文字** `政`/`政协`/`人大`（1-2 汉字） | 文字图标 | 不加载图片，直接显示该文字。 |
| **图片 URL** `http(s)://…` | 图标图 | 渲染为 `<img>`（favicon/logo）。 |
| **混合** `文字\|颜色` 或 `URL\|文字` | 组合 | 按分隔符拆分（约定分隔符 `\|`）。 |

**识别优先级**：URL > 颜色 > 指定文字 > 空值占位。
**维护铁律**：`card_media` 只描述「怎么显示图标」，**不存放核验信息**；核验信息一律进 `verification_*` / `link_N_verify_*`。

## 5. 认证（verification）规则
- 认证挂在**卡片级**（`verification_*`），一卡最多 1 个（如中央网信办多认证则只留主认证，或拆多卡）。
- `verification_enabled=true` 才渲染徽章；`type` 决定徽章样式（备案认证/时间认证/官方认证）。
- 链接级另有 `link_N_verify_date` 等，记录该链接的备案核验时间，与卡片级认证互补。

## 6. 维护铁律（全局）
1. 本表是**数据底座**，页面/卡片/链接所有展示都从本表生成（经 build_site.py）。
2. `card_id` 是归组主键，一卡多链接必须共享同一 `card_id`。
3. 链接最多 10 个；超过需拆卡或转长表。
4. 死链 `link_N_link_status=dead` 不渲染，但保留记录便于复核。
5. 核验信息（verify_*）缺失的卡，发布前由「完整度 SLA」闸门拦截（见配套文档）。

## 7. 已知结构权衡
- 当前为**宽表**，链接级 12 字段 × 10 槽 = 120 列，约 9 成空格。长表（一行=一链接，靠 `card_id` 归组）更 scalable，是 `site_data.xlsx` 的目标形态；本表保留宽表以贴合现有录入习惯。
- 页面级字段（page_*）未并入本表，维持与 `self_meta.json` 的分离。

---
*配套治理文档：域名白名单（官方域名裁决）、完整度 SLA（发布前校验闸门）——均由文档管家起草，见各自文件。*
