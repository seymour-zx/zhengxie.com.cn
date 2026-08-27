# 正协导航

> 让每一次寻找，都不止于找到

正协导航是一个独立第三方导航站，专注汇集人民政协与民主党派的官方入口。配色以正红为主、大面积留白打底、金色只做点缀，整体清爽克制、不堆砌。

本仓库是网站的全部源码。本文档面向**想自建同类导航站的人**——它会告诉你这个站是怎么**手工搭出来**的，照着就能写一个；不需要任何构建工具或数据源文件，所有内容直接手写进 HTML。

## 一、设计语言

- **风格定位**：正红主色 + 白色大底色 + 金色点缀，清爽克制、不堆砌。
- **配色（亮色）**：红系主色 + 金系点缀 + 白底。
- **暗色模式**：复用同一套配色延伸到暗色，**禁止偏蓝、偏紫、科技冷淡、廉价渐变**。暗色配色：漆面黑 `#0D0C0E` / 暖炭灰 `#171519` / 亮金 `#E8CB84` / 象牙白 `#EDE8E0`。
- 暗色模式跟随**用户手动切换**（不跟随系统偏好）；切换状态存 `localStorage('zx_theme')`，加载前同步设置防闪烁（FOUC）。
- 字体跨浏览器一致基准：`html` 16px + `text-size-adjust:100%` + 表单控件 `font-family:inherit`，不得删除。
- 任何 UI 都必须服从这套语言，不擅自引入新主色或新视觉调性。

**视觉细节参考（避免踩坑）**：

- 分类按钮上**不要放数量/计数徽章**（与结果计数行重复）。
- 暗色切换按钮**不要占用置顶吸顶区**，固定放页脚工具簇。
- 卡片文本**允许框选/复制**（已移除 `user-select:none` 限制，链接点击与文本选择互不冲突）。
- 空结果状态**不要做"清除所有筛选"按钮**，只显示提示文案。

## 二、站点结构（手工视角）

```
正协导航/
├── index.html               站点主页/导航产品页（静态，根域 /）
├── README.md                本手册
├── 404.html                 错误页（自包含、按来源动态返回）
├── CNAME                    自定义域名（zhengxie.com.cn）
├── robots.txt               爬虫规则
├── sitemap.xml              搜索引擎站点地图
├── ads.txt                  AdSense 授权
├── directory/               导航频道页（频道 hub + 各垂类频道）
│   ├── index.html          频道导航 hub（列出各频道）【待建】
│   ├── renmin/index.html    人大频道（全国人大及地方人大官网）【待建】
│   └── zhengwu/index.html   政务机构频道（国务院/部委/政务服务平台）【待建】
├── pages/                   说明/合规/功能型子页
│   ├── overview/index.html  网站全景（全站中枢）
│   ├── about/index.html      关于本站
│   ├── submit/index.html     收录申请
│   ├── privacy/index.html    隐私政策
│   ├── contact/index.html    联系我们
│   ├── disclaimer/index.html 免责声明
│   ├── guide/index.html      使用指南
│   ├── sitemap/index.html    站点地图
│   └── changelog/index.html  更新日志
├── blog/                    原创+转载正文
├── news/                    别人网站文章链接索引
├── journal/                 日记
└── assets/
    ├── css/
    │   └── style.css        全站样式（红 / 金 / 白配色、响应式 Grid）
    ├── js/
    │   └── main.js          交互增强（三维度筛选 / 本地收藏 / 引擎搜索 / 统一滑动）
    └── images/
        ├── logo.svg         站点 Logo（红底金字方形）
        └── *.webp           卡片媒体图
```

目录语义边界：`blog/` = 原创+转载正文；`news/` = 挂别人网站文章链接的索引（不放正文）；`journal/` = 日记；`pages/` = 说明/合规/功能型子页；`directory/` = 同骨架导航频道页。各自语义隔离，不混淆。

## 三、页面骨架形态（S1–S6）

本站按**页面骨架契约**分类（而非内容主题），由「布局范式 × 资源引用 × SEO 角色」决定。六大骨架：

