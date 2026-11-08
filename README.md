# sddkf · 规范生成器

一个纯 Markdown 的 AI 技能：用一句话说明想做什么、用什么技术栈，它会采访你，并在目标项目根目录生成 `AGENTS.md`（编码规则）与 `GLOSSARY.md`（业务术语表）。

## 全局安装

```powershell
pwsh ./scripts/install.ps1
```

安装后技能位于 `$HOME/.agents/skills/spec-generator`。

## 在新项目唤起

在任意新项目里对编码代理说：

> 我要用 Vue3 做个博客

生成器会逐轮提问（每题附推荐答案，回答「是」即采用），最后写入规则包。命中 Vue3/React/Spring Boot/FastAPI/UniApp 时使用精调模板，其余技术栈由通用引擎生成。

## 运行测试

```bash
npm test
```

测试只断言生成的规则包文件本身；技能运行时不需要 Node。

本仓库命令在 PowerShell 7 下执行；多行文本用 here-string（`@'...'@`）或 `--body-file`，不要使用 bash heredoc。
