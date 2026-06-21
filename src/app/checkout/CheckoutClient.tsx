"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { VisoraLogo } from "@/components/VisoraLogo";
import {
  createBillingSubscriptionIntent,
  getStoredSession,
  type PlanId,
} from "@/lib/visora-api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");
const paidPlans = new Set<PlanId>(["starter", "growth", "scale"]);
const planCopy: Record<Exclude<PlanId, "free">, { name: string; price: string; usage: string; features: string[] }> = {
  starter: {
    name: "Starter",
    price: "$29/month",
    usage: "10,000 image moderations per month",
    features: ["3 projects", "3 API keys", "30 day logs", "Webhooks"],
  },
  growth: {
    name: "Growth",
    price: "$149/month",
    usage: "50,000 image moderations per month",
    features: ["10 projects", "10 API keys", "90 day logs", "Review queue"],
  },
  scale: {
    name: "Scale",
    price: "$399/month",
    usage: "150,000 image moderations per month",
    features: ["50 projects", "50 API keys", "180 day logs", "Priority limits"],
  },
};

function isPaidPlan(value: string | null): value is Exclude<PlanId, "free"> {
  return value !== null && paidPlans.has(value as PlanId);
}

function PaymentForm({ planId }: { planId: Exclude<PlanId, "free"> }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/?billing=success&plan=${planId}`,
      },
    });

    if (result.error) {
      setError(result.error.message ?? "Payment could not be completed");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: "18px" }}>
      <div style={{ padding: "14px", borderRadius: "14px", background: "#101010", border: "1px solid rgba(255,255,255,0.1)" }}>
        <PaymentElement />
      </div>
      {error && (
        <div style={{ padding: "12px 14px", borderRadius: "11px", border: "1px solid rgba(255,155,155,0.28)", background: "rgba(255,90,90,0.08)", color: "#ffb7b7", fontSize: "13px", lineHeight: 1.45 }}>
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        style={{ width: "100%", border: "none", borderRadius: "11px", padding: "13px 16px", background: submitting ? "rgba(174,191,255,0.55)" : "#fff", color: "#050505", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}
      >
        {submitting ? "Processing..." : "Start subscription"}
      </button>
    </form>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = useMemo(() => (isPaidPlan(planId) ? planId : null), [planId]);
  const plan = selectedPlan ? planCopy[selectedPlan] : null;

  useEffect(() => {
    if (!selectedPlan) {
      router.replace("/pricing");
      return;
    }

    const session = getStoredSession();

    if (!session?.idToken) {
      router.replace(`/register?plan=${selectedPlan}`);
      return;
    }

    let active = true;

    createBillingSubscriptionIntent(session.idToken, selectedPlan)
      .then((intent) => {
        if (active) setClientSecret(intent.clientSecret);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not start payment");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router, selectedPlan]);

  if (!selectedPlan || !plan) return null;

  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", display: "grid", gridTemplateColumns: "minmax(0, .9fr) minmax(360px, 520px)", gap: "40px", padding: "34px", alignItems: "center" }}>
      <section style={{ minHeight: "calc(100vh - 68px)", borderRadius: "26px", border: "1px solid rgba(255,255,255,0.08)", background: "radial-gradient(circle at 30% 20%, rgba(126,155,255,0.16), transparent 34%), linear-gradient(150deg, #111, #070707)", padding: "34px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
        <Link href="/" style={{ width: "fit-content", color: "#fff", textDecoration: "none" }}><VisoraLogo markSize={30} fontSize={20} tone="light" /></Link>
        <div style={{ maxWidth: "620px" }}>
          <div style={{ display: "inline-flex", marginBottom: "18px", padding: "7px 10px", borderRadius: "999px", border: "1px solid rgba(174,191,255,0.22)", background: "rgba(174,191,255,0.08)", color: "#c5d0ff", fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>Secure billing</div>
          <h1 style={{ margin: 0, fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 0.94, letterSpacing: "-0.04em", fontWeight: 650 }}>Complete your Visora subscription.</h1>
          <p style={{ margin: "22px 0 0", maxWidth: "520px", color: "rgba(255,255,255,0.58)", fontSize: "16px", lineHeight: 1.7, fontWeight: 300 }}>Payment details are collected securely by Stripe inside this page. Visora never stores raw card information.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", maxWidth: "680px" }}>
          {["Encrypted card entry", "Monthly subscription", "Cancel anytime"].map((item) => (
            <div key={item} style={{ padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.035)", color: "rgba(255,255,255,0.7)", fontSize: "12.5px" }}>{item}</div>
          ))}
        </div>
      </section>

      <section style={{ borderRadius: "22px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15,15,15,0.94)", boxShadow: "0 24px 80px rgba(0,0,0,0.35)", padding: "26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "start", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.46)", marginBottom: "6px" }}>Selected plan</div>
            <h2 style={{ margin: 0, fontSize: "26px", letterSpacing: "-0.03em" }}>{plan.name}</h2>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.52)", fontSize: "13px" }}>{plan.usage}</p>
          </div>
          <div style={{ textAlign: "right", fontSize: "18px", fontWeight: 700 }}>{plan.price}</div>
        </div>

        <div style={{ display: "grid", gap: "9px", padding: "20px 0" }}>
          {plan.features.map((feature) => (
            <div key={feature} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#aebfff", boxShadow: "0 0 14px rgba(174,191,255,0.65)" }} />
              {feature}
            </div>
          ))}
        </div>

        {loading && <div style={{ padding: "22px", borderRadius: "14px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.58)", fontSize: "13px" }}>Preparing secure payment...</div>}
        {error && <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,90,90,0.08)", border: "1px solid rgba(255,155,155,0.28)", color: "#ffb7b7", fontSize: "13px", lineHeight: 1.5 }}>{error}</div>}
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night", variables: { colorPrimary: "#aebfff", colorBackground: "#101010", colorText: "#ffffff", colorDanger: "#ff9b9b", borderRadius: "10px" } } }}>
            <PaymentForm planId={selectedPlan} />
          </Elements>
        )}

        <p style={{ margin: "18px 0 0", color: "rgba(255,255,255,0.38)", fontSize: "11.5px", lineHeight: 1.55 }}>By subscribing, you authorize recurring monthly charges. You can manage billing from Settings after payment.</p>
      </section>
    </main>
  );
}

export default function CheckoutClient() {
  return (
    <Suspense fallback={null}>
      <CheckoutInner />
    </Suspense>
  );
}
