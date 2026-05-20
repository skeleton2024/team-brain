# QA-02 Entity Project Flow

## 目标

补充 smoke test，覆盖手动 Source 进入后贯穿 Signal、Entity Profile、Project Node、Memory、Action 和 Result 的核心路径。

## 背景

Wave 2 已经分别落地 Entity Profile、Entity Linking、Project Nodes 和 Node Detail Panel。QA-02 需要确认这些能力不是孤立卡片，而能在 Inbox review flow 中连起来：Source / Signal 进入后，Entity 和 Node 都能获得可追溯证据。

## 涉及领域

QA / Inbox / Entity / Project / Memory / Action / Result

## 涉及文件

- `scripts/smoke-test.mjs`
- `src/domain/agentEngine.js`
- `docs/FILE_FUNCTION_NOTES.md`
- `PROJECT_FUNCTION_STRUCTURE.md`

## 数据模型变化

无新增字段。加强 `ProjectNode` 对 `inputContextIds`、`sourceIds`、`signalIds`、`memoryIds`、`actionIds`、`resultIds` 的自动维护。

## UI / 交互

无新增页面。验证现有 Entity Profile 与 Node Detail Panel 可以在完整 flow 中渲染关联证据。

## 明确不做

- 不接 Gmail / Slack API。
- 不自动执行外部动作。
- 不做复杂 e2e 浏览器测试框架。
- 不把产品改成聊天界面。

## 验收标准

1. 手动 Source 创建后会挂到默认 / active Project Node。
2. Source 处理出的 Signal 会挂到 Project Node。
3. Signal 转 Memory / Action 后，Entity 和 Project Node 都能看到新增关联。
4. Action Result 回流后，相关 Result 能挂回 Project Node。
5. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- 更新 `docs/FILE_FUNCTION_NOTES.md`。
