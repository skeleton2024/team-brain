# TeamMind 团队开发共享日志

文档名：`docs/TEAM_DEV_LOG.md`
用途：团队协作看板、分支规则、开发决策和验收记录。
最后更新：2026-05-12

## 1. 当前协作结论

TeamMind 现在可以开始和队友协作开发。当前路线已经足够清晰，原因是：

- `PRD.md` 已经定义 v0.2 的产品方向和不做范围。
- `DATA_MODEL.md` 已经定义目标数据结构。
- `PROJECT_FUNCTION_STRUCTURE.md` 已经定义模块边界。
- `docs/issues/` 已经把 Milestone 1 拆成可执行 issue。
- `scripts/smoke-test.mjs` 可以验证核心闭环没有断。

但项目还处在 v0.1 到 v0.2 的过渡阶段，很多代码仍集中在 `src/main.js`、`src/ui/render.js`、`src/domain/agentEngine.js`。因此可以多人协作，但前几个 issue 需要控制并行度，避免多人同时大改同一文件。

## 2. 仓库和分支现状

远程仓库：

```text
https://github.com/skeleton2024/team-brain.git
```

当前主分支：

```text
main
```

当前没有单独的 `dev` 分支。`npm run dev` 只是本地开发服务器命令，不代表 GitHub 里已经有一个 `dev` 分支。

默认推荐协作方式：

```text
main
  <- PR from codex/CTX-01-context-metadata
  <- PR from codex/CTX-03-context-memory-source-links
  <- PR from codex/MEM-01-memory-status-source-references
```

重要 issue 建议从 `main` 拉一个短生命周期分支，完成后通过 PR 或明确提交合回 `main`。但这不是僵硬审批规则：多个强相关 issue 可以合并在同一个分支中开发，多人也可以共同使用一个开发分支。当前阶段不建议先加复杂流程；如果后续团队人数变多，可以再创建长期 `dev` 分支做集成。

## 3. 草稿版本怎么改

可以改仓库里的草稿版本，但要区分三类内容：

- 产品/需求草稿：例如 `PRD.md`、`docs/issues/*.md`。这类可以直接通过文档 PR 修改。
- 代码草稿：例如某个 issue 的未完成实现。重要或不确定改动建议放在 issue/spike 分支，不建议长期把半成品留在 `main`。
- 本地运行草稿：浏览器 localStorage 里的数据只存在本机，不会自动进入仓库；需要变成共享内容时，应写入 `src/data/demo.js` 或文档。

当前仓库里的 `main` 是共享基准版本，不是个人长期草稿区。个人实验可以开分支，例如：

```text
codex/spike-memory-reconciliation
codex/CTX-01-context-metadata
teammate/MEM-02-edit-company-memory
```

## 4. v0.2 当前建议顺序

Milestone 1：让公司记忆可信。

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

推荐先做 `CTX-01`，因为它给后续 source references 提供更完整的原始上下文；如果团队只想先验证“记忆可信”的核心体验，也可以直接从 `MEM-01` 开始，但后续仍然要补 `CTX-01` 和 `CTX-03`。

## 5. 当前任务看板

| Issue | 状态 | 建议负责人 | 建议分支 | 备注 |
| --- | --- | --- | --- | --- |
| CTX-01 | 待开始 | 未分配 | `codex/CTX-01-context-metadata` | 优先做，补上下文 metadata |
| CTX-03 | 待开始 | 未分配 | `codex/CTX-03-context-memory-source-links` | 依赖 context 数据更完整 |
| MEM-01 | 待 review | Codex | `codex/MEM-01-memory-status-source-references` | 已补 memory 状态、来源数和旧数据兼容 |
| MEM-02 | 待开始 | 未分配 | `codex/MEM-02-edit-company-memory` | 会改 `render.js` 和 `main.js`，注意冲突 |
| MEM-03 | 待开始 | 未分配 | `codex/MEM-03-memory-status-transitions` | 依赖 MEM-01 的状态字段 |
| MEM-04 | 待开始 | 未分配 | `codex/MEM-04-memory-detail-panel` | 可能和 CTX-03 的来源跳转有关 |
| REC-01 | 待开始 | 未分配 | `codex/REC-01-extract-memories-pipeline` | 开始拆 domain pipeline |
| REC-02 | 待开始 | 未分配 | `codex/REC-02-reconcile-memories-pipeline` | 依赖 REC-01 更清楚 |

状态建议只用：

```text
待开始 / 开发中 / 待 review / 已合并 / 暂停
```

## 6. 分支和提交规则

分支命名建议：

