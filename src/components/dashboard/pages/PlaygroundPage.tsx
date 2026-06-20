"use client";

import React, { useState } from "react";
import { FilterSelect } from "../shared";
import { brandPill, cap, card, fmtRisk, pill, riskColor, sectionLabel } from "../styles";
import type { Project } from "../types";
import type { DashboardNotify } from "../Toast";
import { moderateDashboardImageUpload, type ModerationResponse } from "@/lib/visora-api";

export function PlaygroundPage({
  projects,
  idToken,
  onModerated,
  notify,
}: {
  projects: Project[];
  idToken: string;
  onModerated?: () => void;
  notify: DashboardNotify;
}) {
  const [project, setProject] = useState(projects[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ModerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const projectName = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setStatus("idle");
  };

  const runModeration = async () => {
    if (!file) return;
    if (!project) {
      const message = "Create or select a project before running moderation.";
      setError(message);
      setStatus("error");
      notify({ kind: "error", title: "Missing project", message });
      return;
    }
    if (!idToken) {
      const message = "Your dashboard session is missing. Sign in again and retry.";
      setError(message);
      setStatus("error");
      notify({ kind: "error", title: "Missing dashboard session", message });
      return;
    }

    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const response = await moderateDashboardImageUpload({ idToken, projectId: project, image: file });
      setResult(response);
      setStatus("done");
      notify({ kind: "success", title: "Moderation complete", message: `${cap(response.action)} · risk ${fmtRisk(response.riskScore ?? 0)}` });
      onModerated?.();
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "Moderation failed";
      const message = rawMessage.includes("limit")
          ? `${rawMessage}. Check your plan limits in Settings.`
          : rawMessage;
      setError(message);
      setStatus("error");
      notify({ kind: "error", title: "Moderation failed", message });
    }
  };

  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>Playground</h1>
      <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Upload an image and run it through the moderation pipeline.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px", marginTop: "30px", alignItems: "start" }}>
        {/* LEFT: request */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>PROJECT</div>
            <FilterSelect block value={project} onChange={(v) => { setProject(v); reset(); }} options={projects.map((p) => p.id)} render={(o) => `${projectName[o]} · ${o}`} />
            <p style={{ margin: "12px 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>The playground uses your dashboard session. No API key is needed here.</p>
          </div>

          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>IMAGE</div>
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", height: "150px", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.015)", cursor: "pointer", textAlign: "center" }}>
              <input type="file" accept="image/jpeg,image/png" style={{ display: "none" }} onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setError(null); setStatus("idle"); }} />
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{file ? file.name : "Click to select an image"}</span>
              <span style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.35)" }}>{file ? "Ready to upload and scan" : "JPEG or PNG · uploaded and scanned automatically"}</span>
            </label>

            <button disabled={!file || !project || status === "loading"} onClick={runModeration} style={{ width: "100%", marginTop: "16px", padding: "12px", borderRadius: "10px", border: "none", background: file && project ? "#aebfff" : "rgba(174,191,255,0.4)", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: file && project && status !== "loading" ? "pointer" : "not-allowed" }}>
              {status === "loading" ? "Uploading and moderating..." : "Upload and moderate"}
            </button>

            {error && (
              <div style={{ marginTop: "16px", padding: "13px 14px", borderRadius: "10px", border: "1px solid rgba(255,155,155,0.25)", background: "rgba(255,90,90,0.08)", color: "#ffb7b7", fontSize: "12.5px", lineHeight: 1.5 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffd1d1", marginBottom: "4px" }}>Request could not be completed</div>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: result */}
        <div style={{ position: "sticky", top: "30px", ...card, borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: status === "done" ? "#aebfff" : "rgba(255,255,255,0.25)", boxShadow: status === "done" ? "0 0 8px 1px rgba(126,155,255,0.8)" : "none" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)" }}>MODERATION RESULT</span>
          </div>
          <div style={{ padding: "22px" }}>
            {status !== "done" ? (
              <div style={{ height: "260px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
                {status === "loading" ? "Uploading image and running /moderate..." : status === "error" ? "Fix the request and try again." : "Upload an image to see the verdict."}
              </div>
            ) : result ? (
              <>
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ flex: 1, padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "10px" }}>Action</div>
                    <span style={{ ...pill(result.action), fontSize: "14px", padding: "5px 14px" }}>{cap(result.action)}</span>
                  </div>
                  <div style={{ flex: 1, padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "6px" }}>Risk score</div>
                    <div style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.03em", color: riskColor(result.riskScore ?? 0) }}>{fmtRisk(result.riskScore ?? 0)}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginBottom: "22px" }}>
                  <div style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>Brand safety</span>
                    <span style={brandPill(result.brandSafety?.level ?? "safe")}>{cap(result.brandSafety?.level ?? "safe")}</span>
                  </div>
                  <div style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>Compliance</span>
                    {result.compliance ? (
                      <span style={result.compliance.passed ? brandPill("safe") : brandPill("unsafe")}>{result.compliance.passed ? "Pass" : "Fail"}</span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>—</span>
                    )}
                  </div>
                </div>

                {result.explanation && (
                  <div style={{ marginBottom: "22px", padding: "16px", borderRadius: "13px", border: "1px solid rgba(174,191,255,0.18)", background: "rgba(174,191,255,0.055)" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.42)", marginBottom: "9px" }}>POLICY DECISION</div>
                    <div style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{result.explanation.message}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" }}>
                      <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "4px" }}>Reason</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.72)" }}>{result.explanation.reason}</div>
                      </div>
                      <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "4px" }}>Configured action</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.78)", fontWeight: 600 }}>{result.explanation.configuredAction ? cap(result.explanation.configuredAction) : cap(result.action)}</div>
                      </div>
                      <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "4px" }}>Matched label</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{result.explanation.matchedLabel ?? "None"}</div>
                      </div>
                      <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "4px" }}>Confidence</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.72)" }}>{typeof result.explanation.matchedConfidence === "number" ? result.explanation.matchedConfidence.toFixed(1) + "%" : "—"}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "12px" }}>DETECTED LABELS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.labels.length === 0 ? (
                    <div style={{ padding: "14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>No moderation labels detected.</div>
                  ) : result.labels.map((label) => (
                    <div key={`${label.name}-${label.confidence}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.78)" }}>{label.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: riskColor(label.confidence) }}>{fmtRisk(label.confidence)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
