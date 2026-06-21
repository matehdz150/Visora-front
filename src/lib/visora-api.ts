const API_BASE_URL =
  process.env.NEXT_PUBLIC_VISORA_API_URL ??
  "https://6p0ws7vu2f.execute-api.us-east-1.amazonaws.com/dev";

const SESSION_STORAGE_KEY = "visora.session";
const OAUTH_STATE_STORAGE_KEY = "visora.oauth.state";
const OAUTH_CODE_VERIFIER_STORAGE_KEY = "visora.oauth.codeVerifier";
const COGNITO_DOMAIN =
  process.env.NEXT_PUBLIC_COGNITO_DOMAIN ??
  "https://visoracloud.auth.us-east-1.amazoncognito.com";
const COGNITO_CLIENT_ID =
  process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "670ta8v3io1g1kat5jrgechpll";
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? "";
const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://visoracloud.com";

export interface VisoraSession {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface OAuthState {
  csrf: string;
  intent: "signin" | "signup";
  planId?: PlanId;
  returnTo?: string;
}

export interface CurrentUser {
  userId: string;
  email: string;
}

export type PlanId = "free" | "starter" | "plus" | "growth" | "scale";

export interface DeleteAccountResponse {
  deleted: boolean;
  deletedCounts?: Record<string, number>;
}

export interface BillingSubscriptionIntent {
  clientSecret: string;
  subscriptionId: string;
  customerId: string;
  planId: Exclude<PlanId, "free">;
}

export interface BillingPlanChangeResponse {
  account: DashboardAccount;
  changeType: "none" | "immediate" | "scheduled";
  effectiveAt?: string;
}

export interface DashboardAccount {
  accountId: string;
  email: string;
  userId: string;
  planId: PlanId;
  monthlyLimit: number;
  projectLimit: number;
  apiKeyLimit: number;
  logRetentionDays: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionStatus?: string;
  stripeCurrentPeriodEnd?: string;
  stripePendingPlanId?: PlanId;
  stripePlanChangeEffectiveAt?: string;
  stripeScheduleId?: string;
  stripeCancelAtPeriodEnd?: boolean;
}

export interface ModerationDecisionExplanation {
  message: string;
  reason: "no_policy_match" | "category_action" | "risk_threshold" | "review_fallback";
  matchedCategory?: string;
  matchedLabel?: string;
  matchedConfidence?: number;
  configuredAction?: "allow" | "review" | "reject";
  threshold?: number;
}

export interface ModerationLabel {
  name: string;
  confidence: number;
  category?: string | null;
}

export interface ModerationResponse {
  moderationId: string;
  safe: boolean;
  action: "allow" | "review" | "reject";
  riskScore?: number;
  category?: string | null;
  labels: ModerationLabel[];
  explanation?: ModerationDecisionExplanation;
  brandSafety?: {
    safe: boolean;
    score: number;
    level: "safe" | "caution" | "unsafe";
    reasons: string[];
  };
  compliance?: {
    pack: string;
    passed: boolean;
    violations: string[];
  } | null;
}

export interface DashboardProject {
  accountId: string;
  projectId: string;
  name: string;
  planId: string;
  monthlyLimit: number;
  monthModerations?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardApiKey {
  apiKeyHash: string;
  displayKey?: string;
  accountId: string;
  projectId: string;
  planId: string;
  status: "active" | "revoked";
  monthlyLimit: number;
  createdAt: string;
  lastUsedAt?: string;
  name?: string;
}

export interface DashboardPolicy {
  projectId: string;
  mode: "strict" | "balanced" | "relaxed";
  compliancePack?: "marketplace" | "kids" | "education" | "social" | "dating" | "ads";
  minConfidence: number;
  blockedCategories: string[];
  categoryActions: Record<string, "allow" | "review" | "reject">;
  reviewMode?: "enabled" | "disabled";
  reviewFallbackAction?: "allow" | "reject";
  reviewThreshold: number;
  rejectThreshold: number;
}

export interface DashboardModerationLog {
  moderationId: string;
  accountId: string;
  projectId: string;
  planId: string;
  imageKey: string;
  imageUrl?: string;
  safe: boolean;
  action: "allow" | "review" | "reject";
  riskScore?: number;
  category?: string | null;
  policyMode?: "strict" | "balanced" | "relaxed";
  labels: ModerationLabel[];
  explanation?: ModerationDecisionExplanation;
  brandSafety?: { level: "safe" | "caution" | "unsafe"; score: number; reasons: string[] };
  compliance?: { pack: string; passed: boolean; violations: string[] } | null;
  createdAt: string;
}

export type WebhookEventType =
  | "moderation.completed"
  | "moderation.review_required"
  | "review.approved"
  | "review.rejected";

export type WebhookEventStatus = "pending" | "delivered" | "failed" | "skipped";

export interface DashboardWebhookEndpoint {
  webhookId: string;
  accountId: string;
  projectId: string;
  name?: string;
  url: string;
  events: WebhookEventType[];
  status: "active" | "disabled";
  createdAt: string;
  updatedAt: string;
  previousSecretExpiresAt?: string;
}

export interface DashboardWebhookEvent {
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

export interface DashboardReviewItem {
  reviewId: string;
  accountId: string;
  projectId: string;
  planId: string;
  moderationId: string;
  imageKey: string;
  imageUrl?: string;
  status: "pending" | "approved" | "rejected" | "ignored";
  riskScore?: number;
  category?: string | null;
  action: "allow" | "review" | "reject";
  labels: ModerationLabel[];
  explanation?: ModerationDecisionExplanation;
  brandSafety?: { level: "safe" | "caution" | "unsafe"; score: number; reasons: string[] };
  compliance?: { pack: string; passed: boolean; violations: string[] } | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decisionReason?: string;
}

export interface AdminAccountSummary {
  accountId: string;
  email: string;
  userId: string;
  planId: PlanId;
  monthlyLimit: number;
  projectLimit: number;
  apiKeyLimit: number;
  logRetentionDays: number;
  createdAt: string;
  updatedAt: string;
  projectsCount: number;
  activeApiKeys: number;
  revokedApiKeys: number;
  requestsUsed: number;
  usagePercent: number;
}

export interface AdminProjectSummary {
  accountId: string;
  projectId: string;
  name: string;
  planId: string;
  monthModerations: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSystemError {
  timestamp: string;
  logGroupName: string;
  logStreamName?: string;
  event?: string;
  route?: string;
  requestId?: string;
  accountId?: string;
  projectId?: string;
  message: string;
}

export interface AdminWebhookFailure {
  eventId: string;
  type: WebhookEventType;
  accountId: string;
  projectId: string;
  status: WebhookEventStatus;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt?: string;
  lastError?: string;
}

export interface AdminOverviewData {
  generatedAt: string;
  usage: {
    month: string;
    totalRequestsUsed: number;
    totalMonthlyLimit: number;
    overageAccounts: number;
    nearLimitAccounts: number;
  };
  accounts: AdminAccountSummary[];
  topProjects: AdminProjectSummary[];
  usersNearLimit: AdminAccountSummary[];
  failedWebhooks: AdminWebhookFailure[];
  recentErrors: AdminSystemError[];
  recentErrorsUnavailable?: string;
}

export interface DashboardData {
  account: DashboardAccount;
  projects: DashboardProject[];
  apiKeys: DashboardApiKey[];
  policies: DashboardPolicy[];
  moderationLogs: DashboardModerationLog[];
  stats: {
    imagesModerated: number;
    rejected: number;
    review: number;
    activeProjects: number;
  };
  usage?: {
    month: string;
    requestsUsed: number;
    monthlyLimit: number;
    overageEnabled: boolean;
    overageRequests: number;
    overagePriceCentsPerThousand: number;
    estimatedOverageCents: number;
  };
}

interface RegisterResponse {
  userId: string;
  userConfirmed: boolean;
  account: DashboardAccount;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as { error?: string } | T | null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && payload.error
        ? payload.error
        : "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export async function registerUser(email: string, password: string, planId: PlanId): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, planId }),
  });

