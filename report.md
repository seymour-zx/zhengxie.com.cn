# 金融与媒体频道建设概览

## 完成内容
按「中国单列 / 外国单列」原则，新增 8 个导航频道（数据来源：`assets/xlsx/this.txt` 的「金融机构」「在线音像」区块 + 外国机构公开权威信息补充）。

### 新建频道（目录级）
| 频道 | 文件夹 | 内容 | 站点数 |
|------|--------|------|--------|
| 银行 | `directory/bank/` | 中央银行 / 政策性银行 / 国有商业银行 / 其他银行 | 43 |
| 保险 | `directory/insurance/` | 保险公司（人寿/财险/健康险等） | 7 |
| 证券 | `directory/stock/` | 证券公司 + **资管**（资产管理公司并入「资管」二级） | 15 |
| 音视频媒体 | `directory/media/` | 直播 / 视频 / 短视频 / 音乐（合并） | 24 |
| 外国银行 | `directory/world-bank/` | 国际银行（汇丰/花旗/渣打等） | 8 |
| 外国保险 | `directory/world-insurance/` | 国际保险集团（Allianz/AXA/AIG等） | 5 |
| 外国证券 | `directory/world-stock/` | 交易所（NYSE/Nasdaq/LSE/HKEX等）+ 国际券商 | 8 |
| 外国媒体 | `directory/world-media/` | YouTube/Netflix/TikTok/Spotify 等 | 7 |

每个频道均含 `self_meta.json` + `self_links.xlsx`，并已通过自动构建生成 `index.html`，顶部均有「参考」分类（标注「依据公开权威信息整理」）。

### 改动文件
- 新建：`directory/{bank,insurance,stock,media,world-bank,world-insurance,world-stock,world-media}/assets/json/self_meta.json` 与 `self_links.xlsx`
- 修改：`directory/index.html`（JSON-LD 与卡片入口补全新增 8 个频道）
- 生成脚本：`build_finance_media.py`（可复用，重跑即可刷新数据）

### 概念澄清（回应原始提问）
- **银行**：以商业银行/政策性银行/央行为主，无歧义。
- **保险**：以保险公司与保险平台为主（商业保险），社保/公积金等政府类归入 gov，未混入。
- **证券**：以证券公司、证券交易所为主；资管（资产管理公司）并入「证券」作为二级分类，未单列。
- **资管**：指资产管理公司（含银行理财子、AMC 等），已并入 stock 频道「资管」分类。
- **直播/视频/短视频/音乐**：合并为 `media` 频道，内部用二级分类区分，不拆碎。

### 注意事项
- 外国侧数据基于公开常识整理、未逐一核验，页面已如实标注「依据公开权威信息整理」，如需精确可后续替换。
- 沿用既有「中国 vs 外国」边界：中国金融/媒体在 bank/insurance/stock/media；外国在 world-* 系列。

## 待办
- 如需进一步拆分（如资管独立、保险加「社保」等），或核验外国数据真实性，可告诉我。
