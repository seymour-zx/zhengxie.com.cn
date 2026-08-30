# 声明条（#consent-bar）Edge 无法关闭 —— 诊断报告

日期：2026-08-31 00:0x
现象：Chrome 正常；Edge（微软浏览器）点 × 无反应
结论：**代码逻辑本身无误**，问题出在「运行环境」——已用真实 Edge 152 复现两条失败路径

---

## 一、验证方法

- 本地静态服务 `http://127.0.0.1:8899`（python http.server，目录 = 新世界根）
- Playwright-core + `channel: 'msedge'` 调用**本机真实 Edge**（Edg/152.0.0.0）
- 场景矩阵 11 组：首页 / 政务页 / 搜索页 × 桌面 1280 / 窄屏 390 × 顶部 / 滚动后 × 支持 `:has()` / 模拟不支持 × file:// / localStorage 被阻止 / 旧 CSS 缓存

## 二、结果

| # | 场景 | 结果 |
|---|------|------|
| A | 桌面 顶部（支持 :has） | ✅ 关闭正常 |
| B | 桌面 滚动后（支持 :has） | ✅ 正常，关闭按钮 4 点全命中 |
| C | 桌面 滚动后（模拟不支持 :has） | ⚠️ 关闭按钮**左上角被滚动按钮拦截** |
| D | 窄屏 390 滚动后（支持 :has） | ✅ 正常 |
| E | 窄屏 390 滚动后（不支持 :has） | ❌ **中心/上缘/左上角全部被滚动按钮拦截** |
| F | 政务页 滚动后（不支持 :has） | ⚠️ 左上角被拦截 |
| G | 搜索页 滚动后（不支持 :has） | ⚠️ 左上角被拦截 |
| H | file:// 打开 | ✅ 正常 |
| I | localStorage 被阻止（严格隐私） | ✅ 正常（try/catch 兜底有效） |
| J | **旧 CSS 缓存（缺 `[hidden]` 规则）** | ❌ **点击后 hidden=true 但 display 仍 block，条子仍在** |
| K | file:// + localStorage 被阻止 | ✅ 正常 |

## 三、两条真实根因（按概率排序）

### 根因 ①｜Edge 缓存了旧版 CSS（概率最高）
`style.css` 第 816 行才有 `.official-banner[hidden] { display: none; }`。
缺失该规则时，`.official-banner`（display:block/fixed）会覆盖浏览器 UA 的 `[hidden]{display:none}`，
于是 JS 明明执行成功（`hidden=true`），视觉上条子纹丝不动 = **完全"无反应"**。

触发条件：Edge 缓存了 8/30 晚上补丁之前的 HTML+CSS 组合（HTML 被启发式缓存 → 引用旧 CSS 版本号 → 新 CSS 拉不到）。
Chrome 侧若曾 Ctrl+F5 或 localStorage 已置位（30 天内不显示），看起来就"正常"。

### 根因 ②｜`:has()` 失效 + 图层倒挂 → 点击落空（旧内核 / IE 模式）
- `.official-banner` z-index **80**；`.scroll-btns` z-index **90**（历史决策：声明条不得压住滚动按钮）
- 二者位置靠 `:has()` 空间分离：`body:has(.official-banner:not([hidden])) .scroll-btns { bottom: 76px }`
- `:has()` 需 Chrome/Edge **105+**。不生效时 scroll-btns 停在 bottom:24px（窄屏 16px），
  与关闭按钮（距右 12px、距底约 6~32px）**重叠**，z-index 90 压住 80 → 点击被滚动按钮吃掉
- 桌面仅左上角一小块被吃；**窄屏整颗按钮几乎全被吃**（场景 E）

## 四、已排除的原因
- 内联脚本被拦截：Edge 152 下内联脚本正常执行，绑定成功
- localStorage 被禁用：try/catch 兜底，`bar.hidden=true` 先执行，仍可关闭（场景 I/K）
- file:// 协议：正常（场景 H）
- main.js 运行时报错：整段 ES5 写法，无 `?.`/`??` 等现代语法，控制台无 pageerror
- 三个页面（首页 / 政务 / 搜索）代码一致，非单页问题

## 五、30 秒自判定（Edge F12 控制台粘贴）

```js
(function(){
  var bar=document.getElementById('consent-bar'),btn=document.getElementById('consent-close');
  if(!bar||!btn)return console.log('本页无声明条');
  var r=btn.getBoundingClientRect();
  var el=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  var hasRule=false;
  try{[].forEach.call(document.styleSheets,function(s){try{[].forEach.call(s.cssRules,function(c){if(/official-banner\[hidden\]/.test(c.selectorText||''))hasRule=true})}catch(e){}})}catch(e){}
  console.log({
    css有hidden规则:hasRule,
    关闭按钮命中元素:(el&&(el.id||el.className))||'null',
    支持has:CSS.supports('selector(body:has(div))'),
    浏览器:navigator.userAgent
  });
})();
```

