---
name: zhengxie-seo-standard
agent_created: true
description: >-
  Standard manual for all SEO work on the zhengxie.com.cn (正协导航) static navigation
  site. This skill should be used when any SEO-related discussion or change arises:
  page title/keywords/description, meta conventions, category & content architecture,
  indexing, sitemap, Baidu infrastructure, or link/dofollow strategy. It encodes the
  already-decided positioning (vertical-primary, general-secondary) and the known
  technical-debt backlog so that proposals stay consistent and never contradict prior
  decisions made in earlier sessions.
---

# 正协导航 · SEO 标准手册（zhengxie.com.cn）

## Overview

本手册是 `zhengxie.com.cn`（正协导航，静态导航站）SEO 工作的**权威标准**。它把已经在
前期会话中拍板的方向、meta 约定、已知技术债与防矛盾工作流固化下来，使后续任意 SEO 讨论
都能直接对照，避免：

- **重复**讨论已定事项（如"是否保留通用类目"）；
- **矛盾**于已拍板决策（如提议删掉 AI/工具类目，违背"垂类为主、通用为辅"）；
- **臆造**数据（未查 xlsx 就断言"民主党派=0"）。

> 本手册是**项目内 SEO 唯一权威源**，随仓库同步（位于 `.workbuddy/skills/zhengxie-seo-standard/`），系统可自动加载。历史上曾有三份详细底稿（`zhengxie_seo_review.md`、`zhengxie_vertical_plan.md`、`docs/BAIDU_SEO_STRATEGY.md`），曾置于仓库根目录但为**未跟踪临时稿**、跨设备不可读且违反项目约定，**现已删除、不再依赖**——所有 SEO 规则以本手册 + 用户最新指令为准。

## Authoritative source index（按优先级加载）

做 SEO 讨论前，按需加载以下来源；本手册为第一权威：

1. **本 SKILL.md** —— 已定决策 + 防矛盾工作流（权威摘要）。
2. `assets/.build/build_homeplus.py` 顶部 docstring「同骨架导航产品页（/directory/）· 框架约定」——
   生成框架（self_meta 注入、canonical 自动、资源/页脚前缀、清理优先生成、品牌常量）。
3. `assets/json/self_meta.json` + 各 `directory/<name>/assets/json/self_meta.json` ——
   页面级 title/description/keywords（唯一真实改动点）。
4. `README.md` 顶部与 `.workbuddy/docs/CONVENTIONS.md`「一、跨设备权威源约定」—— 项目总规则（跨设备权威源见该约定）。

## LOCKED decisions（已拍板，禁止在无用户重新拍板下违背）

1. **定位 = 垂类为主、通用为辅（vertical-primary, general-secondary）。**
   站点本质为政协/政务垂类导航（品牌"正协"=政协谐音；55/128 卡为政协），但首页**保留**
   AI智能/设计创意/开发技术/学习教育/效率工具/影音娱乐/资讯媒体等通用类目作为**流量广度**
   ——通用词（网址导航/AI工具/效率工具）搜索量远大于垂类词。
   → 因此：**禁止**提议"为纯化垂类而删除首页通用类目"；**禁止**提议从首页 keywords 剥离
   流量词（AI工具/效率工具）。（此条直接推翻一次错误建议，见 Pitfalls。）

2. **首页 meta 可合法引用"民主党派/政务服务平台"作为 Layer-3 目标态。**
   把 meta 里尚未兑现的承诺视为"待补内容"（Layer 3 增补：中国政府网、民主党派中央网站、
   国务院部委），**而非待删文案**。禁止因内容尚未到位就建议删掉这些关键词。

3. **self_meta.json 仅 3 字段**：title / description / keywords。
   - canonical **不进 meta**，由 build.py 依据 `SITE_DOMAIN`+路径自动拼（根 `/`、
     `directory/<name>/`）；**禁止**手改每页 canonical。
   - og:title/og:description/twitter:*/JSON-LD 均引用 title/description；
     author/og:type/twitter:card/og:image/og:site_name 为 build.py 常量。
   - **真实改动一律落在 self_meta.json**：渲染时 `m = dict(ROOT_META); m.update(self_meta.json)`，
     self_meta.json 存在且字段非空即**完全覆盖**常量。改 build.py 的 `ROOT_META`/`SLOGAN`
     常量在 self_meta.json 存在时**不生效**。

