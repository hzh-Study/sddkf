<!-- 模板名：React -->
# {{PROJECT_NAME}} 编码规则

> 本规则包由规范生成器生成
> 技术栈：{{STACK}}
> 模板：{{TEMPLATE_LABEL}}
> 生成日期：{{DATE}}

## 1. 技术栈锁定

- 项目技术栈固定为 **React**（版本：{{STACK_VERSIONS}}），统一使用函数组件与 Hooks，未经用户明确同意不得更换框架、渲染模式或语言。
- 构建工具固定为 {{BUILD_TOOL}}，不得在同一项目中混用多套构建方案；包管理器固定为 {{PACKAGE_MANAGER}}，锁文件必须随代码提交，不得删除或忽略。
- 路由统一使用 React Router（Next.js 项目则使用其约定式路由），不得自研路由或混用两套路由方案。
- 状态方案：组件内状态用 `useState`/`useReducer`，跨组件共享状态集中在约定方案中管理，不得把服务端数据塞进全局状态。
- 核心依赖：{{KEY_DEPS}}。新增依赖前必须说明理由，优先使用 React 官方生态中的成熟库；不得引入与现有依赖功能重复的库。
- 不得擅自升级 React 主版本或降级关键依赖；版本变更必须记录并告知用户。项目定位：{{PROJECT_SUMMARY}}。

## 2. 架构与目录约束

- 代码只能放在以下目录内：{{TARGET_DIRS}}。临时调试代码不得留在提交中。
- `src/components` 只放可复用的展示型组件，不直接发起数据请求；`src/pages`（Next.js 项目为 `app/`）负责路由级页面与数据编排；`src/hooks` 放可复用 Hooks；`src/services` 封装 API 请求与数据转换；`src/styles` 放全局样式与主题变量。
- 组件只能通过 props 与 Hooks 交互，禁止在组件间直接读写彼此的内部状态；跨层调用必须经由 services 层。
- 单个组件文件不超过 200 行，超出时按职责拆分为子组件或抽取 Hooks；禁止在页面文件里堆砌全部逻辑。
- 新增目录或改变目录用途前必须说明理由，并在项目文档中登记。

## 3. 代码风格

- 组件一律使用函数组件，禁止新增 class 组件；组件名使用 PascalCase，Hooks 以 `use` 开头，事件处理函数以 `handle` 开头。
- 遵守 Hooks 规则：不得在条件分支、循环或嵌套函数中调用 Hooks，必须开启并通过 `eslint-plugin-react-hooks` 的 `react-hooks/rules-of-hooks` 与 `react-hooks/exhaustive-deps` 规则。
- `useEffect` 只用于副作用，依赖数组必须完整且稳定；不要用 `useEffect` 做可通过派生计算得到的状态同步，卸载时必须清理订阅与定时器。
- 组件 props 必须有明确类型，禁止使用 `any` 掩盖类型错误；列表渲染必须提供稳定的 `key`。
- 注释语言统一为：{{COMMENT_LANGUAGE}}。注释解释「为什么」，不复述代码「做了什么」；不提交调试输出与被注释掉的旧实现。

## 4. 测试要求

- 测试框架：{{TEST_FRAMEWORK}}；测试命令：`{{TEST_COMMAND}}`。
- 组件与交互测试使用 `@testing-library/react` 与 `@testing-library/user-event`，按用户可见的角色、文本和标签查询元素，禁止断言内部 state 或组件实例。
- 每个交互组件至少覆盖渲染、主要交互与异常/空状态；新增业务逻辑必须同时新增测试，修复缺陷必须先补一个能复现缺陷的测试。
- 测试必须可重复、可独立运行，不依赖执行顺序、外部网络与真实后端；API 请求通过 mock 替身，不得在测试中访问生产数据。
- 提交前必须运行 `{{TEST_COMMAND}}` 且全部通过，测试未通过不得声称任务完成。

## 5. 安全红线

- 禁止使用 `dangerouslySetInnerHTML` 渲染未经消毒的内容；确需渲染富文本时必须先经白名单消毒并说明理由。
- 任何密钥、口令、令牌（如 API Key、私钥、后端密钥）不得进入前端包：只有可公开的变量才能使用 `VITE_`（Vite）或 `NEXT_PUBLIC_`（Next.js）前缀，其余一律由服务端持有。
- 所有外部输入必须校验与转义，链接跳转前校验协议，禁止把 URL 参数直接拼进请求或 `window.location`。
- 鉴权与权限校验必须在服务端完成，前端隐藏按钮不构成安全措施；数据存储：{{DATABASE}}，登录鉴权：{{AUTH}}。
- 依赖必须定期运行 `npm audit` 检查已知漏洞，高危漏洞不得带着上线；禁止执行来源不明的脚本或关闭 TLS 校验。部署目标：{{DEPLOY_TARGET}}。

## 6. AI 自查清单

每次写完代码，逐条自检并在回复中说明结果：

- [ ] 技术栈与版本未被更换，新增依赖已说明理由，锁文件已提交
- [ ] 文件放在约定目录内，组件、页面、Hooks、服务、样式没有跨层越界
- [ ] 只使用函数组件，Hooks 调用位置合规，`useEffect` 依赖完整
- [ ] 命名、注释语言（{{COMMENT_LANGUAGE}}）与格式符合本规则，`{{LINT_COMMAND}}` 通过
- [ ] 新增逻辑已有组件/交互测试，`{{TEST_COMMAND}}` 全部通过
- [ ] 没有提交任何密钥，未使用 `dangerouslySetInnerHTML`，`npm audit` 无高危漏洞
- [ ] 构建命令 `{{BUILD_COMMAND}}` 已跑通

## 7. 验证命令

交付前在项目根目录依次运行以下命令，并确认全部通过：

```bash
{{TEST_COMMAND}}
{{BUILD_COMMAND}}
{{LINT_COMMAND}}
```

如命令需要额外环境变量或后端服务，必须在回复中说明，不得跳过后声称完成。
