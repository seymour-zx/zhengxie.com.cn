# 同骨架导航产品页（/directory/）· 生成框架设计文档（已落地验证）

> 状态：**框架已落地（✅ 2026-08-22 改造 `build.py` 自动扫描生成，根页 + `directory/ai/` 双页跑通）**。
> 实现文件：`assets/py/build.py`（根页与 directory 页共用同一套渲染，自动扫描 `directory/` 生成）。
> 关键约定（用户逐项确认）：
> - 页面元信息走 `self_meta.json`（仅 title/description/keywords 三个真正每页不同的字段）；og:site_name/author/og:type/twitter:card/og:image 为代码常量；**canonical 不进 meta，由 py 自动拼**（域名 SITE_DOMAIN 已知 + 路径规则已知）。
> - 广告 slot / 统计代码：directory 页原样共用首页（同账号同代码）。
> - Footer 的 `pages/` 链接：directory 页仅改前缀 `../../pages/...`（同结构）。
> - `404.html`：纯手写，py 完全不管。
> - canonical：根 `https://zhengxie.com.cn/`，directory 页 `https://zhengxie.com.cn/directory/<name>/`，均由 `SITE_DOMAIN` + 路径规则自动拼，不进 meta、不需手写。
> 范围（用户 2026-08-22 明确指令）：
> 1. **py 生成的导航产品页，统一放 `/directory/<name>/`**，每个子目录一个 `index.html`，**全是 S1 导航产品骨架**（和首页同骨架、同壳）。
> 2. **每个 `/directory/<name>/` 有自己独立的 xlsx 数据源** —— 手工单独提供，内容独立编排，**不是从根 `links.xlsx` 拆出的子集**。
> 3. **`pages/` 子页面完全不管** —— about/submit/privacy/overview 等维持手写现状，本文档不碰、不生成。
> 4. **只搭框架、不定拆法** —— 设计一套机制让 `build.py` **自动扫描 `directory/` 下所有 `<name>/` 子目录**，逐个读取其专属 xlsx 并生成 `directory/<name>/index.html`；不需要手工登记目录清单，新增目录只需放好 xlsx 重跑 build。
>
> ⚠️ 路径口径更正：项目既有草稿记录（SKILL.md:76、README:101 S1 行）曾写"导航频道未来放 `nav/<name>/`"。**本次用户明确指定为 `/directory/`**，以本指令为准；原 `nav/` 草稿约定作废，待落地后同步改写 SKILL.md/README 两处。

---

## 1. 要解决的问题

首页 `index.html` 是 **S1 导航产品页**，由 `build.py` 读 `assets/xlsx/self_links.xlsx`（根页独享数据源，前缀 self_ 表示独享）完整生成。未来想要多个"同骨架导航产品页"（如 `directory/ai/`、`directory/movie/`），它们**和首页同骨架、同壳，但数据是各自独立的 xlsx**——不是首页的子集，而是每个目录手工单独编排的一份全新数据。

关键区别（与常见"频道子集"思路相反）：

| 维度 | 首页 | `/directory/<name>/` 页 |
|------|------|------------------------|
| 数据源 | `assets/xlsx/self_links.xlsx`（根页独享，前缀 self_） | **每个目录一份独立 xlsx**，手工提供，位置自定义 |
| 数据关系 | 全量 | **独立编排，不与根表共享、不从其拆分** |
| 骨架 | S1 | S1（同骨架，复用同一套渲染函数） |
| 壳（SEO头/统计/页脚/视觉） | 单一真源在 build.py | **完全复用首页壳**，零重复 |
| title / description / keywords | 首页专属（根 self_meta.json） | 每目录各自指定（directory/<name>/self_meta.json） |
| canonical | 根 `SITE_DOMAIN/` | `SITE_DOMAIN/directory/<name>/`，py 自动拼，不进 meta |

现状 `build.py` 写死了 `OUT_PATH = index.html` 且 `load_rows()` 硬编码读根 `links.xlsx`，只能生成根页。本设计让它能：
- `load_rows(xlsx_path)` **接收 xlsx 路径**，不再写死；
- **自动扫描 `directory/` 下所有 `<name>/`**，逐个读取其专属 xlsx，生成 `directory/<name>/index.html`，无需手工登记；
- 壳（SEO 头 / 统计 / 页脚 / 视觉语言）与首页**完全一致**，单一真源在 `build.py`；
- 换域名 / 改统计 id / 改页脚，只改一处即全站（含所有 `/directory/` 页）生效。