4. **品牌"正协导航"与 SLOGAN 保留**（谐音防火墙；SLOGAN 可保留情感向），**不改**为"政协"。

5. **合规防火墙**：始终以"第三方资源导航/聚合"自居——**绝不**暗示官方背景、**绝不**使用
   政协官方标识/视觉风格。品牌用"正协"（非"政协"）已是良好防火墙。

## Decided directions（已定方向，部分尚未落地——勿重复争论，标注状态）

- **可信站 dofollow**：计划经 build.py 新增 `TRUSTED` 档（匹配 `gov.cn`/`cppcc.gov.cn`…），
  让 50+ 政协官网外链从默认 nofollow 变 dofollow（最强主题信号，零内容成本）。
  **状态：未实现**（当前所有外链默认 nofollow）。实施线索见下方「参考草稿」段。
- **sitemap 由 build.py 自动生成**（根 + `directory/*` + `pages/*`）：修复 P0 频道页孤儿。
  **状态：未授权/未实现**——build.py docstring 明写"本期不做 sitemap"，`sitemap.xml` 仍手工维护。
  故新增频道时必须**手动补 sitemap.xml**，直到此方向被授权。
- **Phase 2 独立 `directory/zhengxie/` 频道**：已建（55 卡），但现已与根页政协(55) **97% 重复**
  ——见 Backlog（最紧迫内容问题，待裁决）。

## 参考草稿（未实施，源自早期 vertical_plan，供 Phase 1 落地时采用）

> 以下为早期方案的**具体草稿值 / 实现线索**，尚未实施。落地前按 xlsx 实际核验、以用户最新指令为准；不替代 LOCKED 决策。

### meta 建议值（Layer 1，改 `self_meta.json` 三字段）
| 字段 | 建议改为 |
| --- | --- |
| `title` | `正协导航 - 政协委员与政务工作一站式资源导航` |
| `description` | `专注政协与政务垂类，全量收录全国政协及各省市委官网、民主党派、政务服务平台与常用工具，为政协委员和政务工作者提供一站式入口。` |
| `keywords` | `政协,政协委员,人民政协,协商民主,政协会议,各省市政协,民主党派,政务服务平台,正协导航,政协官网导航,AI工具,效率工具` |

> 注意：`BRAND`/`SLOGAN` 保留；`canonical` 不进 meta（build 自动拼）；改 `build.py` 常量不生效，真实改动只在 `self_meta.json`。

### dofollow 实施线索（Layer 4，TRUSTED 档）
- `build.py` 的 `link_attr()`（约 474–505 行）按 `同域>同族>营销>评论>暴露>默认` 匹配；默认 `DEFAULT_LINK_ATTR = 'target="_blank" rel="nofollow noopener noreferrer"'`。
- 当前无任何分类输出 dofollow（`EXPOSED` 政务备案仍是 nofollow）。
- 方案：新增 `TRUSTED_ATTR = 'target="_blank" rel="noopener"'`（传权重、无 nofollow），名单 `TRUSTED = ["gov.cn", "cppcc.gov.cn", …]`；在 `link_attr()` 的 `# 6) 默认` 分支前插入匹配。
- 效果：50+ 政协/政务官网外链自动变 dofollow → 最强主题信号，零额外内容成本。
- ⚠️ `assets/py/link-policy.json` 是死配置（`link_attr()` 不读它），真实改动在 `build.py` 代码。

## Known issues / backlog（当前真实状态，避免重新发现）

### P0（阻断级）
- **频道页孤儿**：`directory/ai/` 全站零内链、且不在 `sitemap.xml`（build.py 从不写 sitemap）。
  计划修复：sitemap 自动生成 + 根页 hero 下/页脚加"频道导航"区块。状态：未实现。
- **境外托管（疑似 GitHub Pages）**：百度对境外 IP 显著降权、爬取慢。百度收录生命线级问题。
- **GA4 + Google AdSense 全站**：GFW 屏蔽→国内加载失败、统计污染、AdSense 违规风险。
  建议：删 GA4/AdSense，仅保留百度统计（本站 ID `2f4df5057c929092e36a0d6357e35261`），广告迁百度联盟或下线。状态：未实现。