| 骨架 | 名称 | 布局范式 | 实例 |
|------|------|---------|------|
| **S1** | 导航产品页 | 卡片 Grid + 三维度筛选 + 集合搜索（sticky 吸顶） | `index.html`（根域）、`directory/*` 频道页 |
| **S2** | 全站中枢页（网站全景） | 中枢型：架构总览 + 各板块活体切片 + 榜单区块 + 分发中枢 | `pages/overview/` |
| **S3** | 说明信息页 | 单栏静态说明，无长文排版 | about / contact / guide / sitemap / changelog |
| **S4** | 合规页 | 同 S3 + 「AI 辅助、非执业律师意见」声明 | privacy / disclaimer |
| **S5** | 功能入口页 | 表单 / 提交 / 交互型 | submit |
| **S6** | 文章 / 内容页 | 列表索引 + 详情（长文 + 插图 + 上一篇/下一篇） | blog / news / journal |

骨架通用技术契约（全部骨架共用）：

- 资源引用：根页用 `assets/...`，子页（`pages/*/`）用 `../../assets/...` 指向根目录唯一 assets 真源（子页不再自包含、不再复制 assets）。
- 内链绝对路径（`https://你的域名/...`）且 `target="_self"`。
- `<head>` **不设**全局 referrer meta。
- FOUC **仅当 `localStorage('zx_theme')==='dark'` 才暗色**（不跟随系统）。
- 页脚导航统一链接（含「网站全景」「频道导航」）+ 备案号注释占位。
- `canonical` / `robots` / `description` 齐备。
- 红 / 金 / 白视觉语言（暗色金系，禁蓝紫）。

新增页面时：先判属哪一已有骨架 → 套该骨架模板 → 若都无法覆盖且对长远有利 → 新增骨架编号（S7+）。

## 四、手写入门：如何创建一个页面

### 4.1 根页 HTML 骨架（S1 导航产品页）

一个最小可运行的导航产品页，由以下部分组成：

1. `<head>` 必填项：
   - `<title>`、`<meta name="description">`、`<meta name="keywords">`
   - `<link rel="canonical" href="https://你的域名/">`
   - Open Graph：`og:title` / `og:description` / `og:image` / `og:site_name` / `og:url`
   - Twitter：`twitter:card`
   - `theme-color`（light/dark 双值）、`apple-touch-icon`、`preconnect`（统计/广告域名）
   - JSON-LD 结构化数据（`WebSite` + `SearchAction`，见第八节）
   - FOUC 防闪烁：加载前内联一小段脚本，读取 `localStorage('zx_theme')` 决定是否加 `data-theme="dark"`
2. `<body>` 自上而下 8 块：
   - `<header class="hero">`：大 Logo + slogan + 集合搜索引擎（主引擎按钮 + 搜索框 + 引擎滑道）
   - `<aside class="ad ad--top">`：广告位 ①
   - `<nav class="category-nav">`：左方形文字 Logo（承担「全部」）+ 中分类滑道 + 右「本地收藏」按钮
   - `<section class="site-search">`：站内搜索框
   - `<section class="result-count">`：结果计数行
   - `<section class="filter-tags">`：筛选标签行（「当前筛选：」+ 标签滑道 + 「清除筛选」）
   - 第 3–5 块包在 `<div class="sticky-top">` 内整体 sticky 吸顶
   - `<main class="cards-container">`：卡片容器（Grid 直接装全部卡片）
   - `<aside class="ad ad--bottom">`：广告位 ②
   - `<footer class="footer">`：版权 + 必要链接 + 页脚工具簇（随机漫步 + 暗色切换）
3. 每张卡片的手写结构见 4.2；样式类见第五节；交互见第六节。

### 4.2 卡片结构（三种 type）

| 结构 | 布局 | 封面比例 |
|------|------|---------|
| type 1 | **4 行 3 列**：图片（跨两行）/ 名称+收藏按钮 / 描述（跨两列）/ 标签行 / 链接标签行 | logo 方形 |
| type 2 | **5 行 2 列**：封面（跨两列）/ 名称+收藏 / 描述 / 标签行 / 链接标签行 | 横向 1.618:1（黄金比） |
| type 3 | **5 行 2 列**：同 type 2 | 纵向 1:1.618（黄金比） |

通用约束（三类卡片一致）：

