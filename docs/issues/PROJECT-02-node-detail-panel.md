# PROJECT-02 Node Detail Panel

## 目标

新增 Node Detail Panel，让用户能打开单个 Project Node，查看目标、输入上下文、成功标准、关联 Source / Signal / Memory / Action / Result，以及当前状态治理入口。

## 背景

`PROJECT-01` 已经落地 ProjectNode 数据和节点列表。Wave 2 还需要让节点成为可推进的工作包，而不仅是状态卡片。详情面板应把节点上的输入、证据、行动和结果串起来，为后续 Node Agent、Action Brief 和 Command Center 做基础。

## 涉及领域

Project / ProjectNode / Memory / Action / Result / UI

## 涉及文件

- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `scripts/smoke-test.mjs`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`

## 数据模型变化

无新增字段。消费 `ProjectNode` 已有的 `inputContextIds`、`sourceIds`、`signalIds`、`memoryIds`、`actionIds`、`resultIds`。

## UI / 交互

- 节点卡片提供“详情”入口。
- 详情面板展示节点目标、成功标准、输入上下文、证据链、相关行动和结果。
- 用户可以关闭详情面板，或点击相关 Action 切换到 Brief 面板。

## 明确不做

- 不做节点编辑表单。
- 不做 AI 自动拆分节点。
- 不做复杂项目管理看板。
- 不自动执行节点 action 或外部动作。

## 验收标准

1. Demo 节点可以打开 Node Detail Panel。
2. 详情中能看到目标、成功标准、输入上下文、Source、Signal、Memory、Action。
3. 点击相关 Action 仍沿用现有 action 选择逻辑。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- 更新 `docs/FILE_FUNCTION_NOTES.md`。
