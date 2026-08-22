# SKILL.md — 正协导航：新增说明型子页 + 全站联动

> **存放说明（重要）**：本文件位于 `assets/skills/`，是**项目内 SOP 文档**，供 AI 在编辑本项目时参考。
> 它**不会**被 WorkBuddy 的 Skill 系统自动加载执行（系统只认 `~/.workbuddy/skills/` 与 `{workspace}/.workbuddy/skills/`）。
> 若需"换设备触发即自动执行"，请将本文件复制到 `{workspace}/.workbuddy/skills/<name>/SKILL.md` 并用 SkillManage 注册。
> 本文件内容与 `README.md` 决策总章互为补充：README 管"决策/规范"，本文件管"可重复的操作步骤"。
>
> **🚫 专家转介纪律（AI 硬边界，任何设备/会话都必须遵守）**：本项目的法律合规文本、SEO 策略、视觉设计评审等**不属于 AI 擅长的确定性工程范畴**，AI 只做"如实陈述技术实现"的草稿，**不替代专业判断**。遇到下列任务，AI 必须**主动停止、明确告知用户应咨询对应专家/connector**，不得硬做、不得给看似专业实则未经验证的结论。具体清单见文末「专家转介纪律」段。

---

## 适用场景（触发词）

用户要求"新增子页面 / 加说明页 / 加一个 XX 页 / 补全站点说明类页面"时，按本流程执行。
本项目已有子页：about（关于）、submit（收录申请）、privacy（隐私政策）、contact（联系我们）、disclaimer（免责声明）、guide（使用指南）、sitemap（站点地图）、changelog（更新日志）。

---

## 子页标准形态（手写静态页，必须与现有子页同构）

每个 `units/<name>/index.html` 必须满足：

1. **资源相对**：`<link rel="stylesheet" href="assets/css/style.css">`、`<link rel="icon" href="assets/images/logo.svg">`（不引用根域共享 assets）。
2. **内链绝对 + `_self`**：站内跳转用 `https://zhengxie.com.cn/...` 且 `target="_self"`（如页脚导航、正文交叉链接）。
3. **不设全局 referrer meta**：`<head>` 中**不要**写 `<meta name="referrer" content="no-referrer">`（全站已锁定"不设全局 referrer"规则）。
4. **FOUC 仅本地 dark**：`<head>` 内联脚本仅当 `localStorage('zx_theme')==='dark'` 才设 `data-theme="dark"`，**不跟随系统偏好**。
5. **页脚导航统一 9 链接**（顺序固定）+ 备案号注释占位：

   ```
   首页 | 关于本站 | 收录申请 | 联系我们 | 免责声明 | 使用指南 | 站点地图 | 更新日志 | 隐私政策
   ```

   备案号占位（每个子页页脚 nav 内、隐私政策链接之后，HTML 注释，不渲染）：

   ```html
   <!-- 备案号占位：当前项目托管于 GitHub Pages，无 ICP 备案，故不渲染备案链接；待迁移国内服务器完成备案后，替换粤ICP备XXXXXXXX号并取消本注释、改用以下形式：
   <a target="_blank" rel="nofollow noopener" referrerpolicy="origin" href="https://beian.miit.gov.cn/">粤ICP备XXXXXXXX号</a>
   -->
   ```

6. **theme-toggle 按钮**：页脚含暗色切换按钮，脚本与现有子页一致（读 `data-theme`、写 `localStorage('zx_theme')`、更新 `aria-pressed`）。
7. **canonical / robots / description**：`<link rel="canonical" href="https://zhengxie.com.cn/units/<name>/">`；`<meta name="robots" content="index, follow">`；补 `description` 与 `keywords`。

### 最小页脚模板（直接复制修改）

```html
<footer class="footer">
  <div class="footer__inner wrap">
    <p class="footer__copyright">© 2026 正协导航 · 让每一次寻找，都不止于找到</p>
    <nav class="footer__nav" aria-label="页脚导航">
      <a target="_self" href="https://zhengxie.com.cn/">首页</a>
      <a target="_self" href="https://zhengxie.com.cn/units/about/">关于本站</a>
      <a target="_self" href="https://zhengxie.com.cn/units/submit/">收录申请</a>
      <a target="_self" href="https://zhengxie.com.cn/units/contact/">联系我们</a>
      <a target="_self" href="https://zhengxie.com.cn/units/disclaimer/">免责声明</a>
      <a target="_self" href="https://zhengxie.com.cn/units/guide/">使用指南</a>
      <a target="_self" href="https://zhengxie.com.cn/units/sitemap/">站点地图</a>
      <a target="_self" href="https://zhengxie.com.cn/units/changelog/">更新日志</a>
      <a target="_self" href="https://zhengxie.com.cn/units/privacy/">隐私政策</a>
      <!-- 备案号占位：...（见上） -->
    </nav>
    <div class="footer__tools">
      <button type="button" class="theme-toggle" id="theme-toggle" aria-label="切换深色/浅色模式" aria-pressed="false">
        <svg class="theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg>
        <svg class="theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
    </div>
  </div>
</footer>
```

---

## 全站联动清单（新增子页后必须同步，缺一不可）

1. **`assets/py/build.py` 的 `UNIT_PAGES`**：追加 `"units/<name>"`。
   - 当前值：`["units/about", "units/submit", "units/privacy", "units/contact", "units/disclaimer", "units/guide", "units/sitemap", "units/changelog"]`
   - 重 build 时 `sync_unit_assets()` 会自动把根 `assets/{css,js,images}` 复制到该子页的 `assets/`，使其自包含。
