# TeamMind 全文件功能备注

用途：给人类队友和 AI 协作者快速理解仓库里每个文件的作用、修改边界和检查重点。  
最后更新：2026-05-13

## 1. 根目录文件

### `README.md`

项目入口说明。它面向第一次打开仓库的人，解释 TeamMind 是什么、MVP 范围、本地运行方式和当前架构。

主要作用：

- 给出项目的一句话定位。
- 列出 MVP 当前已有能力。
- 指向核心产品和开发文档。
- 说明如何用 `npm run dev` 或 `python -m http.server 4173` 本地运行。
- 说明当前不是生产级后端产品。

修改时注意：

- 新增重要文档时，应在 Product Docs 中加链接。
- 不要把详细需求全部塞进 README，详细内容放 PRD 或 issue spec。

### `最终产品形态.md`

长期产品愿景文档。它回答“TeamMind 最终要成为怎样的公司级 AI operating system”。

主要作用：

- 定义终极产品形态。
- 说明 Inbox、Memory、Entity、Project、Action、Agent、Command Center 等长期模块。
- 作为后续阶段规划和优先级判断的最高层产品上下文。

修改时注意：

- 只有长期产品共识变化时才修改。
- 不要把具体实现细节或短期 issue 执行记录塞进这里。

### `AI_HANDOFF.md`

AI 接手入口文档。它给新的 Codex / AI 对话框快速恢复当前上下文。

主要作用：

- 说明当前产品判断。
- 列出开发前必须阅读的文档。
- 记录当前稳定分支和下一步。
- 减少长对话结束后上下文丢失。

修改时注意：

- 每完成 2-3 个 issue 或一个 Wave 后更新。
- 保持简短，只写接手必须知道的信息。

### `当前系统状态.md`

当前系统状态文档。它记录已完成、仍偏 demo、下一阶段和风险。

主要作用：

- 给新对话说明当前代码和产品实际状态。
- 区分已完成能力、demo 形状和未完成能力。
- 指向下一阶段 Wave 计划。

修改时注意：

- Wave 结束后必须更新。
- 不要把详细日志塞进这里，详细日志放 `docs/TEAM_DEV_LOG.md`。

### `PRD.md`

v0.2 产品需求文档。它回答“为什么做、先做什么、不做什么”。

主要作用：

- 定义 TeamMind 的产品定位：公司专属上下文 Agent。
- 定义核心闭环：Context Intake -> Memory Extraction -> Memory Reconciliation -> Top 3 Action Planning -> Scenario Brief -> Result Feedback -> Memory Update。
- 记录 v0.2 的目标、里程碑和不做范围。
- 给后续 issue 开发提供产品判断标准。

修改时注意：

- 行为或产品边界变化必须同步更新这里。
- 不要把 TeamMind 改成聊天机器人、prompt 工具或普通知识库问答。

### `PROJECT_FUNCTION_STRUCTURE.md`

项目功能结构和架构边界文档。它回答“代码应该放在哪里、模块边界是什么”。

主要作用：

- 说明当前文件结构。
- 定义 v0.2 目标架构。
- 解释 UI、App Controller、Domain、Services、Data 的职责。
- 说明未来要新增的 pipeline、schema、provider、repository 文件。
- 给 AI 协作者提供修改守则。

修改时注意：

- 新增目录或改变模块职责时同步更新。
- 保持它和 `DATA_MODEL.md`、`docs/issues/` 一致。

### `DATA_MODEL.md`

v0.2 数据模型基准文档。它回答“数据对象长什么样、字段怎么流转”。

主要作用：

- 定义 `AppState`、`Project`、`ContextItem`、`MemoryItem`、`ActionItem`、`Brief`、`ActionResult`、`AgentRun` 等目标模型。
- 定义 memory status、action status、source references、reconciliation result。
- 说明旧数据迁移、AI 输出校验和写入安全规则。

修改时注意：

- 新增或修改字段时必须先或同时更新这里。
- 不要在代码里发明和本文档冲突的同义字段。

### `package.json`

Node 项目配置和本地脚本入口。

主要作用：

- 声明项目名、版本、模块类型。
- 提供 `npm run dev` 和 `npm run start`，本质都是启动 Python 静态服务器。
- 提供 `npm run smoke`，执行 `scripts/smoke-test.mjs`。

修改时注意：

- 当前项目没有构建工具和依赖包，新增依赖前要确认确实必要。
- 如果引入前端框架或测试框架，需要同步更新 README 和架构文档。

### `index.html`

静态应用 HTML 入口。

主要作用：

