<!-- 模板名：FastAPI -->

# {{PROJECT_NAME}} 编码规则

> 本规则包由规范生成器生成
> 技术栈：{{STACK}}
> 模板：{{TEMPLATE_LABEL}}
> 生成日期：{{DATE}}

## 1. 技术栈锁定

- 技术栈固定为 **FastAPI**（版本：{{STACK_VERSIONS}}），运行时 Python 版本以 {{STACK_VERSIONS}} 为准；不得替换为 Flask、Django 等其他 Web 框架，也不得更换 ASGI 服务器。
- 包管理器：{{PACKAGE_MANAGER}}，依赖锁文件（如 `uv.lock`）必须入库；构建与虚拟环境统一由 {{BUILD_TOOL}} 管理。
- 核心依赖：{{KEY_DEPS}}。未经用户明确同意不得私换依赖，不得引入与 FastAPI/Pydantic 功能重复的库。
- 不得擅自升降 FastAPI、Pydantic、Uvicorn 的主版本；版本变更需说明理由并同步更新锁文件。
- 项目定位：{{PROJECT_SUMMARY}}。

## 2. 架构与目录约束

- 代码只能放在以下目录：{{TARGET_DIRS}}。临时脚本放入临时目录并在完成后删除。
- `app/main.py` 只负责创建 FastAPI 应用实例、注册路由与中间件，不写业务逻辑。
- `app/routers/` 按资源拆分 `APIRouter`，只做参数校验、依赖注入与响应模型声明。
- `app/schemas/` 放 Pydantic v2 请求/响应模型；`app/models/` 放 ORM 模型；`app/services/` 放业务逻辑；`app/core/` 放配置、数据库会话、安全与全局依赖。
- `tests/` 镜像 `app/` 的目录结构。路由不得直接操作 ORM 会话，必须经 `app/services/` 与依赖注入访问数据层；跨层调用与新增未登记目录需先说明理由。

## 3. 代码风格

- 全量类型注解：函数参数、返回值与关键局部变量都要标注类型，遵循 PEP 8，并以 ruff 格式化与检查结果为准。
- 请求与响应统一使用 Pydantic v2 模型（`model_config`、`Field`、`field_validator`），禁止混用 v1 API 或以裸 dict 作为响应结构。
- 路由函数要瘦：只做参数解析、调用 service、返回响应模型；业务编排放进 `app/services/`。
- 依赖注入统一使用 `Depends`：数据库会话、当前用户、分页参数等通过依赖提供，禁止在函数体内全局实例化。
- 命名遵循 Python 惯例：模块与函数 `snake_case`、类 `PascalCase`、常量 `UPPER_SNAKE`；单函数不超过 40 行、单文件不超过 200 行。
- 注释语言统一为：{{COMMENT_LANGUAGE}}。注释解释「为什么」，不复述代码；公开函数写明用途、参数与返回值。

## 4. 测试要求

- 测试框架：{{TEST_FRAMEWORK}}；测试命令：`{{TEST_COMMAND}}`。
- 路由测试使用 `fastapi.testclient.TestClient`；需要真实 ASGI 生命周期或异步场景时使用 `httpx.AsyncClient` + `ASGITransport`。
- 异步测试必须显式标记（`pytest.mark.asyncio` 或 anyio），并且 pytest-asyncio 配置与事件循环模式必须固定；异步用例中禁止调用阻塞式 IO。
- 分层测试：单元测试覆盖 `app/services/`，接口测试覆盖 `app/routers/`，数据层测试使用独立测试数据库并在用例后回滚，不得依赖本地私有数据与外部网络。
- 测试文件放在 `tests/` 中并镜像被测模块路径，命名为 `test_<module>.py`；新增业务逻辑必须同时新增测试，覆盖正常路径、边界条件与错误路径。
- 提交前必须运行 `{{TEST_COMMAND}}` 且全部通过，测试未通过不得声称任务完成；修复缺陷先补一个能复现缺陷的用例。

## 5. 安全红线

- 禁止把 `SECRET_KEY`、数据库口令、JWT 签名密钥、第三方 API Key 写入代码或提交历史；一律通过环境变量与 pydantic-settings 读取，本地 `.env` 不得入库且必须加入 `.gitignore`。
- CORS 必须在 `app/core/` 中显式配置来源白名单，禁止同时开启 `allow_origins=["*"]` 与 `allow_credentials=True`。
- 登录鉴权：{{AUTH}}。受保护路由必须通过 `Depends` 校验当前用户与权限，鉴权只在服务端完成，不得依赖前端隐藏。
- 数据库：{{DATABASE}}；ORM 访问使用 SQLAlchemy 参数化查询或 ORM 表达式，禁止字符串拼接 SQL；所有外部输入必须用 Pydantic 模型校验并限制长度。
- 依赖漏洞检查：定期运行 `pip-audit`（或等价的依赖审计工具），发现高危漏洞必须升级；禁止关闭 TLS 校验或使用已废弃的加密算法。
- 部署目标：{{DEPLOY_TARGET}}。生产环境必须关闭 debug 模式与详细错误回显。

## 6. AI 自查清单

每次写完代码，逐条自检并在回复中说明结果：

- [ ] 技术栈与版本未被更换，新增依赖已说明理由且锁文件已同步
- [ ] 代码放在 `app/` 与 `tests/` 的约定目录内，未新增未登记的目录
- [ ] 全量类型注解与 Pydantic v2 模型符合本规则，`{{LINT_COMMAND}}` 通过
- [ ] 路由函数保持瘦实现，跨层访问经 `Depends` 与 service 层完成
- [ ] 新增逻辑已有 pytest 测试，`{{TEST_COMMAND}}` 全部通过
- [ ] 没有提交任何密钥、`.env` 文件或令牌，CORS 与鉴权配置符合安全红线
- [ ] `{{BUILD_COMMAND}}` 已运行且无类型错误

## 7. 验证命令

交付前在项目根目录依次运行以下命令，并确认全部通过：

```bash
{{TEST_COMMAND}}
{{BUILD_COMMAND}}
{{LINT_COMMAND}}
```

如命令需要额外环境变量（如数据库连接串）或依赖服务，必须在回复中说明，不得跳过后声称完成。
