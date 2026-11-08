<!-- 模板名：Vue3 -->
# {{PROJECT_NAME}} 编码规则

> 本规则包由规范生成器生成
> 技术栈：{{STACK}}
> 模板：{{TEMPLATE_LABEL}}
> 生成日期：{{DATE}}

## 1. 技术栈锁定

- 前端框架固定为 **Vue 3**，构建工具固定为 Vite，状态管理固定为 Pinia，路由固定为 Vue Router；版本以 {{STACK_VERSIONS}} 为准，未经用户明确同意不得更换框架或降级主版本。
- 包管理器固定为 {{PACKAGE_MANAGER}}，锁文件（npm 使用 `package-lock.json`，pnpm 使用 `pnpm-lock.yaml`，yarn 使用 `yarn.lock`）必须提交到仓库，禁止删除或手工改写。
- Node 版本必须与 `.nvmrc` 或 `package.json` 的 `engines` 声明一致，不得使用项目未声明的 Node 特性；核心依赖锁定为 {{KEY_DEPS}}。
- 新增依赖前必须说明理由，优先使用 Vue 官方生态（vue-router、pinia、@vueuse/core 等）中的成熟库；禁止引入 React、Angular、jQuery 或 Vue 2 等与本栈冲突的框架。
- 禁止私自更换依赖或替换构建链（如改用 webpack、Nuxt、Vite 之外的打包器）；确需变更必须经用户确认并同步更新本文档。
- 项目定位：{{PROJECT_SUMMARY}}。

## 2. 架构与目录约束

- 单文件组件按职责分目录：通用组件放 `src/components/`（按功能再分子目录），页面级视图放 `src/views/`，全局状态放 `src/stores/`，路由表放 `src/router/`，跨组件复用逻辑放 `src/composables/`，后端请求封装放 `src/api/`。
- 代码只能写在以下目录内：{{TARGET_DIRS}}；入口固定为 `src/main.js`（或 `src/main.ts`）与 `src/App.vue`，静态资源放 `src/assets/`，全局样式放 `src/assets/styles/`。
- 视图组件只负责展示与用户交互，数据请求与状态编排放到 `src/composables/` 或 `src/stores/`；`src/api/` 中的模块只负责请求与响应结构校验，不得直接操作组件状态。
- 禁止跨层反向依赖：`src/components/` 不得引用 `src/views/`；禁止在 `src/stores/` 中直接操作 DOM；禁止在组件内直接调用 `axios` 或 `fetch` 绕过 `src/api/`。
- 新增顶层目录或改变目录用途前必须说明理由并登记到项目文档；临时脚本放 `scripts/`，完成后删除。

## 3. 代码风格

- 组件一律使用组合式 API 配合 `<script setup>`，禁止使用 Options API、`mixins` 与 `this`；`<script setup>` 内声明顺序固定为：引用、props、emits、响应式状态、计算属性、方法、生命周期。
- 父子通信使用 `defineProps` 与 `defineEmits`，必须写明类型与默认值（`withDefaults`）；禁止直接修改 prop，禁止依赖隐式事件名或使用 `$emit` 字符串拼接。
- 命名遵循 Vue 官方风格指南：组件文件名使用 PascalCase（如 `ArticleCard.vue`），composable 以 `use` 开头（如 `useArticleList`），store 以 `useXxxStore` 命名，自定义事件使用 kebab-case；禁止拼音缩写与无意义命名。
- 单个单文件组件不超过 200 行（模板与脚本合计），超出时拆分子组件或抽取 composable；`<template>` 嵌套层级不超过 5 层，禁止在模板中写复杂表达式。
- 注释语言统一为：{{COMMENT_LANGUAGE}}。注释解释「为什么」，不复述代码行为；组件顶部用一行说明职责，composable 必须写明使用前提与副作用。
- 响应式状态统一用 `ref` / `computed` 管理，禁止通过直接修改深层对象造成隐式更新；样式优先使用 `<style scoped>`，避免全局选择器污染。

## 4. 测试要求

