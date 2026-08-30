# 正协导航

> 让每一次寻找，都不止于找到

正协导航是一个**综合全品类导航 / 陈列馆式索引站**：首页汇集人民政协与民主党派专题（数千张词条卡片），另设政务导航、搜索工具等专题频道，未来持续扩充更多品类。卡片即词条——存在但暂无网址的机构也以空行占位收录。配色以正红为主、大面积留白打底、金色只做点缀，整体清爽克制、不堆砌。

本站为独立第三方导航站，与任何官方机构无隶属关系、无官方授权；收录链接仅作索引聚合，不代表本站立场或担保。

本仓库是网站的全部源码。本文档面向**想自建同类导航站的人**——它会告诉你这个站是怎么**手工搭出来**的，照着就能写一个；**不需要任何构建工具或数据源文件，所有内容直接手写进 HTML**。

## 一、设计语言

- **风格定位**：正红主色 + 白色大底色 + 金色点缀，清爽克制、不堆砌。
- **配色（亮色）**：红系主色 + 金系点缀 + 白底。
- **暗色模式**：复用同一套配色延伸到暗色，**禁止偏蓝、偏紫、科技冷淡、廉价渐变**。暗色配色：暖炭 `#1E1B1F` / 暖炭灰 `#2A252A` / 香槟金 `#D9B978` / 象牙白 `#ECE6DF`（与 style.css `[data-theme="dark"]` 实测一致）。
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
├── index.html               站点主页/导航产品页（静态，根域 /，首页=政协+民主党派专题）
├── README.md                本手册
├── 404.html                 错误页（自包含、按来源动态返回）
├── CNAME                    自定义域名（zhengxie.com.cn）
├── robots.txt               爬虫规则
├── sitemap.xml              搜索引擎站点地图
├── ads.txt                  AdSense 授权
├── topics/                  专题导航（hub + 各专题频道）
│   ├── index.html           专题导航 hub（列出各专题频道）
│   ├── gov/index.html       政务导航（人大/国务院/部委/政务服务平台等官方入口）
│   └── search/index.html    搜索工具（21 个搜索引擎一键调用）
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
└── assets/
    ├── css/
    │   └── style.css        全站样式（红 / 金 / 白配色、响应式 Grid）
    ├── js/
    │   └── main.js          交互增强（筛选 / 本地收藏 / 随机漫步 / 引擎搜索 / 滚动按钮）
    ├── json/
    │   └── manifest.json    PWA manifest
    └── images/
        ├── logo.svg         站点 Logo（红底金字方形）
        └── *.webp           卡片媒体图
