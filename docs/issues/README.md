# TeamMind Issues Development Guide

用途：把产品计划拆成可执行、可验证、可并行管理的 issue，并约束 issue 分支、验收和合并方式。

最后更新：2026-05-18

## 1. Issue 的作用

每个 issue spec 必须让新的 Codex 对话或人类开发者独立理解：

- 为什么做。
- 属于哪个产品领域。
- 改哪些模块。
- 数据结构是否变化。
- UI 应该如何出现。
- 明确不做什么。
- 如何验收。

不要用“优化一下”“增强 AI”“完善体验”这类模糊任务直接开工。

## 2. 当前阶段

Milestone 1 memory foundation 已经进入集成基线。后续主要以 Phase 3 Alpha 为目标：

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

详细 Wave 计划见：

```text
docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md
```

## 3. Issue 命名

建议格式：

```text
AREA-序号-short-name
```

示例：

```text
INBOX-01-manual-source-inbox
PIPE-01-source-to-signal
ENTITY-01-entity-profile
PROJECT-01-project-nodes
ACTION-01-brief-generation
DASH-01-command-center
```

## 4. Issue Spec 模板

```text
# ISSUE-ID 标题

## 目标

这次改动要让 TeamMind 具备什么能力。

## 背景

为什么现在做，和最终产品形态、当前 Wave 的关系是什么。

## 涉及领域

Inbox / Memory / Entity / Project / Action / Result / Dashboard / QA / Docs

## 涉及文件

预计会改哪些文件。

## 数据模型变化

新增或修改哪些字段。若没有，写“无”。

## UI / 交互

用户如何看到或使用这个能力。

## 明确不做

本 issue 不包含哪些内容。

## 验收标准

1. ...
2. ...
3. `node scripts/smoke-test.mjs` 通过。

## 文档同步

需要更新哪些文档。
```

## 5. 并行规则

每个 Wave 最多安排 3-5 个 issue。

可以并行：

- 独立页面。
- 独立组件。
- 测试。
- 文档。
- demo 数据。
- 已稳定接口下的展示能力。

必须串行：

- 核心数据合同。
- `AppState`。
- store / repository。
- pipeline 输入输出协议。
- 全局路由。
- memory reconcile 核心逻辑。
- action / result 状态流转。

如果不确定是否可以并行，默认先串行定合同，再并行做实现。

## 6. 分支规则

每个 issue 单独分支：

```text
issue/ISSUE-ID-short-name
```

每个 Wave 有自己的集成分支：

```text
integration/phase-3-wave-01
```

每个阶段有稳定集成分支：

```text
integration/phase-3-alpha
```

规则：

- issue 分支从本轮稳定 base 开出。
- issue 完成后合回 wave integration。
- 每合并一个 issue，跑 `node scripts/smoke-test.mjs`。
- Wave 完成后合回阶段 integration。
- 阶段 integration 通过后开 draft PR。
- 不直接合 main。

## 7. 完成标准

每个 issue 合并前必须满足：

- 符合 issue spec。
- 没有超出明确范围的大重构。
- 新数据字段已更新 `DATA_MODEL.md`。
- 新文件已更新 `docs/FILE_FUNCTION_NOTES.md`。
- 行为变化已更新 PRD、阶段计划或 issue spec。
- Demo 数据能展示新增能力，或说明为什么不需要。
- `node scripts/smoke-test.mjs` 通过。
- 没有新增自动外部执行。
- 没有把主界面改成聊天产品。

## 8. 当前旧 issue

Milestone 1 的旧 issue 仍保留在本目录，作为已完成或历史上下文：

```text
CTX-01-context-metadata.md
CTX-03-context-memory-source-links.md
MEM-01-memory-status-source-references.md
MEM-02-edit-company-memory.md
MEM-03-memory-status-transitions.md
MEM-04-memory-detail-panel.md
REC-01-extract-memories-pipeline.md
REC-02-reconcile-memories-pipeline.md
```

后续新增 Phase 3 Alpha issue 时，应按 Wave 放入本目录，并在本文件或阶段计划中更新顺序。

## 9. 推荐开工提示词

```text
请按照 docs/AI_DEVELOPMENT_GUIDE.md 和 docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md 工作。
本次实现 docs/issues/ISSUE-ID-short-name.md。
要求每个 issue 单独开分支，完成后运行 node scripts/smoke-test.mjs。
如果涉及数据模型，更新 DATA_MODEL.md。
如果新增文件，更新 docs/FILE_FUNCTION_NOTES.md。
不要直接合 main，最后进入当前 wave integration 分支。
```
