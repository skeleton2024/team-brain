# TeamMind 团队开发共享日志

文档名：`docs/TEAM_DEV_LOG.md`

用途：记录团队协作状态、阶段分支、开发决策、验收记录和重要风险。

最后更新：2026-05-18

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

当前本地 Wave 0 集成分支：

```text
integration/phase-3-wave-00
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
| Wave 0 | 施工系统与核心数据合同 | 开发中 | DEV-00 / ARCH-00 / QA-00 已完成并通过 smoke，文档收尾中 |
| Wave 1 | Inbox 到 Source / Signal | 待开始 | 手动录入优先，不接 Gmail / Slack API |
| Wave 2 | Entity Profile 与 Project Node | 待开始 | 支持长期对象画像和项目多节点 |
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

状态：开发中，DOC-00 当前系统状态已更新，待 DOC-01 handoff 收尾

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

验证结果：

- `DEV-00` 提交：`02451cf`，完成 Wave 0 issue spec。
- `ARCH-00` 提交：`31d3309`，完成 Phase 3 Alpha 核心数据合同。
- `QA-00` 提交：`a77f8e4`，增强 smoke baseline，并补齐 action / brief / result 的证据字段。
- 每个 issue 分支完成后运行 `node scripts/smoke-test.mjs` 通过。
- 每次合回 `integration/phase-3-wave-00` 后再次运行 `node scripts/smoke-test.mjs` 通过。

待决问题：

- `DOC-01` 需要更新 `AI_HANDOFF.md`，把下一步明确指向 Wave 1。
- Wave 0 完成后需要合入 `integration/phase-3-alpha`。
- 远端分支和 draft PR 需要在用户确认外部动作后再推送/创建。

下一步：

- 完成 `DOC-01-ai-handoff`。
