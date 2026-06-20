import React from "react";
import { decColors } from "../dashboard/styles";
import type { Action } from "../dashboard/types";
import { ACCENT, surface, text } from "./theme";
import type { DecisionEntry, FooterLink, NextStep } from "./data";

/* -------------------------------------------------------------------------- */
/* Prose                                                                      */
/* -------------------------------------------------------------------------- */

/** Highlighted info box. */
export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "13px", marginTop: "28px", padding: "16px 18px", borderRadius: "12px", background: "rgba(126,155,255,0.06)", border: "1px solid rgba(126,155,255,0.2)" }}>
      <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(126,155,255,0.2)", border: "1px solid rgba(126,155,255,0.5)", color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0, marginTop: "1px" }}>i</span>
      <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "rgba(255,255,255,0.72)", fontWeight: 300 }}>{children}</p>
    </div>
  );
}

/** Numbered step heading (anchorable via `id`). */
export function StepHeading({ id, step, children }: { id: string; step: number; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{ scrollMarginTop: "80px", margin: "52px 0 0", fontSize: "24px", fontWeight: 600, letterSpacing: "-0.025em", display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, color: ACCENT }}>{step}</span>
      {children}
    </h2>
  );
}

/** Plain (unnumbered) section heading. */
export function SectionHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{ scrollMarginTop: "80px", margin: "56px 0 0", fontSize: "24px", fontWeight: 600, letterSpacing: "-0.025em" }}>{children}</h2>
  );
}

/** Body paragraph with the docs' muted tone. */
export function Lead({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ margin: "14px 0 0", fontSize: "15px", lineHeight: 1.6, color: text.body, fontWeight: 300, ...style }}>{children}</p>;
}

/** Inline code token. */
export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: ACCENT, background: "rgba(126,155,255,0.08)", padding: "2px 6px", borderRadius: "5px" }}>{children}</code>;
}

/* -------------------------------------------------------------------------- */
/* Cards                                                                      */
/* -------------------------------------------------------------------------- */

/** A single row of the decision reference (pill + title + description). */
export function DecisionCard({ decision }: { decision: DecisionEntry }) {
  const c = decColors(decision.action as Action);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "18px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${surface.borderFaint}` }}>
      <span style={{ flexShrink: 0, fontSize: "12px", fontWeight: 500, color: c.color, background: c.bg, border: `1px solid ${c.bd}`, padding: "4px 12px", borderRadius: "20px" }}>{decision.label}</span>
      <div>
        <div style={{ fontSize: "14.5px", fontWeight: 500, marginBottom: "4px" }}>{decision.title}</div>
        <div style={{ fontSize: "13.5px", lineHeight: 1.55, color: text.muted, fontWeight: 300 }}>{decision.desc}</div>
      </div>
    </div>
  );
}

/** A "next steps" navigation card. */
export function NextStepCard({ step }: { step: NextStep }) {
  return (
    <a href={step.href} className="docs-card" style={{ display: "block", padding: "20px", borderRadius: "14px", background: surface.card, border: `1px solid ${surface.borderFaint}`, textDecoration: "none", color: "#fff", transition: "border-color .2s, transform .2s" }}>
      <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
        {step.title}
        <span style={{ color: ACCENT }}>→</span>
      </div>
      <div style={{ fontSize: "13.5px", lineHeight: 1.55, color: text.muted, fontWeight: 300 }}>{step.desc}</div>
    </a>
  );
}

/** Previous / next page navigation at the bottom of an article. */
export function DocFooterNav({ prev, next }: { prev: FooterLink; next: FooterLink }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "64px", paddingTop: "28px", borderTop: `1px solid ${surface.borderFaint}` }}>
      <a href={prev.href} className="docs-footlink" style={{ display: "flex", flexDirection: "column", gap: "4px", textDecoration: "none", color: "#fff" }}>
        <span style={{ fontSize: "12px", color: text.faint }}>← Previous</span>
        <span style={{ fontSize: "14.5px", fontWeight: 500 }}>{prev.label}</span>
      </a>
      <a href={next.href} className="docs-footlink" style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "right", textDecoration: "none", color: "#fff" }}>
        <span style={{ fontSize: "12px", color: text.faint }}>Next →</span>
        <span style={{ fontSize: "14.5px", fontWeight: 500 }}>{next.label}</span>
      </a>
    </div>
  );
}
