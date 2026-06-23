import React from "react";
import { PACK_LABEL } from "../constants";
import { Row } from "../shared";
import { cap, card, modeBadge, planBadge } from "../styles";
import type { Project } from "../types";

function redactionSummary(project: Project) {
  return [
    project.redactionSettings.faceBlur ? "faces" : null,
    project.redactionSettings.textBlur ? "text" : null,
    project.redactionSettings.licensePlateBlur ? "plates" : null,
  ].filter(Boolean).join(", ") || "none";
}

function ProjectGlyph({ type }: { type: Project["projectType"] }) {
  if (type === "verify") {
    return (
      <span style={{ position: "relative", width: "22px", height: "18px", display: "block" }}>
        <span style={{ position: "absolute", left: 0, top: "1px", width: "16px", height: "15px", border: "1.5px solid rgba(255,255,255,0.82)", borderRadius: "4px" }} />
        <span style={{ position: "absolute", left: "3px", top: "4px", width: "5px", height: "5px", borderRadius: "50%", border: "1.4px solid rgba(255,255,255,0.82)" }} />
        <span style={{ position: "absolute", left: "3px", top: "10px", width: "6px", height: "1.6px", borderRadius: "1px", background: "rgba(255,255,255,0.6)" }} />
        <span style={{ position: "absolute", right: "-1px", bottom: "0px", width: "6px", height: "3px", borderLeft: "2px solid #7ee0a8", borderBottom: "2px solid #7ee0a8", transform: "rotate(-45deg)" }} />
      </span>
    );
  }
  if (type === "redaction") {
    return (
      <span style={{ position: "relative", width: "22px", height: "18px", display: "block" }}>
        <span style={{ position: "absolute", inset: "2px 1px", border: "1.5px solid rgba(255,255,255,0.82)", borderRadius: "4px" }} />
        <span style={{ position: "absolute", left: "5px", top: "7px", width: "13px", height: "5px", borderRadius: "2px", background: "#aebfff" }} />
        <span style={{ position: "absolute", left: "10px", top: 0, width: "1.5px", height: "18px", borderRadius: "2px", background: "rgba(255,255,255,0.72)", transform: "rotate(28deg)", transformOrigin: "center" }} />
      </span>
    );
  }

  return <VisoraMark size={22} tone="light" />;
}
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
          <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Isolated moderation and redaction projects under {accountId}.</p>
        </div>
        <button onClick={onCreateProject} className="v-cta" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: "#fff", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Create Project</button>
      </div>
      {projects.length === 0 ? (
        <ProjectsEmptyState onCta={onCreateProject} />
      ) : (
      <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "30px" }}>
        {projects.map((p) => (
          <button key={p.id} onClick={() => onSelectProject(p.id)} className="v-projcard" style={{ ...card, padding: "22px", cursor: "pointer", transition: "border-color .2s, transform .2s", color: "inherit", fontFamily: "inherit", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                <span style={{ width: "34px", height: "34px", borderRadius: "9px", background: "#000", border: "1px solid rgba(255,255,255,0.1)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <ProjectGlyph type={p.projectType} />
                </span>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{p.id}</div>
                </div>
              </div>
              <span style={modeBadge(p.projectType === "moderation" ? p.mode : "relaxed")}>{p.projectType === "verify" ? "Verify" : p.projectType === "redaction" ? "Redaction" : cap(p.mode)}</span>
            </div>
            <Row k="Type" v={p.projectType === "verify" ? "Verify" : p.projectType === "redaction" ? "Redaction" : "Moderation"} top />
            <Row k="Plan" v={<span style={planBadge()}>{cap(p.planId)}</span>} />
            <Row k={p.projectType === "verify" ? "Project verifications" : p.projectType === "redaction" ? "Project redactions" : "Project moderations"} v={p.monthMods} />
            {p.projectType === "moderation" ? <Row k="Compliance pack" v={p.compliancePack ? PACK_LABEL[p.compliancePack] : "None"} /> : p.projectType === "verify" ? <Row k="Checks" v="Document, face, selfie" /> : <Row k="Redaction" v={redactionSummary(p)} />}
            <Row k="Created" v={p.created} />
          </button>
        ))}
      </div>
      )}
    </div>
  );
}
