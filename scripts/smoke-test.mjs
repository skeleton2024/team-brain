import { DEMO_PROJECT } from "../src/data/demo.js";
import {
  absorbContext,
  generateBrief,
  recordActionResult,
  updateMemoryStatus
} from "../src/domain/agentEngine.js";
import { extractMemories } from "../src/domain/pipelines/extractMemories.js";
import { renderApp } from "../src/ui/render.js";

let project = structuredClone(DEMO_PROJECT);

project = absorbContext(project, {
  kind: "customer",
  title: "测试客户访谈",
  occurredAt: "2026-05-12",
  participants: ["客户 A", "销售负责人"],
  tags: ["试点", "权限"],
  importance: "high",
  body:
    "客户愿意试点，但担心数据权限和删除机制。投资人问 ARR 和市场壁垒。工程上 GitHub 集成还没做，本周人手紧张。"
});

const newestContext = project.contexts[0];
const memoryCountBeforePipelineProbe = project.memories.length;
const pipelineProbe = extractMemories({
  project,
  context: newestContext,
  now: "2026-05-13T00:00:00.000Z"
});

if (
  !Array.isArray(pipelineProbe.memories) ||
  pipelineProbe.memories.length < 1 ||
  typeof pipelineProbe.runSummary !== "string" ||
  !pipelineProbe.runSummary.includes("候选记忆") ||
  pipelineProbe.memories.some(
    (memory) =>
      memory.createdAt !== "2026-05-13T00:00:00.000Z" ||
      memory.status !== "draft" ||
      !Array.isArray(memory.sourceReferences) ||
      memory.sourceReferences[0]?.contextId !== newestContext.id
  ) ||
  project.memories.length !== memoryCountBeforePipelineProbe
) {
  throw new Error(`extractMemories pipeline contract failed: ${JSON.stringify(pipelineProbe)}`);
}

if (
  newestContext.occurredAt !== "2026-05-12" ||
  newestContext.importance !== "high" ||
  newestContext.participants.length !== 2 ||
  newestContext.tags.length !== 2
) {
  throw new Error(`Context metadata was not persisted: ${JSON.stringify(newestContext)}`);
}

const demoContextsWithMetadata = project.contexts.filter(
  (context) =>
    context.occurredAt &&
    Array.isArray(context.participants) &&
    Array.isArray(context.tags) &&
    context.importance
);

if (demoContextsWithMetadata.length < 3) {
  throw new Error("Expected at least three demo contexts with metadata.");
}

const newestMemory = project.memories.find((memory) => newestContext.memoryIds.includes(memory.id));
if (
  !newestMemory ||
  newestMemory.status !== "draft" ||
  newestMemory.createdBy !== "ai" ||
  !newestMemory.updatedAt ||
  !Array.isArray(newestMemory.sourceReferences) ||
  newestMemory.sourceReferences.length < 1 ||
  newestMemory.sourceReferences[0].contextId !== newestContext.id
) {
  throw new Error(`New memory did not include MEM-01 defaults: ${JSON.stringify(newestMemory)}`);
}

project = updateMemoryStatus(project, newestMemory.id, "confirmed");
const confirmedMemory = project.memories.find((memory) => memory.id === newestMemory.id);
if (
  confirmedMemory.status !== "confirmed" ||
  !confirmedMemory.updatedAt ||
  !confirmedMemory.lastVerifiedAt
) {
  throw new Error(`Confirmed memory did not record MEM-03 timestamps: ${JSON.stringify(confirmedMemory)}`);
}

const memoryActionsHtml = renderApp({
  activeProjectId: project.id,
  selectedActionId: null,
  projects: [project]
});

if (
  !memoryActionsHtml.includes('data-action="update-memory-status"') ||
  !memoryActionsHtml.includes('data-memory-status="archived"')
) {
  throw new Error("Expected memory cards to render quick status actions.");
}

const demoStatuses = new Set(DEMO_PROJECT.memories.map((memory) => memory.status));
if (!demoStatuses.has("confirmed") || !demoStatuses.has("draft") || !demoStatuses.has("outdated")) {
  throw new Error(`Expected demo memories to show multiple statuses: ${JSON.stringify([...demoStatuses])}`);
}

