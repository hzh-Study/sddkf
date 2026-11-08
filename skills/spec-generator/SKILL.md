---
name: spec-generator
description: "采访式生成通用 AI 编码规则包（AGENTS.md + GLOSSARY.md）。仅供用户主动唤起；命中 Vue3/React/Spring Boot/FastAPI/UniApp 时使用精调模板，其余技术栈由通用引擎生成。"
disable-model-invocation: true
---

# 规范生成器

这是一个纯 Markdown 技能，不依赖任何运行环境。目标：通过逐轮采访，把用户「想做什么、用什么技术栈」转化成目标项目根目录下的规则包，约束编码代理不乱换技术栈、不乱建目录、写测试、守安全红线。

## 唤起方式

本技能设置为 `disable-model-invocation: true`：编码代理不会自动触发，只有用户显式唤起时执行。

- 在目标项目里显式输入 `Use Skill: spec-generator`（或宿主提供的 `/spec-generator` 命令）。
- 随后给出「我要用 <技术栈> 做个 <项目>」；也可以只给项目描述，由采访环节追问技术栈。

适用范围：全新初始化的项目（不处理老项目半路补规范）；规则供编码代理阅读，输出通用格式。

## 工作流程

1. **识别请求**：从用户第一句话提取技术栈与项目类型；缺失时先追问。
2. **路由技术栈**：读取 `references/stack-routing.md`，按表格顺序做大小写不敏感的子串匹配；命中精调模板则读取 `references/templates/<stem>.md`，否则使用 `references/generic-engine.md`。
3. **采访**：读取 `references/interview.md`，逐轮提问。每轮把当前能问的问题一次问完，每题附推荐答案；用户回答「是」即采用推荐答案。至少覆盖项目名、一句话简介、技术栈与版本、构建/包管理工具、数据库、登录鉴权、注释语言、测试框架、验证命令、部署目标，并从描述中提炼业务术语。
4. **装配**：读取 `references/assembly.md`，按其中的占位符与校验规则填充模板。
5. **写文件**：写入前检查目标项目根目录是否已有 `AGENTS.md` 或 `GLOSSARY.md`。已存在时先列出差异并询问用户「覆盖 / 合并 / 跳过」，默认跳过；用户确认覆盖后，先把原文件备份为 `.bak`，再写入 `AGENTS.md` 与 `GLOSSARY.md`；术语表使用 `references/glossary-template.md`。
6. **回报**：列出生成的文件、命中的模板、需要用户确认的假设与验证命令。

## 硬性约束

- 只生成 `AGENTS.md` 与 `GLOSSARY.md` 两个通用文件；不生成 `.cursor/`、`.trae/`、`.github/copilot-instructions.md` 等任何编码代理专有配置。
- 目标项目已有同名规则文件时，先询问再覆盖，且覆盖前备份为 `.bak`；不得静默覆盖。
- 规则全部用中文撰写；代码标识符遵循目标技术栈惯例。
- 输出正文 = 命中模板的正文逐字替换占位符；模板与项目实际不符时，回改仓库中的模板并说明，而不是现场改写输出。
- 不得残留任何 `{{...}}` 占位符；采访答案缺失时必须追问，不得用猜测值填充。
- 不凭空发明用户未确认的依赖、数据库或部署方式。

## 参考文件

- `references/interview.md`：采访流程与推荐答案
- `references/stack-routing.md`：技术栈路由表
- `references/assembly.md`：装配与校验规则
- `references/generic-engine.md`：通用引擎模板（任意技术栈兜底）
- `references/glossary-template.md`：业务术语表模板
- `references/templates/`：精调模板目录（Vue3、React、Spring Boot、FastAPI、UniApp）
