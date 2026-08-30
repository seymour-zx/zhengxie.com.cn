# 项目长期约定（MEMORY.md）

> 纯步骤/硬规则；解释见宪法/契约/日志。注入上限 3000 字符——**超限截断 = 记忆断裂（旧世界教训）**。

## 🚨 世界秩序（最高）
- 造物主=用户；agent=创世神；新世界=miniworld → 取代旧世界 `zhengxie.com.cn`
- 旧世界=素材库（提纯来源），禁止改进不冻结；**边吸边删**（D-17）：提取→提纯→造物主决策→吸收→删对应内容，剩壳删壳

## 🎯 产品本质（不可偏离）
- **主题卡片陈列馆/百科索引**，非导航站（旧世界被弃根因=agent 用传统导航定义产品）
- 卡片=词条（机构/人名/书/电影/学校…无限制）；**可无链接**（"存在但无网址"也是信息）
- 链接行不限制数量；xlsx 10 位=预留
- 定位=综合全品类；政协+民主党派=首页专题（吃流量）；绝不纯垂直
- 名称/slogan 永不改：**正协导航**+「让每一次寻找，都不止于找到」
- 做索引不做内容；切割避免假冒官方
- **首次访问底部第三方声明条**（D-18）：关闭→localStorage 记时间戳→**30 天内不再显示、超期重显**；未关→下次继续

## 五铁律
1. 单一权威：宪法+DEC 库；永不两处说法不同
2. 完整记忆：先记日志再动手；无记录=无效动作
3. 一步一步：每步造物主确认；不批量不越权
4. 提纯取代：内容提炼自旧世界；最终完全取代
5. 旧项目冻结（仅素材库）

## 公开分层（判据=URL 可访问）
- 公开层（README/html/css/robots/sitemap/CNAME/ads/favicon）：只放公开内容
- 私有层（.workbuddy/）：治理/记忆/契约；URL 404
- 内部治理一律进 .workbuddy/

## 世界坐标保护（防泄漏第一）
- 公开层禁止：GitHub 用户名/仓库名/github.com 用户路径/users.noreply/<用户>.github.io
- 上线前坐标扫描零命中才发布

## 身份文件（固定名+软链接）
- 4 固定名：BOOTSTRAP/IDENTITY/SOUL/USER.md；真实文件在 .workbuddy/
- `C:\Users\seymo\.workbuddy\` 4 文件=软链接→新世界；开场检查 `ls -la` 应显 `lrwxrwxrwx`

## 记忆机制（自警）
- 注入文件 MEMORY.md **≤3000 字符**，超限立即瘦身（旧世界 7769 字节截断教训）
- 决策记录必含原因（DEC-007）
- agent=闹钟：流程/循环任务到点提醒（cycle-tasks.md）；造物主回"做/跳过/取消"

## 命名要点
- 专题统一 **topics**；hub=专题导航（/topics/）；政务=政务导航（/topics/gov/）；搜索=搜索工具（/topics/search/）；人大=renda（后期）
- **政务/官方类专题名必带第三方属性词**（DEC-008）；纯工具/文化类不受限
- 首页只放政协+民主党派；其他专题=子频道（D-03）

## 架构要点（D-16 拼装引擎）
- 页面=片段化拼装：pages.unified.xlsx 控制广告位（`1,3` 式）/GA4/百度/搜索框/导语；空=该页零对应代码
- 统计/广告增删=改 xlsx 不改代码；境外保留三件套，迁移境内时 xlsx 关 GA4/AdSense
- **待提醒**：ZX 已删（2026-08-30）；未来迁移后端+需事件分析→重新实现时提醒
- 数据流：cards-pages/*.xlsx（编辑源）→ merge_cards.py → unified → build；造物主不改 unified

## 结构铁律（build HTML 必须与旧世界一致）
- 结构/类名/id 与继承 main.js/style.css 完全一致（旧结构=契约）：分类行 `category-nav__inner+ul.category-nav__list.track#category-bar+li>h2>button`、logo 双文字、fav 星标文本 span（★/☆）、scroll-btns 4 状态
- 卡片=旧 build_card：type t1/t2/t3 + media 5 形态（含首字 fallback）+ tags 按钮 + links（link_attr+箭头）+ fav key（首 URL/标题#row_seq）；**type 变化处插 grid-break 强制分行**（契约 02「type 1→2→3 分行」= 排序 + 分行两件事）
- 搜索框=hero__search/hero__engines/hero__searchrow/track + 21 data-engine；footer=sun/moon+完整导航
- 新功能（random-bar/广告标识）只**新增元素**，禁改既有结构；改动先呈报
- **无链接卡=空行占位**（`<div class="card__links"></div>`，不加提示文字——造物主拍板；"暂无网址"是 agent 自作主张已删）

## 回归闸门（改 main.js 必跑）
- **每次改 main.js 后必跑 `node assets/.build/qa-scroll-check.js`**（退出码 0=过）——滚动按钮是单点脆弱，一个运行时错误=全站 JS 死
- 改声明条（#consent-bar）必跑 `assets/.build/qa-consent-check.js`（需 playwright-core + 本地 8899 服务；含旧 CSS 模拟）
- 双场景：现代 smooth / 老内核降级；stub 必须用真实 index.html 卡片 + 覆盖「池为空」边界（广告卡当前 0 张）
- scrollTo 用 safeScrollTo（smooth→降级两参数→120ms 未动再降级）；**CSS 禁 scroll-behavior:smooth**（与 JS scrollTo 冲突致完全失效——真根因 22:33）；任何"先锁后滚"必须保证滚失败也解锁（T6/小米）

## README 铁律（改 README 必校 contract 06）
- 公开层**纯手工流**教程（教手写 HTML，禁 xlsx/.py/.build）；零内部引用；目录树不列内部层；定位=综合全品类；不写已删功能；改后跑契约 06 校准清单

## Git 纪律
- agent 不执行任何 git 命令；init/commit/push 由造物主执行

## 路线与现状
- 十步路线见宪法 §四；进度：立宪✅分层✅身份✅第2-9步✅ → **第 9 步对比提纯 ✅（P-A/B/C 全收口）** → 第 10 步取代上线（用户 push+删壳）
- **独立小世界愿景**：assets/=可运行本体；.workbuddy=内部治理（剥离不留）；可复制给其他造物主
- DEC 库：宪法 §五（DEC-001~008）；产品决策（D/N）由 contracts/ 承载
