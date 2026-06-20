"use client";

import { useCallback, useState } from "react";
import { PROJECTS } from "./data";
import { makePolicy } from "./engine";
import type { Policy } from "./types";

export type PolicyMap = Record<string, Policy>;
export type PolicyPatch = Partial<Policy> | ((p: Policy) => Partial<Policy>);

export interface PolicyStore {
  policyByProject: PolicyMap;
  setPolicy: (projectId: string, patch: PolicyPatch) => void;
}

function seed(): PolicyMap {
  return Object.fromEntries(
    PROJECTS.map((p) => [p.id, makePolicy(p.mode, p.compliancePack)]),
  );
}

/**
 * Owns the per-project policy state. Shared by the Policies editor (writes) and
 * the Playground (reads the active project's policy to compute a verdict).
 */
export function usePolicyStore(): PolicyStore {
  const [policyByProject, setPolicyByProject] = useState<PolicyMap>(seed);

  const setPolicy = useCallback((projectId: string, patch: PolicyPatch) => {
    setPolicyByProject((prev) => {
      const cur = prev[projectId];
      const p = typeof patch === "function" ? patch(cur) : patch;
      return { ...prev, [projectId]: { ...cur, ...p } };
    });
  }, []);

  return { policyByProject, setPolicy };
}
