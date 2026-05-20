# TeamMind 团队开发共享日志

文档名：`docs/TEAM_DEV_LOG.md`

用途：记录团队协作状态、阶段分支、开发决策、验收记录和重要风险。

最后更新：2026-05-19

## 1. 当前协作结论

TeamMind 后续开发采用“一个主对话跑一个 Wave”的默认方式：

```text
一个主对话 = 一个 Wave
一个 Wave = 3-5 个 issue
一个 issue = 单独分支 + 单独提交 + 单独 smoke test
```

这套规则可以用于后续所有阶段。核心数据合同、全局状态、pipeline 协议必须串行确定；UI、测试、文档和互不重叠的小模块可以并行。

## 2. 当前稳定基线

当前主要集成分支：

```text
integration/phase-3-alpha
```

当前本地 Wave 2 集成分支：

```text
integration/phase-3-wave-02
```

历史 memory foundation 分支已经集成：

- CTX-01
- CTX-03
- MEM-01
- MEM-02
- MEM-03
- MEM-04
- REC-01
- REC-02
- `最终产品形态.md`

后续 Phase 3 Alpha 以 `integration/phase-3-alpha` 为阶段集成分支，不直接合 main，应继续走 issue 分支、wave integration、阶段 integration 和 draft PR。

## 3. 当前开发模式

长期分支：

```text
main
integration/phase-3-alpha
```

Wave 分支：

```text
integration/phase-3-wave-00
integration/phase-3-wave-01
integration/phase-3-wave-02
```

Issue 分支：

```text
issue/ISSUE-ID-short-name
```

合并顺序：

```text
issue/*
-> integration/phase-3-wave-xx
-> integration/phase-3-alpha
-> draft PR
-> main
```

每合并一个 issue 必须运行：

```bash
node scripts/smoke-test.mjs
```

## 4. 当前下一阶段

下一阶段是 Phase 3 Alpha。

目标：

```text
Inbox
-> Source / Signal
-> Entity Profile
-> Project Node
-> Memory Governance
-> Action Brief
-> Result Feedback
-> Command Center
```

详细计划见：

```text
docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md
```

## 5. 当前任务看板

| Wave | 目标 | 状态 | 备注 |
| --- | --- | --- | --- |
| Wave 0 | 施工系统与核心数据合同 | 已合并 | DEV-00 / ARCH-00 / QA-00 / DOC-00 / DOC-01 已完成并合入 main |
| Wave 1 | Inbox 到 Source / Signal | 待 review | INBOX-01 / PIPE-01 / LINK-01 / UI-01 / QA-01 已完成并通过 smoke，PR #8 仍为 draft/open |
| Wave 2 | Entity Profile 与 Project Node | 待 review | ENTITY-01 / ENTITY-02 / PROJECT-01 / PROJECT-02 / QA-02 已完成并通过 smoke，待合入阶段 integration / draft PR |
| Wave 3 | Memory Governance 与 Action 回流 | 待开始 | 让状态、brief、result 进入真实闭环 |
| Wave 4 | Command Center Alpha | 待开始 | 公司级首页和优先级队列 |

状态建议只用：

```text
待开始 / 准备中 / 开发中 / 待 review / 已合并 / 暂停
```

## 6. 易冲突文件

这些文件多人或多个 AI 对话同时开发时最容易冲突：

- `src/main.js`
- `src/ui/render.js`
- `src/domain/agentEngine.js`
- `src/data/demo.js`
- `src/services/store.js`
- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`

协作建议：

- 数据模型先定，再做 UI。
- 同一时间只让一个任务主改 `render.js` 的同一区域。
- 同一时间只让一个任务主改 `agentEngine.js` 的核心编排。
- UI issue 和测试 issue 可以并行。
- 文档 issue 可以与代码 issue 并行，但最后由主对话统一校对。

## 7. 每个 issue 的完成标准

每个 issue 合并前至少满足：

- 符合 issue spec。
- 当前页面可以打开。
- 核心闭环没有断。
- `node scripts/smoke-test.mjs` 通过。
- Demo 数据能展示新增能力，或说明为什么不需要。
- 数据模型变化已同步 `DATA_MODEL.md`。
- 新增文件已同步 `docs/FILE_FUNCTION_NOTES.md`。
- 行为变化已同步 PRD、阶段计划或 issue spec。
- 没有新增自动外部执行能力。
- 没有把主界面改成聊天产品。

## 8. 日志记录格式

每完成一个重要 issue 或 Wave，追加：

```text
日期：
负责人：
范围：
分支：
状态：
改动文件：
验证结果：
待决问题：
下一步：
```

## 9. 开发日志

### 2026-05-20

负责人：Codex

范围：Phase 3 Alpha Wave 3 开工与 `MEM-05-memory-governance-live`

分支：`issue/MEM-05-memory-governance-live`

状态：开发中，已完成 MEM-05 本地实现和 smoke

改动文件：

- `docs/issues/MEM-05-memory-governance-live.md`
- `docs/issues/ACTION-01-brief-generation.md`
- `docs/issues/ACTION-02-result-feedback.md`
- `docs/issues/REC-03-result-to-memory-update.md`
- `docs/issues/QA-03-action-loop-smoke.md`
- `docs/issues/README.md`
- `src/domain/agentEngine.js`
- `src/ui/render.js`
- `src/styles.css`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`

