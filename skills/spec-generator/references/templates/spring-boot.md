<!-- 模板名：Spring Boot -->
# {{PROJECT_NAME}} 编码规则

> 本规则包由规范生成器生成
> 技术栈：{{STACK}}
> 模板：{{TEMPLATE_LABEL}}
> 生成日期：{{DATE}}

## 1. 技术栈锁定

- 项目技术栈固定为 **{{STACK}}**（版本：{{STACK_VERSIONS}}），Java 运行时与 Spring Boot 版本一经确定不得擅自变更。
- 构建工具：{{BUILD_TOOL}}；包依赖坐标由 Maven（或 Gradle）统一管理，包管理器：{{PACKAGE_MANAGER}}，不得混用其他依赖管理方式。
- 核心依赖锁定为：{{KEY_DEPS}}，其中包括 Spring Web、Spring Data JPA 等官方 starter；新增依赖必须说明用途并优先选择 Spring 官方维护的 starter。
- 禁止私换 Web 框架、ORM 或 JSON 库（例如擅自引入 Quarkus、MyBatis、Jackson 之外的另一套序列化方案），禁止同时存在两套功能重复的实现。
- 不得擅自升级或降级 Spring Boot、Java 主版本与关键 starter 版本；确需变更时必须说明理由、评估兼容性并记录在项目文档中。
- 项目定位：{{PROJECT_SUMMARY}}。

## 2. 架构与目录约束

- 代码只允许放在以下目录：{{TARGET_DIRS}}，遵循标准 Maven 布局（`src/main/java`、`src/main/resources`、`src/test/java`）。
- 按包职责分层：`controller` 只处理 HTTP 参数与响应码，`service` 承载业务编排与事务边界，`repository` 通过 Spring Data JPA 访问数据，`entity` 存放持久化实体，`dto` 存放请求/响应模型，`config` 存放 Security、Jackson 等配置，`exception` 存放全局异常处理。
- 调用方向必须是 `controller` → `service` → `repository`：controller 不得直接注入 repository，service 不得返回 entity 给 controller，禁止同一业务在两个层各写一份实现。
- `@SpringBootApplication` 启动类只放在根包，禁止在子包中重复声明启动类或扫描范围。
- 单个类不超过 200 行；超出时按聚合根或职责拆分，禁止把控制器、业务逻辑与 SQL 堆在同一个类里。
- 新增包或改变包用途前必须说明理由并登记，临时脚本放入约定临时目录并在完成后删除。

## 3. 代码风格

- 依赖注入统一使用**构造器注入**，禁止字段注入（`@Autowired` 打在字段上）；需要多个实现时用 `@Qualifier` 显式区分。
- 事务边界由 `@Transactional` 明确声明在 `service` 层：写操作标注 `@Transactional`，只读查询标注 `@Transactional(readOnly = true)`；禁止在 `controller` 或 `repository` 上开启事务，避免事务范围过大。
- DTO 与实体严格分离：禁止把 `entity` 直接作为请求体或响应体返回，请求 DTO 使用 Jakarta Bean Validation 注解（`@Valid`、`@NotNull`、`@Size`）校验，转换逻辑集中在 mapper 或 service 内。
- 命名遵循 Java 惯例：类用 UpperCamelCase，方法与变量用 lowerCamelCase，常量用 UPPER_SNAKE_CASE；不可变数据载体优先使用 `record`，禁止无意义缩写与拼音混用。
- 遵循 Google Java Style，格式与导入顺序由 Spotless 统一（`{{LINT_COMMAND}}`），不得手工绕过格式化。
- 注释语言统一为：{{COMMENT_LANGUAGE}}。注释解释「为什么」而不复述「做了什么」；公开类与方法用 Javadoc 写明用途、参数与异常。
- 单个方法不超过 40 行、圈复杂度不超过 10；魔法值与硬编码字符串提取为具名常量或配置项。
- 不留下被注释掉的旧实现与调试输出；日志使用 SLF4J 统一格式，禁止打印敏感字段。

