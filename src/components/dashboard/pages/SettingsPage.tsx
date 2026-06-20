import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { API_BASE } from "../constants";
import { ConfirmDialog } from "../ConfirmDialog";
import { card } from "../styles";
import type { UsageSummary } from "../types";
import type { DashboardNotify } from "../Toast";
import type { CurrentUser, DashboardAccount, PlanId } from "@/lib/visora-api";
import { SettingsEmptyState } from "@/components/empty-states";

const plans: Array<{
  planId: PlanId;
  name: string;
  price: string;
  monthlyLimit: string;
  limits: string;
}> = [
  { planId: "free", name: "Free", price: "$0", monthlyLimit: "500", limits: "1 project · 1 API key · 7 day logs" },
  { planId: "starter", name: "Starter", price: "$29", monthlyLimit: "10,000", limits: "3 projects · 3 API keys · 30 day logs" },
  { planId: "growth", name: "Growth", price: "$149", monthlyLimit: "50,000", limits: "10 projects · 10 API keys · 90 day logs" },
  { planId: "scale", name: "Scale", price: "$399", monthlyLimit: "150,000", limits: "50 projects · 50 API keys · 180 day logs" },
];

export function SettingsPage({
  accountId,
  currentUser,
  accountPlan,
  usage,
  workspace,
  onWorkspaceChange,
  onChangePlan,
  notify,
}: {
  accountId: string;
  currentUser: CurrentUser | null;
  accountPlan: DashboardAccount | null;
  usage: UsageSummary | null;
  workspace: string;
  onWorkspaceChange: (v: string) => void;
  onChangePlan: (planId: PlanId) => Promise<void>;
  notify: DashboardNotify;
}) {
  const [savingPlan, setSavingPlan] = useState<PlanId | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const usageUsed = usage?.requestsUsed ?? 0;
  const usageLimit = usage?.monthlyLimit ?? accountPlan?.monthlyLimit ?? 0;
  const usagePercent = usageLimit > 0 ? Math.min(100, (usageUsed / usageLimit) * 100) : 0;

  const selectPlan = async (planId: PlanId) => {
    setPlanError(null);
    setSavingPlan(planId);

    try {
      await onChangePlan(planId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update plan";
      setPlanError(message);
      notify({ kind: "error", title: "Could not update plan", message });
    } finally {
      setSavingPlan(null);
    }
  };

  const copyApiBase = async () => {
    await navigator.clipboard?.writeText(API_BASE);
    notify({ kind: "success", title: "API base URL copied" });
  };

  const confirmDeleteAccount = () => {
    setConfirmDeleteOpen(false);
    notify({ kind: "info", title: "Delete account is not enabled yet", message: "The dashboard now requires confirmation, but the backend delete endpoint is not connected." });
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>Settings</h1>
      <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Manage your workspace.</p>

      <div style={{ ...card, padding: "24px", marginTop: "30px" }}>
        <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>Account name</div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: 300, marginBottom: "16px" }}>Account <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{accountId}</span> · shown across the dashboard.</div>
        <input value={workspace} onChange={(e) => onWorkspaceChange(e.target.value)} className="v-input" style={{ width: "100%", maxWidth: "360px", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontFamily: "inherit", fontSize: "14px" }} />
      </div>

      <div style={{ ...card, padding: "24px", marginTop: "18px" }}>
        <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>API base URL</div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: 300, marginBottom: "16px" }}>All requests target this stage.</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "10px", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)" }}>
          <code style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: "12.5px", color: "rgba(255,255,255,0.7)", wordBreak: "break-all" }}>{API_BASE}</code>
          <button onClick={copyApiBase} style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", color: "#fff", fontFamily: "inherit", fontSize: "12px", cursor: "pointer" }}>Copy</button>
        </div>
      </div>

      <div style={{ ...card, padding: "24px", marginTop: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "flex-start", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>Plan</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>Change the account plan used for new and existing projects.</div>
          </div>
          {accountPlan && (
            <span style={{ fontSize: "12px", color: "#c5d0ff", background: "rgba(126,155,255,0.1)", border: "1px solid rgba(126,155,255,0.24)", padding: "5px 10px", borderRadius: "20px", textTransform: "capitalize" }}>{accountPlan.planId}</span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
          {plans.map((plan) => {
            const current = accountPlan?.planId === plan.planId;
            const loading = savingPlan === plan.planId;

            return (
              <button
                key={plan.planId}
                type="button"
                onClick={() => selectPlan(plan.planId)}
                disabled={current || savingPlan !== null}
                style={{
                  textAlign: "left",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid " + (current ? "rgba(126,155,255,0.42)" : "rgba(255,255,255,0.1)"),
                  background: current ? "rgba(126,155,255,0.1)" : "#0a0a0a",
                  color: "#fff",
                  fontFamily: "inherit",
                  cursor: current || savingPlan !== null ? "default" : "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>{plan.name}</span>
                  <span style={{ fontSize: "13px", color: current ? "#c5d0ff" : "rgba(255,255,255,0.58)", fontWeight: 600 }}>{plan.price}/mo</span>
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "rgba(255,255,255,0.48)", lineHeight: 1.45 }}>{plan.monthlyLimit} moderations / month</div>
                <div style={{ marginTop: "4px", fontSize: "12px", color: "rgba(255,255,255,0.36)", lineHeight: 1.45 }}>{plan.limits}</div>
                <div style={{ marginTop: "12px", fontSize: "12px", color: current ? "#7ee0a8" : "#aebfff", fontWeight: 600 }}>{current ? "Current plan" : loading ? "Updating..." : "Select plan"}</div>
              </button>
            );
          })}
        </div>
        {planError && <div style={{ marginTop: "14px", color: "#ffb7b7", fontSize: "13px" }}>{planError}</div>}

        <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "baseline" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>Account monthly usage</div>
              <div style={{ marginTop: "3px", fontSize: "12px", color: "rgba(255,255,255,0.42)", fontWeight: 300 }}>Shared across all projects and API keys.</div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: usagePercent >= 100 ? "#ff9b9b" : "#aebfff" }}>{usageUsed.toLocaleString()} / {usageLimit.toLocaleString()}</div>
          </div>
          <div style={{ height: "6px", marginTop: "13px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${usagePercent}%`, background: usagePercent >= 100 ? "#ff9b9b" : "linear-gradient(90deg,#7e9bff,#aebfff)", borderRadius: "999px" }} />
          </div>
          {usage?.overageEnabled && usage.overageRequests > 0 && (
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#e8c98a" }}>{usage.overageRequests.toLocaleString()} overage requests estimated at ${(usage.estimatedOverageCents / 100).toFixed(2)}.</div>
          )}
        </div>
      </div>

      <div style={{ ...card, padding: "24px", marginTop: "18px" }}>
        <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>Authentication</div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: 300, marginBottom: "18px" }}>How members sign in to the dashboard.</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(140deg,#23252c,#101116)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#aebfff", fontSize: "14px" }}>C</span>
            <div>
              <div style={{ fontSize: "14px", color: "#fff" }}>Email &amp; password</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>Amazon Cognito · {currentUser?.email}</div>
            </div>
          </div>
          <span style={{ fontSize: "12px", color: "#7ee0a8", background: "rgba(120,224,168,0.1)", border: "1px solid rgba(120,224,168,0.22)", padding: "4px 11px", borderRadius: "20px" }}>Enabled</span>
        </div>
      </div>

      <div style={{ ...card, marginTop: "18px", overflow: "hidden" }}>
        <SettingsEmptyState onCta={() => undefined} onSecondary={() => undefined} />
      </div>

      <div style={{ ...card, border: "1px solid rgba(255,90,90,0.18)", padding: "24px", marginTop: "18px" }}>
        <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px", color: "#ff9b9b" }}>Delete account</div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: 300, marginBottom: "18px" }}>Permanently remove this account, its projects, API keys, and all moderation history.</div>
        <button onClick={() => setConfirmDeleteOpen(true)} style={{ fontSize: "13px", fontWeight: 500, color: "#ff9b9b", background: "rgba(255,90,90,0.08)", border: "1px solid rgba(255,90,90,0.25)", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>Delete Account</button>
      </div>

      <AnimatePresence>
        {confirmDeleteOpen && (
          <ConfirmDialog
            open
            tone="danger"
            title="Delete this account?"
            message="This would permanently remove the account, projects, API keys, and moderation history. The backend endpoint is not connected yet, so confirming will not delete data today."
            confirmLabel="I understand"
            onCancel={() => setConfirmDeleteOpen(false)}
            onConfirm={confirmDeleteAccount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
