/**
 * Visora dashboard — mock data. Every record matches a ModerateAPI response
 * shape, so swapping these arrays for live fetches is a drop-in change.
 */
import type { ApiKey, Label, ModLog, Project } from "./types";

export const PROJECTS: Project[] = [
  { id: "proj_marketplace", name: "Marketplace", planId: "pro", mode: "balanced", monthMods: "48,210", created: "Jan 12, 2025", updated: "Jun 16, 02:32 PM", compliancePack: "marketplace" },
  { id: "proj_community", name: "Community", planId: "pro", mode: "strict", monthMods: "92,540", created: "Feb 03, 2025", updated: "Jun 16, 01:58 PM", compliancePack: "social" },
  { id: "proj_mobile", name: "Mobile App", planId: "free", mode: "balanced", monthMods: "812", created: "Mar 21, 2025", updated: "Jun 16, 09:02 AM" },
  { id: "proj_avatars", name: "Avatars", planId: "free", mode: "relaxed", monthMods: "230", created: "Apr 09, 2025", updated: "Jun 15, 10:19 PM", compliancePack: "dating" },
  { id: "proj_forum", name: "Forum", planId: "pro", mode: "strict", monthMods: "27,995", created: "May 17, 2025", updated: "Jun 15, 09:44 PM", compliancePack: "kids" },
  { id: "proj_onboarding", name: "Onboarding", planId: "free", mode: "balanced", monthMods: "514", created: "Jun 01, 2025", updated: "Jun 10, 10:31 AM" },
];

export const PROJECT_NAME: Record<string, string> = Object.fromEntries(
  PROJECTS.map((p) => [p.id, p.name]),
);

export const MODS: ModLog[] = [
  { moderationId: "mod_01KV9F2X3Q", date: "Jun 16 · 14:32", projectId: "proj_marketplace", project: "Marketplace", planId: "pro", category: "weapons", riskScore: 93.58, action: "reject", brandLevel: "unsafe", imageKey: "01KV9F2X3Q", policyMode: "balanced", compliancePack: "marketplace", compliancePassed: false, complianceViolations: ["weapons"] },
  { moderationId: "mod_01KV8D1A7P", date: "Jun 16 · 13:58", projectId: "proj_community", project: "Community", planId: "pro", category: "nudity", riskScore: 88.12, action: "reject", brandLevel: "unsafe", imageKey: "01KV8D1A7P", policyMode: "strict", compliancePack: "social", compliancePassed: false, complianceViolations: ["nudity"] },
  { moderationId: "mod_01KV7C0Z2M", date: "Jun 16 · 13:12", projectId: "proj_mobile", project: "Mobile App", planId: "free", category: "suggestive", riskScore: 63.94, action: "review", brandLevel: "caution", imageKey: "01KV7C0Z2M", policyMode: "balanced" },
  { moderationId: "mod_01KV6B9Y1L", date: "Jun 16 · 12:40", projectId: "proj_avatars", project: "Avatars", planId: "free", category: null, riskScore: 5.71, action: "allow", brandLevel: "safe", imageKey: "01KV6B9Y1L", policyMode: "relaxed", compliancePack: "dating", compliancePassed: true, complianceViolations: [] },
  { moderationId: "mod_01KV5A8X0K", date: "Jun 16 · 11:05", projectId: "proj_forum", project: "Forum", planId: "pro", category: "hate_symbols", riskScore: 91.27, action: "reject", brandLevel: "unsafe", imageKey: "01KV5A8X0K", policyMode: "strict", compliancePack: "kids", compliancePassed: false, complianceViolations: ["hate_symbols"] },
  { moderationId: "mod_01KV4Z7W9J", date: "Jun 16 · 10:31", projectId: "proj_marketplace", project: "Marketplace", planId: "pro", category: "drugs", riskScore: 72.63, action: "review", brandLevel: "caution", imageKey: "01KV4Z7W9J", policyMode: "balanced", compliancePack: "marketplace", compliancePassed: false, complianceViolations: ["drugs"] },
  { moderationId: "mod_01KV3Y6V8H", date: "Jun 16 · 09:48", projectId: "proj_community", project: "Community", planId: "pro", category: "violence", riskScore: 80.49, action: "reject", brandLevel: "unsafe", imageKey: "01KV3Y6V8H", policyMode: "strict", compliancePack: "social", compliancePassed: false, complianceViolations: ["violence"] },
  { moderationId: "mod_01KV2X5U7G", date: "Jun 16 · 09:02", projectId: "proj_mobile", project: "Mobile App", planId: "free", category: null, riskScore: 10.84, action: "allow", brandLevel: "safe", imageKey: "01KV2X5U7G", policyMode: "balanced" },
  { moderationId: "mod_01KV1W4T6F", date: "Jun 15 · 22:19", projectId: "proj_avatars", project: "Avatars", planId: "free", category: "alcohol", riskScore: 52.10, action: "review", brandLevel: "caution", imageKey: "01KV1W4T6F", policyMode: "relaxed", compliancePack: "dating", compliancePassed: true, complianceViolations: [] },
  { moderationId: "mod_01KV0V3S5E", date: "Jun 15 · 21:44", projectId: "proj_forum", project: "Forum", planId: "pro", category: "gambling", riskScore: 46.72, action: "review", brandLevel: "caution", imageKey: "01KV0V3S5E", policyMode: "strict", compliancePack: "kids", compliancePassed: false, complianceViolations: ["gambling"] },
  { moderationId: "mod_01KUZU2R4D", date: "Jun 15 · 20:10", projectId: "proj_marketplace", project: "Marketplace", planId: "pro", category: null, riskScore: 3.92, action: "allow", brandLevel: "safe", imageKey: "01KUZU2R4D", policyMode: "balanced", compliancePack: "marketplace", compliancePassed: true, complianceViolations: [] },
  { moderationId: "mod_01KUYT1Q3C", date: "Jun 15 · 18:55", projectId: "proj_community", project: "Community", planId: "pro", category: "weapons", riskScore: 95.61, action: "reject", brandLevel: "unsafe", imageKey: "01KUYT1Q3C", policyMode: "strict", compliancePack: "social", compliancePassed: false, complianceViolations: ["weapons"] },
];

