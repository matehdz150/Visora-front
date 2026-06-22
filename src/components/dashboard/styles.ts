/**
 * Visora dashboard — style helpers. The dashboard is a faithful inline-style
 * port of the Claude Design source, so colours and decision/risk styling live
 * here as plain functions returning `CSSProperties`.
 */
import type { CSSProperties } from "react";
import type { Action, BrandLevel, Mode } from "./types";

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const fmtRisk = (r: number) => r.toFixed(2);

export function decColors(a: Action) {
  if (a === "reject") return { color: "#ff9b9b", bg: "rgba(255,90,90,0.1)", bd: "rgba(255,90,90,0.24)" };
  if (a === "review") return { color: "#e8c98a", bg: "rgba(232,201,138,0.1)", bd: "rgba(232,201,138,0.22)" };
  return { color: "#7ee0a8", bg: "rgba(120,224,168,0.1)", bd: "rgba(120,224,168,0.22)" };
}

export function pill(a: Action): CSSProperties {
  const c = decColors(a);
  return { display: "inline-block", fontSize: "12px", fontWeight: 500, color: c.color, background: c.bg, border: "1px solid " + c.bd, padding: "3px 10px", borderRadius: "20px" };
}

export function brandColors(l: BrandLevel) {
  if (l === "unsafe") return { color: "#ff9b9b", bg: "rgba(255,90,90,0.1)", bd: "rgba(255,90,90,0.24)" };
  if (l === "caution") return { color: "#e8c98a", bg: "rgba(232,201,138,0.1)", bd: "rgba(232,201,138,0.22)" };
  return { color: "#7ee0a8", bg: "rgba(120,224,168,0.1)", bd: "rgba(120,224,168,0.22)" };
}

export function brandPill(l: BrandLevel): CSSProperties {
  const c = brandColors(l);
  return { display: "inline-block", fontSize: "11px", fontWeight: 500, color: c.color, background: c.bg, border: "1px solid " + c.bd, padding: "3px 10px", borderRadius: "20px" };
}

export function riskColor(r: number) {
  if (r >= 85) return "#ff9b9b";
  if (r >= 60) return "#e8c98a";
  if (r >= 30) return "rgba(255,255,255,0.8)";
  return "#7ee0a8";
}

export function riskCell(r: number): CSSProperties {
  return { fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: 500, color: riskColor(r) };
}

export function modeBadge(m: Mode): CSSProperties {
  let color = "rgba(255,255,255,0.7)";
  if (m === "strict") color = "#aebfff";
  else if (m === "relaxed") color = "#7ee0a8";
  return { fontSize: "11px", fontWeight: 500, color, background: "#000", border: "1px solid rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: "20px" };
}

export function planBadge(): CSSProperties {
  return { fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.7)", background: "#000", border: "1px solid rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: "20px" };
}

export const card: CSSProperties = { background: "#050505", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px" };
export const sectionLabel: CSSProperties = { fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.02em", marginBottom: "16px" };
export const drawerLabel: CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", margin: "24px 0 12px" };
