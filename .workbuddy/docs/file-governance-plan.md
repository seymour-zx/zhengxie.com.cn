# 正协导航 · 文件治理方案（md 精简与首读锚点）

> 文档定位：**方案**，本次**不删除、不修改任何文件**，仅供用户审阅。批准后由 agent 按「执行步骤」落地。
> 制定动机：用户指出——md 过多 + 关联不准 → 不同 agent 忽视的可能是不同 md、甚至同一 md 的不同段 → **漏读才是项目推进的最大障碍**。本方案解决"读哪个、读顺序、读多少"的随机性问题，并削减冗余 md。
> 配套：本方案与 `execution-rules.md`(执行纪律)、`dev-process-plan.md`(流程) 共同构成治理体系；批准后部分内容将合并进 `CONVENTIONS.md` 并删独立 md（见执行步骤）。

---

## 1. 核心诊断：当前 19 个 md 的"读"现状

| 问题 | 表现 |
|------|------|
| **无单一首读锚点** | MEMORY.md 说"读 README+CONVENTIONS+memory"；CONVENTIONS.md 说"以本文件为准"；execution-rules.md 说"README>CONVENTIONS>本文件"——三处互指，无一个文件是"无条件首读且全遵守"的锚 |
| **规定与过程混读** | 硬规则(MEMORY/CONVENTIONS)与流水账日志(2026-08-2*.md 共 40KB)同处"首读路径"，长日志淹没关键约束 |
| **过程 md 冗余** | dev-process-plan.md / execution-rules.md 与 CONVENTIONS.md 内容重叠；artifacts/report.md 一次性；IMAGE_OPTIMIZATION.md 与 SKILL.md 重叠 |
| **体量失衡** | README 69KB、21/22 日志 40KB，单文件过长，agent 易只读前段漏后段 |

**直接后果**（用户原话印证）：你和团队"无视某个 md 中的某段"——因为根本没人规定"必须逐段读完哪个文件"。

---

## 2. 根治设计：唯一首读锚点 + 三级读取

### 2.1 首读锚点 = `MEMORY.md`（升级）
- 它已是 agent 启动上下文必加载项，**天然符合"即使没指令也会读"**。
- 升级为**唯一强制首读锚点**：顶部写死指令——
  > 「每次对话第一条：先读本文件 → 再读 `README.md` 决策总览 → 再读 `CONVENTIONS.md`。**三者之外的任何 md，仅在被本文件点名或用户明确要求时才读**，不得主动读取。」
- 作用：把"读哪个、读顺序"钉死，**消除忽视不同 md 的随机性**。

### 2.2 三级读取分类
| 级别 | 文件 | 读取时机 |
|------|------|----------|
| **L0 强制首读** | `MEMORY.md`(锚点索引+硬规则摘要)、`README.md`(决策)、`CONVENTIONS.md`(约定) | 每次对话第一条，**全读** |
| **L1 按需读** | `skills/*/SKILL.md`(做对应领域任务前)、`.workbuddy/memory/changelog.md`(用户问"某天/某次做了什么"才读) | 触发条件满足才读 |
| **L2 不主动读** | `seo-audit-*.md`、`report.md`、`overview.md`、`artifacts/*`、`BOOTSTRAP/IDENTITY/USER/SOUL`(仅身份重建时用) | 仅用户点名或特定流程触发 |

---

## 3. md 必要性分级与精简映射

### 3.1 保留（必要，不可删）
| 文件 | 角色 | 动作 |
|------|------|------|
| `README.md` | 决策总览（唯一权威决策手册） | 保留，必要时补"见 CONVENTIONS"指针 |
| `CONVENTIONS.md` | 成文约定单一源 | **吸收** dev-process-plan + execution-rules 的"流程/执行"章节，成为 L0 约定终点 |
| `MEMORY.md` | 首读锚点 + 硬规则摘要 | 升级为 2.1 锚点指令 |
| `skills/*/SKILL.md`(2个) | 领域 SOP | 保留；`IMAGE_OPTIMIZATION.md` 并入 `zhengxie-subpage-sop/SKILL.md` 后删 |
| `BOOTSTRAP/IDENTITY/USER/SOUL`(4个) | 身份文件 | 保留（跨设备软链源） |
| `overview.md`(根) | 站点简介 | 保留（站点本体，非 agent 规则） |

