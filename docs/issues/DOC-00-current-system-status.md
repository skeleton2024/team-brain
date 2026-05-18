# DOC-00 当前系统状态维护

## 目标

在 Wave 0 完成后更新 `当前系统状态.md`，准确记录 Phase 3 Alpha 开始前后的系统实际状态、已完成能力、仍偏 demo 的部分、风险和下一步。

## 背景

`当前系统状态.md` 是新 Codex 对话和人类协作者判断“现在项目到底在哪”的入口。Wave 0 会改变分支基线、数据合同和 smoke baseline，因此需要在 Wave 结束后更新状态文档，避免后来者继续以旧 memory foundation 分支作为主要基线。

## 涉及领域

Docs / Handoff / Development Workflow

## 涉及文件

- `当前系统状态.md`
- `docs/TEAM_DEV_LOG.md`

## 数据模型变化

无。

## UI / 交互

无直接 UI 变化。

## 明确不做

- 不修改应用运行时代码。
- 不重复 `DATA_MODEL.md` 的完整字段合同。
- 不把详细提交日志塞进 `当前系统状态.md`，详细记录放 `docs/TEAM_DEV_LOG.md`。

## 验收标准

1. `当前系统状态.md` 说明当前稳定基线已经进入 Phase 3 Alpha。
2. 文档区分已完成能力、demo 状态、风险和下一步。
3. 文档记录 Wave 0 的验证结果和后续 Wave 1 起点。
4. `docs/TEAM_DEV_LOG.md` 追加对应开发记录。
5. `node scripts/smoke-test.mjs` 通过。

## 文档同步

必须同步：

- `当前系统状态.md`
- `docs/TEAM_DEV_LOG.md`

