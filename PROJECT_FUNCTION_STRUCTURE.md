# TeamMind 项目功能结构文档

本文档面向队友和 AI 协作者，帮助快速理解当前 MVP 的技术栈、文件结构、功能边界、数据流和未来扩展点。

## 1. 项目定位

TeamMind 是一个公司专属上下文 Agent 工作台。当前版本是零后端静态 MVP，重点跑通：

```text
上下文输入 -> 公司记忆 -> 下一步行动 -> 行动 Brief -> 结果回流 -> 新记忆和新行动
```

它不是聊天机器人，不以对话流为主；也不是 prompt 生成器，不只输出一次性文本。它的核心资产是项目内持续积累的结构化公司记忆和行动闭环。

## 2. 技术栈

当前 MVP：

- 前端：HTML、CSS、原生 JavaScript。
- 模块系统：ES Modules。
- 状态管理：应用内 JavaScript state。
- 持久化：浏览器 localStorage。
- 本地预览：Python `http.server`。
- 测试方式：Node smoke test。
- 部署方式：任意静态托管服务。
- 仓库：GitHub 私有仓库 `skeleton2024/team-brain`。

当前不依赖：

- React/Vue/Svelte。
- 后端服务。
- 数据库。
- LLM API。
- 外部 SaaS 集成。
- 构建工具。

选择原因：

- 启动快，适合 MVP 演示。
- 无需 API Key、数据库或鉴权。
- 对队友和 AI 都容易阅读。
- 后续可逐层替换为真实 LLM、数据库和集成适配器。

## 3. 文件结构

```text
team-brain/
  index.html
  README.md
  PRD.md
  PROJECT_FUNCTION_STRUCTURE.md
  package.json
  scripts/
    smoke-test.mjs
  src/
    main.js
    styles.css
    data/
      demo.js
    domain/
      agentEngine.js
      types.js
    services/
      store.js
    ui/
      render.js
```

## 4. 文件职责

### `index.html`

静态应用入口。

职责：

- 提供根节点 `#app`。
- 加载 `src/styles.css`。
- 加载 `src/main.js`。

### `src/main.js`

应用状态和交互入口。

职责：

- 读取本地状态。
- 渲染 UI。
- 绑定表单和按钮事件。
- 处理项目创建、项目切换、上下文吸收、Brief 生成、结果回流、Demo 重置和 JSON 导出。
- 调用 domain 层的 Agent 引擎。
- 调用 store 层保存状态。

关键函数：

- `render()`
- `bindEvents()`
- `handleCreateProject()`
- `handleAbsorbContext()`
- `handleRecordResult()`
- `updateActiveProject()`
- `setState()`
- `exportState()`

### `src/styles.css`

完整界面样式。

职责：

- 工作台布局。
- 侧边栏项目列表。
- 顶部闭环计数。
- 上下文输入表单。
- 记忆分组。
- 行动列表。
- Brief 面板。
- 结果回流表单。
- 响应式布局。

设计方向：

- 工作台优先，不做营销页。
- 信息密度适中，适合 60 秒演示。
- 使用低干扰视觉风格，让行动和记忆成为主角。

### `src/data/demo.js`

内置 Demo 数据。

职责：

- 提供 `DEMO_PROJECT`。
- 初始化项目 `Northstar Copilot`。
- 预置上下文、记忆和行动。
- 支持首次打开和重置 Demo。

Demo 覆盖：

- 客户顾虑。
- 风险点。
- 产品决策。
- 工程阻塞。
- 团队限制。
- 客户 follow-up。
- Coding Brief。
- 产品路线整理。

### `src/domain/types.js`

共享枚举和展示标签。

职责：

- 上下文类型。
- 记忆类型。
- 行动类型。
- 优先级标签。
- 风险标签。
- 行动状态。
- 结果状态。

适合新增类型的位置：

- 新增上下文类型：改 `CONTEXT_TYPES`。
- 新增记忆类型：改 `MEMORY_TYPES`。
- 新增行动类型：改 `ACTION_TYPES`。
- 新增结果状态：改 `RESULT_OUTCOMES`。

### `src/domain/agentEngine.js`

本地 Agent 引擎。当前是 deterministic rule engine，未来可替换为真实 LLM provider。

职责：

- 从文本中提取公司记忆。
- 根据记忆生成行动建议。
- 根据行动生成 Brief。
- 根据执行结果生成新记忆和新行动。
- 控制高风险动作只输出草稿和人工确认项。

