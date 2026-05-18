# TeamMind AI Development Guide

用途：规范 Codex、其他 AI 编程助手和人类开发者如何在 TeamMind 中开发、并行、合并、记录上下文和验证结果。

适用范围：当前阶段和后续所有阶段。本文不是 Phase 3 专用规则，而是 TeamMind 长期 AI 开发操作规则。

最后更新：2026-05-18

## 1. 核心原则

TeamMind 的开发规则服务两个目标：

- 尽可能快地推进产品。
- 在 Codex 上下文长度有限的情况下，不丢失关键项目上下文。

原则：

- 仓库文档是项目共享记忆，聊天记录只是临时工作区。
- 一个主对话尽量承载一个完整 Wave，减少上下文分叉。
- 每个 issue 仍然单独分支、单独提交、单独验证。
- 核心数据合同和跨模块协议先串行，UI、测试、文档和互不重叠模块再并行。
- 每次重要改动都要能回答：为什么改、改了哪里、怎么验证、遗留风险是什么。
- 不直接合 main，先走 integration 分支和 draft PR。

## 2. 产品边界

TeamMind 是公司级上下文、记忆、项目推进和行动回流系统。

开发时必须保持：

- 不把主界面改成聊天产品。
- 不把 TeamMind 做成 prompt 模板市场。
- 不优先做外部集成，而是先跑通手动信息闭环。
- 不自动发送邮件、Slack、Gmail、Notion、GitHub、Linear/Jira 等外部动作。
- 不自动承诺价格、法务、融资、客户谈判或数据权限事项。
- 高风险动作必须停留在 draft、brief 或人工确认状态。
- AI 或规则生成的 memory、action、brief、result update 必须逐步具备来源、证据或运行记录。

## 3. 默认阅读顺序

正式开发前，默认阅读：

```text
README.md
-> 最终产品形态.md
-> docs/AI_DEVELOPMENT_GUIDE.md
-> docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md
-> AI_HANDOFF.md
-> 当前系统状态.md
-> PROJECT_FUNCTION_STRUCTURE.md
-> DATA_MODEL.md
-> docs/issues/README.md
-> 当前 issue spec
```

如果任务很小，可以只读直接相关文件，但完成说明里必须写明实际参考了哪些文件。

按任务类型追加阅读：

- UI：`src/ui/render.js`、`src/styles.css`、`src/main.js`
- 数据模型：`DATA_MODEL.md`、`src/data/demo.js`、`src/services/store.js`
- domain / pipeline：`src/domain/agentEngine.js`、`src/domain/types.js`、`src/domain/pipelines/*`
- 存储：`src/services/store.js`、未来 `src/services/repositories/*`
- 测试：`scripts/smoke-test.mjs`
- 新增文件：`PROJECT_FUNCTION_STRUCTURE.md`、`docs/FILE_FUNCTION_NOTES.md`

## 4. 开发模式

TeamMind 后续默认使用三种模式，优先级如下。

### 4.1 单主对话多 issue

默认推荐。

```text
一个主对话 = 一个 Wave
一个 Wave = 3-5 个 issue
一个 issue = 单独分支 + 单独提交 + 单独 smoke test
```

适合：

- 早期架构仍在变化。
- 数据模型和页面信息架构还没完全稳定。
- 希望尽量保留连续上下文。

### 4.2 主对话 + 并行子任务

适合速度要求更高、且任务边界明确时使用。

主对话负责：

- 上下文。
- 分支策略。
- 接口合同。
- 合并顺序。
- 验收。

并行任务负责：

- 独立 UI 区域。
- 测试。
- 文档。
- demo 数据。
- adapter 或小 pipeline。

### 4.3 多 Codex 对话真并行

只在接口稳定后使用。

适合：

- 多个页面互不影响。
- 每个任务有清晰 issue spec。
- 文件改动范围不重叠。
- 有一个主对话负责最终集成。

不适合：

- 核心数据结构仍在变化。
- 多个任务都要改 `src/main.js`、`src/ui/render.js`、`src/domain/agentEngine.js` 的同一区域。
- pipeline 输入输出协议还未确定。

## 5. 并行规则

可以并行：

- UI 页面和独立组件。
- smoke test / e2e test。
- 文档更新。
- demo 数据补充。
- 已稳定接口下的展示层功能。
- 外部 adapter 的 mock 实现。

必须串行：

- 核心数据对象。
- `AppState` 结构。
- store / repository 合同。
- 全局路由和页面信息架构。
- Source / Signal / Memory / Entity / Project / Node / Action / Result 合同。
- memory reconcile 核心 pipeline。
- action / result 状态流转协议。

判断标准：

```text
如果两个任务同时修改同一份合同、同一条状态流、同一个核心 pipeline 协议，就必须串行。
如果两个任务只是消费稳定接口，并且主要改不同文件，可以并行。
```

## 6. 分支规则

长期分支：

```text
main
integration/phase-3-alpha
```

Wave 集成分支：

```text
integration/phase-3-wave-00
integration/phase-3-wave-01
integration/phase-3-wave-02
```

Issue 分支：

```text
issue/INBOX-01-manual-source-inbox
issue/ENTITY-01-entity-profile
issue/ACTION-01-brief-generation
```

规则：