> 注意：本设计**不生成 `pages/` 下的说明/合规/功能子页**（那些是 S3/S4/S5 手写页，不在范围）。

---

## 2. 目录语义边界（必须遵守，来自 README:123 / SKILL.md:165）

| 目录 | 归属骨架 | 本次是否涉及 |
|------|---------|------------|
| `/`（根 `index.html`） | S1 导航产品页 | ✅ 生成（已有） |
| `/directory/<name>/` | **S1 导航产品页（独立 xlsx，非子集）** | ✅ **本次设计目标** |
| `/pages/<name>/` | S3/S4/S5 说明/合规/功能页（手写） | ❌ 不管 |
| `/blog/` `/news/` `/journal/` | S6 内容页（语义隔离，预留未实现） | ❌ 不管 |
| `units/` | 已弃用、禁用 | ❌ 已删 |

`/directory/` 与 `/pages/`、`/blog/`、`/news/`、`/journal/` **语义隔离，不混淆**：前者是"独立编排的导航产品页"，后者是"说明/内容页"。

---

## 3. 目标目录结构（新增部分）

```
正协导航/
├── index.html                  # 根页 S1（build 生成，读 assets/xlsx/self_links.xlsx，不变）
├── directory/                  # 【新增目录】同骨架导航产品页，每目录独立 xlsx
│   └── <name>/                 # 如 directory/ai/、directory/movie/ …（名称由用户定）
│       ├── index.html          # 由 build 生成，S1 骨架 + 同壳 + 该目录专属数据
│       └── assets/
│           └── xlsx/
│               └── self_links.xlsx  # 【手工提供】该目录独享数据源，路径 = directory/<name>/assets/xlsx/self_links.xlsx（统一 self_ 前缀，见 §10）
├── assets/
│   ├── py/
│   │   ├── build.py            # 根页 + 自动扫描 directory/ 生成：load_rows(path) + render_and_write() + list_directory_pages()（自动扫描 directory/ 下所有 <name>/）
│   │   ├── check_links.py
│   │   └── link-policy.json
│   └── xlsx/
│       └── self_links.xlsx     # 根页独享数据源（前缀 self_ 表示独享，不变）
```

`directory/<name>/index.html` 的资源引用同子目录页规则：`../../assets/css/style.css` 等，指向根唯一真源（遵循骨架通用技术契约，README:115）。

> **重要**：每个 `/directory/<name>/` 的 xlsx **列结构应与根 `self_links.xlsx` 保持一致**（站序/type/分类/title/url/media/tags…），这样 `render_s1_page` 和 `build_cards` 能零改动复用。如果某目录想加列，需同步改 `load_rows`/`build_cards`——本期不建议。

---

## 4. 框架设计（自动扫描驱动）

核心思路：**把"生成一页 S1"抽象成一个函数，输入=该页数据行 + 页面元信息，输出=完整 HTML**。首页和 `/directory/` 页都调用它，区别只在"数据从哪个 xlsx 来"和"页面元信息（title/desc/canonical）"。

### 4.1 抽象生成函数

```python
def render_s1_page(rows, meta):
    """渲染一个 S1 骨架完整页。
    rows : 该页要展示的卡片数据（首页=根 self_links.xlsx；directory 页=该目录专属 xlsx）
    meta : {title, desc, keywords}   # 仅页面级文案，来自 self_meta.json
           canonical 由 SITE_DOMAIN + 路径规则自动拼（根 "/" / 目录 "/directory/<name>/"），不在此传
    返回完整 index.html 字符串。
    壳（SEO 头/统计/页脚）与首页完全同源，仅 meta 字段不同。
    """
```

- 首页：`render_s1_page(load_rows(ROOT_XLSX), ROOT_META)` → 写 `index.html`
- directory 页：对每个扫描到的 `<name>/`，`render_s1_page(load_rows(该目录xlsx), dir_meta(name))` → 写 `directory/<name>/index.html`

### 4.2 directory 页 = 自动扫描（无需手工登记）

**你只需在 `directory/` 下建好 `<name>/` 子目录并放入 `self_links.xlsx`，重跑 build，py 自动扫描 `directory/` 下所有含 `assets/xlsx/self_links.xlsx` 的子目录并逐个生成 `index.html`。不需要任何手工目录清单。**