验证结果：

- 新增 Wave 3 issue specs。
- memory governance 已进入 action planning：confirmed 优先，draft / disputed 触发人工复核，outdated / archived 默认不作为新 brief 证据。
- UI 新增 memory governance summary 和 action evidence governance 标记。
- `node scripts/smoke-test.mjs` 通过。

待决问题：

- MEM-05 合回 `integration/phase-3-wave-03` 后需要再次运行 smoke。
- 后续 ACTION-01 需要进一步场景化 Brief sections。

下一步：

- 提交 MEM-05，合回 Wave 3 集成分支，然后继续 `ACTION-01-brief-generation`。

### 2026-05-18

负责人：Codex

范围：开发规则重协调

分支：`integration/CTX-01-MEM-01-MEM-03-REC-01-CTX-03-MEM-02-memory-foundation`

状态：完成文档调整，待后续提交/推送

改动文件：

- `AI_HANDOFF.md`
- `当前系统状态.md`
- `docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md`
- `docs/AI_DEVELOPMENT_GUIDE.md`
- `docs/issues/README.md`
- `docs/TEAM_DEV_LOG.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `README.md`

验证结果：

- 将旧的 Milestone 1 复合开发规则升级为后续阶段通用的 Wave 开发规则。
- 明确一个主对话跑一个 Wave，每个 issue 单独分支、单独提交、单独 smoke test。
- 明确哪些任务可以并行，哪些必须串行。
- 新增 `AI_HANDOFF.md` 和 `当前系统状态.md`，作为新 Codex 对话接手入口。
- 新增 `docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md`，记录下一阶段 Wave 顺序和开发 prompt。

待决问题：

- 下一步应创建或更新 Phase 3 Alpha 的具体 issue spec。
- Wave 0 需要正式落地核心数据合同，并同步 `DATA_MODEL.md`。

下一步：

- 从 `DEV-00` / `ARCH-00` 开始 Phase 3 Alpha Wave 0。

### 2026-05-18

负责人：Codex

范围：Phase 3 Alpha Wave 0 施工系统、数据合同和 smoke baseline

分支：`integration/phase-3-wave-00`

状态：Wave 0 已完成，待合入 `integration/phase-3-alpha`

改动文件：

- `docs/issues/DEV-00-ai-development-rules.md`
- `docs/issues/ARCH-00-core-domain-contract.md`
- `docs/issues/QA-00-smoke-test-baseline.md`
- `docs/issues/DOC-00-current-system-status.md`
- `docs/issues/DOC-01-ai-handoff.md`
- `docs/issues/README.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `scripts/smoke-test.mjs`
- `src/domain/agentEngine.js`
- `src/data/demo.js`
- `当前系统状态.md`
- `AI_HANDOFF.md`

验证结果：

- `DEV-00` 提交：`02451cf`，完成 Wave 0 issue spec。
- `ARCH-00` 提交：`31d3309`，完成 Phase 3 Alpha 核心数据合同。
- `QA-00` 提交：`a77f8e4`，增强 smoke baseline，并补齐 action / brief / result 的证据字段。
- `DOC-00` 提交：`7d32c20`，更新当前系统状态和团队日志。
- `DOC-01` 更新 `AI_HANDOFF.md`，明确下一步从 Wave 1 的 Inbox / Source / Signal 开始。
- 每个 issue 分支完成后运行 `node scripts/smoke-test.mjs` 通过。
- 每次合回 `integration/phase-3-wave-00` 后再次运行 `node scripts/smoke-test.mjs` 通过。

待决问题：

- Wave 0 完成后需要合入 `integration/phase-3-alpha`。
- 远端分支和 draft PR 需要在用户确认外部动作后再推送/创建。

下一步：

