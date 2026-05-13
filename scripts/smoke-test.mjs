import { DEMO_PROJECT } from "../src/data/demo.js";
import {
  absorbContext,
  generateBrief,
  recordActionResult
} from "../src/domain/agentEngine.js";
import { updateMemory } from "../src/services/store.js";

let project = structuredClone(DEMO_PROJECT);

project = absorbContext(project, {
  kind: "customer",
  title: "测试客户访谈",
  body:
    "客户愿意试点，但担心数据权限和删除机制。投资人问 ARR 和市场壁垒。工程上 GitHub 集成还没做，本周人手紧张。"
});

const editableMemoryId = project.memories.find((item) => item.type === "engineering_blocker")?.id;
if (!editableMemoryId) {
  throw new Error("Expected an engineering memory to edit.");
}

project = {
  ...project,
  memories: project.memories.map((item) =>
    item.id === editableMemoryId
      ? {
          ...item,
          sourceReferences: [
            {
              contextId: "ctx-smoke-source",
              excerpt: "工程上 GitHub 集成还没做",
              confidence: "high"
            }
          ]
        }
      : item
  )
};

const sourceReferences = structuredClone(
  project.memories.find((item) => item.id === editableMemoryId).sourceReferences
);
const referencingActionIds = project.actions
  .filter((item) => item.sourceMemoryIds?.includes(editableMemoryId))
  .map((item) => item.id);

project = updateMemory(project, editableMemoryId, {
  title: "GitHub 集成阻塞需要确认",
  type: "engineering_blocker",
  content: "GitHub 集成仍未完成，需要确认权限、分工和交付时间。",
  status: "confirmed"
});

const editedMemory = project.memories.find((item) => item.id === editableMemoryId);
if (
  editedMemory.title !== "GitHub 集成阻塞需要确认" ||
  editedMemory.detail !== "GitHub 集成仍未完成，需要确认权限、分工和交付时间。" ||
  editedMemory.content !== "GitHub 集成仍未完成，需要确认权限、分工和交付时间。" ||
  editedMemory.status !== "confirmed" ||
  !editedMemory.updatedAt ||
  !editedMemory.lastVerifiedAt
) {
  throw new Error(`Memory edit failed: ${JSON.stringify(editedMemory)}`);
}

if (JSON.stringify(editedMemory.sourceReferences) !== JSON.stringify(sourceReferences)) {
  throw new Error("Memory edit should preserve sourceReferences.");
}

const stillLinked = referencingActionIds.every((actionId) =>
  project.actions.find((item) => item.id === actionId)?.sourceMemoryIds?.includes(editableMemoryId)
);
if (!stillLinked) {
  throw new Error("Memory edit should not break action sourceMemoryIds.");
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
