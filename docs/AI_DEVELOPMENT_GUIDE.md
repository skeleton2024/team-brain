# TeamMind AI Development Guide

用途：规范 AI 协作者和团队成员如何阅读项目、修改代码、更新文档，并留下可审计、可追溯、可恢复的开发记录。  
适用对象：Codex、其他 AI 编程助手、人类开发者。  
最后更新：2026-05-12

## 1. 核心原则

TeamMind 当前处在早期快速开发阶段。开发规则的目的不是阻止所有错误，而是让每次改动都能被团队理解、复盘和修正。

原则：

- 优先推进真实开发，不为流程本身卡死。
- 允许小范围试错，但必须留下足够上下文。
- 每次改动都要能回答：为什么改、改了哪里、怎么验证、风险是什么。
- 文档是项目共享记忆，不是审批表。
- 分支策略服务协作，不服务形式主义。
- AI 可以判断失误，但不能无记录地改动。

## 2. 产品边界

TeamMind 是公司专属上下文 Agent，不是聊天机器人、prompt 模板市场或普通知识库问答。

开发时必须遵守：

- 不把主界面改成聊天产品。
- 不优先做外部集成。
- 不自动发送邮件、Slack、Gmail、Notion、GitHub、Linear/Jira 等外部动作。
- 不自动承诺价格、法务、融资、客户谈判或数据权限事项。
- 不自动修改、提交、merge 外部代码仓库。
- 高风险动作必须保留人工确认。
- AI 或规则生成的记忆、行动、Brief、结果更新，都应该逐步具备来源、证据或运行记录。

## 3. 每次开发需要阅读的上下文

AI 每次开发前不需要机械逐字读完所有文档，但必须根据任务读取足够上下文，并在开工说明里写明“已参考哪些文件”。

### 3.1 默认上下文

每次正式开发默认应参考：