2. **`assets/py/build.py` 首页模板页脚**：若新子页需在首页页脚出现，在 footer `<nav>` 内加 `<a href="{{SITE_DOMAIN}}/units/<name>/">名称</a>`（注意用 `{{SITE_DOMAIN}}` 占位，build 会替换；且首页模板页脚已含 9 链接，新增时一并补全）。
3. **手写子页页脚**：about / submit / privacy / contact / disclaimer / guide / sitemap / changelog 共 8 个手写页，页脚 nav 需与新子页互链（保持 9 链接一致）。可用统一模板批量替换 nav 块。
4. **`sitemap.xml`**：在 `</urlset>` 前加 `<url>` 条目，`<loc>https://zhengxie.com.cn/units/<name>/</loc>`、`<changefreq>monthly</changefreq>`、`<priority>0.50</priority>`。
5. **`README.md`**：决策总章第 3 节补该子页的 🔶 状态标注（附原状态=无此页，可退回）；BACKLOG 标记完成情况。
6. **`index.html`**：若是 build 重新生成，确认页脚 9 链接完整、隐私路径为 `units/privacy/`（非旧路径 `units/privacy/1`）。

---

## 真实分类列表（用于站点地图 / 筛选锚点）

首页 `category-bar` 的 `data-cat` 真实值（供 `units/sitemap/` 做分类索引卡片，锚点 `#cat=<分类>` 回首页筛选）：

```
机构 | 政协 | 资讯媒体 | 常用入口 | AI智能 | 设计创意 | 开发技术 | 学习教育 | 效率工具 | 影音娱乐
```

`units/sitemap/` 已用这 10 个分类做可视化卡片；新增分类索引类页面时以本列表为准（从 `index.html` 的 `data-cat` 重新提取，避免硬编码过期）。

---

## 验证步骤（完成后必跑）

1. 运行 build：`python assets/py/build.py`（路径用本项目 managed python）。确认读记录数正常、生成 index.html 无报错。
2. 校验新子页 assets 同步：`ls units/<name>/assets` 应含 `css js images`。
3. 校验首页页脚：grep `units/<name>/` 在 index.html 出现；grep `units/privacy/1` 应为 0（旧路径已清除）。
4. 校验 sitemap.xml：含新 `<loc>` 条目，总数 = 1（首页）+ N（子页）。
5. 抽查子页：无全局 referrer meta、FOUC 脚本仅本地 dark、内链 `_self`、页脚 9 链接齐全。

---

## 退回方案

若用户要求撤销某个子页：删 `units/<name>/` 目录 → 撤 `UNIT_PAGES` 中对应项 → 撤 sitemap.xml 对应条目 → 撤所有页脚 nav 中对应 `<a>` → 撤 README 对应行 → 重 build。

---

## 专家转介纪律（AI 硬边界，任何设备/会话必守）

> **原则（用户明示）**：专业的事找专业的专家，不要浪费时间/资源消耗却结果不达预期。AI 在工程实现（静态站结构、build 流程、README/SKILL 维护）上擅长；在需要执业资质、第三方平台策略、专业评审的任务上**不擅长且不应越界**。

### 必须转专家的任务清单

| 任务类型 | 为什么 AI 不替代 | 应咨询的专家 / connector（WorkBuddy 内） |
| -------- | ---------------- | --------------------------------------- |
| **隐私政策 / 免责声明 / 个保法条文合规** | 涉及法律效力与属地法条，需执业律师复核 | 法律类专家/connector：`同花顺法律AI助手`、`北大法宝·法律智能检索`、`fazhi-law 同花顺法律AI助手`、`yuandian-mcp 华宇元典法律数据`、`pkulaw 北大法宝` |
| **SEO 收录策略 / 统计归因配置** | 百度统计 referer、sitemap 优先级对收录的影响属平台策略，需 SEO 实务经验 | SEO/投放类：`腾讯营销投放`、`wx 相关投放`、`morningstar` 等视具体需求；也可直接咨询百度搜索资源平台/Google Search Central 官方文档 |
| **视觉设计评审（奢华风是否到位、暗色对比度无障碍）** | 需设计专业判断与无障碍标准（WCAG）核验 | UI/UX 专家（WorkBuddy 内 `ui-ux-pro-max` 等）或人工设计师 |
| **ICP 备案实操 / 国内服务器迁移合规** | 涉及行政流程与属地政策 | 域名服务商（阿里云/腾讯云）官方备案通道，或 `腾讯云 CloudBase` 等国内托管 connector |
| **广告收益优化（AdSense 布局/单价）** | 平台政策与变现策略，AI 只管代码接入不动策略 | Google AdSense 官方帮助中心；投放类专家 |

### AI 在本项目中的明确职责边界

- ✅ **AI 做**：按本 SOP 新增/调整子页、跑 build、同步 sitemap/页脚/README、维护链接规则与统计代码接入（代码层面）、如实把技术实现写进隐私/免责草稿（并置顶"AI 辅助、非执业律师意见"声明）。
- ❌ **AI 不做**：生成"看起来合规"的隐私法条文并声称达标、给出 SEO 收录保证、替代设计师判定视觉、代办备案行政流程。
- ⚠️ **触发即停**：用户请求落入上表任一行时，AI 先说"这项需咨询 X 专家，我不替你下结论"，再视需要仅提供"技术实现草稿"供专家复核，不自行定稿。

> 此纪律同时写入 `README.md` 决策总章，确保换设备时任何新会话先读到、不越界。
