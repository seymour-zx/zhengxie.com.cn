# 正协导航 · SEO 审计（13-SEO审计）

> 读者：每月 / 每次新增页面 / 改链接结构时执行。
> 版本：v1.0 ｜ **2026-08-29 首次全站实测**
> 关联技能：做 SEO 讨论前先读项目技能 `zhengxie-seo-standard`（CONVENTIONS §1.7）。

---

## 1. 实测总览（2026-08-29）

扫描对象：14 个页面（根页 + 404 + 9 个 `pages/*` + 频道 hub + 2 个频道页）。

| 指标 | 实测 | 目标 | 判定 |
|---|---|---|---|
| 页面总数 | 14 | — | — |
| 卡片总数 | 337（根页）/ 67（engine）/ 59（gov） | — | — |
| `canonical` 覆盖 | 13/14 | 14/14 | 🟠 |
| `description` 覆盖 | 14/14 | 100% | ✅ |
| `keywords` 覆盖 | 13/14 | 100% | 🟠 |
| **OG 全套覆盖** | **3/14** | 100% | 🔴 |
| **`twitter:card` 覆盖** | **3/14** | 100% | 🔴 |
| `theme-color` 覆盖 | 14/14 | 100% | ✅ |
| `apple-touch-icon` 覆盖 | 3/14 | 100% | 🟠 |
| JSON-LD 存在 | 13/14（404 无为预期） | 100% | ✅ |
| BreadcrumbList | 12 页 | 100% | 🟠 |
| 图片 `alt` | 9/9 | 100% | ✅ |
| `h1` 唯一性 | 每页 1 个 | 100% | ✅ |
| 外链总数 | 219 条 / 196 域名 | — | — |
| `_blank` 缺 `noopener` | **0 / 207** | 0 | ✅ |
| sitemap URL 数 | 13 | 覆盖全部页面 | 需同步 |
| **sitemap `lastmod`** | **0 / 13** | 100% | 🟠 新鲜度信号缺失 |
| 裸 IP 外链 | 1 处 | 0 | 🟠 |

---

## 2. 分项明细

### 2.1 head 标签覆盖矩阵

| 页面 | can. | desc | kw | og | tw | theme | apple-icon |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| `index.html` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `directory/gov/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `directory/engine/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `directory/index.html` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `404.html` | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `pages/*` × 9 | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |

**结论**：OG / Twitter / apple-touch-icon **缺 11 页**（9 个 `pages/*` + `404` + 频道 hub）。这 3 页有 OG 的是 build 生成的页（根页 2 个频道页），**手写页全部缺失** → 根因是手写页模板未统一，属可一次性批量修复的模板问题。

### 2.2 JSON-LD `@type` 分布

| 页面 | `@type` |
|---|---|
| `index.html` | `WebSite`（带 `SearchAction`） |
| `directory/*/` | `WebPage` + `BreadcrumbList` + `ItemList`（engine/gov）；hub 为 `WebPage` + `ItemList` |
| `pages/about/` | `AboutPage` + `Organization` |
| `pages/contact/` | `ContactPage` |
| 其余 `pages/*` | `WebPage` |
| `404.html` | 无（符合预期） |

✅ 与 CONVENTIONS §3.1 映射表一致。**待办 B14**：`Organization` 仅 about 页有，按映射表评估是否需全站 `isPartOf` 侧补充。

### 2.3 标题层级

| 页面 | h1 | h2 | h3 |
|---|---|---|---|
| `index.html` | 1 | 11 | 337 |
| `directory/gov/` | 1 | 7 | 59 |

✅ 层级合法（h1 唯一为站点名，h2 为分类/区块，h3 为卡片名）。

### 2.4 外链结构

- 总数 219 条 / 196 个域名；`_blank` 207 处，**noopener 覆盖率 100%**。
- `nofollow` 92 处（营销/UGC 类），其余 115 处为政务/同域 dofollow，符合 ADR-008 域名优先级。
- 高频外链域名：`beian.miit.gov.cn`（12，备案查询）、各省级政协/人大/部委官网（各 1）。
- ⚠️ 1 处裸 IP 明文外链：`http://202.106.125.196`。

### 2.5 站点配置

| 文件 | 状态 | 判定 |
|---|---|---|
| `robots.txt` | `User-agent: *` + `Disallow: /assets/` + `Allow: /assets/css|js|images/` + `Sitemap` | ✅ |
| `sitemap.xml` | 13 条 URL | 🟠 需与新页面同步（build 自动生成**未授权**，须手动补） |
| `ads.txt` | 存在，AdSense 授权 | ✅ |
| `CNAME` | `zhengxie.com.cn` | ✅ |

---

## 3. 缺陷清单与优先级

### 🔴 P0（生命线）

