"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { card } from "../styles";
import type { Project, RedactionSettings } from "../types";
import { VisoraMark } from "@/components/VisoraLogo";
import { RedactionDetail } from "../RedactionDetail";
import { fetchDashboardRedactionLogs, type RedactionLogEntry } from "@/lib/visora-api";

function numberFromMonth(value: string) {
  return Number(value.replace(/,/g, "")) || 0;
}

function redactionTargets(settings: RedactionSettings) {
  return [
    settings.faceBlur ? "Faces" : null,
    settings.textBlur ? "Text" : null,
    settings.licensePlateBlur ? "License plates" : null,
  ].filter(Boolean) as string[];
}

function styleLabel(style: RedactionLogEntry["style"]) {
  return style === "black_box" ? "Black box" : "Blur";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function totalRegions(log: RedactionLogEntry) {
  return log.facesBlurred + log.textBlurred + log.licensePlatesBlurred;
}

export function RedactionsPage({
  projects,
  idToken,
  onCreateProject,
  onOpenPlayground,
}: {
  projects: Project[];
  idToken?: string;
  onCreateProject: () => void;
  onSelectProject: (projectId: string) => void;
  onOpenPlayground: (projectId: string) => void;
}) {
  const redactionProjects = useMemo(
    () => projects.filter((project) => project.projectType === "redaction"),
    [projects],
  );
  const projectNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const project of redactionProjects) map.set(project.id, project.name);
    return map;
  }, [redactionProjects]);
  const settingsByProjectId = useMemo(() => {
    const map = new Map<string, RedactionSettings>();
    for (const project of redactionProjects) map.set(project.id, project.redactionSettings);
    return map;
  }, [redactionProjects]);

  const [logs, setLogs] = useState<RedactionLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<RedactionLogEntry | null>(null);

  useEffect(() => {
    if (!idToken || redactionProjects.length === 0) {
      setLogs([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      redactionProjects.map((project) =>
        fetchDashboardRedactionLogs({ idToken, projectId: project.id })
          .then((result) => result.logs)
          .catch(() => [] as RedactionLogEntry[]),
      ),
    ).then((lists) => {
      if (cancelled) return;
      const merged = lists
        .flat()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 60);
      setLogs(merged);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [idToken, redactionProjects]);

  const totalRedactions = redactionProjects.reduce((sum, project) => sum + numberFromMonth(project.monthMods), 0);
  const facesBlurred = logs.reduce((sum, log) => sum + log.facesBlurred, 0);
  const regionsBlurred = logs.reduce((sum, log) => sum + totalRegions(log), 0);

  const metrics = [
    { label: "Monthly redactions", value: totalRedactions.toLocaleString(), hint: "Across redaction projects" },
    { label: "Redaction projects", value: redactionProjects.length.toLocaleString(), hint: "Configured workspaces" },
    { label: "Regions blurred", value: regionsBlurred.toLocaleString(), hint: "In recent history" },
    { label: "Faces blurred", value: facesBlurred.toLocaleString(), hint: "In recent history" },
  ];

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "22px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>Redactions</h1>
          <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>History of processed images across your Redact API projects.</p>
        </div>
        <button onClick={onCreateProject} className="v-cta" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: "#fff", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Create redaction project</button>
      </div>

      {redactionProjects.length === 0 ? (
        <div style={{ ...card, marginTop: "32px", padding: "42px", textAlign: "center" }}>
          <div style={{ width: "66px", height: "66px", borderRadius: "18px", margin: "0 auto 20px", background: "#000", border: "1px solid rgba(255,255,255,0.1)", display: "grid", placeItems: "center" }}>
            <VisoraMark size={34} tone="light" />
          </div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em" }}>No redaction projects yet</h2>
          <p style={{ margin: "10px auto 0", maxWidth: "430px", fontSize: "14px", lineHeight: 1.65, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Create a Redaction project to blur faces, license plates, sensitive text, or custom terms from uploaded images.</p>
          <button onClick={onCreateProject} style={{ marginTop: "22px", fontSize: "14px", fontWeight: 500, color: "#050505", background: "#fff", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Create Project</button>
        </div>
      ) : (
        <>
          <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "32px" }}>
            {metrics.map((metric) => (
              <div key={metric.label} style={{ ...card, padding: "20px" }}>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "12px" }}>{metric.label}</div>
                <div style={{ fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>{metric.value}</div>
                <div style={{ marginTop: "7px", fontSize: "12px", color: "rgba(255,255,255,0.38)" }}>{metric.hint}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "44px 0 16px" }}>
            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 600, letterSpacing: "-0.02em" }}>Redaction history</h2>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.42)" }}>{loading ? "Loading…" : `${logs.length} recent`}</span>
          </div>

          {logs.length === 0 ? (
            <div style={{ ...card, padding: "42px", textAlign: "center" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em" }}>{loading ? "Loading redactions…" : "No redactions yet"}</h2>
              {!loading && (
                <>
                  <p style={{ margin: "10px auto 0", maxWidth: "420px", fontSize: "14px", lineHeight: 1.6, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Process an image to see it here. Open a project in the playground to run your first redaction.</p>
                  {redactionProjects[0] && (
                    <button onClick={() => onOpenPlayground(redactionProjects[0].id)} style={{ marginTop: "20px", fontSize: "14px", fontWeight: 500, color: "#050505", background: "#fff", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Try redact</button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
              {logs.map((log, index) => (
                <button
                  key={log.redactionId}
                  onClick={() => setSelectedLog(log)}
                  style={{ display: "flex", alignItems: "center", gap: "16px", width: "100%", textAlign: "left", padding: "14px 18px", background: "transparent", border: "none", borderTop: index === 0 ? "none" : "1px solid rgba(255,255,255,0.06)", cursor: "pointer", fontFamily: "inherit" }}
                >
                  <span style={{ width: "52px", height: "52px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, background: "#000", border: "1px solid rgba(255,255,255,0.1)", display: "grid", placeItems: "center" }}>
                    {log.redactedImageUrl || log.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={log.redactedImageUrl ?? log.imageUrl} alt="Redacted" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <VisoraMark size={22} tone="light" />
                    )}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{projectNameById.get(log.projectId) ?? log.projectId}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{log.redactionId}</div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end", maxWidth: "320px" }}>
                    {log.facesBlurred > 0 && <Tag label={`${log.facesBlurred} face${log.facesBlurred === 1 ? "" : "s"}`} />}
                    {log.textBlurred > 0 && <Tag label={`${log.textBlurred} text`} />}
                    {log.licensePlatesBlurred > 0 && <Tag label={`${log.licensePlatesBlurred} plate${log.licensePlatesBlurred === 1 ? "" : "s"}`} />}
                    {totalRegions(log) === 0 && <Tag label="No regions" muted />}
                  </div>

                  <span style={{ width: "84px", textAlign: "right", flexShrink: 0, fontSize: "11.5px", color: "rgba(255,255,255,0.5)" }}>{styleLabel(log.style)}</span>
                  <span style={{ width: "96px", textAlign: "right", flexShrink: 0, fontSize: "11.5px", color: "rgba(255,255,255,0.42)" }}>{formatDate(log.createdAt)}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {selectedLog && (
          <RedactionDetail
            key={selectedLog.redactionId}
            log={selectedLog}
            projectName={projectNameById.get(selectedLog.projectId) ?? selectedLog.projectId}
            settings={settingsByProjectId.get(selectedLog.projectId)}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Tag({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <span style={{ padding: "4px 9px", borderRadius: "999px", background: "#000", border: "1px solid rgba(255,255,255,0.1)", color: muted ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.68)", fontSize: "11px", whiteSpace: "nowrap" }}>{label}</span>
  );
}
