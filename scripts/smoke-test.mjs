import { DEMO_PROJECT_WITH_SOURCE_EVIDENCE as DEMO_PROJECT } from "../src/data/demoWithSourceEvidence.js";
import {
  absorbContext,
  generateBrief,
  recordActionResult
} from "../src/domain/agentEngineWithSources.js";

let project = structuredClone(DEMO_PROJECT);

const demoMemoriesMissingSources = project.memories.filter(
  (memory) => !hasUsableSourceReference(memory)
);
if (demoMemoriesMissingSources.length) {
  throw new Error(
    `Expected demo memories to include source references: ${demoMemoriesMissingSources
      .map((memory) => memory.id)
      .join(", ")}`
  );
}

project = absorbContext(project, {
  kind: "customer",
  title: "测试客户访谈",
  body:
    "客户愿意试点，但担心数据权限和删除机制。投资人问 ARR 和市场壁垒。工程上 GitHub 集成还没做，本周人手紧张。"
});

const absorbedContext = project.contexts[0];
const absorbedMemories = project.memories.filter((memory) =>
  absorbedContext.memoryIds.includes(memory.id)
);
const absorbedMemoriesMissingSources = absorbedMemories.filter(
  (memory) => !hasUsableSourceReference(memory, absorbedContext.id)
);

if (!absorbedMemories.length || absorbedMemoriesMissingSources.length) {
  throw new Error(
    `Expected absorbed memories to reference ${absorbedContext.id}: ${absorbedMemoriesMissingSources
      .map((memory) => memory.id)
      .join(", ")}`
  );
}

const action = project.actions.find((item) => item.status !== "done");
if (!action) {
  throw new Error("Expected at least one open action.");
}

const resultSummary = "客户同意下周试点，但要求权限设置、删除机制和数据范围先确认。";

project = generateBrief(project, action.id);
project = recordActionResult(project, action.id, {
  outcome: "positive",
  summary: resultSummary
});

const recordedResult = project.results[0];
const resultContext = project.contexts.find(
  (context) => context.title === `行动结果：${action.title}` && context.body === resultSummary
);

if (!recordedResult || !resultContext) {
  throw new Error("Expected action result to be recorded as a source context.");
}

const resultMemories = project.memories.filter((memory) =>
  recordedResult.memoryIds.includes(memory.id)
);
const resultMemoriesMissingSources = resultMemories.filter(
  (memory) => !hasUsableSourceReference(memory, resultContext.id)
);

if (!resultMemories.length || resultMemoriesMissingSources.length) {
  throw new Error(
    `Expected result memories to reference ${resultContext.id}: ${resultMemoriesMissingSources
      .map((memory) => memory.id)
      .join(", ")}`
  );
}

const allMemoriesMissingSources = project.memories.filter(
  (memory) => !hasUsableSourceReference(memory)
);
if (allMemoriesMissingSources.length) {
  throw new Error(
    `Expected every memory to include a source reference: ${allMemoriesMissingSources
      .map((memory) => memory.id)
      .join(", ")}`
  );
}

const summary = {
  contexts: project.contexts.length,
  memories: project.memories.length,
  actions: project.actions.length,
  briefs: project.briefs.length,
  results: project.results.length,
  openActions: project.actions.filter((item) => item.status !== "done").length,
  sourceReferencedMemories: project.memories.filter(hasUsableSourceReference).length,
  resultSourceContextId: resultContext.id
};

if (!summary.contexts || !summary.memories || !summary.actions || !summary.briefs || !summary.results) {
  throw new Error(`Smoke test failed: ${JSON.stringify(summary)}`);
}

console.log(JSON.stringify(summary, null, 2));

function hasUsableSourceReference(memory, contextId) {
  if (!Array.isArray(memory.sourceReferences)) {
    return false;
  }

  return memory.sourceReferences.some(
    (reference) =>
      reference?.quote &&
      reference?.contextId &&
      (!contextId || reference.contextId === contextId)
  );
}
