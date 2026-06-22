import type { Metadata } from "next";
import Link from "next/link";
import { VisoraLogo } from "@/components/VisoraLogo";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple monthly pricing for Visora image moderation and redaction API plans.",
};

const MONO = "var(--font-jetbrains), monospace";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    subtitle: "For testing and early validation.",
    included: "1,000",
    overage: "No overage",
    projects: "1 project",
    apiKeys: "1 API key",
    retention: "7 days",
    redaction: "Not included",
    cta: "Start free",
    featured: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    subtitle: "For small apps validating real upload flows.",
    included: "8,000",
    overage: "$2.50 / 1,000 extra",
    projects: "3 projects",
    apiKeys: "3 API keys",
    retention: "30 days",
    redaction: "Included",
    cta: "Choose Starter",
    featured: false,
  },
  {
    id: "plus",
    name: "Plus",
    price: "$39",
    subtitle: "For growing apps with steady upload volume.",
    included: "16,000",
    overage: "$2.40 / 1,000 extra",
    projects: "5 projects",
    apiKeys: "5 API keys",
    retention: "60 days",
    redaction: "Included",
    cta: "Choose Plus",
    featured: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$89",
    subtitle: "For marketplaces and social products.",
    included: "38,000",
    overage: "$2.25 / 1,000 extra",
    projects: "10 projects",
    apiKeys: "10 API keys",
    retention: "90 days",
    redaction: "Included",
    cta: "Choose Growth",
    featured: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "$249",
    subtitle: "For larger apps with higher monthly usage.",
    included: "110,000",
    overage: "$2.00 / 1,000 extra",
    projects: "50 projects",
    apiKeys: "50 API keys",
    retention: "180 days",
    redaction: "Included",
    cta: "Choose Scale",
    featured: false,
  },
];

const featureRows = [
  ["Image moderation API", "Yes", "Yes", "Yes", "Yes", "Yes"],
  ["Redaction API", "No", "Yes", "Yes", "Yes", "Yes"],
  ["Face, text, and license plate blur", "No", "Yes", "Yes", "Yes", "Yes"],
  ["Brand safety result", "Yes", "Yes", "Yes", "Yes", "Yes"],
  ["Project scoped uploads", "Yes", "Yes", "Yes", "Yes", "Yes"],
  ["Custom policies", "Basic", "Yes", "Yes", "Yes", "Yes"],
  ["Compliance packs", "No", "Yes", "Yes", "Yes", "Yes"],
  ["Human review mode", "No", "Yes", "Yes", "Yes", "Yes"],
  ["Dashboard", "Basic", "Yes", "Yes", "Yes", "Yes"],
  ["Support", "Community", "Email", "Email", "Priority", "Priority"],
];

function Logo() {
  return (
    <VisoraLogo markSize={26} fontSize={18} tone="light" />
  );
}