### 3.2 合并后删除（冗余）
| 原文件 | 去向 | 删后效果 |
|--------|------|----------|
| `dev-process-plan.md` | 内容并入 `CONVENTIONS.md`「流程与执行」章 | 少 1 个 md |
| `execution-rules.md` | 内容并入 `CONVENTIONS.md`「流程与执行」章（作为执行纪律子节） | 少 1 个 md |
| `memory/2026-08-21.md` `2026-08-22.md` `2026-08-24.md` | **提炼为 `memory/changelog.md`**（只留迭代卡摘要，删流水账），原三天日志删 | 40KB→约 5KB，且从 L0 降至 L1 |

### 3.3 直接删除（噪音）
| 文件 | 理由 |
|------|------|
| `.workbuddy/artifacts/report.md` | 一次性产物，与 `report.md`(根) 重叠 |
| `skills/zhengxie-subpage-sop/IMAGE_OPTIMIZATION.md` | 与同目录 SKILL.md 重叠，并入后删 |

### 3.4 保留但移出首读（过程/审计）
| 文件 | 处理 |
|------|------|
| `seo-audit-2026-08-24.md` | 保留为 L2 审计档案，不主动读 |
| 根 `report.md` | 站点交付物，保留，非 agent 规则 |

---

## 4. 精简后 md 全景（从 19 → 约 12）

```
L0 强制首读（每次全读）：
  README.md(决策) · CONVENTIONS.md(约定,吸收流程+执行) · MEMORY.md(锚点)
L1 按需读：
  skills/zhengxie-seo-standard/SKILL.md · skills/zhengxie-subpage-sop/SKILL.md(吸收IMAGE_OPT)
  .workbuddy/memory/changelog.md(迭代摘要,替代三天日志)
L2 不主动读：
  seo-audit-2026-08-24.md · 根 report.md · 根 overview.md
身份(软链源,仅重建用)：
  BOOTSTRAP/IDENTITY/USER/SOUL
```

**关键收益**：必须读的 L0 集合被钉死为 **3 个文件**，且 MEMORY.md 明确"其他不主动读"——彻底消除"忽视不同 md / 同一 md 不同段"的随机漏读。

---

## 5. 执行步骤（批准后由 agent 执行，含回档）

1. **回档**：备份待改/删文件到 `.workbuddy/backups/backup_filegov_<时间戳>/` + MANIFEST（遵循 execution-rules 规则 1/3）。
2. **升级锚点**：改写 `MEMORY.md` 顶部加 2.1 首读指令；保留其硬规则摘要。
3. **合并入 CONVENTIONS**：把 dev-process-plan + execution-rules 的"流程与执行"实质内容移入 CONVENTIONS.md 新章节，避免重复。
4. **提炼 changelog**：从三天日志抽取迭代卡摘要写入 `memory/changelog.md`。
5. **删除冗余**：删 dev-process-plan.md、execution-rules.md、三天日志、artifacts/report.md、IMAGE_OPTIMIZATION.md。
6. **收口查跟踪**：按 execution-rules 规则 1.3 跑 `git status -s`，`git add` 所有强制文件（含删除），**只 add 不 commit**，提醒用户提交。

---

## 6. 待用户确认
- 是否批准按本方案执行（尤其"删 7 个冗余 md"这一步，需你明确同意）？
- `changelog.md` 的摘要粒度是否够（保留迭代卡，丢流水细节，可接受？）？

_方案版本：v1 · 2026-08-24 · 由「产品通」基于"md 漏读才是最大障碍"洞察产出，本次仅出方案不动文件。_