  return parseResponse<RegisterResponse>(response);
}

export async function confirmRegistration(email: string, confirmationCode: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, confirmationCode }),
  });

  await parseResponse<unknown>(response);
}

export async function resendConfirmationCode(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/resend-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  await parseResponse<unknown>(response);
}

export async function loginUser(email: string, password: string): Promise<VisoraSession> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<VisoraSession>(response);
}

export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  await parseResponse<unknown>(response);
}

export async function confirmForgotPassword(email: string, confirmationCode: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/confirm-forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, confirmationCode, newPassword }),
  });

  await parseResponse<unknown>(response);
}

function base64UrlEncode(value: ArrayBuffer | string): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");

  return window.atob(padded);
}

function createRandomString(length = 64): string {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);

  return base64UrlEncode(bytes.buffer).slice(0, length);
}

async function createCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));

  return base64UrlEncode(digest);
}

export function getPublicAppOrigin() {
  if (typeof window === "undefined") {
    return APP_ORIGIN.replace(/\/$/, "");
  }

  const host = window.location.hostname;

  if (host === "localhost" || host === "127.0.0.1") {
    return window.location.origin;
  }

  if (host === "visoracloud.com" || host === "www.visoracloud.com") {
    return window.location.origin;
  }

  return APP_ORIGIN.replace(/\/$/, "");
}

