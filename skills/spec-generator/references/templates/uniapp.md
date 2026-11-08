<!-- 模板名：UniApp -->

# {{PROJECT_NAME}} 编码规则

> 本规则包由规范生成器生成
> 技术栈：{{STACK}}
> 模板：{{TEMPLATE_LABEL}}
> 生成日期：{{DATE}}

## 1. 技术栈锁定

- 技术栈固定为 **uni-app 跨端框架**（版本：{{STACK_VERSIONS}}），基于 Vue 3 组合式 API；不得私自改用原生小程序语法或其他跨端框架。
- 构建工具：{{BUILD_TOOL}}；包管理器：{{PACKAGE_MANAGER}}。CLI 项目以 `package.json` 与锁文件（`package-lock.json` / `pnpm-lock.yaml`）为准，依赖变更必须同步提交锁文件。
- 核心依赖：{{KEY_DEPS}}。新增依赖前必须说明理由，优先选用 DCloud 官方与 uni-app 生态插件；禁止私换依赖或替换框架版本。
- 不得擅自升级 uni-app、Vue 或编译器主版本；升级前须在 `manifest.json`、`pages.json` 与目标平台构建产物上完成验证。
- 项目定位：{{PROJECT_SUMMARY}}。

## 2. 架构与目录约束

- 代码目录限定为：{{TARGET_DIRS}}。页面放 `pages/`，可复用组件放 `components/`，静态资源放 `static/`，状态放 `stores/`，工具函数放 `utils/`。
- 所有页面必须在 `pages.json` 中注册；分包页面统一写入 `subPackages`，主包只保留启动页与公共资源，避免超出各平台包体积限制。
- 页面目录采用 `pages/<业务>/<页面>.vue` 结构，页面内私有组件与页面同级维护；跨页面复用的组件必须提升到 `components/`。
- `static/` 只放图片、字体等静态资源，禁止在其中放置可执行脚本；引用时使用以 `/static/` 开头的绝对路径。
- 新增目录或改变目录用途前必须说明理由并登记，禁止在 `pages/` 之外散落页面文件。

## 3. 代码风格

- 页面与组件统一使用 Vue 3 `<script setup>` 单文件组件，组件名使用 PascalCase（如 `ProductCard.vue`），页面目录名使用 kebab-case。
- 平台差异一律「先条件编译后运行」：用 `#ifdef H5`、`#ifdef MP-WEIXIN` 等条件编译包裹平台专属代码，禁止用运行时 `if` 猜测平台。
- 所有跨端能力统一走 `uni.` 前缀 API（如 `uni.request`、`uni.navigateTo`），禁止直接调用 `wx.` 或浏览器专属接口。
- 注释语言统一为：{{COMMENT_LANGUAGE}}。注释解释设计取舍与平台差异原因，不复述代码；被条件编译的分支必须注明目标平台。
- 单个组件不超过 200 行，模板与逻辑分离；样式默认使用 `scoped`，全局样式只在 `App.vue` 中定义。

## 4. 测试要求

- 测试框架：{{TEST_FRAMEWORK}}（标准 uni-app CLI 项目使用 Vitest）；测试命令：`{{TEST_COMMAND}}`。
- 页面与组件的测试放在与源码同级的 `__tests__/` 目录，命名与被测文件一致（如 `ProductCard.spec.ts`）；纯函数测试放 `utils/__tests__/`。
- 新增业务逻辑必须同时补充测试，覆盖正常路径、边界条件与错误路径；修复缺陷先补一个能复现缺陷的用例。
- 测试中的 `uni.` API 必须被 mock，测试不得依赖真机、网络或平台登录态，保证可重复运行。
- 每次改动至少在一个目标平台完成构建验证（如 `{{BUILD_COMMAND}}`），构建失败不得声称任务完成。

## 5. 安全红线

- 任何密钥、AppSecret、云服务 Token 禁止写入 `manifest.json`、`pages.json` 或源码，必须通过构建时环境变量注入；提交前检查 `manifest.json` 中的小程序 appid 等敏感配置。
- `uni.request` 只能访问白名单内的 HTTPS 域名，域名须在小程序后台配置；禁止关闭 TLS 校验，禁止使用 HTTP 明文或 `http://localhost` 作为生产地址。
- 谨慎使用 `v-html`：仅允许渲染已过滤的可信内容，禁止直接渲染用户输入，防止 XSS。
- 登录鉴权：{{AUTH}}；数据存储：{{DATABASE}}。鉴权与权限校验必须在服务端完成，前端只做交互提示。
- 第三方依赖与 uni-app 插件必须定期执行 `npm audit` 检查已知漏洞，禁止引入来源不明的插件或未审计的 npm 包。

## 6. AI 自查清单

每次写完代码，逐条自检并在回复中说明结果：

- [ ] 技术栈仍为 uni-app + Vue 3，未私换依赖或版本，锁文件已同步
- [ ] 页面已在 `pages.json` 注册，分包写入 `subPackages`，文件位于约定目录
- [ ] 使用 `<script setup>` 与 `uni.` API，平台差异已用条件编译包裹
- [ ] 注释语言为{{COMMENT_LANGUAGE}}，组件与页面命名符合规则
- [ ] 新增逻辑已有{{TEST_FRAMEWORK}}测试，`{{TEST_COMMAND}}` 全部通过
- [ ] 至少一个目标平台构建通过（`{{BUILD_COMMAND}}`），并已检查 `npm audit` 结果
- [ ] 未提交任何密钥、AppSecret 或敏感的 `manifest.json` 配置

## 7. 验证命令

交付前在项目根目录依次运行以下命令，并确认全部通过：

```bash
{{TEST_COMMAND}}
{{BUILD_COMMAND}}
{{LINT_COMMAND}}
```

请按目标平台替换构建命令（H5 为 `build:h5`，微信小程序为 `build:mp-weixin`）；如命令需要额外环境变量，必须在回复中说明，不得跳过后声称完成。