**xlsx 路径约定（已定）**：每个目录的数据源固定为 `directory/<name>/assets/xlsx/self_links.xlsx`——与根目录结构对称（`根/assets/xlsx/self_links.xlsx`），目录页的 `self_links.xlsx` 就放在自己目录的 `assets/xlsx/` 下。**统一 `self_` 前缀**（规则见 §10）：凡是某页面独享的数据文件都加 `self_`。

```python
def list_directory_pages():
    """扫描 directory/ 下所有含 assets/xlsx/self_links.xlsx 的子目录，返回 name 列表。"""
    base = os.path.join(BASE_DIR, "directory")
    if not os.path.isdir(base):
        return []
    names = []
    for name in sorted(os.listdir(base)):
        xlsx = os.path.join(base, name, "assets", "xlsx", "self_links.xlsx")
        if os.path.isfile(xlsx):
            names.append(name)
    return names
```

- **没有 `DIRECTORY_PAGES` 列表**：新增目录 = 建文件夹 + 放 xlsx + 重跑，零代码改动。
- 半成品/未准备好 xlsx 的目录不会出现（扫描条件就是"有 self_links.xlsx"）。
- 不需要"filter/拆法"逻辑——因为每个 xlsx 本就独立，不是根表的子集。

### 4.3 directory 页元信息（title/desc/keywords）

- **`canonical` 不进 `self_meta.json`**：由 `SITE_DOMAIN`（已定义为 `https://zhengxie.com.cn`）+ 路径规则自动拼——根页 `SITE_DOMAIN + "/"`、directory 页 `SITE_DOMAIN + "/directory/<name>/"`（`<name>` 来自遍历 `list_directory_pages()` 拿到的目录名）。域名与目录名代码全已知，无需手写。
- **页面级信息进 `self_meta.json`**（根 `self_meta.json` + 各 `directory/<name>/self_meta.json`）。**`self_meta.json` 为必填项**（2026-08-22 23:39 指令推翻早期"可选兜底"方案）：与 `self_links.xlsx` 二者齐备才生成该目录 `index.html`，缺任一（或都缺）则跳过不生成。实际落地字段（用户逐项确认 2026-08-22）：
  - `title` / `description` / `keywords` —— 进 meta，注入 `<title>` / `<meta description>` / `<meta keywords>`，且 `og:title`/`og:description`/`twitter:title`/`twitter:description`/JSON-LD 的 name/alternateName/description **全部引用** title/description（不单独写）。
  - 常量（不进 meta，代码固定）：`author`=正协导航、`og:type`=website、`twitter:card`=summary、`og:image`={SITE_DOMAIN}/assets/images/logo.svg、`og:site_name`=正协导航、`canonical`（`SITE_DOMAIN`+路径自动拼）。
- **目录页结构与首页完全同构**：不额外加首页没有的结构（如面包屑导航），只替换页面级文案/数据。
- 广告 slot / 统计 id / OG 图 / `theme-color` / 页脚 10 链接 —— **全部复用首页壳**（用户确认：directory 页原样共用，仅 Footer 链接前缀改 `../../pages/...`）。
- **生成流程安全清理（2026-08-22 23:39 指令，已在 build.py 落地）**：每次运行 `build.py`，先生成根页；再对 `directory/`：① 删除所有 `directory/<name>/index.html`（避免旧页残留）；② 遍历含 `self_links.xlsx` 的子目录，删除「空的 `self_links.xlsx`（0字节/0数据行）」与「空的 `self_meta.json`（不存在/0字节/非法/全无字段）」；③ 生成循环：`self_links.xlsx` 与 `self_meta.json` 都齐备（meta 含 title+description+keywords）才 `render_and_write`，否则跳过。注：字段不全（填写中）的 `self_meta.json` 只跳过生成、**保留文件不删**；缺 meta 直接跳过（不删目录）。
- `PAGE_TEMPLATE` 已抽成占位符（`{{META_TITLE}}` / `{{META_DESC}}` / `{{META_KEYWORDS}}` / `{{CANONICAL_PATH}}` / `{{ASSET_PREFIX}}` 等），由 `build_page()` 注入；`og:title`/`og:description`/`twitter:title`/`twitter:description`/JSON-LD 全部复用 `{{META_TITLE}}`/`{{META_DESC}}`（不单独占位）。

