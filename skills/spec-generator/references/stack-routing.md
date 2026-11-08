# 技术栈路由表

命中精调模板时优先使用精调模板，未命中任何关键词时走最后一行兜底（通用引擎）。

关键词用英文逗号分隔、大小写不敏感、按子串匹配；按表格行序取第一个命中项。模板列为相对 `references/` 目录的路径；「参考脚手架」列用于选择项目脚手架与验收项目，装配器只读取前两列。

| 技术栈关键词 | 模板 | 参考脚手架 |
| --- | --- | --- |
| UniApp, uni-app, uniapp | `templates/uniapp.md` | create-uni（CLI）或 HBuilderX |
| Vue 3, Vue3 | `templates/vue3.md` | create-vue |
| React, React.js, Next.js | `templates/react.md` | create-vite 或 create-next-app |
| Spring Boot, SpringBoot | `templates/spring-boot.md` | start.spring.io（Maven Wrapper） |
| FastAPI, Fast Api | `templates/fastapi.md` | uv init + FastAPI 官方项目结构 |
| 其他任意技术栈 | `generic-engine.md` | 该技术栈的官方脚手架 |

更具体的栈写在前面；不要使用会误命中其他栈的宽泛关键词（如单独的 `Vue`、`Spring`、`小程序`）。
