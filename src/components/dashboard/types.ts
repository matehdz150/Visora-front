/**
 * Visora dashboard — domain types. These mirror the shapes ModerateAPI returns
 * so the screens map 1:1 to the API once the fetch layer lands.
 */

export type Action = "allow" | "review" | "reject";

export type Category =
  | "nudity"
  | "suggestive"
  | "violence"
  | "drugs"
  | "weapons"
  | "hate_symbols"
  | "gambling"
  | "alcohol";

export type BrandLevel = "safe" | "caution" | "unsafe";

export type Mode = "strict" | "balanced" | "relaxed";
export type ReviewMode = "enabled" | "disabled";
export type ReviewFallbackAction = "allow" | "reject";
export type ProjectType = "moderation" | "redaction" | "verify";
export type RedactionStyle = "blur" | "black_box";
export type RedactionTextCategory = "sexual" | "profanity" | "credentials" | "id_document" | "pii" | "financial" | "medical" | "dates";

export interface RedactionSettings {
  faceBlur: boolean;
  textBlur: boolean;
  licensePlateBlur: boolean;
  redactionStyle: RedactionStyle;
  textCategories: RedactionTextCategory[];
  customWords: string[];
  ignoredWords: string[];
  minConfidence: number;
}

export type VerifyDecision = "verified" | "review" | "rejected";

export interface VerifySettings {
  faceMatchThreshold: number;
  faceMatchRejectBelow: number;
  requireUnexpiredDocument: boolean;
}

export type CompliancePack =
  | "marketplace"
  | "kids"
  | "education"
  | "social"
  | "dating"
  | "ads";

export type Page =
  | "overview"
  | "moderations"
  | "redactions"
  | "verifications"
  | "reviews"
  | "webhooks"
  | "admin"
  | "playground"
  | "projects"
  | "project-detail"
  | "create-project"
  | "keys"
  | "settings";

export interface DecisionExplanation {
  message: string;
  reason: "no_policy_match" | "category_action" | "risk_threshold" | "review_fallback";
  matchedCategory?: Category;
  matchedLabel?: string;
  matchedConfidence?: number;
  configuredAction?: Action;
  threshold?: number;
}

export interface Label {
  name: string;
  confidence: number;
  category?: Category | null;
}

export interface ScoredLabel extends Label {
  active: boolean;
  blocked: boolean;
  action: Action;
}

export interface ModLog {
  moderationId: string;
  date: string;
  projectId: string;
  project: string;
  planId: string;
  category: Category | null;
  riskScore: number;
  action: Action;
  brandLevel: BrandLevel;
  imageKey: string;
  imageUrl?: string;
  labels?: Label[];
  explanation?: DecisionExplanation;
  policyMode: Mode;
  compliancePack?: CompliancePack;
  compliancePassed?: boolean;
  complianceViolations?: string[];
}

export type ReviewStatus = "pending" | "approved" | "rejected" | "ignored";

export interface ReviewItem {
  reviewId: string;
  moderationId: string;
  date: string;
  accountId: string;
  projectId: string;
  project: string;
  planId: string;
  imageKey: string;
  imageUrl?: string;
  status: ReviewStatus;
  riskScore: number;
  category: Category | null;
  action: Action;
  brandLevel: BrandLevel;
  labels?: Label[];
  explanation?: DecisionExplanation;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decisionReason?: string;
}

export interface Policy {
  mode: Mode;
  minConfidence: number;
  reviewThreshold: number;
  rejectThreshold: number;
  blockedCategories: Category[];
  categoryActions: Partial<Record<Category, Action>>;
  reviewMode: ReviewMode;
  reviewFallbackAction: ReviewFallbackAction;
  compliancePack?: CompliancePack | "none";
}

export interface Project {
  id: string;
  name: string;
  projectType: ProjectType;
  redactionSettings: RedactionSettings;
  verifySettings: VerifySettings;
  planId: string;
  mode: Mode;
  monthMods: string;
  created: string;
  updated: string;
  compliancePack?: CompliancePack;
}

export interface ApiKey {
  apiKeyHash: string;
  name: string;
  projectId: string;
  displayKey: string;
  planId: string;
  created: string;
  lastUsedAt: string;
  status: "Active" | "Revoked";
}

export type WebhookEventType =
  | "moderation.completed"
  | "moderation.review_required"
  | "review.approved"
  | "review.rejected"
  | "redaction.completed"
  | "verification.completed";

export type WebhookEventStatus = "pending" | "delivered" | "failed" | "skipped";

export interface WebhookEndpoint {
  webhookId: string;
  projectId: string;
  name?: string;
  url: string;
  events: WebhookEventType[];
  status: "active" | "disabled";
  createdAt: string;
  updatedAt: string;
  previousSecretExpiresAt?: string;
}

export interface WebhookEventLog {
  eventId: string;
  type: WebhookEventType;
  accountId: string;
  projectId: string;
  payload: Record<string, unknown>;
  status: WebhookEventStatus;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt?: string;
  lastError?: string;
  deliveredAt?: string;
  skippedAt?: string;
}

export interface UsageSummary {
  month: string;
  requestsUsed: number;
  monthlyLimit: number;
  overageEnabled: boolean;
  overageRequests: number;
  overagePriceCentsPerThousand: number;
  estimatedOverageCents: number;
}