- 均有**收藏按钮**（内联 SVG 星形，描边金；收藏后填充金），固定在名称行右端。
- 名称、描述、标签、链接**必有**（空也占位），且只占一行，超出截断/横向滚动。
- 卡片内所有内容**允许框选/复制**（不再设 `user-select:none`）。
- 标签行第 1 个标签固定为该卡片的**分类名**。
- 三种类型**按 type 分组分行**显示（type1 组 → type2 组 → type3 组，组间强制换行），不同类型绝不同行。

### 4.3 页脚模板

页脚导航统一链接（含「网站全景」「频道导航」）+ 备案号注释占位 + 工具簇（随机漫步 + 暗色切换）。备案号在有 ICP 备案的国内域名下才显示（代码保留占位，未备案前不渲染）。

## 五、字段与手工录入指引

导航页的每张卡片，本质就是一组字段。你**直接在 HTML 里手写这些值**，不需要任何数据表或构建步骤。

| 字段 | 必填 | 说明（你在 HTML 里怎么写） |
|------|------|--------------------------|
| 站序 | 是 | 数字。卡片排序**先按 type（1→2→3）分组，再按站序从小到大**；不同类型自动分行 |
| 分类 | 是 | 分类名。你手写的分类按钮按出现顺序生成；改分类名即改导航 |
| type | 是 | 卡片结构：`1`=4行3列 logo 卡，`2`=5行2列横向封面卡，`3`=5行2列纵向封面卡 |
| title | 是 | 网站名称（首字母自动大写用于占位 logo） |
| desc | 否 | 一句话描述 |
| media | 否 | 媒体区，手写格式：`URL`（仅图片）/ `URL,颜色`（图片衬底色）/ `颜色值`（纯色块占位）/ `字符,颜色`（文字占位+底色）。颜色支持 `#rgb`/`rgb()`/`rgba()`/`hsl()`/`transparent`/颜色名。图片**统一用 WebP 且保留透明通道（RGBA）**，否则透明 logo 被填黑 |
| tags | 否 | 标签，英文逗号 `,` 分隔（如 `AI,免费`）。分类名会自动作为标签行第 1 个标签 |
| link1_name … link10_name | 否 | 相关链接名称（共 10 组，每组 2 列 `linkN_name` + `linkN_url`） |
| link1_url … link10_url | 否 | 相关链接 URL；**空 URL 的组自动跳过**，组序即展示顺序（如 `link1_name=官网`、`link1_url=https://x.com`）。外链属性按域名优先级自动匹配（见第七节） |

> ⚠️ 分隔符一律用英文半角逗号 `,` 与分号 `;`；媒体图片用 WebP 且保留透明通道。

## 六、视觉规范（CSS 实现）

- 红金白配色用 CSS 变量定义（如 `--red-soft` 淡红 / `--gold-deep` 深金）。
- 响应式 Grid：`grid-template-columns: repeat(2/3/4, 1fr)`，手机 2 卡 / 平板 3 卡 / 桌面 4 卡。
- type1 用 4 行 3 列、type2/3 用 5 行 2 列的 `grid-template-areas`；收藏按钮为 grid 成员固定在名称行右端。
- 黄金比例封面：`aspect-ratio: 1.618/1`（横向）与 `1/1.618`（纵向）。
- 横向滚动：`overflow-x:auto`；卡片文本可正常框选/复制。
- 卡片收藏星为内联 SVG，CSS 按 `aria-pressed` 切换描边/填充。
- 页面容器最大宽度 1200px 居中；视口高度用 `100dvh` 适配；卡片 Grid 用 `min-width:0` 防溢出。
- 左 Logo 按钮同时带 `category-nav__logo` 与 `category-btn` 两个类，logo 样式块必须放在 `.category-btn` 系列**之后**，否则会被覆盖成圆形白底。

## 七、交互说明（前端 JS 思路）

- **三维度筛选（AND 叠加）**：分类（`activeCat`）× 关键词（`filterTags`）× 本地收藏（`showFav`），三者同时满足才显示。
  - 分类：点 Logo = 重置「全部」；点分类按钮 = 只显示该分类。
  - 关键词：搜索输入实时筛选；回车固化为筛选标签；点卡片内文字标签等同一次站内搜索。多标签叠加（AND）。
  - 本地收藏：点星形按钮收藏；点顶部「本地收藏」按钮切换「只显示已收藏」。
  - 「清除筛选」只清关键词，不影响分类与收藏；点 Logo 重置只动分类。
