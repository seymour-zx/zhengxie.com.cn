# IMAGE_OPTIMIZATION.md — 图片压缩 / PNG→WebP 须知

> 本文档与同目录的 `SKILL.md`（子页新增 SOP）**平级但内容独立**，专门记录本站图片压缩 / 格式转换的经验。
> 它**不属于** `SKILL.md` 的「AI 必须遵守」子页规程范畴，也不改写那份权威 SOP——只是一份通用技术参考。
> 按项目约定，本文件非跨设备权威源（仅 `README.md` 与 `SKILL.md` 保证可读），故任何「AI 必须遵循的项目规范」仍应落在那两个 md 或代码里；本文仅作技术备忘。

---

## 何时用

- 给站点新增 / 替换卡片图、logo、截图，准备压体积时。
- 把 PNG / JPG 转 WebP 以省带宽时。

---

## 铁律：保留透明通道（RGBA）

本站卡片图（logo / 图标类）多为 **RGBA 透明背景**，透明区常占 **80–96%**（中心小 logo + 全透明画布）。

**禁止** `Image.open(p).convert("RGB")` 后再存 WebP——这会丢弃 alpha 通道，把透明区填成黑色，结果与原图「完全不一样」、卡片直接废掉。

正确写法：

```python
from PIL import Image
im = Image.open(p).convert("RGBA")          # 关键：保留透明
im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
im.save(out, "WEBP", quality=82, method=4)
```

WebP 原生支持 alpha，透明背景在任意底色（如卡片红渐变）上渲染与原 PNG 一致。

---

## 标准步骤

1. **先判断是否有透明**：`mode in ("RGBA","LA")` 或 `mode=="P" 且 "transparency" in info`。
2. **有透明 → `convert("RGBA")`；无透明**（不透明 JPG / RGB PNG）→ `convert("RGB")`。
3. **缩放**：`thumbnail()` 缩到显示所需最大边。卡片图 640px 足够；原图常是 4961×3508 印刷级，纯浪费带宽。
4. **编码**：WebP `quality=82, method=4`；文字 / logo 怕糊可提到 90。
5. **防抖动**：`<img>` 补 `width` / `height`。

---

## 常见坑（逐一验证，不要想当然）

- **引用改了但文件没生成**：浏览器 404；若带 `onerror="this.remove()"` 会把 `<img>` 直接删掉变空图。务必先生成 webp 再改引用。
- **手改生成产物**：`index.html` 由 `assets/py/build.py` 扫描各目录 `assets/xlsx/self_links.xlsx` 生成，图片 `src` 来自数据源 `media` 字段。**手改 index.html 会被下次 build 覆盖还原**。要持久生效就改 xlsx 的 `media` 字段（如 `…/12377-3-0X.png` → `…webp`），或改 `build_media()` 模板（一劳永逸）。
- **`<picture>` 双源需两文件都在**：`<source webp>` + `<img png>` 兜底时，若 webp 缺失，现代浏览器「匹配格式成功」后**不会回退** png，直接破图。只引 webp 时，png 冗余可删。

---

## 可复用能力

已沉淀为 WorkBuddy 用户级技能 **`webp-image-compress`**（`~/.workbuddy/skills/webp-image-compress/`），含 `scripts/compress.py`：

```bash
python scripts/compress.py <图片或目录> [--max-edge 640] [--quality 82]
```

自动识别透明、保 alpha、缩放、打印前后体积对比；不删原图。

---

## 验证

压缩后并排看原图与 webp：透明区仍透明（非黑）、在目标显示尺寸下无糊 / 缺色。
