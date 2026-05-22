import { makeId } from "../../services/store.js";

export function linkSignals({ project, signals, now = new Date().toISOString() } = {}) {
  const targetSignals = Array.isArray(signals) ? signals : [];
  const existingEntities = Array.isArray(project?.entities) ? project.entities : [];
  const entityByName = new Map(existingEntities.map((entity) => [normalize(entity.name), entity]));
  const newEntities = [];
  const signalUpdates = [];
  const sourceEntityIds = new Map();

  targetSignals.forEach((signal) => {
    const source = (project.sources || []).find((item) => item.id === signal.sourceId);
    const participantNames = Array.isArray(source?.participants) ? source.participants : [];
    const entityIds = participantNames.map((name) => {
      const key = normalize(name);
      if (!key) {
        return null;
      }

      const existing = entityByName.get(key);
      if (existing) {
        return existing.id;
      }

      const entity = buildEntityFromName(name, source, signal, project, now);
      entityByName.set(key, entity);
      newEntities.push(entity);
      return entity.id;
    }).filter(Boolean);

    if (source?.id) {
      sourceEntityIds.set(source.id, entityIds);
    }

    signalUpdates.push({
      id: signal.id,
      suggestedEntityIds: unique([...(signal.suggestedEntityIds || []), ...entityIds]),
      suggestedProjectIds: unique([...(signal.suggestedProjectIds || []), project.id])
    });
  });

  return {
    entities: newEntities,
    signalUpdates,
    sourceUpdates: [...sourceEntityIds.entries()].map(([sourceId, entityIds]) => ({
      sourceId,
      relatedEntityIds: entityIds,
      relatedProjectIds: [project.id]
    })),
    runSummary: `为 ${targetSignals.length} 条 Signal 建议 ${newEntities.length} 个新 Entity。`
  };
}

function buildEntityFromName(name, source, signal, project, now) {
  return {
    id: makeId("ent"),
    type: inferEntityType(name, source),
    name,
    role: "",
    organization: "",
    description: `由 Source「${source?.title || "未命名 Source"}」参与对象建议生成。`,
    status: "watching",
    relationshipStage: "suggested_from_inbox",
    ownerSuggestion: "",
    tags: ["inbox_suggested"],
    sourceIds: source?.id ? [source.id] : [],
    signalIds: signal?.id ? [signal.id] : [],
    memoryIds: [],
    projectIds: unique([...(source?.relatedProjectIds || []), project?.id]),
    lastInteractionAt: source?.occurredAt || source?.receivedAt || now,
    nextSuggestedActionId: "",
    relatedSourceIds: source?.id ? [source.id] : [],
    relatedSignalIds: signal?.id ? [signal.id] : [],
    relatedMemoryIds: [],
    relatedProjectIds: unique([...(source?.relatedProjectIds || []), project?.id]),
    createdAt: now,
    updatedAt: now
  };
}

function inferEntityType(name, source) {
  const text = `${name} ${(source?.body || "").slice(0, 240)}`.toLowerCase();
  if (text.includes("投资") || text.includes("investor")) {
    return "investor";
  }

  if (text.includes("客户") || text.includes("customer")) {
    return "customer";
  }

  if (text.includes("团队") || text.includes("工程") || text.includes("产品")) {
    return "team_member";
  }

  if (text.includes("公司") || text.includes("corp") || text.includes("inc")) {
    return "company";
  }

  return "person";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}
