"use client";

import React, { useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_LABEL } from "../constants";
import { FilterSelect } from "../shared";
import { brandPill, cap, card, fmtRisk, pill, riskCell } from "../styles";
import type { Category, ModLog, Project } from "../types";
import { ModerationsEmptyState } from "@/components/empty-states";

const catText = (c: Category | null) => (c ? CATEGORY_LABEL[c] : "Safe");

export function ModerationsPage({
  projects,
  logs,
  onSelectMod,
}: {
  projects: Project[];
  logs: ModLog[];
  onSelectMod: (m: ModLog) => void;
}) {
  const [q, setQ] = useState("");
  const [fProject, setFProject] = useState("All");
  const [fDecision, setFDecision] = useState("All");
  const [fCategory, setFCategory] = useState("All");

  const filtered = useMemo(
    () =>
      logs.filter((m) => {
        if (fProject !== "All" && m.projectId !== fProject) return false;
        if (fDecision !== "All" && m.action !== fDecision) return false;
        if (fCategory !== "All" && m.category !== fCategory) return false;
        if (q) {
          const s = q.toLowerCase();
          const hay = `${m.moderationId} ${m.project} ${m.imageKey} ${m.category ?? "safe"}`.toLowerCase();
          if (!hay.includes(s)) return false;
        }
        return true;
      }),
    [logs, q, fProject, fDecision, fCategory],
  );
  const projectName = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>Moderations</h1>
      <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Every /moderate request, in real time.</p>

      {logs.length === 0 ? (
        <ModerationsEmptyState onCta={() => window.open("/docs", "_blank")} onSecondary={() => navigator.clipboard?.writeText("POST /moderate")} />
      ) : (
        <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", margin: "28px 0 18px" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", width: "13px", height: "13px", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: "50%" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, project, image key…" className="v-input" style={{ width: "100%", background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px 10px 34px", color: "#fff", fontFamily: "inherit", fontSize: "13px" }} />
        </div>
        <FilterSelect value={fProject} onChange={setFProject} options={["All", ...projects.map((p) => p.id)]} render={(o) => (o === "All" ? "All" : projectName[o])} />
        <FilterSelect value={fDecision} onChange={setFDecision} options={["All", "allow", "review", "reject"]} render={(o) => (o === "All" ? "All" : cap(o))} />
        <FilterSelect value={fCategory} onChange={setFCategory} options={["All", ...CATEGORIES]} render={(o) => (o === "All" ? "All" : CATEGORY_LABEL[o as Category])} />
      </div>

      <div className="dash-scroll" style={{ ...card, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr 0.7fr 0.8fr 0.9fr 1.3fr", padding: "13px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
          <span>Date</span><span>Project</span><span>Category</span><span>Risk</span><span>Decision</span><span>Brand</span><span>Moderation ID</span>
        </div>
        {filtered.map((m) => (
          <div key={m.moderationId} onClick={() => onSelectMod(m)} className="v-row" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr 0.7fr 0.8fr 0.9fr 1.3fr", alignItems: "center", padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "background .15s" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>{m.date}</span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>{m.project}</span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{catText(m.category)}</span>
            <span style={riskCell(m.riskScore)}>{fmtRisk(m.riskScore)}</span>
            <span><span style={pill(m.action)}>{cap(m.action)}</span></span>
            <span><span style={brandPill(m.brandLevel)}>{cap(m.brandLevel)}</span></span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{m.moderationId}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
          <span>Showing {filtered.length} results</span>
          <div style={{ display: "flex", gap: "6px" }}>
            <span style={{ padding: "5px 10px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px" }}>‹</span>
            <span style={{ padding: "5px 10px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px" }}>›</span>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