function ensureSupportedOAuthOrigin() {
  if (typeof window === "undefined") return true;

  const host = window.location.hostname;

  if (host === "localhost" || host === "127.0.0.1" || host === "visoracloud.com" || host === "www.visoracloud.com") {
    return true;
  }

  window.location.assign(`${APP_ORIGIN.replace(/\/$/, "")}${window.location.pathname}${window.location.search}`);
  return false;
}

function getOAuthRedirectUri() {
  return `${getPublicAppOrigin()}/auth/callback/`;
}

function getGitHubRedirectUri() {
  return `${getPublicAppOrigin()}/auth/github/callback/`;
}

export async function startGoogleOAuth(params: {
  intent: "signin" | "signup";
  planId?: PlanId;
  returnTo?: string;
}): Promise<void> {
  if (!ensureSupportedOAuthOrigin()) return;

  const csrf = createRandomString(32);
  const codeVerifier = createRandomString(96);
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const state: OAuthState = {
    csrf,
    intent: params.intent,
    ...(params.planId ? { planId: params.planId } : {}),
    ...(params.returnTo ? { returnTo: params.returnTo } : {}),
  };

  window.sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, JSON.stringify(state));
  window.sessionStorage.setItem(OAUTH_CODE_VERIFIER_STORAGE_KEY, codeVerifier);

  const searchParams = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    response_type: "code",
    scope: "openid email profile",
    redirect_uri: getOAuthRedirectUri(),
    identity_provider: "Google",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state: base64UrlEncode(JSON.stringify(state)),
  });

  window.location.assign(`${COGNITO_DOMAIN}/oauth2/authorize?${searchParams.toString()}`);
}

export async function startGitHubOAuth(params: {
  intent: "signin" | "signup";
  planId?: PlanId;
  returnTo?: string;
}): Promise<void> {
  if (!ensureSupportedOAuthOrigin()) return;

  if (!GITHUB_CLIENT_ID) {
    throw new Error("GitHub sign in is not configured");
  }

  const state: OAuthState = {
    csrf: createRandomString(32),
    intent: params.intent,
    ...(params.planId ? { planId: params.planId } : {}),
    ...(params.returnTo ? { returnTo: params.returnTo } : {}),
  };

  window.sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, JSON.stringify(state));

  const searchParams = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: getGitHubRedirectUri(),
    scope: "read:user user:email",
    state: base64UrlEncode(JSON.stringify(state)),
  });

  window.location.assign(`https://github.com/login/oauth/authorize?${searchParams.toString()}`);
}