### 4.5 directory 页页面级独有信息（self_meta.json，必含全字段 + 兜底=复制根）

除卡片数据（xlsx）外，每个目录页还有**页面级独有文案**。这些不放 xlsx（不是卡片数据），放各目录的 `directory/<name>/assets/self_meta.json`。

**字段范围（已定，全收）**：根目录 `index.html` 里所有需手工提供的页面级信息，目录页都要有对应字段，不省略：

| 字段 | 对应根页位置 | 说明 |
|------|------------|------|
| `title` | `<title>` | SEO 标题 |
| `description` | `<meta name=description>` | SEO 描述 |
| `keywords` | `<meta name=keywords>` | SEO 关键词 |
| `og_title` | `og:title` | 社交分享标题 |
| `og_description` | `og:description` | 社交分享描述 |
| `twitter_title` | `twitter:title` | Twitter 卡片标题 |
| `twitter_description` | `twitter:description` | Twitter 卡片描述 |
| `jsonld_name` | JSON-LD `name` | 结构化数据站名 |
| `jsonld_alternateName` | JSON-LD `alternateName` | 结构化数据别名 |
| `jsonld_description` | JSON-LD `description` | 结构化数据描述 |
| `h1` | `hero__logo` | 可见主标题 |
| `slogan` | `hero__slogan` | 可见副标题/标语 |

**兜底策略（已定）= 初始创建 json 时默认复制根目录的同名值**：
- meta.json **不是空白模板**，而是以根页当前对应字段值作为默认值生成。目录页没特别改的字段就"和根页一致"，改了的才覆盖。
- 实现上：`ROOT_META` 常量集中保存根页所有页面级字段的当前值（从 `PAGE_TEMPLATE` 抽出来）；新建目录时 `meta.json` = `ROOT_META` 的深拷贝；build 时 `meta = {**ROOT_META, **load_meta(...)}`（根值打底，json 覆盖）。
- 这样"根页改了 slogan，所有没自定义 slogan 的目录页自动跟随"，无需逐文件改。

```json
{
  "title": "正协导航 - 让每一次寻找，都不止于找到",
  "description": "正协导航：全量收录的精选站点导航……",
  "keywords": "正协导航,网址导航,网站导航,AI工具,效率工具,政协,导航网站",
  "og_title": "正协导航 - 让每一次寻找，都不止于找到",
  "og_description": "全量收录的精选站点导航，覆盖AI智能、资讯媒体……",
  "twitter_title": "正协导航 - 让每一次寻找，都不止于找到",
  "twitter_description": "全量收录的精选站点导航。",
  "jsonld_name": "正协导航",
  "jsonld_alternateName": "正协导航 - 让每一次寻找，都不止于找到",
  "jsonld_description": "全量收录的精选站点导航",
  "h1": "正协导航",
  "slogan": "让每一次寻找，都不止于找到",
  "breadcrumb": "正协导航"
}
```

> 上方示例即"未自定义"状态——所有字段等于根页。目录页要差异化时，只改对应字段即可（如 AI 页改 `h1`="AI 工具导航"、`slogan`="……"）。

`build_directory_pages()` 内：`meta = load_meta(meta_path)`（仅 title/desc/keywords，缺则 ROOT_META 兜底），`canonical` 由 `SITE_DOMAIN + "/directory/<name>/"` 自动拼。你只维护 xlsx + 可选 self_meta.json（3 字段），完全不碰 py。

### 4.4 与首页的差异点（directory 页需注意）

- **页脚 10 链接**：directory 页页脚与首页同结构（含「网站全景」），内链前缀改为 `../../pages/...`（用户确认：仅改前缀，共用结构）。
- **结果计数**：首页「共 N 张卡片」；directory 页「共 M 张卡片」（M=该目录 xlsx 行数），由 `total_cards` 控制。
- **三维度筛选 / 集合搜索 / sticky 吸顶**：directory 页与首页同构，直接复用，无需改 `main.js`（main.js 读 DOM 不关心页面是哪个）。
- **SEO 差异**：directory 页 `canonical` 各自独立（py 自动拼 `SITE_DOMAIN/directory/<name>/`），避免与首页重复内容被降权；`og:url` 同样用该自动拼值。
- **资源引用**：`directory/<name>/index.html` 引用 `../../assets/...` 指根（见 §3）；manifest/favicon/CSS/JS 均走 `{{ASSET_PREFIX}}`。

