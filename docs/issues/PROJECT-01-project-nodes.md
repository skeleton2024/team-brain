# PROJECT-01 Project Nodes

## 目标

新增 Project Node 的最小数据结构、默认单节点、节点列表和状态切换，让项目从单一事项开始演化为可推进、可复盘的节点结构。

## 背景

长期产品形态要求项目可以拆成多个节点。小项目允许只有一个默认节点，大项目后续可以由 AI 建议拆分并保留人工确认。Wave 2 先落地节点数据和列表展示，为 `PROJECT-02` 的 Node Detail Panel 做基础。

## 涉及领域

Project / ProjectNode / Action / Memory / UI

## 涉及文件

- `src/data/demo.js`
- `src/domain/agentEngine.js`
- `src/domain/types.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/issues/README.md`
- `docs/FILE_FUNCTION_NOTES.md`

## 数据模型变化

- `Project.nodes` 开始在代码中落地。
- 旧项目如果没有 nodes，会在 normalize 时补一个稳定的默认节点。
- 新项目创建时自带一个默认 active node。

## UI / 交互

- 在主工作区新增 `Project Nodes` 面板。
- 节点卡片显示目标、状态、成功标准、关联 Source / Signal / Memory / Action / Result 数量。
- 用户可以切换节点状态：planned / active / blocked / done / archived。

## 明确不做

- 不做 Node Detail Panel，本轮留给 `PROJECT-02`。
- 不做 AI 自动拆分多节点。
- 不自动执行节点行动或外部动作。
- 不做复杂甘特图、看板或项目管理系统。

## 验收标准

1. Demo 项目包含 Project Node。
2. 旧项目没有 nodes 时也能渲染默认节点，不白屏。
3. Project Nodes 面板可以展示节点列表和状态。
4. 节点状态切换只更新本地 state。
5. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- 更新 `DATA_MODEL.md` 当前差异说明。
- 更新 `docs/FILE_FUNCTION_NOTES.md`。
