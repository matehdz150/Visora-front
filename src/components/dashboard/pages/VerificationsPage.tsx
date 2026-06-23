"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { card } from "../styles";
import type { Project } from "../types";
import { VisoraMark } from "@/components/VisoraLogo";
import { VerifyDetail, DECISION_STYLE } from "../VerifyDetail";
import { fetchDashboardVerifyLogs, type VerifyLogEntry } from "@/lib/visora-api";

function numberFromMonth(value: string) {
  return Number(value.replace(/,/g, "")) || 0;
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

export function VerificationsPage({
  projects,
  idToken,
  onCreateProject,
}: {
  projects: Project[];
  idToken?: string;
  onCreateProject: () => void;
  onSelectProject: (projectId: string) => void;
}) {
  const verifyProjects = useMemo(
    () => projects.filter((project) => project.projectType === "verify"),
    [projects],
  );
  const projectNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const project of verifyProjects) map.set(project.id, project.name);
    return map;
  }, [verifyProjects]);

  const [logs, setLogs] = useState<VerifyLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<VerifyLogEntry | null>(null);

  useEffect(() => {
    if (!idToken || verifyProjects.length === 0) {
      setLogs([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      verifyProjects.map((project) =>
        fetchDashboardVerifyLogs({ idToken, projectId: project.id })
          .then((result) => result.logs)
          .catch(() => [] as VerifyLogEntry[]),
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
  }, [idToken, verifyProjects]);

  const totalVerifications = verifyProjects.reduce((sum, project) => sum + numberFromMonth(project.monthMods), 0);
  const verifiedCount = logs.filter((log) => log.decision === "verified").length;
  const reviewCount = logs.filter((log) => log.decision === "review").length;

  const metrics = [
    { label: "Monthly verifications", value: totalVerifications.toLocaleString(), hint: "Across verify projects" },
    { label: "Verify projects", value: verifyProjects.length.toLocaleString(), hint: "Configured workspaces" },
    { label: "Verified", value: verifiedCount.toLocaleString(), hint: "In recent history" },
    { label: "Needs review", value: reviewCount.toLocaleString(), hint: "In recent history" },
  ];

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "22px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>Verifications</h1>
          <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>History of identity checks across your Verify API projects.</p>
        </div>
        <button onClick={onCreateProject} className="v-cta" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: "#fff", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Create verify project</button>
      </div>

      {verifyProjects.length === 0 ? (
        <div style={{ ...card, marginTop: "32px", padding: "42px", textAlign: "center" }}>
          <div style={{ width: "66px", height: "66px", borderRadius: "18px", margin: "0 auto 20px", background: "#000", border: "1px solid rgba(255,255,255,0.1)", display: "grid", placeItems: "center" }}>
            <VisoraMark size={34} tone="light" />
          </div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em" }}>No verify projects yet</h2>
          <p style={{ margin: "10px auto 0", maxWidth: "440px", fontSize: "14px", lineHeight: 1.65, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Create a Verify project to check identity documents against a selfie — document authenticity, face match, and liveness signals in one call.</p>
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
            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 600, letterSpacing: "-0.02em" }}>Verification history</h2>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.42)" }}>{loading ? "Loading…" : `${logs.length} recent`}</span>
          </div>

          {logs.length === 0 ? (
            <div style={{ ...card, padding: "42px", textAlign: "center" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em" }}>{loading ? "Loading verifications…" : "No verifications yet"}</h2>
              {!loading && (
                <p style={{ margin: "10px auto 0", maxWidth: "440px", fontSize: "14px", lineHeight: 1.6, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Send a document and a selfie to <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>POST /verify</span> and the result will show up here.</p>
              )}
            </div>
          ) : (
            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
              {logs.map((log, index) => {
                const decision = DECISION_STYLE[log.decision];
                return (
                  <button
                    key={log.verificationId}
                    onClick={() => setSelectedLog(log)}
                    style={{ display: "flex", alignItems: "center", gap: "16px", width: "100%", textAlign: "left", padding: "14px 18px", background: "transparent", border: "none", borderTop: index === 0 ? "none" : "1px solid rgba(255,255,255,0.06)", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    <span style={{ width: "52px", height: "52px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, background: "#000", border: "1px solid rgba(255,255,255,0.1)", display: "grid", placeItems: "center" }}>
                      {log.selfieImageUrl || log.documentImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={log.selfieImageUrl ?? log.documentImageUrl} alt="Verification" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <VisoraMark size={22} tone="light" />
                      )}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{projectNameById.get(log.projectId) ?? log.projectId}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{log.verificationId}</div>
                    </div>

                    <span style={{ width: "92px", textAlign: "right", flexShrink: 0, fontSize: "11.5px", color: "rgba(255,255,255,0.5)" }}>{log.faceMatchSimilarity}% match</span>

                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexShrink: 0, padding: "5px 11px", borderRadius: "999px", background: decision.bg, border: `1px solid ${decision.color}44`, color: decision.color, fontSize: "12px", fontWeight: 500, width: "98px", justifyContent: "center" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: decision.color }} />
                      {decision.label}
                    </span>

                    <span style={{ width: "96px", textAlign: "right", flexShrink: 0, fontSize: "11.5px", color: "rgba(255,255,255,0.42)" }}>{formatDate(log.createdAt)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {selectedLog && (
          <VerifyDetail
            key={selectedLog.verificationId}
            log={selectedLog}
            projectName={projectNameById.get(selectedLog.projectId) ?? selectedLog.projectId}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