- `README.md`
- `PRD.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `DATA_MODEL.md`
- `docs/TEAM_DEV_LOG.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/issues/README.md`
- 当前任务对应的 issue spec，如果已有

这些文件分别回答：

- `README.md`：项目是什么，怎么运行。
- `PRD.md`：产品边界、v0.2 目标、不做范围。
- `PROJECT_FUNCTION_STRUCTURE.md`：代码模块边界和目标架构。
- `DATA_MODEL.md`：核心数据对象、字段和状态流转。
- `docs/TEAM_DEV_LOG.md`：当前协作状态、分支、任务看板和决策。
- `docs/FILE_FUNCTION_NOTES.md`：每个文件的职责和修改注意事项。
- `docs/issues/README.md`：issue 开发顺序、规则和验收底线。
- 当前 issue spec：本次具体任务的目标、涉及模块、不做范围和验收标准。

### 3.2 按任务类型追加阅读

如果改 UI，重点阅读：

- `src/ui/render.js`
- `src/styles.css`
- `src/main.js`

如果改数据模型，重点阅读：

- `DATA_MODEL.md`
- `src/data/demo.js`
- `src/services/store.js`
- 相关 issue spec

如果改 domain / agent 逻辑，重点阅读：

- `src/domain/agentEngine.js`
- `src/domain/types.js`
- 未来相关 `src/domain/pipelines/*`

如果改持久化，重点阅读：

- `src/services/store.js`
- 未来相关 `src/services/repositories/*`
- `DATA_MODEL.md`

如果改测试或验收，重点阅读：

- `scripts/smoke-test.mjs`
- 当前 issue spec 的验收标准

如果新增、删除、重命名文件，重点阅读：

- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- 相关 issue spec

如果任务很小，例如错字、链接、单个说明文案，可以只阅读直接相关文件，但改完仍要说明实际改动。

## 4. 开工前需要留下的记录

AI 或开发者开始改动前，应先输出简短开发说明。目的不是审批，而是留下可追溯上下文。

建议格式：

```text
已参考：
本次目标：
预计改动：
风险点：
验证方式：
```

如果是正式 issue 或影响核心闭环的改动，建议补充：

```text
本次 issue：
所属领域：
明确不做：
可能冲突文件：
需要同步更新的文档：
```

如果任务来自临时想法，而不是已有 issue，需要先判断并说明：

```text
是否已有 issue 覆盖？
是否需要新建 issue spec？
是否可以直接作为小改动处理？
是否应该推迟到后续 milestone？
```

没有 issue 归属并不绝对禁止开发，但必须说明本次改动目的和风险。

## 5. 分支规则

分支策略服务协作，不服务形式主义。

默认建议：

- 重要 issue 使用独立分支。
- 多人协作时，尽量避免同时大改同一个文件。
- `main` 保持相对稳定。
- 半成品进入 `main` 前必须说明风险。
- 长期实验或不确定方案使用 `spike/` 或 `codex/spike-` 分支。

允许：

- 多个强相关 issue 在同一个分支中合并开发。
- 多人共同使用一个开发分支。
- 文档小修、说明补充、轻量维护直接在当前分支完成。
- 出现错误后通过后续提交修正，而不是追求每次提交完美。

当前状态：

- 当前没有长期 `dev` 分支。
- `npm run dev` 只是本地开发服务器命令，不是 Git 分支。
- 如果未来引入长期 `dev` 分支，需要更新本指南和 `docs/TEAM_DEV_LOG.md`。

## 6. 开发中架构规则

### 6.1 UI Layer

`src/ui/render.js` 主要负责展示和生成 HTML。

原则：

- UI 可以收集用户输入和展示状态。
- UI 不承载 memory extraction、action ranking、Brief 生成等业务推理。
- UI 不直接读写 localStorage。
- 新交互入口应提供清楚的 `data-*` 属性给 `src/main.js` 绑定。

### 6.2 App Controller

`src/main.js` 负责事件绑定、状态切换和轻量编排。

原则：

- 可以读取表单输入。
- 可以调用 domain 层。
- 可以调用 store/repository 层。
- 不应承载复杂 Agent 推理、Brief 模板或持久化细节。

### 6.3 Domain Layer

`src/domain/agentEngine.js` 和未来 `src/domain/pipelines/*` 负责产品闭环判断。

原则：

- 保持 `absorbContext()`、`generateBrief()`、`recordActionResult()` 等核心入口清晰。
- pipeline 输出应是结构化对象。
- domain 不关心 DOM 和 CSS。
- domain 不直接写 localStorage。
- domain 不自动执行外部动作。

### 6.4 Services Layer

`src/services/*` 负责持久化、provider、未来外部 adapter。

原则：

- store/repository 负责保存和读取 state。
- store 不承载 Agent 判断。
- provider 服务 pipeline，不直接驱动 UI。
- 高风险外部写操作必须保留人工确认。

### 6.5 Data Layer

`src/data/demo.js` 提供 demo 数据。

原则：

- demo 数据应覆盖新增能力。
- demo 数据不包含真实敏感信息。
- demo 数据应与 `DATA_MODEL.md` 保持一致。

## 7. 文档同步规则

文档同步是硬规则。因为我们允许一定犯错率，所以更需要记录改动。

按改动类型同步：

| 改动类型 | 需要同步更新 |
| --- | --- |
| 新增/修改数据字段 | `DATA_MODEL.md`、`src/data/demo.js`、必要时 `scripts/smoke-test.mjs` |
| 新增/修改文件职责 | `docs/FILE_FUNCTION_NOTES.md` |
| 新增、删除、重命名文件 | `docs/FILE_FUNCTION_NOTES.md`、必要时 `PROJECT_FUNCTION_STRUCTURE.md` |
| 新增目录或改变架构边界 | `PROJECT_FUNCTION_STRUCTURE.md`、`docs/FILE_FUNCTION_NOTES.md` |
| 改变产品行为 | `PRD.md` 或当前 issue spec |
| 改变 issue 目标、范围或验收 | 当前 issue spec、必要时 `docs/issues/README.md` |
| 改变协作流程或分支策略 | `docs/TEAM_DEV_LOG.md`、本指南 |
| 改变运行方式 | `README.md`、`package.json` |
| 改变核心闭环逻辑 | `scripts/smoke-test.mjs`、`DATA_MODEL.md`、相关 issue spec |
| 新增 demo 能力 | `src/data/demo.js`、必要时 issue spec |

特别规则：

- `docs/FILE_FUNCTION_NOTES.md` 是文件功能对照地图。新增、删除、重命名文件，或改变文件职责后必须更新。
- `docs/TEAM_DEV_LOG.md` 是团队共享开发状态。重要任务开始、完成、暂停、分支策略变化、重大决策变化后应更新。
- 不要只在聊天里改变规则或产品口径，重要变化要进入仓库文档。

## 8. 验证规则

每次代码改动后，能运行 smoke test 就运行：

```bash
node scripts/smoke-test.mjs
```

如果没有运行，必须说明原因。

如果改动涉及 UI，建议本地打开页面检查：

```bash
npm run dev
```

然后访问：

```text
http://localhost:4173
```

最低验收：

- 页面可以打开。
- 上下文输入可用。
- 能生成 memory。
- 能生成 action。
- 能生成 Brief。
- 能记录 result。
- result 能进入回流闭环。
- 没有引入自动外部执行。
- 没有把主界面改成聊天产品。

如果本次 issue 新增了关键字段、状态或流程，建议增强 `scripts/smoke-test.mjs` 的断言。

## 9. 改完后需要留下的记录

AI 或开发者完成后，应输出改动总结。

建议格式：

```text
实际改动：
影响文件：
同步文档：
验证结果：
遗留风险：
下一步建议：
```

如果产生了提交或 PR，应记录：

```text
分支：
提交：
PR：
```

如果测试失败，应明确说明失败原因和当前状态。

## 10. 允许的错误与处理方式

允许：

- 小范围实现不完美。
- 后续提交修正前一次判断。
- 一个分支里合并强相关任务。
- 先用规则/mock 实现，再逐步替换为更好的 pipeline。
- 文档先记录当前共识，后续再修订。

不允许：

- 无记录地大改。
- 改完不知道为什么改。
- 修改数据结构但不更新数据模型文档。
- 新增文件但不更新文件功能地图。
- 改产品边界但不更新 PRD 或 issue spec。
- 引入自动外部执行。
- 把产品改成聊天主界面。
- 测试失败却汇报为完成。

## 11. 推荐开发流程

推荐流程，不是僵硬审批：

```text
读取足够上下文
-> 输出开工说明
-> 开始修改
-> 同步必要文档
-> 运行可行验证
-> 输出完成记录
-> 提交或进入 review
```

正式 issue 推荐流程：

```text
阅读默认上下文
-> 阅读当前 issue spec
-> 阅读相关代码
-> 输出开发说明
-> 创建或使用开发分支
-> 小步实现
-> 更新 demo / docs / smoke test
-> 运行验证
-> 更新 TEAM_DEV_LOG
-> 提交 / PR / 合并
```

## 12. 给新 AI 会话的推荐提示词

可以这样启动新 AI 开发会话：

```text
请按照 docs/AI_DEVELOPMENT_GUIDE.md 工作。
先根据任务阅读足够上下文，至少参考 README.md、PRD.md、PROJECT_FUNCTION_STRUCTURE.md、DATA_MODEL.md、docs/TEAM_DEV_LOG.md、docs/FILE_FUNCTION_NOTES.md、docs/issues/README.md，以及当前 issue spec。
开始修改前先输出：已参考、本次目标、预计改动、风险点、验证方式。
完成后输出：实际改动、影响文件、同步文档、验证结果、遗留风险。
如果新增或改变文件职责，必须更新 docs/FILE_FUNCTION_NOTES.md。
如果改变数据结构，必须更新 DATA_MODEL.md。
```