export function readOAuthState(encodedState: string | null): OAuthState | null {
  if (!encodedState) return null;

  try {
    const decoded = JSON.parse(base64UrlDecode(encodedState)) as OAuthState;
    const storedRaw = window.sessionStorage.getItem(OAUTH_STATE_STORAGE_KEY);
    const stored = storedRaw ? (JSON.parse(storedRaw) as OAuthState) : null;

    if (!stored || stored.csrf !== decoded.csrf) {
      throw new Error("OAuth state mismatch");
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function exchangeCognitoCodeForSession(code: string): Promise<VisoraSession> {
  const codeVerifier = window.sessionStorage.getItem(OAUTH_CODE_VERIFIER_STORAGE_KEY);

  if (!codeVerifier) {
    throw new Error("Missing OAuth code verifier");
  }

  const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: COGNITO_CLIENT_ID,
      code,
      redirect_uri: getOAuthRedirectUri(),
      code_verifier: codeVerifier,
    }),
  });
  const payload = await parseResponse<{
    id_token: string;
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
  }>(response);

  window.sessionStorage.removeItem(OAUTH_STATE_STORAGE_KEY);
  window.sessionStorage.removeItem(OAUTH_CODE_VERIFIER_STORAGE_KEY);

  return {
    idToken: payload.id_token,
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresIn: payload.expires_in,
    tokenType: payload.token_type,
  };
}

export async function exchangeGitHubCodeForSession(code: string, planId?: PlanId): Promise<VisoraSession> {
  const response = await fetch(`${API_BASE_URL}/auth/github/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      redirectUri: getGitHubRedirectUri(),
      ...(planId ? { planId } : {}),
    }),
  });

  const session = await parseResponse<VisoraSession>(response);

  window.sessionStorage.removeItem(OAUTH_STATE_STORAGE_KEY);

  return session;
}

export async function getCurrentUser(idToken: string): Promise<CurrentUser> {
  const response = await fetch(`${API_BASE_URL}/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${idToken}` },
  });

  return parseResponse<CurrentUser>(response);
}

export async function getAdminOverview(idToken: string): Promise<AdminOverviewData> {
  const response = await fetch(API_BASE_URL + "/admin/overview", {
    headers: { Authorization: "Bearer " + idToken },
  });

  return parseResponse<AdminOverviewData>(response);
}

export async function getDashboardData(idToken: string): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/dashboard-data`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  return parseResponse<DashboardData>(response);
}

export async function createBillingSubscriptionIntent(idToken: string, planId: Exclude<PlanId, "free">): Promise<BillingSubscriptionIntent> {
  const response = await fetch(`${API_BASE_URL}/billing/subscription-intent/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ planId }),
  });

  return parseResponse<BillingSubscriptionIntent>(response);
}

export async function createBillingCheckoutSession(idToken: string, planId: Exclude<PlanId, "free">): Promise<{ url: string }> {
  const response = await fetch(`${API_BASE_URL}/billing/checkout-session`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ planId }),
  });

  return parseResponse<{ url: string }>(response);
}

export async function changeBillingPlan(idToken: string, planId: PlanId): Promise<BillingPlanChangeResponse> {
  const response = await fetch(`${API_BASE_URL}/billing/change-plan/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ planId }),
  });

  return parseResponse<BillingPlanChangeResponse>(response);
}

export async function createBillingPortalSession(idToken: string): Promise<{ url: string }> {
  const response = await fetch(`${API_BASE_URL}/billing/portal-session`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });

  return parseResponse<{ url: string }>(response);
}