- 声明中文页面和 viewport。
- 加载 `src/styles.css`。
- 提供根节点 `#app`。
- 以 ES Module 方式加载 `src/main.js`。

修改时注意：

- 这里不放业务逻辑。
- 如果新增全局资源或 meta 信息，应保持静态部署兼容。

## 2. `docs/` 协作文档

### `docs/TEAM_DEV_LOG.md`

团队共享开发日志。

主要作用：

- 记录当前协作结论。
- 说明远程仓库、分支现状和是否存在 `dev` 分支。
- 给出 v0.2 issue 开发顺序。
- 维护任务看板、易冲突文件、完成标准和开发日志。

修改时注意：

- 每次开始或完成重要 issue，可以追加日志。
- 这里记录协作事实和决策，不替代 issue spec。

### `docs/AI_DEVELOPMENT_GUIDE.md`

AI 和开发者开发规范指南。

主要作用：

- 说明 AI 每次开发前应阅读哪些上下文文档。
- 定义一个主对话跑一个 Wave 的默认开发方式。
- 定义哪些任务可以并行、哪些必须串行。
- 定义 issue 分支、wave integration、阶段 integration 和 draft PR 规则。
- 定义开工说明、改后总结、文档同步和验证规则。
- 约束产品边界：不改成聊天产品，不做自动外部执行。

修改时注意：

- 改变协作流程、AI 开发规则或分支策略时同步更新。
- 不要在这里重复完整 PRD 或数据模型，只写开发行为规范。

### `docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md`

Phase 3 Alpha 开发计划。它把下一阶段拆成 Wave、issue、并行规则和开发 prompt。

主要作用：

- 定义 Phase 3 Alpha 的阶段目标。
- 给出 Wave 0 到 Wave 4 的开发顺序。
- 写清每轮哪些任务可以并行、哪些需要串行。
- 提供每轮可以直接交给 Codex 的开发 prompt。

修改时注意：

- Phase 3 Alpha 的开发顺序变化时同步更新。
- 后续 Phase 4 / Phase 5 应新增独立阶段计划，不要把所有未来内容塞进这个文件。

### `docs/FILE_FUNCTION_NOTES.md`

当前文件，也就是全文件功能备注。

主要作用：

- 逐一说明仓库内所有文件的职责。
- 标明修改时容易影响的边界。
- 帮助人类和 AI 快速检查文件作用。

修改时注意：

- 新增文件后要在这里补一节。
- 文件职责发生变化时要同步更新。

## 3. `docs/issues/` Issue 规格

### `docs/issues/README.md`

issue 开发说明总览。

主要作用：

- 说明 issue spec 的写法和用途。
- 说明 issue 命名、模板、验收和分支规则。
- 指向当前阶段 Wave 计划。
- 区分历史 Milestone 1 issue 和后续 Phase 3 Alpha issue。

修改时注意：

- 新增 issue 后应检查这里的顺序是否需要更新。

### `docs/issues/CTX-01-context-metadata.md`

上下文元数据 issue。

主要作用：

- 让上下文输入支持发生日期、参与人、标签和重要程度。
- 要求 demo 数据和持久化同步升级。
- 为后续 source references 和 context detail 打基础。

通常会改：

- `src/domain/types.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/data/demo.js`

### `docs/issues/CTX-03-context-memory-source-links.md`

上下文和记忆来源引用 issue。

主要作用：

- 要求每条 memory 带 `sourceReferences`。
- source reference 至少包含 `contextId` 和原文片段。
- 为用户从记忆回到原始上下文验证判断打基础。

通常会改：

- `src/domain/types.js`
- `src/domain/agentEngine.js`
- 未来的 `src/domain/pipelines/extractMemories.js`
- `src/ui/render.js`

### `docs/issues/MEM-01-memory-status-source-references.md`

memory 状态和来源引用 issue。

主要作用：

- 给 `MemoryItem` 增加 `status`、`sourceReferences`、`createdBy`、`updatedAt`、`lastVerifiedAt`。
- 新 AI memory 默认 `draft`。
- UI 显示状态 badge、来源数量和置信度。

通常会改：

- `src/domain/types.js`
- `src/domain/agentEngine.js`
- 未来的 `src/domain/pipelines/extractMemories.js`
- `src/ui/render.js`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

### `docs/issues/MEM-02-edit-company-memory.md`

编辑公司记忆 issue。

主要作用：

- 允许用户编辑 memory 的标题、类型、内容和状态。
- 保存后刷新仍保留。
- 保证编辑不会破坏 action 关联。

通常会改：

- `src/ui/render.js`
- `src/main.js`
- `src/services/store.js`

### `docs/issues/MEM-03-memory-status-transitions.md`

