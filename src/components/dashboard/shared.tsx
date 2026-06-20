import React from "react";
import { CATEGORY_LABEL } from "./constants";
import { decColors } from "./styles";
import type { Policy, ScoredLabel } from "./types";

/** Styled native <select> used by the moderation filters and playground. */
export function FilterSelect({
  value,
  onChange,
  options,
  render,
  block,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render: (o: string) => string;
  block?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: block ? "100%" : undefined, background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 30px 10px 14px", color: "rgba(255,255,255,0.8)", fontFamily: "inherit", fontSize: "13px", cursor: "pointer", backgroundImage: "linear-gradient(45deg,transparent 50%,rgba(255,255,255,0.4) 50%),linear-gradient(135deg,rgba(255,255,255,0.4) 50%,transparent 50%)", backgroundPosition: "calc(100% - 16px) center, calc(100% - 11px) center", backgroundSize: "5px 5px, 5px 5px", backgroundRepeat: "no-repeat" }}
    >
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "#0f0f0f" }}>{render(o)}</option>
      ))}
    </select>
  );
}

/** Key/value row used inside project cards. */
export function Row({ k, v, top }: { k: string; v: React.ReactNode; top?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", marginTop: top ? 0 : "8px", paddingTop: top ? "14px" : 0, borderTop: top ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
      <span style={{ color: "rgba(255,255,255,0.45)" }}>{k}</span>
      <span style={{ color: "rgba(255,255,255,0.85)" }}>{v}</span>
    </div>
  );
}

/** Confidence bars for detected labels — shared by Policies preview & Playground. */
export function LabelBars({ scored }: { scored: ScoredLabel[]; policy?: Policy }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {scored.map((l, i) => {
        const tagColor = !l.active ? "rgba(255,255,255,0.3)" : l.blocked ? decColors(l.action).color : "#7ee0a8";
        const tagText = !l.active ? "ignored" : l.blocked ? l.action : "safe";
        const barColor = l.blocked ? decColors(l.action).color : l.active ? "rgba(126,155,255,0.7)" : "rgba(255,255,255,0.2)";
        return (
          <div key={i} style={{ opacity: l.active ? 1 : 0.4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>{l.name}</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{l.category ? CATEGORY_LABEL[l.category] : "Safe"}</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{l.confidence.toFixed(1)}%</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: tagColor, border: "1px solid " + tagColor + "44", padding: "1px 7px", borderRadius: "20px" }}>{tagText}</span>
              </span>
            </div>
            <div style={{ height: "4px", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: l.confidence + "%", borderRadius: "3px", background: barColor, transition: "width .3s" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