- 测试框架固定为 {{TEST_FRAMEWORK}}（Vitest + Vue Test Utils），测试命令 `{{TEST_COMMAND}}`；禁止混入 Jest 或引入第二套测试运行器。
- create-vue 脚手架默认 `src/__tests__/`，自建项目可用 `tests/unit/`；文件名与被测组件一致（如 `ArticleCard.spec.js`）。
- 组件测试必须通过 `@vue/test-utils` 的 `mount` 或 `shallowMount` 从公共接口断言：渲染输出、发出的事件与暴露的方法；禁止断言组件私有状态或依赖真实 DOM 结构细节。
- 新增业务逻辑必须同时新增测试，覆盖正常路径、边界条件与错误路径；修复缺陷必须先补一个能复现缺陷的测试。
- 外部依赖（HTTP、时间、随机数）必须用 `vi.mock` 或 `vi.stubGlobal` 替换，测试不得依赖真实网络与执行顺序；store 测试使用独立 pinia 实例或 `createTestingPinia`，禁止跨用例共享状态。
- 提交前必须运行 `{{TEST_COMMAND}}` 且全部通过；已配置覆盖率工具时，新增逻辑语句覆盖率不低于 70%；未配置时以正常/边界/错误路径用例覆盖为准，不得以此为由跳过测试。

## 5. 安全红线

- 禁止滥用 `v-html`：仅在内容来源完全可信且经服务端富文本白名单过滤时使用，其余一律使用插值或组件渲染，禁止把用户输入直接交给 `v-html`。
- 任何密钥、口令、令牌不得进入前端包：`VITE_` 前缀的环境变量会被打包进产物，因此只放公开配置（如 API 基地址），密钥必须留在服务端；不得提交 `.env`、`.env.local` 等本地配置。
- 登录鉴权：{{AUTH}}。前端路由守卫只用于体验优化，真正的权限校验必须在服务端完成，禁止只依赖前端隐藏按钮或路由。
- 外部输入在展示前必须校验与转义，接口响应先经 `src/api/` 做结构校验；禁止关闭 TLS 校验，禁止用 `eval`、`new Function` 或动态 `innerHTML` 执行字符串代码。
- 依赖必须定期运行 `{{PACKAGE_MANAGER}} audit` 检查已知漏洞，高危漏洞未修复不得合入；禁止引入来源不明的 CDN 脚本与长期未维护的依赖。
- 部署目标：{{DEPLOY_TARGET}}。生产构建不得保留 source map 与调试开关，不得在控制台打印令牌或用户隐私数据。

## 6. AI 自查清单

每次写完代码，逐条自检并在回复中说明结果：

- [ ] 只使用 Vue 3 + Vite + Pinia + Vue Router，未更换主版本或私换依赖
- [ ] 组件使用组合式 API 与 `<script setup>`，props 与事件用 `defineProps` / `defineEmits` 声明
- [ ] 文件放在 `src/components/`、`src/views/`、`src/stores/`、`src/composables/`、`src/api/` 等约定目录
- [ ] 单文件组件未超过 200 行，注释语言为 {{COMMENT_LANGUAGE}}
- [ ] 新增逻辑已有 Vitest 测试，`{{TEST_COMMAND}}` 全部通过
- [ ] 没有 `v-html` 滥用，没有密钥进入 `VITE_` 变量或前端包
- [ ] 构建与静态检查已跑通（`{{BUILD_COMMAND}}`、`{{LINT_COMMAND}}`），依赖漏洞已检查

## 7. 验证命令

交付前在项目根目录依次运行以下命令，并确认全部通过：

```bash
{{TEST_COMMAND}}
{{BUILD_COMMAND}}
{{LINT_COMMAND}}
```

- `{{TEST_COMMAND}}`：Vitest 单元测试，对应 `package.json` 中的 `test:unit` 脚本。
- `{{BUILD_COMMAND}}`：Vite 生产构建，首次运行前需先执行依赖安装。
- `{{LINT_COMMAND}}`：ESLint 静态检查。

如命令需要额外环境变量或服务，必须在回复中说明，不得跳过后声称完成。