memory 状态流转 issue。

主要作用：

- 支持 confirmed、outdated、disputed、archived 等状态切换。
- 后续 action planning 会优先使用 confirmed memory。
- outdated 和 archived 默认不参与新行动生成。

通常会改：

- `src/domain/types.js`
- `src/ui/render.js`
- `src/main.js`
- `src/domain/agentEngine.js`

### `docs/issues/MEM-04-memory-detail-panel.md`

memory 详情面板 issue。

主要作用：

- 显示单条记忆详情。
- 展示来源上下文。
- 展示相关行动和结果。
- 支持从 memory 跳回 source context。

通常会改：

- `src/ui/render.js`
- `src/main.js`

### `docs/issues/REC-01-extract-memories-pipeline.md`

拆出 memory 提取 pipeline issue。

主要作用：

- 把 `agentEngine.js` 里的 memory 提取逻辑迁移到 `src/domain/pipelines/extractMemories.js`。
- 保持 `absorbContext()` 对外行为不变。
- 让 `agentEngine.js` 更像 orchestrator。

通常会改：

- `src/domain/agentEngine.js`
- `src/domain/pipelines/extractMemories.js`
- `scripts/smoke-test.mjs`

### `docs/issues/REC-02-reconcile-memories-pipeline.md`

新增 memory reconcile pipeline issue。

主要作用：

- 在候选记忆写入前与已有记忆比较。
- 输出新增、重复、更新、冲突、过期建议。
- 为后续人工处理冲突打基础。

通常会改：