```

目录语义边界：`topics/` = 专题导航频道页（政务导航/搜索工具等，同骨架）；`pages/` = 说明/合规/功能型子页；`index.html` = 导航产品页（首页专题：政协+民主党派）。各自语义隔离，不混淆。

## 三、页面骨架形态

本站页面按骨架分类，手写时直接套用对应骨架：

| 骨架 | 页面 | 说明 |
|------|------|------|
| **S1 导航产品页** | `index.html` | 首页：hero → 分类行 → 搜索/计数/筛选（吸顶）→ 卡片 Grid → 页脚 + 滚动按钮 + 声明条 |
| **S2 专题频道页** | `topics/gov/`、`topics/search/` | 与 S1 同骨架，频道标题/导语 + 该频道卡片（政务导航 59 卡 / 搜索工具 67 卡）|
| **S3 专题导航 hub** | `topics/index.html` | 独立静态页：channel-grid 频道卡片（首字图标+标题+描述+进入频道→），**无筛选 JS、无滚动按钮** |
| **S4 手写子页** | `pages/*` | 说明/合规/功能页，统一 head + footer + 正文 |
| **S5 错误页** | `404.html` | 自包含静态页（内联样式 + 绝对域名 logo，可从任意深层路径触发）|

**骨架可演进原则**：新页面优先归集已有骨架；确无法覆盖且对长远有利时新增骨架（S6+）。

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
2. `<body>` 自上而下：
   - `<header class="hero">`：大 Logo + slogan
   - `<nav class="category-nav">`：左方形文字 Logo（承担「全部」）+ 中分类滑道（`ul.category-nav__list.track`）+ 右「本地收藏」按钮 + 随机漫步条（`random-bar`）
   - `<section class="site-search">`：站内搜索框
   - `<section class="result-count">`：结果计数行
   - `<section class="filter-tags">`：筛选标签行（「当前筛选：」+ 标签滑道 + 「清除筛选」）
   - 第 3–5 块包在 `<div class="sticky-top">` 内整体 sticky 吸顶
   - `<main class="cards-container">`：卡片容器（Grid 直接装全部卡片）
   - `<footer class="footer">`：版权 + 必要链接 + 页脚工具簇（随机漫步 + 暗色切换）
   - `<div id="scroll-btns">`：滚动按钮（上/顶/下/底 4 状态，按滚动位置只显示 1 个）
   - `<div class="official-banner" id="consent-bar">`：独立第三方声明条（首次访问显示，点「×」后 localStorage 记录时间戳，30 天内不再显示、超期重新显示）
3. 每张卡片的手写结构见 4.2；样式类见第六节；交互见第七节。

### 4.2 卡片结构（三种 type）

| 结构 | 布局 | 封面比例 |
|------|------|---------|
| type 1 | **4 行 3 列**：图片（跨两行）/ 名称+收藏按钮 / 描述（跨两列）/ 标签行 / 链接标签行 | logo 方形 |
| type 2 | **5 行 2 列**：封面（跨两列）/ 名称+收藏 / 描述 / 标签行 / 链接标签行 | 横向 1.618:1（黄金比） |
| type 3 | **5 行 2 列**：同 type 2 | 纵向 1:1.618（黄金比） |

通用约束（三类卡片一致）：

- 均有**收藏按钮**（内联 SVG 星形，描边金；收藏后填充金），固定在名称行右端。
- 名称、描述、标签、链接**必有**（无链接也空占位，**不加任何提示文字**），且只占一行，超出截断/横向滚动。
- 卡片内所有内容**允许框选/复制**。
- 标签行第 1 个标签固定为该卡片的**分类名**，可点击筛选。
- 三种类型**按 type 分组分行**显示（type1 组 → type2 组 → type3 组，组间插入 `grid-break` 强制换行），不同类型绝不同行。
- 媒体区**无图时用首字占位**（文字 logo 兜底，不破版）。

### 4.3 页脚模板

页脚导航统一链接 + 备案号注释占位 + 工具簇（随机漫步 + 暗色切换 sun/moon）。备案号在有 ICP 备案的国内域名下才显示（代码保留占位，未备案前不渲染）。

## 五、字段与手工录入指引

导航页的每张卡片，本质就是一组字段。你**直接在 HTML 里手写这些值**，不需要任何数据表或构建步骤。

| 字段 | 必填 | 说明（你在 HTML 里怎么写） |
|------|------|--------------------------|
| 站序 | 是 | 数字。卡片排序**先按 type（1→2→3）分组，再按站序从小到大**；不同类型自动分行 |
| 分类 | 是 | 分类名。你手写的分类按钮按出现顺序生成；改分类名即改导航 |
| type | 是 | 卡片结构：`1`=4行3列 logo 卡，`2`=5行2列横向封面卡，`3`=5行2列纵向封面卡 |
| title | 是 | 网站名称（首字自动大写用于占位 logo） |
| desc | 否 | 一句话描述 |
| media | 否 | 媒体区，手写格式：`URL`（仅图片）/ `URL,颜色`（图片衬底色）/ `颜色值`（纯色块占位）/ `字符,颜色`（文字占位+底色）。颜色支持 `#rgb`/`rgb()`/`rgba()`/`hsl()`/`transparent`/颜色名。图片**统一用 WebP 且保留透明通道（RGBA）**，否则透明 logo 被填黑 |
| tags | 否 | 标签，英文逗号 `,` 分隔（如 `政协,官方`）。分类名会自动作为标签行第 1 个标签 |
| link1_name … link10_name | 否 | 相关链接名称（共 10 组，每组 2 列 `linkN_name` + `linkN_url`） |
| link1_url … link10_url | 否 | 相关链接 URL；**空 URL 的组自动跳过**，组序即展示顺序（如 `link1_name=官网`、`link1_url=https://x.com`）。外链属性按域名优先级自动匹配（见第七节） |

> ⚠️ 分隔符一律用英文半角逗号 `,` 与分号 `;`；媒体图片用 WebP 且保留透明通道。

## 六、视觉规范（CSS 实现）

- **响应式 Grid**：桌面一行 4 卡、平板 3 卡、移动 2 卡（与随机漫步的行宽一致）。
- **吸顶区**：分类行 / 站内搜索 / 结果计数 / 筛选标签 包在 sticky-top 内，滚动时吸顶。
- **卡片版式**：三种 type 用 Grid 区域模板区分（见 4.2）；类型变化处 `.grid-break` 占满整行强制换行。
- **滑道**：分类行 / 标签行 / 引擎行 用 `.track` 通用滑道（横向溢出 + 悬停滚轮左右滚动 + 移动端触摸滑动）。
- **滚动按钮**：`.scroll-btn` 4 状态（up/top/down/bottom），`position:fixed` 右下角，按滚动位置 `.is-active` 只亮 1 个；**声明条显示时按钮上移避让（空间分离，不依赖 z-index 对抗）**，声明条 `z-index:80`、按钮 `z-index:90` 仅作双保险。
- **随机漫步条**：`.random-bar` 独立整行居中（在分类行容器之外，不被 flex 挤出）。
- **声明条**：`.official-banner` 底部固定，点「×」关闭并本地记录时间戳（30 天有效期）。
- **暗色**：`html[data-theme="dark"]` 变量切换；**禁止 `scroll-behavior:smooth`**（与 JS 滚动冲突会致按钮失效）。

## 七、交互说明（前端 JS 思路）

- **三维度筛选**：分类 + 关键词 + 本地收藏，AND 叠加精准定位；筛选状态可通过 URL 分享（`#cat=分类名`）。
- **本地收藏**：点星形按钮（描边金→填充金），点顶部「本地收藏」只显示已收藏；存 `localStorage('zx_favs')`。
- **随机漫步**：`random-bar` 的「🎲 随机漫步」从当前筛选结果随机展示 2 行卡片（先按数量加权随机卡片类型，再取该类型 2 行，不足取全部），不跳转外站；「换一批」重掷，「退出」恢复原状。
- **集合搜索**（搜索工具页）：`hero__search` 主引擎按钮 + 搜索框 + 引擎滑道，共 21 个 `data-engine`，回车跳转对应引擎结果页。
- **滚动按钮**：4 状态按钮用 `safeScrollTo` 平滑滚动（smooth → 老内核降级两参数 → 120ms 未动再降级），任何「先锁后滚」都必须保证滚失败也能解锁。
- **暗色切换**：页脚 `theme-toggle`（sun/moon 双图标），切换存 `localStorage('zx_theme')`。
- **声明条**：首次访问（无有效 `zx_notice_closed` 时间戳）底部显示第三方声明，点「×」记录关闭时间，30 天内不再显示、超期重新显示；未关闭离开不记录，下次继续显示。
- **外链属性规则（优先级从高到低）**：同主域原地打开（`_self`）> 同族站新窗隔离 opener > 营销 `sponsored` > 评论 `ugc` > 政务官方公开来源（`noopener` + `referrerpolicy="origin"`，传递权重）> 默认 `nofollow noopener noreferrer`。

## 八、SEO 要点

- **canonical**：每页 `<link rel="canonical">` 指向完整 URL。
- **JSON-LD**：首页 `WebSite` + `SearchAction`；专题导航 hub `CollectionPage`；专题/子页 `WebPage` + `BreadcrumbList`。
- **OG / Twitter**：`og:title` / `og:description` / `og:image`（绝对 URL）/ `og:site_name` / `og:url` / `twitter:card`。
- **sitemap.xml**：全站页面 URL（含 /topics/ 路径），随新增页面更新。
- **robots.txt**：放行 css/js/images 渲染必需资源，软隔离数据工作区，声明 Sitemap。
- **静态渲染**：全站纯静态 HTML，搜索引擎可直接抓取。

## 九、统计与广告（接入思路）

> 本节只讲「你的 HTML 里要放什么」，不涉及任何构建步骤。把下面代码直接写进对应页面的 `<head>` / 广告位即可。

- **网站统计**（百度统计 / Google Analytics GA4）：在 `<head>` 放对应脚本片段。统计 ID 用你自己的。
- **Google AdSense**：`<head>` 放一份 async 加载器（`adsbygoogle.js?client=你的发布商ID`）；页面放广告位，每个含 `<ins>` + `adsbygoogle.push({})`，各自 `data-ad-slot` 占位。广告容器左右零 margin/padding、无包裹样式，只保留上下间距与右上「广告」小字标签（合规要求）。
- **404 页**：手写自包含静态页，放与主页相同的统计脚本，但**不放广告位**（错误页不应展示广告）。
- 隐私与 Referer 策略见隐私政策：不设全局 no-referrer，仅卡片图片单独压制。

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

> 国内访问 GitHub Pages 可能不稳定，可换国内 CDN 或 Vercel/Netlify。

### 4. 上线检查清单（手工）

- [ ] 卡片按 type 分组分行显示（不同类型不同行，grid-break 生效）
- [ ] 分类按钮（点 Logo=全部）、站内搜索、标签筛选均正常
- [ ] 本地收藏：点星形按钮（描边金→填充金），点顶部「本地收藏」只显示已收藏
- [ ] 结果计数行：无筛选「共 N 张卡片」，筛选后「当前显示 X / N」，0 结果红色提醒
- [ ] 随机漫步：随机展示 2 行卡片、换一批重掷、退出恢复；按钮不破版
- [ ] 引擎滑道：切换引擎，回车跳转对应结果页
- [ ] 各滑道/行内容超出时，悬停滚轮可左右滚动（页面暂停）
- [ ] 滚动按钮：滚动后 4 状态切换正常，点击可滚到对应位置（老内核不锁死）
- [ ] 声明条：首次访问显示，点「×」后 30 天内不再显示（localStorage 时间戳）
- [ ] 移动端一行 2 卡、平板 3 卡、桌面 4 卡
- [ ] 字体跨浏览器一致（`html` 16px + `text-size-adjust:100%` + 表单控件 `font-family:inherit`）
- [ ] 媒体图片 WebP + 透明通道，加载失败处显示文字 logo 占位不破版
- [ ] 统计/广告代码已上线；备案号按实际填写（国内域名需 ICP 备案）

## 十一、常见问题（FAQ）

- **为什么有的卡片没有链接？** 卡片是词条索引，收录的是「存在」——机构暂无官网时链接行留空占位，不显示任何提示文字，未来有网址再补。
- **收录标准是什么？** 公开、权威、稳定。只收录官方公开入口，不做内容托管、不做商业化导流。
- **链接打不开/有变化怎么办？** 通过「联系我们」反馈，核实后及时修正或移除。
- **想收录自己的站点？** 通过「收录申请」页面提交，审核通过后上架。
- **本站与官方是什么关系？** 独立第三方导航站，无隶属、无授权；名称与视觉不指代任何官方机构。