export default function PricingPage() {
  return (
    <main className="lp-root" style={{ minHeight: "100vh", background: "#050505", color: "#fff" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", background: "rgba(5,5,5,0.78)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(14px)" }}>
        <Link href="/" style={{ textDecoration: "none" }}><Logo /></Link>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <span className="lp-nav-mid" style={{ display: "contents" }}>
            <Link href="/features/webhooks" className="v-navlink" style={{ fontSize: "14px", color: "rgba(255,255,255,0.68)", textDecoration: "none" }}>Features</Link>
            <a href="#plans" className="v-navlink" style={{ fontSize: "14px", color: "#fff", textDecoration: "none" }}>Pricing</a>
            <Link href="/login" className="v-navlink" style={{ fontSize: "14px", color: "rgba(255,255,255,0.68)", textDecoration: "none" }}>Log In</Link>
          </span>
          <Link href="/register?plan=free" className="v-btn-primary-sm" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: "#fff", padding: "9px 18px", borderRadius: "9px", textDecoration: "none", transition: "transform .2s, box-shadow .2s" }}>Start free</Link>
        </div>
      </nav>

      <section style={{ position: "relative", maxWidth: "1180px", margin: "0 auto", padding: "92px 40px 40px", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-280px", left: "50%", transform: "translateX(-50%)", width: "980px", height: "600px", background: "radial-gradient(ellipse at center, rgba(126,155,255,0.12), rgba(126,155,255,0) 64%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: "760px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "999px", background: "rgba(126,155,255,0.08)", border: "1px solid rgba(126,155,255,0.18)", color: "#aebfff", fontFamily: MONO, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Pricing</div>
          <h1 style={{ margin: "22px 0 0", fontSize: "clamp(34px, 8vw, 58px)", lineHeight: 1.02, fontWeight: 600, letterSpacing: "-0.055em" }}>Simple Visora Cloud plans for moderation and redaction.</h1>
          <p style={{ margin: "20px 0 0", maxWidth: "650px", color: "rgba(255,255,255,0.55)", fontSize: "17px", lineHeight: 1.7, fontWeight: 300 }}>Start free with image moderation, then upgrade when you need redaction projects, longer retention, compliance packs, and higher monthly usage.</p>
        </div>
      </section>

      <section id="plans" style={{ maxWidth: "1180px", margin: "0 auto", padding: "24px 40px 76px" }}>
        <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "16px" }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{ position: "relative", minHeight: "560px", background: plan.featured ? "linear-gradient(180deg, rgba(126,155,255,0.14), rgba(255,255,255,0.035))" : "#0f0f0f", border: "1px solid " + (plan.featured ? "rgba(126,155,255,0.38)" : "rgba(255,255,255,0.08)"), borderRadius: "14px", padding: "24px", display: "flex", flexDirection: "column" }}>
              {plan.featured && <div style={{ position: "absolute", top: "14px", right: "14px", fontFamily: MONO, fontSize: "10px", letterSpacing: "0.08em", color: "#aebfff", background: "rgba(126,155,255,0.11)", border: "1px solid rgba(126,155,255,0.28)", padding: "4px 8px", borderRadius: "999px" }}>POPULAR</div>}
              <div style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em" }}>{plan.name}</div>
              <p style={{ minHeight: "46px", margin: "9px 0 22px", fontSize: "13px", lineHeight: 1.6, color: "rgba(255,255,255,0.48)", fontWeight: 300 }}>{plan.subtitle}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "22px" }}>
                <span style={{ fontSize: "42px", fontWeight: 600, letterSpacing: "-0.05em" }}>{plan.price}</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.42)" }}>/ month</span>
              </div>
              <Link href={`/register?plan=${plan.id}`} className={plan.featured ? "v-btn-primary-sm" : "v-btn-secondary"} style={{ display: "block", textAlign: "center", textDecoration: "none", borderRadius: "10px", padding: "11px 14px", fontSize: "13px", fontWeight: 600, color: plan.featured ? "#050505" : "rgba(255,255,255,0.82)", background: plan.featured ? "#fff" : "rgba(255,255,255,0.04)", border: plan.featured ? "none" : "1px solid rgba(255,255,255,0.12)", transition: "transform .2s, box-shadow .2s, background .2s, border-color .2s" }}>{plan.cta}</Link>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "24px 0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  ["Included", `${plan.included} API requests / month`],
                  ["Redaction API", plan.redaction],
                  ["Overage", plan.overage],
                  ["Projects", plan.projects],
                  ["API keys", plan.apiKeys],
                  ["Logs", `${plan.retention} retention`],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.32)", textTransform: "uppercase" }}>{label}</span>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.78)", lineHeight: 1.45 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 40px 100px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", marginBottom: "18px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 600, letterSpacing: "-0.035em" }}>Plan comparison</h2>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.48)", fontSize: "14px", fontWeight: 300 }}>Paid plans include moderation and redaction projects. Free is limited to image moderation while you test the API.</p>
          </div>
        </div>

        <div className="dash-scroll" style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", overflow: "hidden", background: "#0f0f0f" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(5, 1fr)", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: MONO, fontSize: "11px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.38)", textTransform: "uppercase" }}>
            <span>Feature</span><span>Free</span><span>Starter</span><span>Plus</span><span>Growth</span><span>Scale</span>
          </div>
          {featureRows.map((row) => (
            <div key={row[0]} style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(5, 1fr)", padding: "15px 18px", borderBottom: "1px solid rgba(255,255,255,0.055)", fontSize: "13px" }}>
              {row.map((cell, index) => <span key={`${row[0]}-${cell}-${index}`} style={{ color: index === 0 ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.58)" }}>{cell}</span>)}
            </div>
          ))}
        </div>
      </section>
      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 40px 110px" }}>
        <div className="r-stack" style={{ display: "grid", gridTemplateColumns: "0.78fr 1fr", gap: "48px", alignItems: "start" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "0.16em", color: "#8fa0d8", textTransform: "uppercase" }}>FAQ</div>
            <h2 style={{ margin: "14px 0 0", fontSize: "34px", lineHeight: 1.08, fontWeight: 600, letterSpacing: "-0.04em" }}>Pricing questions.</h2>
            <p style={{ margin: "14px 0 0", color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: 1.7, fontWeight: 300 }}>Short answers for developers evaluating Visora Cloud plans.</p>
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {[
              ["How does billing work?", "Paid plans use monthly Stripe subscriptions. Choose a plan, complete payment in Visora checkout, and your account updates after Stripe confirms the subscription."],
              ["What counts toward usage?", "A successful protected moderation or redaction request counts toward monthly usage. Validation or authentication failures are not counted."],
              ["Is Redaction API included?", "Redaction API is available on paid plans. It supports face blur, selected text blur, custom words, ID-document sensitive fields, and license plate redaction."],
              ["What is the difference between Visora and Visora Cloud?", "Visora is the image moderation product and API. Visora Cloud is the hosted dashboard where accounts manage projects, plans, keys, policies, and logs."],
              ["Which SDK should I use?", "Use @visoracloud/client from Node.js or TypeScript server code. API keys should not be exposed in browser code."],
            ].map(([question, answer]) => (
              <div key={question} style={{ padding: "20px 22px", borderRadius: "14px", background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: "7px" }}>{question}</div>
                <div style={{ fontSize: "14px", lineHeight: 1.65, color: "rgba(255,255,255,0.52)", fontWeight: 300 }}>{answer}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
