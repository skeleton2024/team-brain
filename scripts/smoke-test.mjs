import { DEMO_PROJECT } from "../src/data/demo.js";
import {
  absorbContext,
  generateBrief,
  recordActionResult
} from "../src/domain/agentEngine.js";

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