- **结果计数**：无筛选「共 N 张卡片」；任一维度生效「当前显示 X / N 张卡片」；0 结果红色加粗提醒。
- **集合搜索（Hero）**：百度/Google/必应为首引擎按钮，下方引擎滑道含淘宝/京东/知乎/B站/GitHub 等；点引擎激活，回车新窗口打开结果页。
- **统一滑动行为**：所有滑道与卡片四类行同一套交互——只在内容真溢出时接管滚轮为左右滑（页面暂停上下滚），触屏触摸同样激活。
- **本地收藏持久化**：存 `localStorage`（同浏览器非无痕），不跨设备/浏览器同步（静态站无后端）。
- **SEO 友好**：所有卡片、链接、分类按钮均**静态渲染在 HTML 中**，不依赖 JS 注入；禁用 JS 时内容仍完整可读可点。

**链接属性规则**（全站统一，按域名优先级 `同域 > 同族 > 营销 > 评论 > 暴露 > 默认` 匹配）：

- 同域（你的站点及子域）：`target="_self"`，原地打开，发 Referer、传权重。
- 同族（关联域名）：`target="_blank" rel="noopener"`。
- 营销：`target="_blank" rel="sponsored noopener noreferrer nofollow"`。
- 评论社媒：`target="_blank" rel="ugc noopener noreferrer nofollow"`。
- 暴露/公开（如政务 `.gov.cn`、备案号）：`target="_blank" rel="noopener" referrerpolicy="origin"`（dofollow，传权重）。
- 默认外链：`target="_blank" rel="nofollow noopener noreferrer"`。
- **不设**全局 `<meta name="referrer" content="no-referrer">`（会让统计后台收不到来源）；仅卡片图片用 `referrerpolicy="no-referrer"` 单独压制（防图片防盗链）。

## 八、SEO 要点

- 所有卡片、链接、分类按钮静态渲染在 HTML（不靠 JS 注入），禁用 JS 仍可读可点。
- `<head>` 齐备：`canonical` / `description` / `keywords` / OG 标签 / `twitter:card` / `theme-color`。
- JSON-LD 结构化数据：注入 `WebSite` + `SearchAction`（帮助搜索引擎理解站点搜索功能）；子页/频道页可加 `CollectionPage`。
- 标题层级完整：`h1`=站点名（Hero）、`h2`=各分类按钮、`h3`=各卡片名。
- `robots.txt`：`User-agent: *` + `Sitemap`；先 `Disallow` 内部目录再用 `Allow` 白名单放出 `assets/css/`、`assets/js/`、`assets/images/`。
- `sitemap.xml`：列出首页 + 各子页 + 频道页。
- `ads.txt`：AdSense 授权必需，放在根目录（公开可抓）。
- 404 页面：品牌风格 + 可读内容 + 延迟跳转首页（非纯 JS 跳转），按来源动态返回（站内→返回上一页、外链/搜索引擎跳入→返回首页、直接访问→首页）。

## 九、统计与广告（接入思路）

> 本节只讲「你的 HTML 里要放什么」，不涉及任何构建步骤。把下面代码直接写进对应页面的 `<head>` / 广告位即可。

- **网站统计**（百度统计 / Google Analytics GA4）：在 `<head>` 放对应脚本片段。统计 ID 用你自己的（一方统计不走 Referer 头，不受影响）。
- **Google AdSense**：`<head>` 放一份 async 加载器（`adsbygoogle.js?client=你的发布商ID`）；页面放 2 个广告位（Hero 之后、Footer 之前），每个含 `<ins>` + `adsbygoogle.push({})`，各自 `data-ad-slot` 占位。广告容器左右零 margin/padding、无包裹样式，只保留上下间距与右上「广告」小字标签（合规要求）。
- **404 页**：手写自包含静态页，放与主页相同的统计脚本，但**不放广告位**（错误页不应展示广告）。
- 隐私与 Referer 策略见第七节（不设全局 no-referrer，仅卡片图片单独压制）。

