/**
 * Visora dashboard — static configuration mirroring ModerateAPI's policy engine
 * and routing surface.
 */
import type {
  Action,
  Category,
  CompliancePack,
  Mode,
  Page,
} from "./types";

export const ACCOUNT_ID = "acc_test_001";
export const API_BASE =
  "https://6p0ws7vu2f.execute-api.us-east-1.amazonaws.com/dev";

export const CATEGORIES: Category[] = [
  "nudity",
  "suggestive",
  "violence",
  "drugs",
  "weapons",
  "hate_symbols",
  "gambling",
  "alcohol",
];

export const CATEGORY_LABEL: Record<Category, string> = {
  nudity: "Nudity",
  suggestive: "Suggestive",
  violence: "Violence",
  drugs: "Drugs",
  weapons: "Weapons",
  hate_symbols: "Hate symbols",
  gambling: "Gambling",
  alcohol: "Alcohol",
};

export const COMPLIANCE_PACKS: CompliancePack[] = [
  "marketplace",
  "kids",
  "education",
  "social",
  "dating",
  "ads",
];

export const PACK_LABEL: Record<CompliancePack, string> = {
  marketplace: "Marketplace",
  kids: "Kids",
  education: "Education",
  social: "Social",
  dating: "Dating",
  ads: "Ads",
};

export const MODE_ACTIONS: Record<Mode, Record<Category, Action>> = {
  strict: {
    suggestive: "reject",
    violence: "review",
    nudity: "reject",
    drugs: "reject",
    weapons: "reject",
    hate_symbols: "reject",
    alcohol: "review",
    gambling: "review",
  },
  balanced: {
    suggestive: "review",
    violence: "review",
    nudity: "reject",
    drugs: "review",
    weapons: "reject",
    hate_symbols: "reject",
    alcohol: "allow",
    gambling: "review",
  },
  relaxed: {
    suggestive: "allow",
    violence: "review",
    nudity: "reject",
    drugs: "review",
    weapons: "review",
    hate_symbols: "reject",
    alcohol: "allow",
    gambling: "allow",
  },
};

// Per-mode threshold presets (API defaults are 70 / 50 / 80 for balanced).
export const MODE_PRESET: Record<
  Mode,
  { minConfidence: number; reviewThreshold: number; rejectThreshold: number }
> = {
  strict: { minConfidence: 40, reviewThreshold: 40, rejectThreshold: 65 },
  balanced: { minConfidence: 70, reviewThreshold: 50, rejectThreshold: 80 },
  relaxed: { minConfidence: 80, reviewThreshold: 65, rejectThreshold: 90 },
};

export const DEFAULT_BLOCKED: Category[] = [
  "nudity",
  "suggestive",
  "violence",
  "drugs",
  "weapons",
  "hate_symbols",
];

export const NAV: [Page, string][] = [
  ["overview", "Overview"],
  ["moderations", "Moderations"],
  ["reviews", "Reviews"],
  ["webhooks", "Webhooks"],
  ["admin", "Admin"],
  ["playground", "Playground"],
  ["projects", "Projects"],
  ["keys", "API Keys"],
  ["settings", "Settings"],
];

export const imageKey = (projectId: string, id: string) =>
  `accounts/${ACCOUNT_ID}/projects/${projectId}/uploads/${id}.jpg`;
