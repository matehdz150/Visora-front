/**
 * Visora docs — page content config.
 *
 * The sidebar, table of contents, decision reference and "next steps" are all
 * data-driven so adding entries (or whole pages later) is a content edit, not a
 * markup change.
 */
import type { Action } from "../dashboard/types";

export interface NavItem {
  label: string;
  href: string;
  /** Marks the currently-open page. */
  active?: boolean;
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Build",
    items: [
      { label: "Developer quickstart", href: "#overview", active: true },
      { label: "Install SDK", href: "#install" },
      { label: "SDK webhooks", href: "#sdk-webhooks" },
      { label: "Authenticate", href: "#api-key-auth" },
      { label: "Server-side flow", href: "#integration-flow" },
      { label: "First moderation", href: "#first-request" },
      { label: "Redaction API", href: "/docs/redaction" },
    ],
  },
  {
    title: "Use The API",
    items: [
      { label: "Handle decisions", href: "#handle-decisions" },
      { label: "Response model", href: "#response-model" },
      { label: "Decision explanations", href: "#decision-explanations" },
      { label: "Moderation logs", href: "#get-moderation-logs" },
      { label: "Review queue", href: "#review-queue" },
      { label: "Webhooks", href: "#webhooks" },
    ],
  },
  {
    title: "Configure",
    items: [
      { label: "Project policies", href: "#policies" },
      { label: "Brand safety", href: "#brand-safety" },
      { label: "Compliance packs", href: "#compliance-packs" },
      { label: "Scoped uploads", href: "#scoped-uploads" },
    ],
  },
  {
    title: "Reference",
    items: [
      { label: "Customer routes", href: "#api-reference" },
      { label: "Plans and limits", href: "#plans" },
      { label: "Errors", href: "#errors" },
    ],
  },
];

export interface TocItem {
  label: string;
  /** Hash of the section heading id. */
  href: string;
}

export const TOC_ITEMS: TocItem[] = [
  { label: "Quickstart", href: "#overview" },
  { label: "Install", href: "#install" },
  { label: "SDK webhooks", href: "#sdk-webhooks" },
  { label: "Auth", href: "#api-key-auth" },
  { label: "Integration flow", href: "#integration-flow" },
  { label: "Moderate", href: "#first-request" },
  { label: "Decisions", href: "#handle-decisions" },
  { label: "Response", href: "#response-model" },
  { label: "Policies", href: "#policies" },
  { label: "Review queue", href: "#review-queue" },
  { label: "Webhooks", href: "#webhooks" },
  { label: "Errors", href: "#errors" },
];

export interface SearchItem {
  title: string;
  href: string;
  description: string;
}

export const SEARCH_INDEX: SearchItem[] = [
  { title: "Developer quickstart", href: "#overview", description: "Integrate Visora image moderation into backend routes, workers, and server actions." },
  { title: "Install SDK", href: "#install", description: "Install @visoracloud/client with npm, pnpm, or yarn." },
  { title: "SDK v0.2 webhooks", href: "#sdk-webhooks", description: "Use verifyWebhookSignature, constructWebhookEvent, Next.js helpers, Express helpers, and typed webhook events." },
  { title: "Authenticate", href: "#api-key-auth", description: "Use project API keys from server-side code and keep x-api-key secret." },
  { title: "Server-side flow", href: "#integration-flow", description: "Receive uploads in your backend, call Visora, branch on the moderation action, and store moderation ids." },
  { title: "First moderation", href: "#first-request", description: "Moderate an image with the Node SDK, Next.js route handlers, REST, or logs API." },
  { title: "Redaction API", href: "/docs/redaction", description: "Blur faces, text, custom words, ID document fields, and license plates with redaction projects." },
  { title: "Handle decisions", href: "#handle-decisions", description: "Use allow, review, and reject actions to control your product flow." },
  { title: "Response model", href: "#response-model", description: "Read moderationId, safe, action, labels, riskScore, category, brandSafety, compliance, and explanation." },
  { title: "Decision explanations", href: "#decision-explanations", description: "Show policy explanations such as rejected because weapons matched reject action." },
  { title: "Customer API reference", href: "#api-reference", description: "Use /moderate, /upload-url, /moderation-logs, and /health from customer integrations." },
  { title: "Moderation logs", href: "#get-moderation-logs", description: "Fetch recent logs scoped to the authenticated project." },
  { title: "Review queue", href: "#review-queue", description: "Queue review decisions for manual approval or rejection per project." },
  { title: "Webhooks", href: "#webhooks", description: "Configure project webhook endpoints, verify visora-signature headers, and handle moderation/review events." },
  { title: "Webhook event types", href: "#webhook-events", description: "Use moderation.completed, moderation.review_required, review.approved, and review.rejected events." },
  { title: "Verify webhook signatures", href: "#webhook-signatures", description: "Validate visora-signature using HMAC SHA-256 over timestamp.rawBody before trusting the payload." },
  { title: "Project policies", href: "#policies", description: "Configure category actions, thresholds, review mode, and compliance packs." },
  { title: "Brand safety", href: "#brand-safety", description: "Use safe, caution, and unsafe brand suitability results." },
  { title: "Compliance packs", href: "#compliance-packs", description: "Evaluate marketplace, kids, education, social, dating, and ads presets." },
  { title: "Scoped uploads", href: "#scoped-uploads", description: "Understand project-owned S3 key prefixes and image access checks." },
  { title: "Plans and limits", href: "#plans", description: "Review monthly limits, projects, API keys, retention, and overage behavior." },
  { title: "Errors and retries", href: "#errors", description: "Handle JSON errors and SDK error classes for auth, validation, limits, and timeouts." },
];

export interface DecisionEntry {
  /** Capitalised label shown in the pill. */
  label: string;
  /** Underlying ModerateAPI action that drives the pill colour. */
  action: Action;
  title: string;
  desc: string;
}

export const DECISIONS: DecisionEntry[] = [
  { label: "Allow", action: "allow", title: "Continue the user flow", desc: "The image did not violate the active project policy, or the matched category is explicitly configured as allow." },
  { label: "Review", action: "review", title: "Queue for manual decision", desc: "Borderline or policy-specific content. When review mode is enabled, this can be handled from the project review queue." },
  { label: "Reject", action: "reject", title: "Block automatically", desc: "The image matched a category, threshold, or compliance-sensitive condition that the project policy treats as reject." },
];

export interface NextStep {
  title: string;
  desc: string;
  href: string;
}

export const NEXT_STEPS: NextStep[] = [
  { title: "Create a project", desc: "Projects own API keys, policies, usage, scoped uploads, review queue, and moderation logs.", href: "/dashboard" },
  { title: "Generate an API key", desc: "Use project API keys from server code only. Never ship them to a browser, mobile app, or public repo.", href: "#api-key-auth" },
  { title: "Wire the SDK", desc: "Call moderateImage from your backend upload route and branch on allow, review, or reject.", href: "#first-request" },
  { title: "Add redaction", desc: "Use redaction projects for face blur, text blur, license plate blur, and redacted image delivery.", href: "/docs/redaction" },
  { title: "Tune policy", desc: "Configure category actions, thresholds, review mode, brand safety, and compliance packs per project.", href: "#policies" },
  { title: "Add webhooks", desc: "Send moderation and review events to your backend for automation, notifications, and audit workflows.", href: "#webhooks" },
];

export interface FooterLink {
  label: string;
  href: string;
}

export const FOOTER_NAV: { prev: FooterLink; next: FooterLink } = {
  prev: { label: "Pricing", href: "/pricing" },
  next: { label: "Dashboard", href: "/dashboard" },
};
