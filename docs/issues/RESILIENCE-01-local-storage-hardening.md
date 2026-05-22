# RESILIENCE-01 Local Storage Hardening

## 目标

加强旧 localStorage migration、缺字段保护、空状态和异常状态，避免旧项目或部分字段缺失时白屏。

## 背景

Phase 3 Alpha 已多次扩展 Project、Source、Signal、Entity、ProjectNode、Commitment、Risk 和 Opportunity。当前 demo 流程可跑通，但真实用户可能已经有旧 localStorage，或部分对象缺字段。Wave 5 应把兼容性作为 Alpha hardening 的核心工作。

## 涉及领域

Storage / UI / Dashboard / QA

## 涉及文件

- `src/services/store.js`
- `src/ui/render.js`
- `src/domain/pipelines/buildCommandCenter.js`
- `scripts/smoke-test.mjs`
- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`

## 数据模型变化

无新增字段。补齐 migration 和默认值，保证现有合同字段缺失时可以安全 fallback。

## UI / 交互

- 空项目、旧项目、缺少 sources / signals / entities / nodes / commitments / risks / opportunities 的项目仍能渲染。
- Command Center 在没有数据时显示可操作的空状态。
- 部分证据字段缺失时展示“证据待补”，不抛错。

## 明确不做

- 不做数据库迁移系统。
- 不引入 schema 校验库。
- 不删除旧数据。
- 不改变核心产品方向。

## 验收标准

1. `loadState()` / migration 能兼容旧 Project 缺字段。
2. `renderApp()` 能渲染空项目和部分字段缺失项目。
3. Smoke test 增加 legacy project / partial project case。
4. `node scripts/smoke-test.mjs` 通过。

## 文档同步

- `PROJECT_FUNCTION_STRUCTURE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`