export async function syncBillingAccount(idToken: string): Promise<DashboardAccount> {
  const response = await fetch(`${API_BASE_URL}/billing/sync/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });
  const payload = await parseResponse<{ account: DashboardAccount }>(response);

  return payload.account;
}

export async function deleteAccount(idToken: string): Promise<DeleteAccountResponse> {
  const response = await fetch(`${API_BASE_URL}/account`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });

  return parseResponse<DeleteAccountResponse>(response);
}

export async function updateAccountPlan(idToken: string, planId: PlanId): Promise<DashboardAccount> {
  const response = await fetch(`${API_BASE_URL}/account/plan`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ planId }),
  });
  const payload = await parseResponse<{ account: DashboardAccount }>(response);

  return payload.account;
}

export async function createDashboardProject(params: {
  idToken: string;
  name: string;
}): Promise<DashboardProject> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: params.name }),
  });
  const payload = await parseResponse<{ project: DashboardProject }>(response);

  return payload.project;
}

export async function renameDashboardProject(params: {
  idToken: string;
  projectId: string;
  name: string;
}): Promise<DashboardProject> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${params.idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId: params.projectId, name: params.name }),
  });
  const payload = await parseResponse<{ project: DashboardProject }>(response);

  return payload.project;
}

export async function deleteDashboardProject(params: {
  idToken: string;
  projectId: string;
}): Promise<DashboardProject> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${params.idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId: params.projectId }),
  });
  const payload = await parseResponse<{ project: DashboardProject }>(response);

  return payload.project;
}

export async function createProjectApiKey(params: {
  idToken: string;
  projectId: string;
  name?: string;
}): Promise<DashboardApiKey & { rawApiKey: string }> {
  const response = await fetch(`${API_BASE_URL}/api-keys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId: params.projectId, name: params.name }),
  });

  return parseResponse<DashboardApiKey & { rawApiKey: string }>(response);
}

export async function renameProjectApiKey(params: {
  idToken: string;
  apiKeyHash: string;
  name: string;
}): Promise<DashboardApiKey> {
  const response = await fetch(`${API_BASE_URL}/api-keys`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${params.idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ apiKeyHash: params.apiKeyHash, name: params.name }),
  });

  return parseResponse<DashboardApiKey>(response);
}

export async function revokeProjectApiKey(params: {
  idToken: string;
  apiKeyHash: string;
}): Promise<DashboardApiKey> {
  const response = await fetch(`${API_BASE_URL}/api-keys/revoke`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ apiKeyHash: params.apiKeyHash }),
  });

  return parseResponse<DashboardApiKey>(response);
}