## 十、部署（GitHub Pages + 自有域名）

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

仓库 → **Settings → Pages**：Source 选 `Deploy from a branch`，Branch 选 `main` / `/ (root)`，Save 后访问 `https://<用户名>.github.io/<仓库名>/`。

### 3. 绑定自有域名

1. Settings → Pages → Custom domain 填 `你的域名`，Save（GitHub 自动生成 CNAME 并签发 HTTPS）。
2. 域名服务商 DNS 添加：

| 主机记录 | 类型 | 值 |
| ---- | ----- | ----------------- |
| @ | CNAME | `<用户名>.github.io` |
| www | CNAME | `<用户名>.github.io` |

3. 等待 DNS 生效，访问 `https://你的域名` 验证；Pages 设置页勾选 Enforce HTTPS。

> 国内访问 GitHub Pages 可能不稳定，可换国内 CDN 或 Vercel/Netlify（见第十一节）。

### 4. 上线检查清单（手工）

- [ ] 卡片按 type 分组分行显示（不同类型不同行）
- [ ] 分类按钮（点 Logo=全部）、站内搜索、标签筛选均正常
- [ ] 本地收藏：点星形按钮（描边金→填充金），点顶部「本地收藏」只显示已收藏
- [ ] 结果计数行：无筛选「共 N 张卡片」，筛选后「当前显示 X / N」，0 结果红色提醒
- [ ] 左 Logo：方形（非圆形）、未选中淡红底、选中正红+金环
- [ ] 引擎滑道：切换引擎，回车跳转对应结果页
- [ ] 各滑道/行内容超出时，悬停滚轮可左右滚动（页面暂停）
- [ ] 移动端一行 2 卡、平板 3 卡、桌面 4 卡
- [ ] 字体跨浏览器一致（`html` 16px + `text-size-adjust:100%` + 表单控件 `font-family:inherit`）
- [ ] 媒体图片 WebP + 透明通道，加载失败处显示文字 logo 占位不破版
- [ ] 统计/广告代码已上线；备案号按实际填写（国内域名需 ICP 备案）

## 十一、可选的部署方案

| 平台 | 优点 | 注意事项 |
| ---- | ---- | ---- |
| GitHub Pages | 免费、与仓库一体、自动 HTTPS | 国内访问稳定性一般 |
| Vercel / Netlify | 全球 CDN、自动 HTTPS、拖拽部署 | 国内访问一般，免费额度充足 |
| 国内对象存储 + CDN（阿里云 OSS / 腾讯云 COS） | 国内访问快 | 需要备案，需手动配置静态托管与 CDN |

纯静态站，以上平台均可直接部署本文件夹内容（入口 `index.html`）。

## 十二、常见问题（FAQ）

**Q1：图片显示成红色底大字？**
这是**文字 logo 占位**的预期表现。出现条件：media 为空或不是合规 URL（合规 = `http(s)://` 开头 + 合法主机名）。填上可访问的合规图片 URL 即可正常显示；图片加载失败时露出红色渐变底。

**Q2：标签/链接太长看不到？分类滑道超出屏幕？**
所有滑道与卡片四类行行为一致：只在内容真溢出时，悬停→金色高亮，滚轮接管为左右滚动，页面暂停上下滚；触屏触摸同样激活。不溢出时滚轮照常滚页面。

**Q3：想调整卡片顺序？**
改「站序」的数字即可。排序规则：先按 type（1→2→3）分组，再按站序从小到大——站序只在同类型内部生效，不同类型永远分行。

**Q4：新增一个分类？**
在手写分类按钮/卡片时填一个新分类名即可，分类按钮按出现顺序生成。

**Q5：想增删搜索引擎？**
在手写 Hero 的引擎滑道里增删引擎按钮（每项含显示名 / 搜索 URL / 是否主引擎），主引擎保持原位，其余进滑道。

**Q6：本地收藏没了？**
本地收藏存浏览器 `localStorage`，不跨设备/浏览器。换浏览器/设备、无痕模式、清"站点数据"会丢失——纯前端静态站固有限制。

---

© 2026 正协导航 · 让每一次寻找，都不止于找到