---

## 5. build.py 改造方案（框架层）【已落地，与代码一致】

```python
ROOT_META = {"title": ..., "description": ..., "keywords": ...}   # 兜底，读不到 self_meta.json 时用
DIR_ASSET_PREFIX = "../../"                                       # directory 页回退两级到根 assets
DIRECTORY_ROOT = os.path.join(BASE_DIR, "directory")

def load_rows(xlsx_path=None):
    """读取指定 xlsx。缺省用全局 XLSX_PATH（根页）；directory 页传各自 self_links.xlsx。"""

def load_meta(json_path):
    """读 self_meta.json，文件不存在/损坏返回 {}，由 build_page 兜底 ROOT_META。"""

def list_directory_pages():
    """扫描 directory/ 下所有含 assets/xlsx/self_links.xlsx 的子目录，
    返回 [(name, xlsx, meta_path, out, canonical), ...]。无手工清单。"""

def build_page(..., prefix="", meta=None, canonical_path="/"):
    """PAGE_TEMPLATE 占位符替换：
    {{ASSET_PREFIX}} → prefix（根 "" / directory "../../"）
    {{META_TITLE}}/{{META_DESC}}/{{META_KEYWORDS}} → meta（缺失回退 ROOT_META）
    {{CANONICAL_PATH}} → canonical_path（拼 SITE_DOMAIN）
    og:title/og:description/twitter:*/JSON-LD 全部引用 META_TITLE/META_DESC。"""

def render_and_write(xlsx_path, out_path, prefix="", meta=None, canonical_path="/", label="根页"):
    """通用渲染：load_rows → build_cards → build_page → 写出。根页与 directory 页共用。"""

def main():
    root_meta = load_meta(os.path.join(BASE_DIR, "self_meta.json"))
    # canonical 由 SITE_DOMAIN + "/" 自动拼，不读 meta
    render_and_write(XLSX_PATH, OUT_PATH, prefix="", meta=root_meta,
                     canonical_path="/", label="根页")
    for name, xlsx, meta_path, out, canonical in list_directory_pages():
        meta = load_meta(meta_path)
        # canonical 由 SITE_DOMAIN + "/directory/<name>/" 自动拼（canonical 已含），不读 meta
        render_and_write(xlsx, out, prefix=DIR_ASSET_PREFIX, meta=meta,
                         canonical_path=canonical, label=f"directory/{name}")
```

运行方式：
```bash
python assets/py/build.py                # 生成 index.html + 自动扫描的所有 directory/<name>/
```
（未加 `--index` / `--dir` 命令行参数；当前一次性生成根页 + 全部 directory 页。如需单页调试可后续补。）

---

## 6. 本期不做的事（明确边界）

- ❌ 不生成 `pages/` 手写子页（about/submit/privacy/overview 维持手写，不在范围）。
- ❌ 不生成 `/blog/`、`/news/`、`/journal/`（S6 内容页，语义隔离，预留未实现）。
- ❌ 不做"从根表自动拆频道"逻辑（每个目录 xlsx 独立手工提供，不存在拆法问题）。
- ❌ 不改 `links.xlsx` 结构（根表与目录表列结构保持一致即可，不新增"频道"列）。
- ❌ 不动根页现有 `PAGE_TEMPLATE`（directory 页复用同一套壳逻辑，实现上用同一 `render_s1_page`，不强制先重构根页模板；但需把写死的 title/desc 改为占位符）。

---

## 7. 落地步骤（已全部完成 2026-08-22）

1. ✅ `build.py`：`load_rows(xlsx_path=None)` 参数化；抽 `render_and_write()` 通用渲染，根页与 directory 页共用。
2. ✅ `PAGE_TEMPLATE` 写死的 title/description/keywords/canonical/og/twitter/JSON-LD 改为占位符 `{{META_TITLE}}`/`{{META_DESC}}`/`{{META_KEYWORDS}}`/`{{CANONICAL_PATH}}`/`{{ASSET_PREFIX}}`；og:title 等引用 META_TITLE。
3. ✅ 加 `list_directory_pages()` 自动扫描（无手工清单）+ `load_meta()` + `main()` 先根页后 directory 循环。
4. ✅ 示例 `directory/ai/assets/xlsx/self_links.xlsx`（6 条 AI 卡）+ `directory/ai/self_meta.json`（3 字段），跑通 `directory/ai/index.html`：`../../assets/` 引用、canonical `https://zhengxie.com.cn/directory/ai/`（py 自动拼）、Footer 前缀 `../../pages/...` 均正确。
5. ⏳ 待办（未做，用户未授权）：同步 `sitemap.xml` 加 `directory/<name>/` 条目；README/SKILL 的 `nav/` 草稿已改为 `directory/`（前期已完成）。
6. ⚠️ 用户明确：**不提交 git**。

