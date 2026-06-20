import React from "react";
import { PACK_LABEL } from "../constants";
import { Row } from "../shared";
import { cap, card, modeBadge, planBadge } from "../styles";
import type { Project } from "../types";
import { ProjectsEmptyState } from "@/components/empty-states";
import { VisoraMark } from "@/components/VisoraLogo";

export function ProjectsPage({
  accountId,
  projects,
  onCreateProject,
  onSelectProject,
}: {
  accountId: string;
  projects: Project[];
  onCreateProject: () => void;
  onSelectProject: (projectId: string) => void;
}) {
  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>Projects</h1>
          <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Isolated moderation environments under {accountId}.</p>
        </div>
        <button onClick={onCreateProject} className="v-cta" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: "#fff", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Create Project</button>
      </div>
      {projects.length === 0 ? (
        <ProjectsEmptyState onCta={onCreateProject} />
      ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "30px" }}>
        {projects.map((p) => (
          <button key={p.id} onClick={() => onSelectProject(p.id)} className="v-projcard" style={{ ...card, padding: "22px", cursor: "pointer", transition: "border-color .2s, transform .2s", color: "inherit", fontFamily: "inherit", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                <span style={{ width: "34px", height: "34px", borderRadius: "9px", background: "linear-gradient(140deg,#23252c,#101116)", border: "1px solid rgba(255,255,255,0.1)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <VisoraMark size={22} tone="light" />
                </span>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{p.id}</div>
                </div>
              </div>
              <span style={modeBadge(p.mode)}>{cap(p.mode)}</span>
            </div>
            <Row k="Plan" v={<span style={planBadge()}>{cap(p.planId)}</span>} top />
            <Row k="Project moderations" v={p.monthMods} />
            <Row k="Compliance pack" v={p.compliancePack ? PACK_LABEL[p.compliancePack] : "None"} />
            <Row k="Created" v={p.created} />
          </button>
        ))}
      </div>
      )}
    </div>
  );
}
