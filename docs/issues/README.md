# TeamMind Issues 开发说明

本目录把 PRD 中的功能方向拆成可执行开发卡片。每个 issue spec 都应该能让队友或新 Codex 独立理解：

- 为什么做；
- 改哪些模块；
- 数据结构怎么变；
- UI 应该怎么表现；
- 什么不做；
- 如何验收。

## 当前优先级

Milestone 1：让公司记忆可信。

建议顺序：

```text
1. CTX-01-context-metadata.md
2. CTX-03-context-memory-source-links.md
3. MEM-01-memory-status-source-references.md
4. MEM-02-edit-company-memory.md
5. MEM-03-memory-status-transitions.md
6. MEM-04-memory-detail-panel.md
7. REC-01-extract-memories-pipeline.md
8. REC-02-reconcile-memories-pipeline.md
```

## 开发规则

- 默认一次只做一个 issue；如果多个 issue 强依赖、共享同一数据链路，或连续开发明显更快，可以使用复合 issue 分支。
- 复合 issue 分支名必须包含开发者前缀和 issue 编号组合，例如 `skeleton/CTX-01-MEM-01-context-memory-foundation`。
- 复合 issue 分支必须在开发日志和 PR 描述里列出包含哪些 issue、为什么合并开发、各自验收结果和遗留风险。
- 每个代码提交信息建议包含 issue 编号。
- 数据模型变化必须同步更新 `DATA_MODEL.md`。
- 行为变化必须同步更新 `PRD.md` 或对应 issue spec。
- 完成后运行 `node scripts/smoke-test.mjs`。
- 不要在 issue 范围外顺手做大重构。

## 验收底线

每个 issue 合并前必须满足：

- 当前页面可打开。
- 核心闭环不坏。
- smoke test 通过。
- Demo 数据能展示新增能力。
- 不引入自动外部执行。
- 不把主界面改成聊天产品。