对外导出：

- `absorbContext(project, input)`
- `generateBrief(project, actionId)`
- `recordActionResult(project, actionId, resultInput)`

内部核心模块：

- `MEMORY_RULES`：关键词到记忆类型的规则。
- `ACTION_BY_MEMORY_TYPE`：记忆类型到行动模板的映射。
- `extractMemories()`：文本切分和记忆提取。
- `proposeActions()`：根据新记忆生成行动。
- `buildBrief()`：生成结构化 Brief。
- `proposeResultActions()`：根据结果回流生成后续行动。

未来替换建议：

- 保留三个对外函数签名。
- 把内部规则替换为 `AgentProvider`。
- 让 LLM 返回结构化 JSON。
- 增加 schema 校验。
- 保留安全规则作为 LLM 输出后的 guardrail。

### `src/services/store.js`

本地持久化服务。

职责：

- 创建初始状态。
- 从 localStorage 读取状态。
- 保存状态到 localStorage。
- 重置 Demo。
- 创建项目。
- 创建 ID。

关键常量：

- `STORAGE_KEY = "teammind.mvp.state.v1"`

未来替换建议：

- 保留函数接口。
- localStorage 可替换为 Supabase、Postgres 或 API client。
- `makeProject()` 后续可加入 owner、members、permissions、integrations。

### `src/ui/render.js`

纯 UI 渲染层。

职责：

- 根据 state 生成 HTML 字符串。
- 渲染侧边栏。
- 渲染顶部项目信息。
- 渲染闭环 pipeline。
- 渲染上下文输入。
- 渲染公司记忆。
- 渲染行动列表。
- 渲染行动 Brief。
- 渲染结果回流表单。

原则：

- 不直接修改状态。
- 不调用 localStorage。
- 不包含业务推理逻辑。
- 只根据输入 state 输出 UI。

### `scripts/smoke-test.mjs`

核心闭环烟雾测试。

职责：

- 导入 Demo 项目。
- 模拟吸收上下文。
- 生成行动。
- 生成 Brief。
- 回流结果。
- 检查上下文、记忆、行动、Brief 和结果数量是否有效。

运行方式：

```bash
node scripts/smoke-test.mjs
```

## 5. 功能模块结构

### 5.1 项目空间

用户入口：

- 左侧项目列表。
- 新项目输入框。

数据对象：

- `Project`

主要状态：

- `state.activeProjectId`
- `state.projects`

主要交互：

- 创建项目。
- 切换项目。
- 每个项目独立保存上下文、记忆、行动、Brief 和结果。

### 5.2 上下文输入

用户入口：

- “上下文输入”面板。

输入字段：

- 类型 `kind`。
- 标题 `title`。
- 正文 `body`。

处理流程：

```text
form submit
-> handleAbsorbContext()
-> absorbContext(project, input)
-> extractMemories()
-> proposeActions()
-> saveState()
-> render()
```

输出：

- 新 Context。
- 新 Memory。
- 新 Action。

### 5.3 公司记忆

用户入口：

- “公司记忆”面板。

展示方式：

- 按记忆类型分组。
- 每组展示标题、详情、来源和置信度。

记忆类型：

- `customer_concern`
- `investor_question`
- `product_decision`
- `engineering_blocker`
- `team_constraint`
- `risk`
- `opportunity`
- `fact`
- `result_learning`

### 5.4 下一步行动

用户入口：

- “下一步行动”面板。

行动状态：

- `pending`：待处理。
- `briefed`：已生成 Brief。
- `done`：已回流。

展示信息：

- 行动类型。
- 状态。
- 标题。
- 生成理由。
- 优先级。
- 风险等级。

处理流程：

```text
Memory[]
-> proposeActions()
-> Action[]
-> UI action list
```

### 5.5 行动 Brief

用户入口：

- 点击行动卡片。
- 点击“生成 Brief”。

处理流程：

```text
click generate brief
-> generateBrief(project, actionId)
-> buildBrief()
-> saveState()
-> render()
```

Brief 结构：

- 目标 `goal`。
- 已知背景 `background`。
- 建议策略 `strategy`。
- 草稿内容 `draft`。
- 风险提醒 `risks`。
- 成功标准 `successCriteria`。
- 人工确认清单 `checklist`。

安全原则：

- Brief 只生成草稿。
- 对外发送前必须人工确认。
- 高风险事项需要负责人确认。

### 5.6 结果回流

用户入口：