export const KEYS: ApiKey[] = [
  { apiKeyHash: "hash_prod", name: "Production", projectId: "proj_marketplace", displayKey: "c19bb83a01...8c4d1e", planId: "pro", created: "Jun 02, 2025", lastUsedAt: "Jun 16, 02:32 PM", status: "Active" },
  { apiKeyHash: "hash_ci", name: "Server (CI)", projectId: "proj_community", displayKey: "a6f44e11da...7c2f91", planId: "pro", created: "May 28, 2025", lastUsedAt: "Jun 16, 01:58 PM", status: "Active" },
  { apiKeyHash: "hash_mobile", name: "Mobile SDK", projectId: "proj_mobile", displayKey: "3ff0bde201...8e5c30", planId: "free", created: "Apr 14, 2025", lastUsedAt: "Never", status: "Active" },
  { apiKeyHash: "hash_staging", name: "Staging", projectId: "proj_avatars", displayKey: "91ba781f32...d9b84", planId: "free", created: "Mar 30, 2025", lastUsedAt: "Jun 12, 09:44 AM", status: "Active" },
  { apiKeyHash: "hash_legacy", name: "Legacy", projectId: "proj_forum", displayKey: "f4a8e10db7...8f1c62", planId: "pro", created: "Jan 09, 2025", lastUsedAt: "May 02, 07:20 PM", status: "Revoked" },
];

// Sample labels the policy / playground previews score against.
export const SAMPLE: Label[] = [
  { name: "Weapon Violence", confidence: 93.58, category: "weapons" },
  { name: "Person", confidence: 98.2, category: null },
  { name: "Exposed Skin", confidence: 71.4, category: "nudity" },
  { name: "Alcoholic Beverage", confidence: 58.0, category: "alcohol" },
  { name: "Gambling Scene", confidence: 44.1, category: "gambling" },
];
