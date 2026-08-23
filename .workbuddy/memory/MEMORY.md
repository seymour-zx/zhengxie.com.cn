# 项目长期约定（MEMORY.md）

> 用途：跨设备同步的项目级长期笔记。本文件随 Git 仓库同步，是各设备会话的硬规则来源。

## 项目背景
- 站点「正协导航」（zhengxie.com.cn），纯静态导航站，GitHub Pages + 自有域名。
- 工作空间 = 项目文件夹 `D:\Universal Space\zhengxie.com.cn`，`.workbuddy` 随仓库跨设备同步。
- **只有本项目，没有其他空间** → 项目级数据是唯一事实来源，用户级（home 目录）数据无意义、不依赖。

## 跨设备数据策略（三件套，已定稿）
1. **技能一律项目级**：存到 `{workspace}/.workbuddy/skills/`，随仓库同步；禁止默认用户级（`~/.workbuddy/skills/` 不同步）。
2. **记忆一律工作空间级**：写 `{workspace}/.workbuddy/memory/`（按 `YYYY-MM-DD.md` 追加 + 本文件沉淀长期约定）；禁止写入用户级 `~/.workbuddy/MEMORY.md`。
3. **身份文件已纳入同步**：SOUL.md / IDENTITY.md / USER.md / BOOTSTRAP.md 真实文件落在工作空间 `.workbuddy/`，用户主目录 `C:\Users\seymo\.workbuddy\` 下为 C:→D: 软链接（详见 `memory/2026-08-24.md`）。换设备需在本机用户主目录重建软链接。

## 安全边界（不要违反）
- 用户主目录 `C:\Users\seymo\.workbuddy\` 下的**用户级技能、workbuddy.db（自动化）、mcp.json、受管 node/python 运行环境**保持本地、不进同步区（防泄密 + 防仓库臃肿）。
- 仅身份文件 4 份通过软链接纳入同步；其余用户级内容不碰。

## 文件改动铁律（用户设定）
- 用户首次明确同意前，不修改空间内任何文件。同意后按"复制→删原→建链接→失败回滚"的安全顺序执行。
