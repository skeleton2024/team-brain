# DOC-01 AI handoff 维护

## 目标

在 Wave 0 完成后更新 `AI_HANDOFF.md`，让下一个 Codex 对话能直接从 Phase 3 Alpha Wave 1 的起点接手。

## 背景

`AI_HANDOFF.md` 是长对话结束后的接力棒。Wave 0 会建立新的阶段集成分支、核心数据合同、smoke baseline 和 issue spec。handoff 需要记录这些事实，并明确下一步从 Wave 1 的 Inbox / Source / Signal 开始。

## 涉及领域

Docs / Handoff / Development Workflow

## 涉及文件

- `AI_HANDOFF.md`
- `docs/TEAM_DEV_LOG.md`

## 数据模型变化

无。

## UI / 交互

无直接 UI 变化。

## 明确不做

- 不修改应用运行时代码。
- 不替代 `当前系统状态.md` 的详细状态说明。
- 不替代 `DATA_MODEL.md` 的字段合同。

## 验收标准

1. `AI_HANDOFF.md` 说明当前稳定分支和 Wave 0 完成内容。
2. `AI_HANDOFF.md` 明确 Wave 1 的起点和必须参考的文档。
3. `AI_HANDOFF.md` 保留产品边界：不做聊天界面、不自动执行外部动作、不直合 main。
4. `docs/TEAM_DEV_LOG.md` 追加对应开发记录。
5. `node scripts/smoke-test.mjs` 通过。

## 文档同步

必须同步：

- `AI_HANDOFF.md`
- `docs/TEAM_DEV_LOG.md`

