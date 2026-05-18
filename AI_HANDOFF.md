# TeamMind AI Handoff

用途：给新的 Codex / AI 对话框快速接手项目，减少重复解释和上下文丢失。

最后更新：2026-05-18

## 1. 当前产品判断

TeamMind 的长期目标是公司级 AI operating system。它要吸收公司信息，沉淀可治理记忆，理解客户、投资人、项目和行动之间的关系，并通过行动结果回流持续更新公司判断。

当前不优先做登录、计费、套餐、多租户和复杂外部自动执行。下一阶段的目标是做出可真实使用的 Alpha：手动信息进入、Source / Signal 整理、Entity Profile、Project Node、Memory Governance、Action Brief、Result Feedback 和 Command Center。

## 2. 开发前必须先读

新的 AI 开发会话默认按这个顺序阅读：

```text
README.md
-> 最终产品形态.md
-> docs/AI_DEVELOPMENT_GUIDE.md
-> docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md
-> 当前系统状态.md
-> PROJECT_FUNCTION_STRUCTURE.md
-> DATA_MODEL.md
-> docs/issues/README.md
-> 当前 issue spec
```

如果任务很小，可以只读直接相关文件，但必须说明实际参考了哪些文件。

## 3. 默认开发方式

默认采用“一个主对话跑一个 Wave”的方式：

- 一个主对话负责 3-5 个 issue 的上下文、分支、合并和验收。
- 每个 issue 仍然单独开分支、单独提交、单独 smoke test。
- 核心数据合同、全局状态、路由、pipeline 协议必须先串行定下来。
- UI、测试、文档、互不重叠的小模块可以并行。
- 每完成 2-3 个 issue，更新本文件和 `当前系统状态.md`。
- Wave 结束后更新开发计划和团队日志。

## 4. 当前稳定分支

当前主要集成分支：

```text
integration/CTX-01-MEM-01-MEM-03-REC-01-CTX-03-MEM-02-memory-foundation
```

该分支已集成 Milestone 1 的 memory foundation 方向，包括 CTX、MEM、REC 相关基础能力，并已加入 `最终产品形态.md`。

## 5. 当前下一步

下一步不是继续堆单点能力，而是启动 Phase 3 Alpha：

```text
Wave 0：施工规则、核心数据合同、状态文档和 smoke test 基线
Wave 1：Inbox -> Source -> Signal
Wave 2：Entity Profile + Project Node
Wave 3：Memory Governance + Action Result Loop
Wave 4：Command Center Alpha
```

具体顺序和每轮开发 prompt 见：

```text
docs/PHASE3_ALPHA_DEVELOPMENT_PLAN.md
```

## 6. 不要做

- 不要把主界面改成聊天产品。
- 不要优先接 Gmail / Slack / Notion / Linear / GitHub 自动执行。
- 不要自动发送邮件、Slack 或外部承诺。
- 不要直接合 main。
- 不要多个 issue 混在一个分支里，除非这是明确的 wave integration 分支。
- 不要修改核心数据结构但不更新 `DATA_MODEL.md`。
- 不要新增文件但不更新 `docs/FILE_FUNCTION_NOTES.md`。

## 7. 完成后必须记录

完成一个 issue 或一个 Wave 后，至少记录：

```text
完成了什么：
分支：
提交：
测试：
更新的文档：
遗留风险：
下一步：
```

这些记录可以写入 `docs/TEAM_DEV_LOG.md`，也可以同步更新本文件中的当前状态摘要。