## 4. 测试要求

- 测试框架：{{TEST_FRAMEWORK}}；测试命令：`{{TEST_COMMAND}}`。
- 单元测试与集成测试都放在 `src/test/java`，与被测类同包同名并以后缀 `Test` 结尾；纯业务逻辑用 JUnit 5 + Mockito 做单元测试，不启动 Spring 容器。
- 集成测试使用 `@SpringBootTest`，Web 层配合 `@AutoConfigureMockMvc`；数据库依赖用 Testcontainers 或独立的测试数据库，禁止连接开发库或生产库。
- 新增业务逻辑必须同时新增测试，覆盖正常路径、边界条件与错误路径；修复缺陷必须先补一个能复现缺陷的测试。
- 测试必须可重复、可独立运行，不依赖执行顺序与外部网络；外部 HTTP 与消息依赖使用 Mock 替身。
- 提交前必须运行 `{{TEST_COMMAND}}` 且全部通过，测试未通过不得声称任务完成。

## 5. 安全红线

- 禁止把任何密钥、令牌或数据库口令写入代码、`application.yml` 或提交历史；数据库口令（如 `SPRING_DATASOURCE_PASSWORD`）与 JWT 密钥（`JWT_SECRET`）一律通过环境变量注入，本地配置文件只保留占位引用并加入 `.gitignore`。
- 数据库：{{DATABASE}}；登录鉴权：{{AUTH}}。鉴权与权限校验必须在服务端完成，不得只依赖前端隐藏入口。
- 防 **SQL 注入**：禁止用字符串拼接构造 SQL 或 JPQL；优先使用 Spring Data JPA 的方法名查询与 `:param` 绑定参数，原生查询必须使用命名参数，禁止 `String.format` 拼 SQL。
- Spring Security 配置遵循最小权限：默认拒绝未认证请求，按接口显式放行；启用方法级 `@PreAuthorize`，密码使用 BCrypt 加密，禁止无理由关闭 CSRF、全局放开 CORS 或关闭鉴权。
- 禁止在响应中回显堆栈与内部路径；Actuator 端点只在内网或鉴权后开放，生产环境关闭 `show-details`。
- 依赖必须定期做漏洞检查：Maven 项目运行 `./mvnw dependency-check:check`（Gradle 使用 `./gradlew dependencyCheckAnalyze`），出现高危漏洞必须升级或说明处置方案。
- 部署目标：{{DEPLOY_TARGET}}。生产环境默认关闭调试模式与详细错误回显。

## 6. AI 自查清单

每次写完代码，逐条自检并在回复中说明结果：

- [ ] Java 与 Spring Boot 版本、starter 依赖未被擅自更换，新增依赖已说明理由
- [ ] 代码放在约定包内，调用方向符合 `controller` → `service` → `repository`
- [ ] 使用构造器注入，`@Transactional` 只出现在 service 层且读写标注正确
- [ ] DTO 与 entity 已分离，请求参数已加 Bean Validation 校验
- [ ] 命名、注释语言（{{COMMENT_LANGUAGE}}）与 Spotless 格式符合本规则
- [ ] 新增逻辑已有 JUnit 5 测试，`{{TEST_COMMAND}}` 全部通过
- [ ] 没有把任何密钥、令牌或数据库口令写入仓库
- [ ] 构建、静态检查与依赖漏洞检查已跑通（`{{BUILD_COMMAND}}`、`{{LINT_COMMAND}}`、`./mvnw dependency-check:check`）

## 7. 验证命令

交付前在项目根目录依次运行以下命令，并确认全部通过：

```bash
{{TEST_COMMAND}}
{{BUILD_COMMAND}}
{{LINT_COMMAND}}
./mvnw dependency-check:check
```

若项目使用 Gradle 而非 Maven，将 `./mvnw` 前缀替换为 `./gradlew`，并同步替换对应任务的写法。

如命令需要额外环境变量或服务（例如 Testcontainers 需要 Docker），必须在回复中说明，不得跳过后声称完成。
