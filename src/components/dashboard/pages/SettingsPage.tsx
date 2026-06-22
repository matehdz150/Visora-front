import React, { useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AnimatePresence } from "framer-motion";
import { API_BASE } from "../constants";
import { ConfirmDialog } from "../ConfirmDialog";
import { card } from "../styles";
import type { UsageSummary } from "../types";
import type { DashboardNotify } from "../Toast";
import {
  createBillingSubscriptionIntent,
  getPublicAppOrigin,
  type CurrentUser,
  type DashboardAccount,
  type PlanId,
} from "@/lib/visora-api";
import { SettingsEmptyState } from "@/components/empty-states";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");
const paidPlans = new Set<PlanId>(["starter", "plus", "growth", "scale"]);

function isPaidPlan(planId: PlanId): planId is Exclude<PlanId, "free"> {
  return paidPlans.has(planId);
}

function InlinePaymentForm({
  planId,
  onCancel,
  onPaymentComplete,
  notify,
}: {
  planId: Exclude<PlanId, "free">;
  onCancel: () => void;
  onPaymentComplete: () => Promise<void>;
  notify: DashboardNotify;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${getPublicAppOrigin()}/dashboard/?billing=success&plan=${planId}`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message ?? "Payment could not be completed");
      setSubmitting(false);
      return;
    }

    await onPaymentComplete();
    notify({ kind: "success", title: "Subscription activated", message: `Your ${planId} plan is being synced.` });
    setSubmitting(false);
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: "14px" }}>
      <div style={{ padding: "14px", borderRadius: "12px", background: "#050505", border: "1px solid rgba(255,255,255,0.1)" }}>
        <PaymentElement />
      </div>
      {error && <div style={{ padding: "11px 13px", borderRadius: "10px", border: "1px solid rgba(255,155,155,0.28)", background: "rgba(255,90,90,0.08)", color: "#ffb7b7", fontSize: "12.5px", lineHeight: 1.45 }}>{error}</div>}
      <div style={{ display: "flex", gap: "10px" }}>
        <button type="button" onClick={onCancel} disabled={submitting} style={{ flex: 1, padding: "11px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "#000", color: "rgba(255,255,255,0.72)", fontFamily: "inherit", fontSize: "13px", cursor: submitting ? "not-allowed" : "pointer" }}>Cancel</button>
        <button type="submit" disabled={!stripe || !elements || submitting} style={{ flex: 1, padding: "11px 14px", borderRadius: "10px", border: "none", background: submitting ? "rgba(255,255,255,0.55)" : "#fff", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}>{submitting ? "Processing..." : "Subscribe"}</button>
      </div>
    </form>
  );
}
const plans: Array<{
  planId: PlanId;
  name: string;
  price: string;
  monthlyLimit: string;
  limits: string;
}> = [
  { planId: "free", name: "Free", price: "$0", monthlyLimit: "1,000", limits: "1 project · 1 API key · 7 day logs" },
  { planId: "starter", name: "Starter", price: "$19", monthlyLimit: "8,000", limits: "3 projects · 3 API keys · 30 day logs" },
  { planId: "plus", name: "Plus", price: "$39", monthlyLimit: "16,000", limits: "5 projects · 5 API keys · 60 day logs" },
  { planId: "growth", name: "Growth", price: "$89", monthlyLimit: "38,000", limits: "10 projects · 10 API keys · 90 day logs" },
  { planId: "scale", name: "Scale", price: "$249", monthlyLimit: "110,000", limits: "50 projects · 50 API keys · 180 day logs" },
];

export function SettingsPage({
  accountId,
  currentUser,
  accountPlan,
  usage,
  workspace,
  onWorkspaceChange,
  idToken,
  onChangePlan,
  onManageBilling,
  onBillingActivated,
  onDeleteAccount,
  notify,
}: {
  accountId: string;
  currentUser: CurrentUser | null;
  accountPlan: DashboardAccount | null;
  usage: UsageSummary | null;
  workspace: string;
  onWorkspaceChange: (v: string) => void;
  idToken: string | null;
  onChangePlan: (planId: PlanId) => Promise<void>;
  onManageBilling: () => Promise<void>;
  onBillingActivated: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  notify: DashboardNotify;
}) {
  const [savingPlan, setSavingPlan] = useState<PlanId | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<Exclude<PlanId, "free"> | null>(null);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const usageUsed = usage?.requestsUsed ?? 0;
  const usageLimit = usage?.monthlyLimit ?? accountPlan?.monthlyLimit ?? 0;
  const usagePercent = usageLimit > 0 ? Math.min(100, (usageUsed / usageLimit) * 100) : 0;
  const hasActiveSubscription = Boolean(accountPlan?.stripeSubscriptionId && ["active", "trialing", "past_due"].includes(accountPlan.stripeSubscriptionStatus ?? ""));
  const pendingPlan = accountPlan?.stripePendingPlanId;
  const pendingPlanDate = accountPlan?.stripePlanChangeEffectiveAt
    ? new Date(accountPlan.stripePlanChangeEffectiveAt).toLocaleDateString()
    : null;

  const selectPlan = async (planId: PlanId) => {
    setPlanError(null);

    if (isPaidPlan(planId) && !hasActiveSubscription) {
      if (!idToken) {
        const message = "Missing dashboard session";
        setPlanError(message);
        notify({ kind: "error", title: "Could not start payment", message });
        return;
      }

      setCheckoutPlan(planId);
      setCheckoutClientSecret(null);
      setCheckoutLoading(true);

      try {
        const intent = await createBillingSubscriptionIntent(idToken, planId);
        setCheckoutClientSecret(intent.clientSecret);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not start payment";
        setPlanError(message);
        setCheckoutPlan(null);
        notify({ kind: "error", title: "Could not start payment", message });
      } finally {
        setCheckoutLoading(false);
      }
      return;
    }

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

  const closeInlineCheckout = () => {
    setCheckoutPlan(null);
    setCheckoutClientSecret(null);
    setCheckoutLoading(false);
  };

  const completeInlineCheckout = async () => {
    closeInlineCheckout();
    await onBillingActivated();
  };

  const openBillingPortal = async () => {
    setPlanError(null);
    setOpeningPortal(true);

    try {
      await onManageBilling();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not open billing portal";
      setPlanError(message);
      notify({ kind: "error", title: "Could not open billing portal", message });
    } finally {
      setOpeningPortal(false);
    }
  };

  const copyApiBase = async () => {
    await navigator.clipboard?.writeText(API_BASE);
    notify({ kind: "success", title: "API base URL copied" });
  };

  const confirmDeleteAccount = async () => {
    setDeletingAccount(true);

    try {
      await onDeleteAccount();
      setConfirmDeleteOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not delete account";
      notify({ kind: "error", title: "Could not delete account", message });
    } finally {
      setDeletingAccount(false);
    }
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
          <button onClick={copyApiBase} style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.14)", background: "#000", color: "#fff", fontFamily: "inherit", fontSize: "12px", cursor: "pointer" }}>Copy</button>
        </div>
      </div>

      <div style={{ ...card, padding: "24px", marginTop: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "flex-start", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>Plan</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>Upgrades apply immediately. Downgrades and free cancellations apply at the end of the current billing period.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {accountPlan?.stripeCustomerId && (
              <button type="button" onClick={openBillingPortal} disabled={openingPortal} style={{ padding: "7px 11px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.14)", background: "#000", color: "rgba(255,255,255,0.84)", fontFamily: "inherit", fontSize: "12px", cursor: openingPortal ? "not-allowed" : "pointer" }}>{openingPortal ? "Opening..." : "Manage billing"}</button>
            )}
            {accountPlan && (
              <span style={{ fontSize: "12px", color: "#c5d0ff", background: "rgba(126,155,255,0.1)", border: "1px solid rgba(126,155,255,0.24)", padding: "5px 10px", borderRadius: "20px", textTransform: "capitalize" }}>{accountPlan.planId}</span>
            )}
          </div>
        </div>

        {pendingPlan && (
          <div style={{ marginBottom: "14px", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(174,191,255,0.22)", background: "rgba(126,155,255,0.08)", color: "rgba(255,255,255,0.72)", fontSize: "12.5px", lineHeight: 1.55 }}>
            Plan change scheduled: <strong style={{ color: "#fff", textTransform: "capitalize" }}>{pendingPlan}</strong>{pendingPlanDate ? " on " + pendingPlanDate : " at the end of the billing period"}. Select your current plan to cancel the pending change.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
          {plans.map((plan) => {
            const current = accountPlan?.planId === plan.planId;
            const canCancelPendingChange = Boolean(current && pendingPlan);
            const loading = savingPlan === plan.planId;

            return (
              <button
                key={plan.planId}
                type="button"
                onClick={() => selectPlan(plan.planId)}
                disabled={(current && !canCancelPendingChange) || savingPlan !== null}
                style={{
                  textAlign: "left",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid " + (current ? "rgba(126,155,255,0.42)" : "rgba(255,255,255,0.1)"),
                  background: current ? "rgba(126,155,255,0.1)" : "#0a0a0a",
                  color: "#fff",
                  fontFamily: "inherit",
                  cursor: (current && !canCancelPendingChange) || savingPlan !== null ? "default" : "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>{plan.name}</span>
                  <span style={{ fontSize: "13px", color: current ? "#c5d0ff" : "rgba(255,255,255,0.58)", fontWeight: 600 }}>{plan.price}/mo</span>
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "rgba(255,255,255,0.48)", lineHeight: 1.45 }}>{plan.monthlyLimit} moderations / month</div>
                <div style={{ marginTop: "4px", fontSize: "12px", color: "rgba(255,255,255,0.36)", lineHeight: 1.45 }}>{plan.limits}</div>
                <div style={{ marginTop: "12px", fontSize: "12px", color: current ? "#7ee0a8" : "#aebfff", fontWeight: 600 }}>{current ? (canCancelPendingChange ? "Cancel scheduled change" : "Current plan") : loading ? "Updating..." : pendingPlan === plan.planId ? "Scheduled" : (plan.planId === "free" ? "Switch to free" : "Switch plan") }</div>
              </button>
            );
          })}
        </div>
        {planError && <div style={{ marginTop: "14px", color: "#ffb7b7", fontSize: "13px" }}>{planError}</div>}

        {checkoutPlan && (
          <div style={{ marginTop: "16px", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)", background: "#050505" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "start", marginBottom: "14px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Activate {plans.find((plan) => plan.planId === checkoutPlan)?.name}</div>
                <div style={{ marginTop: "4px", fontSize: "12px", color: "rgba(255,255,255,0.46)", lineHeight: 1.45 }}>Enter payment details here. You will stay in Settings.</div>
              </div>
              <div style={{ fontSize: "12px", color: "#c5d0ff", fontWeight: 700 }}>{plans.find((plan) => plan.planId === checkoutPlan)?.price}/mo</div>
            </div>
            {checkoutLoading && <div style={{ padding: "14px", borderRadius: "10px", background: "#000", color: "rgba(255,255,255,0.58)", fontSize: "12.5px" }}>Preparing secure payment...</div>}
            {checkoutClientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret: checkoutClientSecret, appearance: { theme: "night", variables: { colorPrimary: "#aebfff", colorBackground: "#050505", colorText: "#ffffff", colorDanger: "#ff9b9b", borderRadius: "10px" } } }}>
                <InlinePaymentForm planId={checkoutPlan} onCancel={closeInlineCheckout} onPaymentComplete={completeInlineCheckout} notify={notify} />
              </Elements>
            )}
          </div>
        )}

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
            <span style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#000", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#aebfff", fontSize: "14px" }}>C</span>
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
        <button onClick={() => setConfirmDeleteOpen(true)} disabled={deletingAccount} style={{ fontSize: "13px", fontWeight: 500, color: "#ff9b9b", background: "rgba(255,90,90,0.08)", border: "1px solid rgba(255,90,90,0.25)", padding: "10px 18px", borderRadius: "10px", cursor: deletingAccount ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{deletingAccount ? "Deleting..." : "Delete Account"}</button>
      </div>

      <AnimatePresence>
        {confirmDeleteOpen && (
          <ConfirmDialog
            open
            tone="danger"
            title="Delete this account?"
            message="This permanently removes the account, projects, API keys, moderation history, review queue items, webhooks, usage records, and uploaded account images. Active paid subscriptions must be cancelled before deleting."
            confirmLabel={deletingAccount ? "Deleting..." : "Delete account"}
            onCancel={() => setConfirmDeleteOpen(false)}
            onConfirm={confirmDeleteAccount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
