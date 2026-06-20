import React from "react";
import { CATEGORY_LABEL } from "../constants";
import { cap, card, fmtRisk, pill, riskCell } from "../styles";
import type { Category, ModLog, Project, UsageSummary } from "../types";
import { OverviewEmptyState } from "@/components/empty-states";

const catText = (c: Category | null) => (c ? CATEGORY_LABEL[c] : "Safe");

export function OverviewPage({
  projects,
  logs,
  stats,
  usage,
  onCreateProject,
  onSelectMod,
  onViewAll,
}: {
  projects: Project[];
  logs: ModLog[];
  stats: { imagesModerated: number; rejected: number; review: number; activeProjects: number };
  usage: UsageSummary | null;
  onCreateProject: () => void;
  onSelectMod: (m: ModLog) => void;
  onViewAll: () => void;
}) {
  const usageUsed = usage?.requestsUsed ?? stats.imagesModerated;
  const usageLimit = usage?.monthlyLimit ?? 0;
  const usagePercent = usageLimit > 0 ? Math.min(100, (usageUsed / usageLimit) * 100) : 0;
  const usageLabel = usageLimit > 0
    ? `${usageUsed.toLocaleString()} / ${usageLimit.toLocaleString()}`
    : usageUsed.toLocaleString();

  const metrics = [
    { label: "Monthly usage", value: usageLabel, delta: usage?.overageRequests ? `${usage.overageRequests.toLocaleString()} overage` : usage?.month ?? "This month", up: !usage?.overageRequests, progress: usagePercent },
    { label: "Rejected", value: stats.rejected.toLocaleString(), delta: "This month", up: false },
    { label: "Flagged for review", value: stats.review.toLocaleString(), delta: "This month", up: true },
    { label: "Active projects", value: stats.activeProjects.toLocaleString(), delta: projects.length ? "+0" : "0", up: true },
  ];

  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>Overview</h1>
      <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Monitor moderation activity across your projects.</p>

      {projects.length === 0 && logs.length === 0 ? (
        <OverviewEmptyState onCta={onCreateProject} onSecondary={() => window.open("/docs", "_blank")} />
      ) : (
        <>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "32px" }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ ...card, padding: "20px" }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "14px" }}>{m.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{ fontSize: m.label === "Monthly usage" ? "24px" : "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>{m.value}</span>
              <span style={{ fontSize: "12px", fontWeight: 500, color: m.up ? "#7ee0a8" : "rgba(255,155,155,0.85)" }}>{m.delta}</span>
            </div>
            {"progress" in m && typeof m.progress === "number" && (
              <div style={{ height: "5px", marginTop: "16px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ width: `${m.progress}%`, height: "100%", borderRadius: "999px", background: m.progress >= 100 ? "#ff9b9b" : "linear-gradient(90deg,#7e9bff,#aebfff)" }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "44px 0 16px" }}>
        <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 600, letterSpacing: "-0.02em" }}>Recent moderations</h2>
        <button onClick={onViewAll} style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>View all →</button>
      </div>
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr 0.9fr 0.9fr 1.2fr", padding: "13px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
          <span>Time</span><span>Project</span><span>Category</span><span>Risk</span><span>Decision</span><span>Moderation ID</span>
        </div>
        {logs.slice(0, 6).map((m) => (
          <div key={m.moderationId} onClick={() => onSelectMod(m)} className="v-row" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr 0.9fr 0.9fr 1.2fr", alignItems: "center", padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "background .15s" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>{m.date.split("·")[1]?.trim() ?? m.date}</span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>{m.project}</span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{catText(m.category)}</span>
            <span style={riskCell(m.riskScore)}>{fmtRisk(m.riskScore)}</span>
            <span><span style={pill(m.action)}>{cap(m.action)}</span></span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{m.moderationId}</span>
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
}