- 合入 `integration/phase-3-alpha`，然后准备 draft PR。

### 2026-05-18

负责人：Codex

范围：Phase 3 Alpha Wave 1：Inbox -> Source / Signal

分支：`integration/phase-3-wave-01`

状态：Wave 1 已完成，待合入 `integration/phase-3-alpha` 并开 draft PR

改动文件：

- `src/domain/types.js`
- `src/services/store.js`
- `src/domain/agentEngine.js`
- `src/domain/pipelines/extractSignals.js`
- `src/domain/pipelines/linkSignals.js`
- `src/main.js`
- `src/ui/render.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/issues/INBOX-01-manual-source-inbox.md`
- `docs/issues/PIPE-01-source-to-signal.md`
- `docs/issues/LINK-01-project-entity-suggestion.md`
- `docs/issues/UI-01-inbox-review-flow.md`
- `docs/issues/QA-01-inbox-smoke-flow.md`
- `AI_HANDOFF.md`
- `当前系统状态.md`
- `docs/TEAM_DEV_LOG.md`

验证结果：

- `INBOX-01` 提交：`b16cab5`，完成手动 Source Inbox 和本地持久化。
- `PIPE-01` 提交：`869ba12`，完成 Source -> Signal 本地规则 pipeline。
- `LINK-01` 提交：`ddf3e82`，完成 Signal 到 Entity / Project 建议关联。
- `UI-01` 提交：`e7e455a`，完成 Signal review flow，支持确认、忽略、转 Memory、转 Action。
- `QA-01` 提交：`3bc16d6`，扩展 smoke test 覆盖完整 Inbox flow 和 UI 渲染断言。
- 每个 issue 分支完成后运行 `node scripts/smoke-test.mjs` 通过。
- 每次合回 `integration/phase-3-wave-01` 后再次运行 `node scripts/smoke-test.mjs` 通过。

待决问题：

- 本地浏览器插件访问 `127.0.0.1:4173` / `localhost:4173` 被环境策略拦截，UI 验证以 `renderApp()` smoke 断言为准。
- Entity 目前仍是建议和最小对象，完整 Entity Profile 留给 Wave 2。
- Project Node 尚未落地，留给 Wave 2。

下一步：

- 合入 `integration/phase-3-alpha`，推送远端分支，创建面向 `main` 的 draft PR。

### 2026-05-19

负责人：Codex

范围：Phase 3 Alpha Wave 2：Entity Profile + Project Node

分支：`integration/phase-3-wave-02`

状态：Wave 2 已完成，待合入 `integration/phase-3-alpha` 并开 draft PR

改动文件：

- `src/domain/agentEngine.js`
- `src/domain/pipelines/linkSignals.js`
- `src/domain/types.js`
- `src/services/store.js`
- `src/main.js`
- `src/ui/render.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `AI_HANDOFF.md`
- `当前系统状态.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/issues/ENTITY-01-entity-profile.md`
- `docs/issues/ENTITY-02-entity-linking.md`
- `docs/issues/PROJECT-01-project-nodes.md`
- `docs/issues/PROJECT-02-node-detail-panel.md`
- `docs/issues/QA-02-entity-project-flow.md`

验证结果：

- `ENTITY-01` 提交：`f1c9ae7`，完成 Entity Profile 面板、详情展示、状态治理和 Entity 字段兼容迁移。
- `ENTITY-02` 提交：`562a073`，完成 Entity 与 Source / Signal / Memory / Project / Action 的持续链接。
- `PROJECT-01` 提交：`65fece0`，完成 Project Node 数据结构、默认单节点、节点列表和状态治理。
- `PROJECT-02` 提交：`9facecb`，完成 Node Detail Panel，展示目标、输入上下文、证据链、action 和 result。
- `QA-02` 提交：`628d84d`，扩展 smoke test 覆盖 Source -> Signal -> Entity -> Memory / Action -> Project Node -> Result 的贯通路径。
- 每个 issue 分支完成后运行 `node scripts/smoke-test.mjs` 通过。
- 每次合回 `integration/phase-3-wave-02` 后再次运行 `node scripts/smoke-test.mjs` 通过。

待决问题：

- Wave 2 尚未推送远端，也尚未合入 `integration/phase-3-alpha`。
- Entity Relation Graph、实体合并、节点编辑、AI 自动拆分节点仍留给后续阶段。
- Action Brief 和 Result Feedback 仍需要 Wave 3 完整化。

下一步：

- 合入 `integration/phase-3-alpha`，推送远端分支，创建 draft PR。