| # | 缺陷 | 影响 | 修复方案 |
|---|---|---|---|
| **SEO-1** | OG + Twitter 缺 11 页 | 社交分享/即时通讯无卡片；影响富结果与点击率 | 补全手写页 head 模板（一次性批量） |
| **SEO-2** | **境外托管（GitHub Pages）致百度降权** | 国内主战场收录生命线受损 | 与 A5/F1 联动：备案 + 国内托管（ADR-001） |
| **SEO-3** | GA4 + AdSense 域名被墙 | 首屏超时拖慢 LCP，间接伤排名；数据缺失 | D-4 拍板（删 / 留 / 异步化） |

### 🟠 P1

| # | 缺陷 | 修复方案 |
|---|---|---|
| **SEO-4** | `apple-touch-icon` 缺 11 页 | 随 SEO-1 批量补 |
| **SEO-5** | `404.html` 缺 `canonical` / `keywords` | 补（canonical 指向根域或省略） |
| **SEO-6** | 1 处裸 IP 明文外链 | 换 https 域名或移除该收录 |
| **SEO-7** | 频道页导语未内容化（D1） | 每频道 300–500 字独特导语 + FAQPage |
| **SEO-8** | 搜索引擎验证与提交未完成（百度/Bing/GSC） | F2 百度站长平台接入（需用户账号） |
| **SEO-8b** | **`sitemap.xml` 13 条 URL 零 `lastmod`** | 已定机制：**内容哈希 + 持久化缓存 `assets/.build/.sitemap_lastmod.json`**（hash 同→沿用历史 lastmod；hash 异→今天；新页→今天；删页→移出）。⚠️ 落地前提：sitemap 当前为**静态手写**文件（`build_homeplus.py` 第 166 行明示不维护 sitemap），需先授权补"自动生成"，属 build 脚本改动——按文件改动铁律需用户二次授权 |
| **SEO-9** | 根页 HTML 345 KB 超预算 | 见 14-性能基线 §4 优化路径 |
| **SEO-10** | 频道页仅 2 个（gov / engine），与文档"15 频道"不符 | 修文档（05-开发规范 M-5）或扩容频道 |

### 🟡 P2

| # | 缺陷 | 修复方案 |
|---|---|---|
| **SEO-11** | 重复条目去重（新华网 ×2、12377 ×3–4） | 人工核对后合并/差异化描述 |
| **SEO-12** | JSON-LD `alternateName` 改真实别名 | 补真实别名 |
| **SEO-13** | `og:image` 差异化封面 | 各页配独立封面 |
| **SEO-14** | 办事指南类内容缺失（D3） | 月 2–4 篇，内链到频道页 |

---

## 4. 静态渲染生命线（不可妥协）

- 所有卡片、链接、分类按钮**静态渲染在 HTML**，禁用 JS 时内容完整可读可点。
- 禁用 JS 降级检查为**发布红线**（08-测试流程 UC-F11）。
- 任何"用 JS 渲染卡片"的改动一律拒绝。

---

## 5. 新增页面的 SEO 必做

1. 判骨架（S1–S6）→ 按 CONVENTIONS §3.1 选 JSON-LD `@type`。
2. 补齐 head 全套（canonical / description / keywords / **OG 全套** / twitter:card / theme-color / apple-touch-icon）。
3. 面包屑：与可见导航一致，**禁止虚构层级**（ADR-004）。
4. **手动**加入 `sitemap.xml`（build 自动生成未授权）。
5. 内链：绝对路径 + `target="_self"`；外链按 ADR-008 判 `rel`。
6. 频道页导语必须**独特**（非模板重复）。
7. 跑 09-用例模板 UC-S01 ~ UC-S10。

---

## 6. 变更 URL 的强制动作

任何页面 URL 变更（重命名、迁移、合并频道）**必须**同时：

1. 配置 **301 重定向**（GitHub Pages 无原生 301，需靠保留旧路径 HTML 做 meta refresh + canonical，或迁到支持 301 的平台）。
2. 更新 `sitemap.xml`。
3. 更新全站内链引用（页脚导航、overview 页、其他页面的链接）。
4. 在搜索引擎站长平台提交变更。
5. 记录到当日时间日志 + `pages/changelog`。

> 参考：国际频道"完整法"迁移预案（ADR-009 / CONVENTIONS §3.2.3）。

---

## 7. 审计节奏

| 周期 | 动作 |
|---|---|
| **每次新增/改动页面** | 走 §5 清单 |
| **每月** | 死链全量（根页 + 频道页）；新增页 head 覆盖复查 |
| **每季度** | 外链全量核验（合规 + 可用性）；sitemap 与实际一致性 |
| **每半年** | SEO 大盘复盘：收录量 / 排名 / 流量来源 / 扑空率趋势 |

---

## 8. 复测记录

| 日期 | 执行 | 主要变化 |
|---|---|---|
| 2026-08-29 | 首次全站实测（ProjectManagementExpert） | 建立基线：OG 3/14、JSON-LD 13/14、noopener 207/207、外链 219 条 |