### P1
- **JSON-LD SearchAction** `urlTemplate` 指向不存在的服务端 `/?q=` 端点 → 建议直接删除 `potentialAction`。
- **21 张 picsum.photos 随机占位图** → 换真实站点 favicon 或纯文字/纯色占位。
- **无搜索引擎验证与提交**（百度/Bing/GSC）→ 中文站百度收录无保障。
- **政协内容 97% 重复**：根页 `政协`(55) ↔ `directory/zhengxie`(55) 重叠 54 条。
  裁决二选一：**（推荐）删 `directory/zhengxie` 频道**（根页已置顶政协全量）；或保留频道、从根页移除政协。
- **AI 重叠**：根 `AI智能`(6) ↔ `directory/ai`(6) 重叠 4。处理：根只做精选预览（旗舰工具+"更多→"），
  频道做深做全（扩到 10+：补 Perplexity/Gemini/豆包/智谱/讯飞/SD/Runway）。

### P2
- **重复条目**：`新华网` ×2、`中央网信办举报中心(12377)` ×3–4 → 去重到 1 条；`央广网` 混了公众号分享链接 → 只留 `cnr.cn`。
- **JSON-LD** `alternateName` == `name` → 改为真实别名（如"正协"）。
- **无面包屑 / `BreadcrumbList`** 结构化数据（尤其 `directory/` 层级）。
- **og:image 单一**：各频道无差异化封面。

### 内容/架构观察项
- **政协广东倾斜**：55 条中广东（含市/区）约 22 条，其余省仅省级 → 看起来像广东地方站。
- **`check_links.py` 仅扫根 `self_links.xlsx`**，不覆盖 `directory/*/self_links.xlsx` → 频道死链检不出。
- **`directory/index.html` 手写门户页未建**（已知缺口；手写、非 build 任务）。

## SEO proposal workflow（建议工作流）

1. **先加载权威源**（本手册 + 相关底稿 + README + build.py docstring）。
2. **核查数据**：对 xlsx 实际读取后再断言（条数、缺失分类、重复），禁止凭印象。
3. **对照 LOCKED decisions**：若提议与之冲突（如"删通用类目""剥离 AI工具 关键词"），
   **停下**——要么改写为合规方案，要么显式请用户重新拍板；**绝不静默推翻已定决策**。
4. **处理文档间张力**：若三份底稿彼此矛盾（例：BAIDU 文档 P1#5 建议关键词聚焦垂类、弃泛词，
   而 vertical_plan + 用户决策保留通用），**以用户决策为准**（垂类为主通用为辅），注明张力即可。
5. **分级**：每一条标 `现在做(无风险)` / `需用户拍板` / `暂缓观察`。
6. **交付可执行改单**：具体 xlsx 增删行（含 URL 供用户核验官方域名）、meta 字段值、或 build.py
   代码改动；不要只叙述。
7. **守项目约定**：讨论先于改代码；简化不过度设计；用户实时指令优先于文档草稿；不提交 git（除非明示）。

## Pitfalls（已踩过的坑，禁止再犯）

- ❌ 提议"删除首页通用类目以纯化垂类" —— 违背「垂类为主、通用为辅」。
- ❌ 提议从 keywords 剥离流量词（AI工具/效率工具） —— 同上。
- ❌ 把引用"民主党派/政务服务平台"的 meta 视为"过度承诺应删" —— 它是 Layer-3 目标，补内容、留文案。
- ❌ 在根页与 directory 频道间制造/保留重复内容（政协 97% 重复）—— 优先单一来源。
- ❌ 未查 xlsx 就断言数据事实（条数、是否缺某分类）。
- ❌ 改 build.py `ROOT_META`/`SLOGAN` 常量期望改 meta —— self_meta.json 会覆盖它们。
- ❌ 手改每页 canonical —— 它由 build.py 自动生成。
- ❌ 暗示官方政协背景或使用官方视觉 —— 合规红线。
- ⚠️ 注意历史底稿张力：早期 `docs/BAIDU_SEO_STRATEGY.md` P1#5 曾建议关键词聚焦垂类、弃泛词，与已定「垂类为主通用为辅」冲突；用户已重申保留通用，故**跟决策、不跟该历史文档那一条**（该文档已弃用，不再依赖）。

## 跨设备说明

- 本手册是 SEO 事项的**项目内唯一权威源**，位于 `.workbuddy/skills/zhengxie-seo-standard/`、随仓库同步、系统可自动加载。
- 跨设备权威源约定见 `.workbuddy/docs/CONVENTIONS.md`「一、跨设备权威源约定」（README 与各技能均指向它）。
- 做 SEO 讨论前必读本手册。
