import type {
  DashboardApiKey,
  DashboardData,
  DashboardModerationLog,
  DashboardPolicy,
  DashboardProject,
  DashboardReviewItem,
} from "@/lib/visora-api";
import { makePolicy } from "./engine";
import type { ApiKey, Category, CompliancePack, ModLog, Policy, Project, ReviewItem, UsageSummary } from "./types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function mapProject(project: DashboardProject, policy?: DashboardPolicy): Project {
  return {
    id: project.projectId,
    name: project.name,
    planId: project.planId,
    mode: policy?.mode ?? "balanced",
    monthMods: formatNumber(project.monthModerations ?? 0),
    created: new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(project.createdAt)),
    updated: formatDate(project.updatedAt),
    compliancePack: policy?.compliancePack as CompliancePack | undefined,
  };
}

export function mapApiKey(apiKey: DashboardApiKey, index: number): ApiKey {
  const displayKey = apiKey.displayKey ?? `${apiKey.apiKeyHash.slice(0, 10)}...${apiKey.apiKeyHash.slice(-6)}`;

  return {
    apiKeyHash: apiKey.apiKeyHash,
    name: apiKey.name ?? `API Key ${index + 1}`,
    projectId: apiKey.projectId,
    displayKey,
    planId: apiKey.planId,
    created: new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(apiKey.createdAt)),
    lastUsedAt: apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : "Never",
    status: apiKey.status === "active" ? "Active" : "Revoked",
  };
}

function mapUsage(data: DashboardData): UsageSummary {
  return data.usage ?? {
    month: new Date().toISOString().slice(0, 7),
    requestsUsed: data.stats.imagesModerated,
    monthlyLimit: data.account.monthlyLimit,
    overageEnabled: data.account.planId !== "free",
    overageRequests: Math.max(0, data.stats.imagesModerated - data.account.monthlyLimit),
    overagePriceCentsPerThousand: 0,
    estimatedOverageCents: 0,
  };
}

export function mapPolicy(policy: DashboardPolicy): Policy {
  return {
    mode: policy.mode,
    minConfidence: policy.minConfidence,
    reviewThreshold: policy.reviewThreshold,
    rejectThreshold: policy.rejectThreshold,
    blockedCategories: policy.blockedCategories as Category[],
    categoryActions: policy.categoryActions as Policy["categoryActions"],
    reviewMode: policy.reviewMode ?? "enabled",
    reviewFallbackAction: policy.reviewFallbackAction ?? "reject",
    compliancePack: policy.compliancePack ?? "none",
  };
}

export function toDashboardPolicy(projectId: string, policy: Policy): DashboardPolicy {
  return {
    projectId,
    mode: policy.mode,
    minConfidence: policy.minConfidence,
    reviewThreshold: policy.reviewThreshold,
    rejectThreshold: policy.rejectThreshold,
    blockedCategories: policy.blockedCategories,
    categoryActions: policy.categoryActions as Record<string, "allow" | "review" | "reject">,
    reviewMode: policy.reviewMode,
    reviewFallbackAction: policy.reviewFallbackAction,
    ...(policy.compliancePack && policy.compliancePack !== "none"
      ? { compliancePack: policy.compliancePack }
      : {}),
  };
}

export function mapModerationLog(log: DashboardModerationLog, projects: Project[]): ModLog {
  const project = projects.find((item) => item.id === log.projectId);
  const category = (log.category ?? null) as Category | null;

  return {
    moderationId: log.moderationId,
    date: formatDate(log.createdAt),
    projectId: log.projectId,
    project: project?.name ?? log.projectId,
    planId: log.planId,
    category,
    riskScore: log.riskScore ?? 0,
    action: log.action,
    brandLevel: log.brandSafety?.level ?? (log.action === "allow" ? "safe" : "unsafe"),
    imageKey: log.imageKey,
    imageUrl: log.imageUrl,
    labels: log.labels.map((label) => ({
      name: label.name,
      confidence: label.confidence,
      category: (label.category ?? null) as Category | null,
    })),
    explanation: log.explanation as ModLog["explanation"],
    policyMode: log.policyMode ?? "balanced",
    compliancePack: log.compliance?.pack as CompliancePack | undefined,
    compliancePassed: log.compliance?.passed,
    complianceViolations: log.compliance?.violations,
  };
}

export function mapReviewItem(review: DashboardReviewItem, projects: Project[]): ReviewItem {
  const project = projects.find((item) => item.id === review.projectId);
  const category = (review.category ?? null) as Category | null;

  return {
    reviewId: review.reviewId,
    moderationId: review.moderationId,
    date: formatDate(review.createdAt),
    accountId: review.accountId,
    projectId: review.projectId,
    project: project?.name ?? review.projectId,
    planId: review.planId,
    imageKey: review.imageKey,
    imageUrl: review.imageUrl,
    status: review.status,
    riskScore: review.riskScore ?? 0,
    category,
    action: review.action,
    brandLevel: review.brandSafety?.level ?? "caution",
    labels: review.labels.map((label) => ({
      name: label.name,
      confidence: label.confidence,
      category: (label.category ?? null) as Category | null,
    })),
    explanation: review.explanation as ReviewItem["explanation"],
    createdAt: review.createdAt,
    reviewedAt: review.reviewedAt,
    reviewedBy: review.reviewedBy,
    decisionReason: review.decisionReason,
  };
}

export function reviewToModLog(review: ReviewItem): ModLog {
  return {
    moderationId: review.moderationId,
    date: review.date,
    projectId: review.projectId,
    project: review.project,
    planId: review.planId,
    category: review.category,
    riskScore: review.riskScore,
    action: review.action,
    brandLevel: review.brandLevel,
    imageKey: review.imageKey,
    imageUrl: review.imageUrl,
    labels: review.labels,
    explanation: review.explanation,
    policyMode: "balanced",
  };
}

export function mapDashboardData(data: DashboardData) {
  const policyByProject = Object.fromEntries(
    data.policies.map((policy) => [policy.projectId, mapPolicy(policy)]),
  );
  const projects = data.projects.map((project) =>
    mapProject(project, data.policies.find((policy) => policy.projectId === project.projectId)),
  );

  return {
    account: data.account,
    projects,
    apiKeys: data.apiKeys.map(mapApiKey),
    policyByProject: Object.fromEntries(
      projects.map((project) => [project.id, policyByProject[project.id] ?? makePolicy(project.mode, project.compliancePack)]),
    ),
    moderationLogs: data.moderationLogs.map((log) => mapModerationLog(log, projects)),
    stats: data.stats,
    usage: mapUsage(data),
  };
}
