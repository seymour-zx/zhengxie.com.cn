# 项目长期约定（MEMORY.md）

> 用途：跨设备同步的项目级长期笔记。本文件随 Git 仓库同步，是各设备会话的硬规则来源。

## 🚨 强制首读锚点（每次对话第一条必读，即使无指令也读）
- **读取顺序锁死**：每次对话第一条动作 = ① 读**本文件 MEMORY.md**（锚点/硬规则）→ ② 读 **`README.md`**「决策与偏好总览」章（设计/技术/合规决策）→ ③ 读 **`CONVENTIONS.md`**（成文约定 + 流程与执行纪律）。
- **三者之外的 md 不主动读**：`memory/YYYY-MM-DD.md`（日志）、`changelog.md`、`skills/`、`file-governance-plan.md` 等，仅在**本文件或用户点名**时才读（见下方三级读取）。不主动翻阅历史日志/方案文档，避免重复消费上下文、避免不同 agent 忽视不同 md。
- **本文件是"索引 + 不可妥协硬规则摘要"**：长文正文在 README/CONVENTIONS；本文件只放决策指针与红线。

### 三级读取（L0/L1/L2）
- **L0 强制（每次全读）**：MEMORY.md + README.md + CONVENTIONS.md。
- **L1 按需（被点名/问到才读）**：`.workbuddy/skills/**`（操作 SOP）、`memory/changelog.md`（迭代卡摘要）。
- **L2 不主动（仅交付/审计时）**：`memory/YYYY-MM-DD.md` 流水日志、`file-governance-plan.md`、SEO 审计报告、`seo-audit-*.md`。