- Brief 面板下方的“结果回流”表单。

输入字段：

- 结果摘要 `summary`。
- 结果状态 `outcome`。

处理流程：

```text
form submit
-> handleRecordResult()
-> recordActionResult(project, actionId, resultInput)
-> extractMemories(result summary)
-> proposeResultActions()
-> original action marked done
-> saveState()
-> render()
```

输出：

- 新 Result。
- 新 result_learning Memory。
- 可能的新风险、客户顾虑、工程阻塞等记忆。
- 新后续行动。

### 5.7 Demo 与导出

Demo：

- 首次打开自动载入。
- 可点击“重置 Demo”恢复初始数据。

导出：

- 点击“导出 JSON”下载当前 state。
- 方便调试、分享和未来迁移。

## 6. 数据流

完整主链路：

```text
User input text
-> src/main.js handleAbsorbContext()
-> src/domain/agentEngine.js absorbContext()
-> Context created
-> Memory extracted
-> Action proposed
-> src/services/store.js saveState()
-> src/ui/render.js renderApp()
```

Brief 链路：

```text
User selects action
-> generateBrief()
-> source memories resolved
-> Brief sections created
-> action status becomes briefed
-> UI updates
```

结果回流链路：

```text
User records result
-> recordActionResult()
-> Result created
-> result learning memory created
-> follow-up actions proposed
-> original action becomes done
-> UI updates
```

## 7. 当前规则引擎说明

当前 `agentEngine` 使用关键词分类，不调用外部模型。

示例：

- 出现“客户、用户、担心、隐私、权限、数据”等，倾向生成客户顾虑。
- 出现“投资人、融资、估值、市场、壁垒”等，倾向生成投资人问题。
- 出现“工程、技术、bug、API、部署、GitHub、Slack”等，倾向生成工程阻塞。
- 出现“风险、合规、承诺、自动发送、敏感”等，倾向生成风险点。

优点：

- 可离线运行。
- 输出稳定。
- 方便演示。
- 方便调试。

限制：

- 语义理解有限。
- 对长文本的结构化能力有限。
- 无法进行复杂推理。
- 无法引用历史上下文做深层判断。

## 8. 未来扩展接口

### 8.1 LLM Provider

建议新增：

```text
src/services/agentProvider.js
```

职责：

- 封装 OpenAI 或其他模型调用。
- 接收项目上下文、历史记忆和用户输入。
- 返回结构化 JSON。

需要保留：

- `absorbContext(project, input)`
- `generateBrief(project, actionId)`
- `recordActionResult(project, actionId, resultInput)`

### 8.2 数据库

当前：

- localStorage。

未来：

- Supabase。
- Postgres。
- SQLite。
- 自建 API。

建议优先替换 `src/services/store.js`，不要让 UI 直接依赖数据库。

### 8.3 向量检索

未来新增：

- Memory embedding。
- Context chunk embedding。
- Project-level retrieval。
- Brief 生成时检索相关历史。

建议位置：

```text
src/services/retrievalService.js
```

### 8.4 外部集成

未来可增加 adapters：

```text
src/integrations/
  githubAdapter.js
  notionAdapter.js
  slackAdapter.js
  gmailAdapter.js
  linearAdapter.js
```

安全要求：

- 第一阶段只读。
- 写入动作必须草稿优先。
- 发送、承诺、merge、关闭 issue 等高风险动作必须二次确认。

### 8.5 多成员与权限

未来数据模型可扩展：

- `workspaceId`
- `ownerId`
- `members`
- `roles`
- `permissions`
- `auditLogs`

权限原则：

- 默认项目私有。
- 外部集成按项目授权。
- 高风险行动需要负责人确认。

## 9. AI 协作提示

AI 修改本项目时应遵守：

- 不要把产品改成聊天机器人。
- 不要把主界面改成 prompt 输入器。
- 优先维护闭环：上下文、记忆、行动、Brief、结果回流。
- 不要自动执行外部动作。
- 保留人工确认清单。
- 新功能先考虑是否能增强闭环。
- UI 层不要塞业务推理逻辑。
- 存储逻辑集中在 `services/store.js`。
- Agent 逻辑集中在 `domain/agentEngine.js` 或未来 provider。
- 修改后运行 `node scripts/smoke-test.mjs`。

## 10. 本地运行

推荐：

```bash
python -m http.server 4173
```

或者：

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:4173
```

验证：

```bash
node scripts/smoke-test.mjs
```
