# REVIEW-01 Human Review Actions

## 目标

补强人工确认动作，让用户能对 Memory Review、Commitment、Risk 和 Opportunity 做最小可用的状态推进。

## 背景

Wave 3 已有 memory governance，Wave 4 已把 commitment、risk 和 opportunity 放进 Command Center。当前 Alpha 仍偏“看见问题”，用户还不能足够快地确认、忽略、归档或推进这些对象。Wave 5 应让用户能在本地完成最小人工 review loop，同时保持所有证据链。

## 涉及领域

Memory / Dashboard / Project / QA

## 涉及文件

- `src/services/store.js`
- `src/ui/render.js`
- `src/main.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`

## 数据模型变化

无新增持久化字段。复用现有 `status`、`updatedAt` 和对象自带 `evidenceLinks` / `sourceReferences`。如实现过程中需要新增 review 元数据，必须同步 `DATA_MODEL.md`。

## UI / 交互

- Memory Review 支持 confirm / dispute / archive 等快速状态动作。
- Commitment 支持 mark done / mark blocked / archive 等本地状态动作。
- Risk 支持 mark mitigated / archive。
- Opportunity 支持 evaluating / pursuing / archive 等状态推进。
- 所有操作只更新本地 state，不触发外部发送或外部承诺。

## 明确不做

- 不自动应用 result 的高影响 memory update。
- 不自动发送催办、邮件、Slack 或客户消息。
- 不新增复杂表单系统。
- 不接 Gmail / Slack / Notion / Linear / GitHub。

## 验收标准

1. 用户能从工作台对 Memory、Commitment、Risk、Opportunity 做最小状态推进。
2. 状态推进保留对象原有证据链。
3. localStorage 保存后刷新仍保留状态。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`