const demoMemoriesWithSources = DEMO_PROJECT.memories.filter(
  (memory) => Array.isArray(memory.sourceReferences) && memory.sourceReferences.length > 0
);

if (demoMemoriesWithSources.length !== DEMO_PROJECT.memories.length) {
  throw new Error("Expected every demo memory to include source references.");
}

let archivedProject = {
  ...structuredClone(DEMO_PROJECT),
  contexts: [],
  actions: [],
  briefs: [],
  results: [],
  memories: [structuredClone(DEMO_PROJECT.memories[0])]
};

archivedProject = updateMemoryStatus(archivedProject, "mem-demo-customer", "archived");
archivedProject = absorbContext(archivedProject, {
  kind: "customer",
  title: "归档后重新输入客户顾虑",
  occurredAt: "2026-05-13",
  participants: ["客户 A"],
  tags: ["权限"],
  importance: "high",
  body: DEMO_PROJECT.memories[0].detail
});

const archivedContext = archivedProject.contexts[0];
const archivedEvidenceActions = archivedProject.actions.filter((item) =>
  archivedContext.actionIds.includes(item.id)
);

if (
  archivedContext.memoryIds.length < 1 ||
  archivedEvidenceActions.some((item) => item.sourceMemoryIds.includes("mem-demo-customer"))
) {
  throw new Error("Archived memories should not block fresh memories or become new action evidence.");
}

const action = project.actions.find((item) => item.status !== "done");
if (!action) {
  throw new Error("Expected at least one open action.");
}

project = generateBrief(project, action.id);
project = recordActionResult(project, action.id, {
  outcome: "positive",
  summary: "客户同意下周试点，但要求权限设置、删除机制和数据范围先确认。"
});

const latestResult = project.results[0];
const resultContext = project.contexts.find(
  (context) => context.title === `行动结果：${action.title}` && context.body.includes("客户同意下周试点")
);
if (
  !resultContext ||
  !Array.isArray(resultContext.memoryIds) ||
  resultContext.memoryIds.length < 1 ||
  !Array.isArray(resultContext.actionIds)
) {
  throw new Error(`Expected action result to create a traceable context: ${JSON.stringify(resultContext)}`);
}

const resultMemories = project.memories.filter((memory) => latestResult.memoryIds.includes(memory.id));
if (
  resultMemories.length < 1 ||
  resultMemories.some(
    (memory) =>
      memory.status !== "draft" ||
      !Array.isArray(memory.sourceReferences) ||
      memory.sourceReferences.length < 1 ||
      memory.sourceReferences.some((reference) => reference.contextId !== resultContext.id)
  )
) {
  throw new Error(`Result memories did not include draft status and sources: ${JSON.stringify(resultMemories)}`);
}

const legacyHtml = renderApp({
  activeProjectId: "legacy-project",
  selectedActionId: null,
  projects: [
    {
      id: "legacy-project",
      name: "Legacy Project",
      stage: "旧数据兼容",
      createdAt: "2026-05-01T00:00:00.000Z",
      updatedAt: "2026-05-01T00:00:00.000Z",
      contexts: [],
      memories: [
        {
          id: "legacy-memory",
          type: "fact",
          title: "旧记忆没有 status",
          detail: "旧 localStorage 数据只保存了基础 memory 字段。",
          source: "旧版本",
          confidence: "medium",
          createdAt: "2026-05-01T00:00:00.000Z"
        }
      ],
      actions: [],
      briefs: [],
      results: []
    }
  ]
});

if (!legacyHtml.includes("待确认") || !legacyHtml.includes("旧来源") || legacyHtml.includes("来源待补")) {
  throw new Error("Expected legacy memory HTML to render default status and legacy source label.");
}

const summary = {
  contexts: project.contexts.length,
  memories: project.memories.length,
  actions: project.actions.length,
  briefs: project.briefs.length,
  results: project.results.length,
  openActions: project.actions.filter((item) => item.status !== "done").length
};

if (!summary.contexts || !summary.memories || !summary.actions || !summary.briefs || !summary.results) {
  throw new Error(`Smoke test failed: ${JSON.stringify(summary)}`);
}

console.log(JSON.stringify(summary, null, 2));