- 不直接在 `main` 开发。
- 不直接合 `main`。
- 每个 issue 从上一个稳定 base 开出。
- 每个 issue 完成后先合回当前 wave integration。
- 每合并一个 issue，运行 `node scripts/smoke-test.mjs`。
- Wave 全部通过后，再合入阶段 integration，例如 `integration/phase-3-alpha`。
- 阶段 integration 稳定后开 draft PR。

例外：

- 文档小修可以在当前分支完成，但必须说明影响范围。
- 紧密相关的架构合同可以在同一个 `ARCH-*` 分支内完成，但 PR 描述必须列明范围。
- spike 使用 `spike/topic-name`，不能直接作为稳定 base。

## 7. 开工记录

正式改动前，AI 应先给出简短开工说明：

```text
已参考：
本次目标：
涉及 issue：
预计改动：
明确不做：
风险点：
验证方式：
```

如果任务临时出现、没有 issue，需要先判断：

```text
是否已有 issue 覆盖：
是否需要新增 issue spec：
是否可以作为文档/小修直接处理：
是否应该推迟到后续 Wave：
```

## 8. 上下文保存规则

为了避免 Codex 长对话丢上下文：

- 每个 Wave 开始前读 `AI_HANDOFF.md` 和 `当前系统状态.md`。
- 每完成 2-3 个 issue，更新一次 `AI_HANDOFF.md`。
- 每个 Wave 结束后更新 `当前系统状态.md`。
- 每个重要 issue 完成后追加 `docs/TEAM_DEV_LOG.md`。
- 新增数据对象或字段时更新 `DATA_MODEL.md`。
- 新增文件时更新 `docs/FILE_FUNCTION_NOTES.md`。
- 改变开发顺序或并行规则时更新 `docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md` 或后续阶段计划文件。

聊天里形成的重要共识不能只留在聊天里，必须写回仓库文档。

## 9. 架构规则

UI Layer：

- 只负责展示和收集用户输入。
- 不做 memory extraction、action ranking、brief generation。
- 不直接读写 localStorage。

App Controller：

- 负责事件绑定、状态切换和轻量编排。
- 可以调用 domain 和 services。
- 不承载复杂业务推理。

Domain Layer：

- 保持 `absorbContext()`、`generateBrief()`、`recordActionResult()` 等入口稳定。
- pipeline 输出结构化对象。
- 不关心 DOM 和 CSS。
- 不直接写 localStorage。
- 不自动执行外部动作。

Services Layer：

- 负责持久化、provider、repository、未来外部 adapter。
- 不承载 Agent 判断。

Data Layer：

- demo 数据覆盖新增能力。
- 不包含真实敏感信息。
- 与 `DATA_MODEL.md` 保持一致。

## 10. 文档同步规则

| 改动类型 | 必须同步 |
| --- | --- |
| 新增/修改数据字段 | `DATA_MODEL.md`、`src/data/demo.js`、必要时 `scripts/smoke-test.mjs` |
| 新增/修改文件职责 | `docs/FILE_FUNCTION_NOTES.md` |
| 新增、删除、重命名文件 | `docs/FILE_FUNCTION_NOTES.md`、必要时 `PROJECT_FUNCTION_STRUCTURE.md` |
| 改变架构边界 | `PROJECT_FUNCTION_STRUCTURE.md`、`docs/AI_DEVELOPMENT_GUIDE.md` |
| 改变产品行为 | `PRD.md` 或当前 issue spec |
| 改变 issue 目标、范围或验收 | 当前 issue spec、`docs/issues/README.md` |
| 改变协作流程或分支策略 | `docs/AI_DEVELOPMENT_GUIDE.md`、`docs/TEAM_DEV_LOG.md` |
| 改变阶段计划 | 当前阶段计划文件，例如 `docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md` |
| 改变运行方式 | `README.md`、`package.json` |
| 完成 2-3 个 issue | `AI_HANDOFF.md`、`当前系统状态.md` |

## 11. 验证规则

每个代码 issue 完成后运行：

```bash
node scripts/smoke-test.mjs
```

涉及 UI 时建议本地预览：

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:4173
```

最低验收：

- 页面可以打开。
- 核心闭环不坏。
- 新增功能有 UI 或明确入口。
- 新数据结构有 demo 或 migration。
- 没有自动外部执行。
- 没有把主界面改成聊天产品。
- smoke test 通过，或明确说明不能运行的原因。

## 12. 完成记录

完成后输出：

```text
实际改动：
影响文件：
同步文档：
验证结果：
遗留风险：
下一步建议：
```

如果产生提交或 PR，记录：

```text
分支：
提交：
PR：
```

如果测试失败，必须明确说明失败原因和当前状态，不能把失败汇报成完成。

## 13. 给新 AI 对话的推荐提示词

```text
请按照 docs/AI_DEVELOPMENT_GUIDE.md 工作。
先阅读 README.md、最终产品形态.md、docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md、AI_HANDOFF.md、当前系统状态.md、PROJECT_FUNCTION_STRUCTURE.md、DATA_MODEL.md、docs/issues/README.md，以及当前 issue spec。
本轮采用一个主对话跑一个 Wave 的方式。每个 issue 单独分支，完成后运行 node scripts/smoke-test.mjs。
开始修改前先说明：已参考、本次目标、涉及 issue、预计改动、明确不做、风险点、验证方式。
完成后说明：实际改动、影响文件、同步文档、验证结果、遗留风险、下一步建议。
如果新增或改变文件职责，必须更新 docs/FILE_FUNCTION_NOTES.md。
如果改变数据结构，必须更新 DATA_MODEL.md。
```