```text
codex/ISSUE-ID-short-name
name/ISSUE-ID-short-name
spike/topic-name
```

提交信息建议：

```text
CTX-01 Add context metadata fields
MEM-01 Add memory status badges
REC-01 Extract memory pipeline
```

默认建议一个 PR 对应一个 issue，但允许多个强相关 issue 合并在一个分支或 PR 中开发。关键要求不是形式上完美拆分，而是每次改动都能说明目的、影响文件、验证结果和遗留风险。

## 7. 易冲突文件

这些文件多人同时开发时最容易冲突：

- `src/main.js`：事件绑定和状态更新集中在这里。
- `src/ui/render.js`：大部分 UI 都在一个文件中。
- `src/domain/agentEngine.js`：当前业务规则还没拆 pipeline。
- `src/data/demo.js`：每个数据模型变化都可能要改 demo。
- `DATA_MODEL.md`：新增字段时必须更新。

协作建议：

- 同一时间只让一个人主改 `render.js` 的同一区域。
- UI issue 和 domain issue 可以并行，但要提前说明各自改哪些文件。
- 数据模型变更先更新 `DATA_MODEL.md`，再改代码和 demo。

## 8. 每个 issue 的完成标准

完成一个 issue 前至少满足：

- 当前页面可以打开。
- 核心闭环没有断：上下文输入 -> 记忆 -> 行动 -> Brief -> 结果回流。
- `node scripts/smoke-test.mjs` 通过。
- Demo 数据能展示新增能力。
- 数据模型变化已同步 `DATA_MODEL.md`。
- 行为变化已同步对应 issue spec 或 PRD。
- 没有新增自动外部执行能力。
- 没有把主界面改成聊天产品。

## 9. 本地验证命令

运行静态服务：

```bash
npm run dev
```

或：

```bash
python -m http.server 4173
```

运行 smoke test：

```bash
node scripts/smoke-test.mjs
```

## 10. 日志记录格式

每次开始或完成一个 issue，可以在这里追加一条记录：

```text
日期：
负责人：
Issue：
分支：
状态：
改动文件：
验证结果：
待决问题：
```

## 11. 开发日志

### 2026-05-12

负责人：Codex
Issue：MEM-01 增加 memory status 和 sourceReferences
分支：`codex/MEM-01-memory-status-source-references`
状态：待 review
改动文件：

- `src/domain/types.js`
- `src/domain/agentEngine.js`
- `src/services/store.js`
- `src/ui/render.js`
- `src/styles.css`
- `src/data/demo.js`
- `scripts/smoke-test.mjs`
- `DATA_MODEL.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`

验证结果：

- 新生成 memory 默认 `status = "draft"`，并带 `sourceReferences`、`createdBy`、`updatedAt`。
- Demo memory 已展示不同状态、来源数量和置信度。
- 结果回流会生成可追溯的 result context，结果 memory 的 `sourceReferences` 指向真实 context。
- 旧 memory 没有 `status` 时显示默认状态；有旧版 `source` 但没有 `sourceReferences` 时显示“旧来源”，不误报“来源待补”。
- `node scripts/smoke-test.mjs` 通过。

待决问题：

- 当前分支基于 `codex/CTX-01-context-metadata` 堆叠开发，后续需要在 CTX-01 合并后决定 rebase 或拆 PR。
- MEM-01 只展示状态，不提供编辑和状态切换；这些留给 MEM-02/MEM-03。

### 2026-05-12

负责人：Codex
Issue：AI 开发规范指南
分支：`main`
状态：已完成
改动文件：

- `docs/AI_DEVELOPMENT_GUIDE.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `docs/TEAM_DEV_LOG.md`
- `README.md`

验证结果：

- 新增 AI 和开发者通用开发规范指南。
- 明确 AI 每次开发需要阅读的上下文文档。
- 将开发规则调整为“允许试错，但必须可审计、可追溯、可恢复”。
- 将分支规则调整为默认建议，允许强相关任务合并开发。

待决问题：

- 后续是否要把 GitHub PR 模板也按本指南固化。

### 2026-05-12

负责人：Codex
Issue：文档协作准备
分支：`main`
状态：已完成
改动文件：

- `docs/TEAM_DEV_LOG.md`
- `docs/FILE_FUNCTION_NOTES.md`
- `README.md`

验证结果：

- 新增团队共享开发日志。
- 新增全文件功能备注文档。
- 明确当前没有 `dev` 分支，推荐按 issue 分支开发后 PR 合回 `main`。

待决问题：

- 是否需要创建长期 `dev` 集成分支。
- 是否要为 GitHub 仓库开启 branch protection 和 PR review 规则。
