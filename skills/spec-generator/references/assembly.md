# 装配规则

采访结束后，把答案装配成 `AGENTS.md` 与 `GLOSSARY.md`。

## 1. 选择模板

读取 `stack-routing.md`，按表格行序用技术栈做大小写不敏感的子串匹配：

- 命中精调模板 → 使用 `references/templates/<stem>.md`，模板 id 为文件 stem（如 `vue3`）。
- 未命中 → 使用 `references/generic-engine.md`，模板 id 为 `generic`。

## 2. 填写占位符

模板中的占位符只允许下列键，语法为 `{{UPPER_SNAKE}}`：

| 占位符 | 含义 |
| --- | --- |
| `PROJECT_NAME` | 项目名 |
| `PROJECT_SUMMARY` | 一句话简介 |
| `STACK` | 技术栈名称 |
| `STACK_VERSIONS` | 技术栈版本 |
| `BUILD_TOOL` | 构建工具 |
| `PACKAGE_MANAGER` | 包管理器 |
| `TEST_FRAMEWORK` | 测试框架 |
| `TEST_COMMAND` | 测试命令 |
| `BUILD_COMMAND` | 构建/检查命令 |
| `LINT_COMMAND` | 静态检查命令 |
| `DATABASE` | 数据库 |
| `AUTH` | 登录鉴权 |
| `COMMENT_LANGUAGE` | 注释语言 |
| `KEY_DEPS` | 核心依赖 |
| `TARGET_DIRS` | 代码目录 |
| `DEPLOY_TARGET` | 部署目标 |
| `DATE` | 生成日期（`YYYY-MM-DD`） |
| `TEMPLATE_LABEL` | 模板标签，由装配过程计算，不由采访回答 |
| `GLOSSARY_TERMS` | 术语行，仅用于 `glossary-template.md` |

规则：

- 答案中缺失任何模板引用到的键都必须追问，不得留空或用猜测值。
- 占位符之外不得自造新键；渲染完成后不得残留 `{{`。

## 3. 计算模板标签

- 通用引擎 → `通用引擎`。
- 精调模板 → `精调模板（<显示名>）`；显示名从模板文件中的 `<!-- 模板名：Vue3 -->` 注释读取，缺省时用文件 stem。
- 该 `模板名` 注释属于元数据，渲染时从输出中移除。

## 4. AGENTS.md 结构

所有模板共用同一结构：

1. 标题行：`# {{PROJECT_NAME}} 编码规则`
2. 溯源块（模板中逐行写出，装配时替换占位符）：

   ```
   > 本规则包由规范生成器生成
   > 技术栈：{{STACK}}
   > 模板：{{TEMPLATE_LABEL}}
   > 生成日期：{{DATE}}
   ```

3. 恰好以下七个顶层章节，标题逐字一致：

   ```
   ## 1. 技术栈锁定
   ## 2. 架构与目录约束
   ## 3. 代码风格
   ## 4. 测试要求
   ## 5. 安全红线
   ## 6. AI 自查清单
   ## 7. 验证命令
   ```

约束：

- 第 1–5 节每节正文不少于 50 字符，不得写空泛占位句。
- 第 6 节至少 5 个 `- [ ]` 复选框。
- 第 7 节列出 `{{TEST_COMMAND}}`、`{{BUILD_COMMAND}}`、`{{LINT_COMMAND}}`。
- 不要在模板中使用 `## ` 级别做其他用途，避免破坏章节结构。

## 5. 生成 GLOSSARY.md

读取 `glossary-template.md`，把 `{{GLOSSARY_TERMS}}` 展开为每条一行：

```
- **术语**：定义
```

## 6. 写文件与校验

1. 只写目标项目根目录的 `AGENTS.md` 与 `GLOSSARY.md`。
2. 不创建 `.cursor/`、`.trae/`、`.github/copilot-instructions.md` 等任何工具专有配置。
3. 写入前校验：
   - 七个章节标题齐全且顺序正确；
   - 五个规则模块正文非空（≥ 50 字符）；
   - 第 6 节复选框 ≥ 5；
   - 无 `{{` 残留；
   - 溯源块的技术栈、模板标签、生成日期正确；
   - 术语表包含全部业务术语与定义。
4. 写入后向用户回报：命中的模板、生成的文件、采用的假设、验证命令。
