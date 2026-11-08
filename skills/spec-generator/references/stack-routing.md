# 技术栈路由表

命中精调模板时优先使用精调模板，未命中任何关键词时走最后一行兜底（通用引擎）。

关键词用英文逗号分隔、大小写不敏感、按子串匹配；按表格行序取第一个命中项。模板列为相对 `references/` 目录的路径。

| 技术栈关键词 | 模板 |
| --- | --- |
| Vue 3, Vue3, Vue | `templates/vue3.md` |
| React, React.js, Next.js | `templates/react.md` |
| Spring Boot, SpringBoot, Spring | `templates/spring-boot.md` |
| FastAPI, Fast Api | `templates/fastapi.md` |
| UniApp, uni-app, uniapp, 小程序 | `templates/uniapp.md` |
| 其他任意技术栈 | `generic-engine.md` |
