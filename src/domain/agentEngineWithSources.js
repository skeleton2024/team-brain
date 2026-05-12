import {
  absorbContext,
  generateBrief,
  recordActionResult as recordActionResultCore
} from "./agentEngine.js";
import { makeId } from "../services/store.js";

export { absorbContext, generateBrief };

export function recordActionResult(project, actionId, resultInput) {
  const action = project.actions.find((item) => item.id === actionId);
  if (!action) {
    return project;
  }

  const nextProject = recordActionResultCore(project, actionId, resultInput);
  const result = nextProject.results[0];
  if (!result || result.actionId !== actionId || result.summary !== resultInput.summary) {
    return nextProject;
  }

  const resultMemories = nextProject.memories.filter((memory) =>
    result.memoryIds.includes(memory.id)
  );
  if (!resultMemories.length || resultMemories.every(hasUsableSourceReference)) {
    return nextProject;
  }

  const sourceTitle = `行动结果：${action.title}`;
  const resultContext = {
    id: makeId("ctx"),
    kind: "other",
    title: sourceTitle,
    body: resultInput.summary,
    createdAt: result.createdAt,
    memoryIds: [...result.memoryIds],
    actionIds: [...result.actionIds]
  };
  const resultMemoryIds = new Set(result.memoryIds);

  return {
    ...nextProject,
    contexts: [resultContext, ...nextProject.contexts],
    memories: nextProject.memories.map((memory) => {
      if (!resultMemoryIds.has(memory.id) || hasUsableSourceReference(memory)) {
        return memory;
      }

      return {
        ...memory,
        sourceReferences: [buildResultSourceReference(resultContext, memory)]
      };
    })
  };
}

function buildResultSourceReference(context, memory) {
  return {
    contextId: context.id,
    quote: truncateQuote(memory.detail || context.body),
    note: `来自上下文：${context.title}`,
    confidence: sourceConfidenceValue(memory.confidence)
  };
}

function hasUsableSourceReference(memory) {
  return Array.isArray(memory.sourceReferences) &&
    memory.sourceReferences.some((reference) => reference?.contextId && reference?.quote);
}

function truncateQuote(value) {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  return clean.length > 180 ? `${clean.slice(0, 180)}...` : clean;
}

function sourceConfidenceValue(confidence) {
  const values = {
    high: 0.9,
    medium: 0.7,
    low: 0.5
  };

  return values[confidence] ?? 0.5;
}
