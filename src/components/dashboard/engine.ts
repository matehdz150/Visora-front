/**
 * Visora dashboard — decision engine. Mirrors the ModerateAPI policy-engine
 * flow: score labels against a policy and derive action / risk / brand level.
 */
import { DEFAULT_BLOCKED, MODE_ACTIONS, MODE_PRESET } from "./constants";
import type {
  Action,
  BrandLevel,
  Category,
  CompliancePack,
  Label,
  Mode,
  Policy,
  ScoredLabel,
} from "./types";

const ACTION_SEVERITY: Record<Action, number> = {
  allow: 0,
  review: 1,
  reject: 2,
};

function thresholdAction(risk: number, policy: Policy): Action {
  if (risk >= policy.rejectThreshold) return "reject";
  if (risk >= policy.reviewThreshold) return "review";
  return "allow";
}

function applyReviewMode(action: Action, policy: Policy): Action {
  if (action !== "review") return action;
  if (policy.reviewMode === "disabled") return policy.reviewFallbackAction;
  return action;
}

export function moderate(policy: Policy, labels: Label[]) {
  const scored: ScoredLabel[] = labels.map((l) => {
    const active = l.confidence >= policy.minConfidence;
    const blocked = !!(active && l.category && policy.blockedCategories.includes(l.category));
    const category = l.category as Category;
    const action: Action = blocked ? policy.categoryActions[category] || MODE_ACTIONS[policy.mode][category] || thresholdAction(l.confidence, policy) : "allow";
    return { ...l, active, blocked, action };
  });

  const blk = scored.filter((x) => x.blocked);
  const risk = blk.length ? Math.max(...blk.map((x) => x.confidence)) : 0;
  const action = applyReviewMode(
    blk.reduce<Action>(
      (highest, label) => (ACTION_SEVERITY[label.action] > ACTION_SEVERITY[highest] ? label.action : highest),
      "allow",
    ),
    policy,
  );

  let brandLevel: BrandLevel = "safe";
  if (action === "reject") brandLevel = "unsafe";
  else if (action === "review") brandLevel = "caution";

  const topCat = blk.length ? blk.sort((a, b) => b.confidence - a.confidence)[0].category || null : null;

  return { scored, risk, action, brandLevel, category: topCat };
}

export function makePolicy(mode: Mode, pack?: CompliancePack): Policy {
  return {
    mode,
    ...MODE_PRESET[mode],
    blockedCategories: [...DEFAULT_BLOCKED],
    categoryActions: { ...MODE_ACTIONS[mode] },
    reviewMode: "enabled",
    reviewFallbackAction: "reject",
    compliancePack: pack ?? "none",
  };
}