- `src/domain/pipelines/reconcileMemories.js`
- `src/domain/agentEngine.js`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`

## 4. `scripts/` 文件

### `scripts/smoke-test.mjs`

核心闭环 smoke test。

主要作用：

- 从 `DEMO_PROJECT` 克隆一个项目。
- 调用 `absorbContext()` 模拟新增上下文。
- 找到一个未完成 action。
- 调用 `generateBrief()` 生成 Brief。
- 调用 `recordActionResult()` 写入结果回流。
- 检查 contexts、memories、actions、briefs、results 都存在。
- 直接检查 `extractMemories()` pipeline 输出 `{ memories, runSummary }`，并确认候选记忆带 `sourceReferences`。

修改时注意：

- 每个 issue 完成后都要能通过它。
- 数据模型升级后，应补充对应断言，避免只检查数量。
- 不依赖浏览器 DOM，便于 Node 中执行。

## 5. `src/` 应用代码

### `src/main.js`

应用控制器。

主要作用：

- 加载或创建初始 state。
- 调用 `renderApp(state)` 渲染页面。
- 绑定创建项目、吸收上下文、生成 Brief、结果回流、重置 Demo、导出 JSON 等事件。
- 调用 domain 层的 `absorbContext()`、`generateBrief()`、`recordActionResult()`。
- 调用 store 层的 `loadState()`、`saveState()`、`resetState()`、`makeProject()`。
- 管理 `activeProjectId` 和 `selectedActionId`。

修改时注意：

- 不要在这里写复杂业务推理。
- UI 新按钮通常需要在这里绑定事件。
- 数据结构变化时，要确认表单读取和 state 更新逻辑同步。
- 多人协作时这里很容易冲突。

### `src/styles.css`

全局界面样式。

主要作用：

- 定义颜色、字体、布局和响应式规则。
- 控制 sidebar、topbar、pipeline、四栏工作区、memory card、action card、brief card、表单等视觉表现。
- 提供状态 badge、类型色点、空状态和移动端布局。

修改时注意：

- 当前 UI 是静态原生 CSS，没有组件库。
- 新 UI 状态要保证移动端不溢出。
- 不要让界面变成聊天产品布局。
- 颜色和圆角应保持现有克制风格。

### `src/data/demo.js`

内置 demo 项目数据。

主要作用：

- 提供 `DEMO_PROJECT`。
- 初始化一个名为 `Northstar Copilot` 的演示项目。
- 包含一条 context、五条 memory、三条 action。
- 让用户打开页面即可看到完整产品形态。

修改时注意：

- 每次数据模型新增字段，都要同步 demo 数据。
- demo 应覆盖新增能力，例如 memory status、sourceReferences、context metadata。
- demo 不应包含真实敏感信息。

### `src/domain/types.js`

共享类型枚举和展示标签。

主要作用：

- 定义 `CONTEXT_TYPES`。
- 定义 `MEMORY_TYPES` 及其标签、短标签和色调。
- 定义 `ACTION_TYPES`。
- 定义 priority、risk、action status、result outcome 的展示标签。

修改时注意：

- 新增状态、类型或标签时，同步 `DATA_MODEL.md` 和 UI。
- 这里只放稳定常量，不放业务函数。
- 当前已有 memory status 展示常量，MEM-03 会继续补状态流转。

### `src/domain/agentEngine.js`

当前本地规则 Agent 引擎。

主要作用：

- 暴露核心闭环入口：`absorbContext(project, input)`、`generateBrief(project, actionId)`、`recordActionResult(project, actionId, resultInput)`。
- 调用 `extractMemories()` pipeline 把上下文转成候选 memory。
- 为 memory 生成 action。
- 为 action 生成通用 Brief。
- 处理结果回流并生成 result learning memory 和 follow-up actions。

当前内部职责：

- `proposeActions()`：按 memory type 生成 action。
- `buildBrief()`：生成通用 brief sections。
- `recordActionResult()`：写入结果并产生新的记忆和后续行动。

修改时注意：

- v0.2 会逐步把内部逻辑拆到 `src/domain/pipelines/*`。
- 对外三个入口应尽量保持稳定，减少 UI 层改动。
- 不要在这里直接调用外部 SaaS 或真实发送动作。
- 新增 AI 输出时必须保证可追溯、可校验。

### `src/domain/pipelines/extractMemories.js`

记忆提取 pipeline。

主要作用：

- 暴露 `extractMemories({ project, context, now })`。
- 用本地关键词规则把 `ContextItem.body` 拆成候选 `MemoryItem`。
- 为每条候选 memory 补齐 `status`、`sourceReferences`、`createdBy`、`createdAt` 和 `updatedAt`。
- 返回 `{ memories, runSummary }`，不直接保存或修改 project state。

修改时注意：

- 不在这里做 reconciliation，也不直接过滤已有记忆；去重仍由 `agentEngine.js` 编排。
- 后续接真实 AI provider 时，应保持输出结构稳定并补 schema 校验。
- 每条 AI 生成的 memory 必须能追溯到 `context.id`。

### `src/services/store.js`

本地持久化服务。

主要作用：

- 定义 localStorage key：`teammind.mvp.state.v1`。
- 创建初始 state。
- 从 localStorage 读取 state。
- 保存 state。
- 重置 demo state。
- 创建新 project。
- 生成稳定 ID。

修改时注意：

- 当前依赖浏览器 `window.localStorage`，Node smoke test 不直接调用 `loadState()`。
- v0.2 需要增加 `schemaVersion` 和 migration。
- 未来会把 localStorage 细节迁移到 repository abstraction。
- 不要把业务判断放进 store。

### `src/ui/render.js`

HTML 渲染层。

主要作用：

- `renderApp(state)` 根据当前 state 输出完整页面 HTML。
- 渲染 sidebar、topbar、pipeline、上下文输入、memory 列表、action 列表、brief 面板和结果回流表单。
- 暴露 `getActiveProject(state)` 给 controller 使用。
- 提供 `escapeHtml()` 防止用户输入直接破坏 HTML。

当前主要渲染函数：

- `renderSidebar()`
- `renderTopbar()`
- `renderPipeline()`
- `renderContextIntake()`
- `renderMemories()`
- `renderActions()`
- `renderBrief()`
- `renderBriefSections()`

修改时注意：

- 这里只负责展示，不做业务推理。
- 新增交互入口要提供稳定 `data-*` 属性给 `main.js` 绑定。
- 用户输入展示必须继续经过 `escapeHtml()`。
- 这是当前最容易产生 merge conflict 的文件之一。

## 6. 未来计划文件

这些文件在 v0.2 文档中已经规划，但当前仓库还不存在：

- `src/domain/schemas.js`
- `src/domain/pipelines/reconcileMemories.js`
- `src/domain/pipelines/planActions.js`
- `src/domain/pipelines/composeBrief.js`
- `src/domain/pipelines/processResult.js`
- `src/services/agentProvider.js`
- `src/services/repositories/localProjectRepository.js`

新增这些文件时，应同步更新：

- `PROJECT_FUNCTION_STRUCTURE.md`
- `DATA_MODEL.md`
- `docs/FILE_FUNCTION_NOTES.md`
- 对应 issue spec
- `scripts/smoke-test.mjs`

## 7. 快速检查清单

人类或 AI 修改前先确认：

- 当前改动对应哪个 issue？
- 是否涉及数据模型？
- 是否要更新 demo？
- 是否会影响 `render.js`、`main.js` 或 `agentEngine.js` 的共享区域？
- 是否需要更新 smoke test？
- 是否保持“草稿/人工确认优先，不自动外部执行”的产品边界？

修改后至少运行：

```bash
node scripts/smoke-test.mjs
```