判定：
- `css有hidden规则: false` → 根因 ①（缓存旧 CSS）→ Ctrl+F5 强制刷新即可恢复
- `关闭按钮命中元素` 不是 `consent-close` → 根因 ②（图层被压）
- 两项都正常 → 贴控制台红字报错，另行排查扩展冲突

## 六、修复方案（待造物主拍板，未动代码）

**方案 ① 最小止血（治根因 ①，2 处 JS + 0 处 CSS）**
关闭回调与初始化隐藏处，在 `bar.hidden = true` 后追加 `bar.style.display = 'none'`（内联样式，任何旧 CSS 都盖不住）。
三个页面内联脚本 + main.js 第 13 段，共 4 处。

**方案 ② 完整加固（① + 治根因 ②，推荐）**
① 之外，不依赖 `:has()`：
- JS：声明条显示时 `document.body.classList.add('has-notice')`，关闭时 `remove`
- CSS：新增 `body.has-notice .scroll-btns { bottom: 76px }` + 移动端 `84px`（保留 `:has()` 规则作无 JS 降级）

**方案 ③ ② + 声明条 z-index 80 → 91**
空间分离后声明条与滚动按钮不再重叠，关闭按钮永不被压。
代价：推翻历史决策「声明条 z-index 必须低于 scroll-btns」的注释约束，需造物主确认。

## 七、修复实施（造物主拍板：方案② 完整加固，2026-08-31 完成）

改动清单（4 个文件 + 1 个新增回归脚本）：

| 文件 | 改动 |
|------|------|
| `index.html`（内联脚本） | 新增 `liftScrollBtns()` / `hideBar()` / `closeBar()`；隐藏改为三重兜底；显示时加 `body.has-notice` + 内联避让 + resize 重算 |
| `topics/gov/index.html` | 同上（同一份逻辑） |
| `topics/search/index.html` | 同上（同一份逻辑） |
| `assets/js/main.js`（第 13 段） | 同上，并新增「内联脚本已关闭则保持关闭」分支，避免重复显示 |
| `assets/css/style.css` | 新增 `body.has-notice .scroll-btns{bottom:76px}` + 移动端 `84px`（无 JS 时的样式降级，`:has()` 规则原样保留） |
| `assets/.build/qa-consent-check.js` | 新增回归闸门（与 qa-scroll-check.js 并列） |

三重兜底说明：
1. `bar.hidden = true`（语义）
2. `bar.style.display = 'none'`（内联样式，任何缺 `[hidden]` 规则的旧 CSS 都盖不住 → 治根因①）
3. 避让不再依赖 `:has()`：JS 按 `bar.offsetHeight` 实测高度写内联 `bottom`（治根因②，旧 CSS/老内核同样生效）

## 八、修复后验证（真实 Edge 152，7 组全 PASS）

```
1 首页 桌面 顶部（新CSS）        [PASS]
2 首页 桌面 滚动后（新CSS）      [PASS]
3 首页 窄屏390 滚动后（新CSS）   [PASS]
4 首页 桌面 滚动后（旧CSS模拟）  [PASS]   ← 修复前 FAIL
5 首页 窄屏390 滚动后（旧CSS模拟）[PASS]  ← 修复前 中心/上缘/左上角全被拦截
6 政务页 桌面 滚动后（旧CSS模拟）[PASS]
7 搜索页 窄屏390 滚动后（旧CSS模拟）[PASS]
```

关键指标：
- 关闭按钮 5 点（中心/上缘/左上角/右上角/左下角）**全部命中 `consent-close`**，无一点被滚动按钮拦截
- 点击后 `display:none`、不可见；`localStorage` 正常写入
- 刷新后不再显示（30 天有效期生效）
- 滚动按钮 `bottom`：显示时 64px（桌面 40+24）/ 95px（窄屏 79+16），关闭后复位 CSS 值 24px / 16px
- 无 pageerror

回归闸门：`node assets/.build/qa-scroll-check.js` → 退出码 0（场景 A smooth 4 次 / 场景 B 降级 4 次，全过）
语法检查：`node --check assets/js/main.js` → OK

## 九、备注：线上环境不同步（另案）
`https://zhengxie.com.cn/` 线上 HTML **无声明条**（0 处 `official-banner`），且描述仍是旧文案
（"专注人民政协与民主党派的第三方导航站"）、CSS 用 preload 无版本号；
但线上 `assets/css/style.css` 已含 `.official-banner` 规则 → 线上 HTML 落后于本地。
本次测试均在**本地**环境进行。