---

## 8. 退回方案

- 删除 `directory/` 目录 + `build.py` 里 `render_and_write`/`list_directory_pages`/`load_meta`/`load_rows` 的 path 参数（git 恢复即可）。
- README/SKILL 相关更正条目撤除（恢复 `nav/` 草稿约定或标注待定）。
- 根页若已改走占位符注入，回退到原 `PAGE_TEMPLATE` 直接生成（git 恢复）；`load_rows` 恢复硬编码 `XLSX_PATH`。

---

## 9. 待用户拍板的事项（本框架落地前）

1. **xlsx 存放约定**：✅ 已定 —— 每个目录数据源固定为 `directory/<name>/assets/xlsx/self_links.xlsx`（与根目录结构对称，目录页的 self_links.xlsx 放在自己目录的 assets/xlsx/ 下）。
2. **self_meta.json 字段范围 + 兜底**：✅ 已定 —— 实际落地 **3 字段**（title/description/keywords）；og:title/og:description/twitter:title/twitter:description/JSON-LD 全部**引用** title/description（不单独写）；author/og:type/twitter:card/og:image/og:site_name 为**代码常量**不进 meta；**canonical 也不进 meta**（由 `SITE_DOMAIN`+路径规则自动拼）。**兜底策略 = ROOT_META 打底，json 覆盖**，未自定义的字段自动跟随根页（根 self_meta.json 缺失时也不会崩）。
3. **落地节奏**：✅ 已完成改造验证 —— `build.py` 改造后 + `directory/ai/`（self_links.xlsx 6 条 AI 卡片 + self_meta.json 3 字段）已跑通生成 `directory/ai/index.html`，校验全过（资源 `../../assets/`、canonical 由 `SITE_DOMAIN`+目录名自动拼、Footer 前缀 `../../pages/...`、title/desc 注入、统计/广告共用首页）。后续新增目录只需放 self_links.xlsx + 可选 self_meta.json（3 字段）重跑。
4. **口径同步**：✅ 已确认并落地 —— SKILL.md:76、README 相关 `nav/<name>/` 草稿已改写为 `directory/<name>/`（前期已完成）。

---

## 10. 文件命名约定（已定，2026-08-22，规则统一）

- **`self_` 前缀 = 某页面/某功能独享的数据文件**，不与其他页面共享。规则统一适用所有层级：
  - 凡是"仅某一页使用、不应被其他页复用"的数据文件，文件名加 `self_` 前缀。
  - 根页和目录页一视同仁，不再因"目录路径已隔离"而豁免。

### 当前项目中的独享文件清单

| 文件 | 独享归属 | 说明 |
|------|---------|------|
| `assets/xlsx/self_links.xlsx` | 根 `index.html` 独享 | 根页卡片数据源 |
| `directory/<name>/assets/xlsx/self_links.xlsx` | 各目录页独享 | 目录页卡片数据源（如 `directory/ai/assets/xlsx/self_links.xlsx`） |
| `directory/<name>/self_meta.json` | 各目录页独享 | 目录页页面级信息（title/description/keywords；位于目录根，非 assets 下） |
| `self_meta.json` | 根 `index.html` 独享 | 根页页面级信息（title/description/keywords） |

### 非独享（不加 `self_`）

| 文件 | 原因 |
|------|------|
| `assets/json/manifest.json` | 全站共享（根页+目录页都引用，PWA 清单） |
| `assets/xlsx/link-policy.json` | 全站共享配置（外链属性域名白名单） |
| `assets/py/*.py` | 共享脚本 |
| `pages/<name>/index.html` | 手写子页本体（非数据文件，本次范围外） |

© 2026 正协导航 · 同骨架导航产品页（/directory/）生成框架设计提案
