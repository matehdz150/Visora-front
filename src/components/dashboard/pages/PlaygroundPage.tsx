"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FilterSelect } from "../shared";
import { cap, card, fmtRisk, sectionLabel } from "../styles";
import type { Project } from "../types";
import type { DashboardNotify } from "../Toast";
import { moderateDashboardImageUpload, redactDashboardImageUpload, verifyDashboardImageUpload, type ModerationResponse, type RedactionResponse, type VerifyResponse } from "@/lib/visora-api";

export function PlaygroundPage({
  projects,
  idToken,
  initialProjectId,
  onModerated,
  notify,
}: {
  projects: Project[];
  idToken: string;
  initialProjectId?: string | null;
  onModerated?: (projectId: string) => void;
  notify: DashboardNotify;
}) {
  const [project, setProject] = useState(initialProjectId ?? projects[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [moderationResult, setModerationResult] = useState<ModerationResponse | null>(null);
  const [redactionResult, setRedactionResult] = useState<RedactionResponse | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const projectName = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  const selectedProject = projects.find((item) => item.id === project) ?? null;
  const workflow = selectedProject?.projectType ?? "moderation";
  const originalPreviewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const selfiePreviewUrl = useMemo(() => (selfieFile ? URL.createObjectURL(selfieFile) : null), [selfieFile]);
  const ready = workflow === "verify" ? Boolean(file && selfieFile) : Boolean(file);
  const neutralPill = (label: string): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "28px",
    padding: "5px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#050505",
    color: label === "reject" || label === "unsafe" || label === "fail" ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.74)",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: 600,
  });
  const softDecisionColors = (value: string) => {
    if (value === "reject" || value === "unsafe" || value === "fail") return { color: "#d89b9b", border: "rgba(216,155,155,0.2)", background: "rgba(216,155,155,0.055)" };
    if (value === "review" || value === "caution") return { color: "#cdb98a", border: "rgba(205,185,138,0.2)", background: "rgba(205,185,138,0.055)" };
    return { color: "#9fceb3", border: "rgba(159,206,179,0.2)", background: "rgba(159,206,179,0.055)" };
  };
  const softPill = (value: string): React.CSSProperties => {
    const colors = softDecisionColors(value);
    return {
      ...neutralPill(value),
      color: colors.color,
      border: `1px solid ${colors.border}`,
      background: colors.background,
    };
  };
  const softRiskColor = (value: number) => {
    if (value >= 85) return "#d89b9b";
    if (value >= 60) return "#cdb98a";
    return "#9fceb3";
  };

  useEffect(() => {
    if (initialProjectId && initialProjectId !== project) {
      setProject(initialProjectId);
      reset();
    }
  }, [initialProjectId]);

  useEffect(() => {
    return () => {
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    };
  }, [originalPreviewUrl]);

  useEffect(() => {
    return () => {
      if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
    };
  }, [selfiePreviewUrl]);

  const reset = () => {
    setFile(null);
    setSelfieFile(null);
    setModerationResult(null);
    setRedactionResult(null);
    setVerifyResult(null);
    setError(null);
    setStatus("idle");
  };

  const runProcessing = async () => {
    if (workflow === "verify" ? !(file && selfieFile) : !file) return;
    if (!project) {
      const message = "Create or select a project before running the playground.";
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
    setModerationResult(null);
    setRedactionResult(null);
    setVerifyResult(null);

    try {
      if (workflow === "redaction") {
        const response = await redactDashboardImageUpload({ idToken, projectId: project, image: file! });
        setRedactionResult(response);
        setStatus("done");
        notify({ kind: "success", title: "Redaction complete", message: `${response.regions.length} region${response.regions.length === 1 ? "" : "s"} blurred.` });
        onModerated?.(project);
        return;
      }

      if (workflow === "verify") {
        const response = await verifyDashboardImageUpload({ idToken, projectId: project, document: file!, selfie: selfieFile! });
        setVerifyResult(response);
        setStatus("done");
        notify({ kind: "success", title: "Verification complete", message: `${cap(response.decision)} · ${response.faceMatch.similarity}% face match` });
        onModerated?.(project);
        return;
      }

      const response = await moderateDashboardImageUpload({ idToken, projectId: project, image: file! });
      setModerationResult(response);
      setStatus("done");
      notify({ kind: "success", title: "Moderation complete", message: `${cap(response.action)} · risk ${fmtRisk(response.riskScore ?? 0)}` });
      onModerated?.(project);
    } catch (err) {
      const failTitle = workflow === "redaction" ? "Redaction failed" : workflow === "verify" ? "Verification failed" : "Moderation failed";
      const rawMessage = err instanceof Error ? err.message : failTitle;
      const message = rawMessage.includes("limit")
          ? `${rawMessage}. Check your plan limits in Settings.`
          : rawMessage;
      setError(message);
      setStatus("error");
      notify({ kind: "error", title: failTitle, message });
    }
  };

  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>Playground</h1>
      <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Upload an image and run it through the selected project workflow.</p>

      <div className="r-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px", marginTop: "30px", alignItems: "start" }}>
        {/* LEFT: request */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>PROJECT</div>
            <FilterSelect block value={project} onChange={(v) => { setProject(v); reset(); }} options={projects.map((p) => p.id)} render={(o) => { const t = projects.find((item) => item.id === o)?.projectType; return `${projectName[o]} · ${t === "redaction" ? "Redaction" : t === "verify" ? "Verify" : "Moderation"} · ${o}`; }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginTop: "14px", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "#000" }}>
              <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)" }}>Workflow</span>
              <span style={{ fontSize: "12.5px", color: workflow === "verify" ? "#7ee0a8" : workflow === "redaction" ? "#7ee0a8" : "#aebfff", fontWeight: 600 }}>{workflow === "redaction" ? "Image redaction" : workflow === "verify" ? "Identity verification" : "Image moderation"}</span>
            </div>
            <p style={{ margin: "12px 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>The playground uses your dashboard session. No API key is needed here.</p>
          </div>

          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>{workflow === "verify" ? "DOCUMENT & SELFIE" : "IMAGE"}</div>

            {workflow === "verify" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { label: "Identity document", hint: "ID, passport or license", value: file, set: setFile, preview: originalPreviewUrl },
                  { label: "Selfie", hint: "A clear photo of the person", value: selfieFile, set: setSelfieFile, preview: selfiePreviewUrl },
                ].map((slot) => (
                  <div key={slot.label}>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "7px" }}>{slot.label}</div>
                    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", height: "110px", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.16)", background: "#000", cursor: "pointer", textAlign: "center", overflow: "hidden", position: "relative" }}>
                      <input type="file" accept="image/jpeg,image/png" style={{ display: "none" }} onChange={(e) => { slot.set(e.target.files?.[0] ?? null); setVerifyResult(null); setError(null); setStatus("idle"); }} />
                      {slot.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={slot.preview} alt={slot.label} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }} />
                      ) : (
                        <>
                          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Click to select</span>
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{slot.hint}</span>
                        </>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", height: "150px", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.16)", background: "#000", cursor: "pointer", textAlign: "center" }}>
                  <input type="file" accept="image/jpeg,image/png" style={{ display: "none" }} onChange={(e) => { setFile(e.target.files?.[0] ?? null); setModerationResult(null); setRedactionResult(null); setError(null); setStatus("idle"); }} />
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{file ? file.name : "Click to select an image"}</span>
                  <span style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.35)" }}>{file ? (workflow === "redaction" ? "Ready to upload and redact" : "Ready to upload and scan") : "JPEG or PNG · uploaded and processed automatically"}</span>
                </label>

                {originalPreviewUrl && (
                  <div style={{ marginTop: "16px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#000" }}>
                    <img src={originalPreviewUrl} alt="Selected upload" style={{ display: "block", width: "100%", maxHeight: "260px", objectFit: "contain", background: "#080808" }} />
                  </div>
                )}
              </>
            )}

            <button disabled={!ready || !project || status === "loading"} onClick={runProcessing} style={{ width: "100%", marginTop: "16px", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: ready && project ? "#fff" : "rgba(255,255,255,0.32)", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: ready && project && status !== "loading" ? "pointer" : "not-allowed" }}>
              {status === "loading" ? (workflow === "redaction" ? "Uploading and redacting..." : workflow === "verify" ? "Verifying identity..." : "Uploading and moderating...") : workflow === "redaction" ? "Upload and redact" : workflow === "verify" ? "Run verification" : "Upload and moderate"}
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
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: status === "done" ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.25)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)" }}>{workflow === "redaction" ? "REDACTION RESULT" : workflow === "verify" ? "VERIFICATION RESULT" : "MODERATION RESULT"}</span>
          </div>
          <div style={{ padding: "22px" }}>
            {status !== "done" ? (
              <div style={{ height: "260px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
                {status === "loading" ? `Uploading and running ${workflow === "redaction" ? "/redact" : workflow === "verify" ? "/verify" : "/moderate"}...` : status === "error" ? "Fix the request and try again." : workflow === "redaction" ? "Upload an image to see the redacted output." : workflow === "verify" ? "Upload a document and a selfie to see the decision." : "Upload an image to see the verdict."}
              </div>
            ) : workflow === "verify" && verifyResult ? (
              <>
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ flex: 1, padding: "16px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "10px" }}>Decision</div>
                    <span style={softPill(verifyResult.decision === "verified" ? "allow" : verifyResult.decision === "rejected" ? "reject" : "review")}>{cap(verifyResult.decision)}</span>
                  </div>
                  <div style={{ flex: 1, padding: "16px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "6px" }}>Face match</div>
                    <div style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.03em", color: softRiskColor(100 - verifyResult.faceMatch.similarity) }}>{verifyResult.faceMatch.similarity}%</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginBottom: "22px" }}>
                  <div style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>Document</span>
                    <span style={softPill(verifyResult.document.detected && !verifyResult.document.expired ? "pass" : "fail")}>{!verifyResult.document.detected ? "None" : verifyResult.document.expired ? "Expired" : verifyResult.document.type ?? "Valid"}</span>
                  </div>
                  <div style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>Selfie quality</span>
                    <span style={softPill(verifyResult.selfie.quality === "pass" ? "pass" : "fail")}>{verifyResult.selfie.quality === "pass" ? "Pass" : "Fail"}</span>
                  </div>
                </div>

                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "12px" }}>REASONS</div>
                <div style={{ padding: "14px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "#000" }}>
                  {verifyResult.reasons.length === 0 ? (
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>No flags — all checks passed.</span>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "7px" }}>
                      {verifyResult.reasons.map((reason, i) => (
                        <li key={i} style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(255,255,255,0.72)" }}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "16px", padding: "11px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "#000", fontSize: "12.5px" }}>
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>Verification ID</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.72)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{verifyResult.verificationId}</span>
                </div>
              </>
            ) : workflow === "redaction" && redactionResult ? (
              <>
                <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#080808", marginBottom: "18px" }}>
                  <img src={redactionResult.redactedImageUrl} alt="Redacted output" style={{ display: "block", width: "100%", maxHeight: "460px", objectFit: "contain" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginBottom: "18px" }}>
                  {[
                    { label: "Faces", value: redactionResult.facesBlurred },
                    { label: "Text", value: redactionResult.textBlurred },
                    { label: "Plates", value: redactionResult.licensePlatesBlurred },
                  ].map((item) => (
                    <div key={item.label} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "#000" }}>
                      <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.42)", marginBottom: "6px" }}>{item.label}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "22px", color: "rgba(255,255,255,0.86)", fontWeight: 700 }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "11px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "#000", fontSize: "12.5px" }}>
                    <span style={{ color: "rgba(255,255,255,0.45)" }}>Redaction ID</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.72)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{redactionResult.redactionId}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "11px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "#000", fontSize: "12.5px" }}>
                    <span style={{ color: "rgba(255,255,255,0.45)" }}>Regions blurred</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.82)" }}>{redactionResult.regions.length}</span>
                  </div>
                  <a href={redactionResult.redactedImageUrl} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", marginTop: "6px", padding: "11px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "#050505", color: "rgba(255,255,255,0.78)", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>Open processed image</a>
                </div>
              </>
            ) : moderationResult ? (
              <>
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ flex: 1, padding: "16px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "10px" }}>Action</div>
                    <span style={softPill(moderationResult.action)}>{cap(moderationResult.action)}</span>
                  </div>
                  <div style={{ flex: 1, padding: "16px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "6px" }}>Risk score</div>
                    <div style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.03em", color: softRiskColor(moderationResult.riskScore ?? 0) }}>{fmtRisk(moderationResult.riskScore ?? 0)}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginBottom: "22px" }}>
                  <div style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>Brand safety</span>
                    <span style={softPill(moderationResult.brandSafety?.level ?? "safe")}>{cap(moderationResult.brandSafety?.level ?? "safe")}</span>
                  </div>
                  <div style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>Compliance</span>
                    {moderationResult.compliance ? (
                      <span style={softPill(moderationResult.compliance.passed ? "pass" : "fail")}>{moderationResult.compliance.passed ? "Pass" : "Fail"}</span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>—</span>
                    )}
                  </div>
                </div>

                {moderationResult.explanation && (
                  <div style={{ marginBottom: "22px", padding: "16px", borderRadius: "13px", border: "1px solid rgba(255,255,255,0.08)", background: "#000" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.42)", marginBottom: "9px" }}>POLICY DECISION</div>
                    <div style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{moderationResult.explanation.message}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" }}>
                      <div style={{ padding: "10px", borderRadius: "10px", background: "#000", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "4px" }}>Reason</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.72)" }}>{moderationResult.explanation.reason}</div>
                      </div>
                      <div style={{ padding: "10px", borderRadius: "10px", background: "#000", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "4px" }}>Configured action</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.78)", fontWeight: 600 }}>{moderationResult.explanation.configuredAction ? cap(moderationResult.explanation.configuredAction) : cap(moderationResult.action)}</div>
                      </div>
                      <div style={{ padding: "10px", borderRadius: "10px", background: "#000", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "4px" }}>Matched label</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{moderationResult.explanation.matchedLabel ?? "None"}</div>
                      </div>
                      <div style={{ padding: "10px", borderRadius: "10px", background: "#000", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "4px" }}>Confidence</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.72)" }}>{typeof moderationResult.explanation.matchedConfidence === "number" ? moderationResult.explanation.matchedConfidence.toFixed(1) + "%" : "—"}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "12px" }}>DETECTED LABELS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {moderationResult.labels.length === 0 ? (
                    <div style={{ padding: "14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "#000", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>No moderation labels detected.</div>
                  ) : moderationResult.labels.map((label) => (
                    <div key={`${label.name}-${label.confidence}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "#000" }}>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.78)" }}>{label.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: softRiskColor(label.confidence) }}>{fmtRisk(label.confidence)}</span>
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