## 🔔 新设备 / 新会话开场必做（最高优先级）
- **每次会话第一条动作**：检查用户主目录 `C:\Users\seymo\.workbuddy\` 下 4 个身份文件（SOUL.md / IDENTITY.md / USER.md / BOOTSTRAP.md）是否为**软链接**（`ls -L` 或 `readlink` 能解析到 `D:\Universal Space\zhengxie.com.cn\.workbuddy\`）。
- 若**不存在或不是链接** → 立即提醒用户：本设备尚未重建身份软链接，跨设备身份/记忆不同步；按 `memory/2026-08-24.md` 的步骤（开开发者模式 + Git Bash `ln -s`）重建，再继续其他任务。
- 若链接正常 → 简短确认"身份已同步"，再进入正题。
- 此检查优先于一切其他工作；用户明确要求"换设备对话时第一时间提醒"。

## 项目背景
- 站点「正协导航」（zhengxie.com.cn），纯静态导航站，GitHub Pages + 自有域名。
- 工作空间 = 项目文件夹 `D:\Universal Space\zhengxie.com.cn`，`.workbuddy` 随仓库跨设备同步。
- **只有本项目，没有其他空间** → 项目级数据是唯一事实来源，用户级（home 目录）数据无意义、不依赖。

## 跨设备数据策略（三件套，已定稿）
1. **技能一律项目级**：存到 `{workspace}/.workbuddy/skills/`，随仓库同步；禁止默认用户级（`~/.workbuddy/skills/` 不同步）。
2. **记忆一律工作空间级**：写 `{workspace}/.workbuddy/memory/`（按 `YYYY-MM-DD.md` 追加 + 本文件沉淀长期约定）；禁止写入用户级 `~/.workbuddy/MEMORY.md`。
3. **身份文件已纳入同步**：SOUL.md / IDENTITY.md / USER.md / BOOTSTRAP.md 真实文件落在工作空间 `.workbuddy/`，用户主目录 `C:\Users\seymo\.workbuddy\` 下为 C:→D: 软链接（详见 `memory/2026-08-24.md`）。换设备需在本机用户主目录重建软链接。

## 项目硬规则的权威来源（重要）
- 本站点大量**已锁死的设计/技术/合规决策**（设计语言、暗色模式、外链属性规则、页面骨架 S1–S6、专家转介纪律、备案号策略等）已沉淀在 **`README.md`**（决策与偏好总览章 + 各节）与曾有的 `assets/skills/SKILL.md` 中，**不在此 MEMORY.md 重复抄写**。
- 换设备/新会话时：先读 `README.md` 的「决策与偏好总览」章（任何优化前必读），再读 `memory/YYYY-MM-DD.md` 了解近期操作。
- 历史日志：`memory/2026-08-21.md`（第2–10轮）、`memory/2026-08-22.md`（第11–23轮）已并入本目录（原先误落在 `.workbuddy/.workbuddy/` 嵌套层，2026-08-24 整合回上级）。
- 注：`assets/skills/SKILL.md` 当前不在仓库中（可能未同步）；若需子页新增 SOP 请确认是否重建。

## 安全边界（不要违反）
- 用户主目录 `C:\Users\seymo\.workbuddy\` 下的**用户级技能、workbuddy.db（自动化）、mcp.json、受管 node/python 运行环境**保持本地、不进同步区（防泄密 + 防仓库臃肿）。
- 仅身份文件 4 份通过软链接纳入同步；其余用户级内容不碰。

## 文件职责边界（MEMORY / CONVENTIONS / 技能 SKILL）
> 避免把内容写错地方：约定类内容进 CONVENTIONS，操作记忆/硬规则进 MEMORY，操作 SOP 进技能 SKILL。

- **MEMORY.md（本文件，`.workbuddy/memory/`）**：
  - 读者 = 未来的我（agent）。性质 = **操作记忆 / 硬规则**。
  - 写什么：跨设备数据策略、身份软链约定、新设备必提醒指令、项目背景、安全边界、文件改动铁律。
  - 不写：项目规定正文、子页规范、专家纪律清单这类"成文约定本身"（那些进 CONVENTIONS）。
- **CONVENTIONS.md（`.workbuddy/docs/`）**：
  - 读者 = 用户 + 未来的我。性质 = **项目成文约定（去重后的单一权威源）**。
  - 写什么：跨设备权威源约定（README + SKILL 保证可读）、专家转介纪律清单、子页/资源规范等"规定本身"。
  - 来源：从 README.md 与 `assets/skills/SKILL.md` 去重后收敛而来；README / SKILL 只留"见 CONVENTIONS.md"指针，不再抄写。
- **技能 SKILL.md（`.workbuddy/skills/<name>/`）**：
  - 读者 = 未来的我（被 Skill 加载）。性质 = **领域操作 SOP**。
  - 写什么：具体操作步骤、模板、样例、验证清单（如子页新增 SOP、SEO 标准）。
  - 与 CONVENTIONS 的关系：SKILL 专注"怎么做"，CONVENTIONS 专注"规定是什么"；SKILL 内重复的约定块删掉、改指 CONVENTIONS。
- **三者都随仓库同步**，且都可能在内容上讲"跨设备"，但角度不同：**MEMORY 讲"数据存哪一级"，CONVENTIONS 讲"哪些 md 保证可读"，技能讲"跨设备操作步骤"**——互补不重复。

## 文件改动铁律（用户设定）
- 用户首次明确同意前，不修改空间内任何文件。同意后按"复制→删原→建链接→失败回滚"的安全顺序执行。

## Git 提交/推送纪律（用户设定，最高优先级之一）
- **可以提醒，不得询问**：我**可以**主动提醒用户"有文件尚未 git 提交/推送"（例如列出未跟踪/已修改文件），但**绝不可主动询问**"要我帮你提交/推送吗？""要我提交吗？"之类的话。用户已声明：肯定不会让我提交/推送。
- **用户要求提交/推送 → 必须二次确认**：若用户提出让我 git commit/push，我必须先**复述将提交/推送的具体文件清单与目标仓库**，请用户再次明确确认后，才执行那一次。
- **纪律长期有效**：本纪律除非用户**明确更改**（口头或文字说"更改纪律/允许你提交"等），否则始终有效，不得以任何"之前提交过""用户曾同意过"为由自行放宽。
- **临时授权 = 一次性，不改纪律**：若用户临时让我提交/推送，该授权**仅对该次动作有效**，不等于更改本纪律；之后默认仍不提交、不询问。
- **最终执行权在用户**：所有 git commit/push 默认由用户自己完成；我只在"被明确要求 + 二次确认"后，才执行那一次性的动作。
- 提醒措辞区分：提醒 = "有 N 个文件未提交"（允许）；询问 = "要我提交吗"（禁止）。

## 同步强制规则（2026-08-24 新增，最高优先级，堵"约定≠同步"断层）
> 完整版见 `CONVENTIONS.md` 第五节「流程与执行」。根因：2026-08-21/22 日志已写但未 `git add`，跨设备看不到——"记忆随仓库同步"是目标却无强制提交规则。
- **强制同步文件**（改了/写了就必须 `git add`，不得留 `??`）：身份 4 文件、`.workbuddy/docs/*`(CONVENTIONS/流程/规则)、`.workbuddy/memory/MEMORY.md`、`.workbuddy/memory/YYYY-MM-DD.md`(每条日志写完必 add)、`.workbuddy/skills/**`、站点源码(html/css/构建脚本/sitemap/README/CNAME/robots/ads.txt)。
- **严禁进 git**（.gitignore 已涵盖）：`.workbuddy/backups/`、`__pycache__/*.pyc`、`*.verify.tmp.py`。
- **每次收口必查**：Close 阶段对强制目录跑 `git status -s`，发现 `??` 立即 `git add` 并在回复列出"已暂存待你提交：<清单>"。**只 add 不 commit**（add≠commit，不与 Git 纪律冲突）。
- **新会话第一条交接**：核对 `git status -s` 是否有强制文件 `??`；若有，说明上次收口漏做本规则，本会话第一条就补 add 并提醒用户。
- **用户豁免同步**：若用户明示本次不同步某强制文件，agent 须在迭代卡记"用户豁免同步：<文件>"。
