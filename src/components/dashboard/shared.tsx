import React from "react";
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABEL } from "./constants";
import { decColors } from "./styles";
import type { Policy, ScoredLabel } from "./types";

export type Crumb = { label: string; onClick?: () => void };

/** Route breadcrumb trail. The first crumb carries a lucide ArrowLeft as the
 *  back affordance; crumbs with an onClick are clickable, the last is the
 *  current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {item.onClick ? (
              <button
                onClick={item.onClick}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontFamily: "inherit", fontSize: "13px", padding: 0 }}
              >
                {i === 0 && <ArrowLeft size={15} strokeWidth={2} style={{ marginRight: "1px" }} />}
                {item.label}
              </button>
            ) : (
              <span style={{ fontSize: "13px", color: isLast ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "320px" }}>{item.label}</span>
            )}
            {!isLast && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/** Shadcn/Radix select used by dashboard filters and playground controls. */
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
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={block ? "w-full" : undefined}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{render(o)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
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