export async function rotateProjectApiKey(params: {
  idToken: string;
  apiKeyHash: string;
}): Promise<{
  revokedApiKey: DashboardApiKey;
  apiKey: DashboardApiKey & { rawApiKey: string };
}> {
  const response = await fetch(`${API_BASE_URL}/api-keys/rotate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ apiKeyHash: params.apiKeyHash }),
  });

  return parseResponse<{
    revokedApiKey: DashboardApiKey;
    apiKey: DashboardApiKey & { rawApiKey: string };
  }>(response);
}

export async function saveDashboardPolicy(params: {
  idToken: string;
  policy: DashboardPolicy;
}): Promise<DashboardPolicy> {
  const response = await fetch(`${API_BASE_URL}/policies`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${params.idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params.policy),
  });
  const payload = await parseResponse<{ policy: DashboardPolicy }>(response);

  return payload.policy;
}

export async function moderateImageUpload(params: {
  apiKey: string;
  image: File;
}): Promise<ModerationResponse> {
  const formData = new FormData();
  formData.append("image", params.image);

  const response = await fetch(`${API_BASE_URL}/moderate`, {
    method: "POST",
    headers: {
      "x-api-key": params.apiKey,
    },
    body: formData,
  });

  return parseResponse<ModerationResponse>(response);
}

export async function moderateDashboardImageUpload(params: {
  idToken: string;
  projectId: string;
  image: File;
}): Promise<ModerationResponse> {
  const formData = new FormData();
  formData.append("image", params.image);

  const response = await fetch(
    `${API_BASE_URL}/dashboard/moderate?projectId=${encodeURIComponent(params.projectId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.idToken}`,
      },
      body: formData,
    },
  );

  return parseResponse<ModerationResponse>(response);
}

export async function listProjectWebhooks(params: {
  idToken: string;
  projectId: string;
}): Promise<DashboardWebhookEndpoint[]> {
  const searchParams = new URLSearchParams({ projectId: params.projectId });
  const response = await fetch(API_BASE_URL + "/webhooks?" + searchParams.toString(), {
    method: "GET",
    headers: { Authorization: "Bearer " + params.idToken },
  });
  const payload = await parseResponse<{ webhooks: DashboardWebhookEndpoint[] }>(response);

  return payload.webhooks;
}

export async function createProjectWebhook(params: {
  idToken: string;
  projectId: string;
  url: string;
  name?: string;
  events: WebhookEventType[];
}): Promise<{ webhook: DashboardWebhookEndpoint; secret: string }> {
  const response = await fetch(API_BASE_URL + "/webhooks", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + params.idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId: params.projectId,
      url: params.url,
      name: params.name,
      events: params.events,
    }),
  });

  return parseResponse<{ webhook: DashboardWebhookEndpoint; secret: string }>(response);
}

export async function disableProjectWebhook(params: {
  idToken: string;
  webhookId: string;
}): Promise<DashboardWebhookEndpoint> {
  const response = await fetch(API_BASE_URL + "/webhooks", {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + params.idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ webhookId: params.webhookId }),
  });
  const payload = await parseResponse<{ webhook: DashboardWebhookEndpoint }>(response);

  return payload.webhook;
}

export async function listWebhookEvents(params: {
  idToken: string;
  projectId?: string;
  status?: WebhookEventStatus | "all";
  eventType?: WebhookEventType | "all";
  limit?: number;
}): Promise<DashboardWebhookEvent[]> {
  const searchParams = new URLSearchParams();
  if (params.projectId && params.projectId !== "all") searchParams.set("projectId", params.projectId);
  if (params.status && params.status !== "all") searchParams.set("status", params.status);
  if (params.eventType && params.eventType !== "all") searchParams.set("eventType", params.eventType);
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const response = await fetch(API_BASE_URL + "/webhook-events" + (query ? "?" + query : ""), {
    method: "GET",
    headers: { Authorization: "Bearer " + params.idToken },
  });
  const payload = await parseResponse<{ events: DashboardWebhookEvent[] }>(response);

  return payload.events;
}


export async function retryWebhookEvent(params: {
  idToken: string;
  eventId: string;
}): Promise<DashboardWebhookEvent> {
  const response = await fetch(API_BASE_URL + "/webhook-events/retry", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + params.idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventId: params.eventId }),
  });
  const payload = await parseResponse<{ event: DashboardWebhookEvent }>(response);

  return payload.event;
}

export async function rotateProjectWebhookSecret(params: {
  idToken: string;
  webhookId: string;
}): Promise<{ webhook: DashboardWebhookEndpoint; secret: string; previousSecretExpiresAt?: string }> {
  const response = await fetch(API_BASE_URL + "/webhooks/rotate-secret", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + params.idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ webhookId: params.webhookId }),
  });

  return parseResponse<{ webhook: DashboardWebhookEndpoint; secret: string; previousSecretExpiresAt?: string }>(response);
}

export async function listReviewQueue(params: {
  idToken: string;
  projectId?: string;
  status?: DashboardReviewItem["status"];
  limit?: number;
}): Promise<DashboardReviewItem[]> {
  const searchParams = new URLSearchParams();
  if (params.projectId) searchParams.set("projectId", params.projectId);
  if (params.status) searchParams.set("status", params.status);
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const response = await fetch(API_BASE_URL + "/review-queue" + (query ? "?" + query : ""), {
    method: "GET",
    headers: { Authorization: "Bearer " + params.idToken },
  });
  const payload = await parseResponse<{ reviews: DashboardReviewItem[] }>(response);

  return payload.reviews;
}

export async function decideReviewQueueItem(params: {
  idToken: string;
  reviewId: string;
  decision: "approved" | "rejected" | "ignored";
  reason?: string;
}): Promise<DashboardReviewItem> {
  const response = await fetch(API_BASE_URL + "/review-queue/decision", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + params.idToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reviewId: params.reviewId,
      decision: params.decision,
      reason: params.reason,
    }),
  });
  const payload = await parseResponse<{ review: DashboardReviewItem }>(response);

  return payload.review;
}

export function saveSession(session: VisoraSession): void {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredSession(): VisoraSession | null {
  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as VisoraSession;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
