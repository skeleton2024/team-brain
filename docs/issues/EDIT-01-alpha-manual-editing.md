# EDIT-01 Alpha Manual Editing

## 目标

为 Alpha 中最关键对象提供轻量手动编辑或状态修改能力，让工作台能支持日常运营中的小幅纠正。

## 背景

TeamMind 的信任层要求用户能纠正 AI 判断。当前已有 memory 编辑和部分状态切换，但 Action、Commitment、Risk、Opportunity 仍缺少最小手动调整入口。Wave 5 应优先支持关键字段编辑，而不是引入大型表单系统。

## 涉及领域

Action / Memory / Dashboard / Project / QA

## 涉及文件

- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `scripts/smoke-test.mjs`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`

## 数据模型变化

无新增字段。复用现有字段：

- `ActionItem.priority`
- `ActionItem.status`
- `Commitment.status`
- `Commitment.dueAt`
- `MemoryItem.status`
- `Risk.status`
- `Opportunity.status`

## UI / 交互

- Action card 提供 priority / status 的轻量修改入口。
- Commitment 提供 status / dueAt 的轻量修改入口。
- Risk / Opportunity 提供 status 修改入口。
- Memory status 继续沿用已有治理入口，并在工作台里更容易触达。

## 明确不做

- 不做复杂对象编辑器。
- 不改写原始 Source / Context。
- 不引入后端或鉴权。
- 不自动执行外部动作。

## 验收标准

1. 关键对象的状态或优先级可以本地修改。
2. 修改后的对象在 Command Center 和项目区展示同步变化。
3. 旧 localStorage 缺字段时仍能渲染默认状态。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`

