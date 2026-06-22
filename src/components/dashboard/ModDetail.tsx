import React, { useState } from "react";
import { motion } from "framer-motion";
import { CATEGORY_LABEL, MODE_PRESET, PACK_LABEL } from "./constants";
import { brandPill, cap, card, decColors, drawerLabel, fmtRisk, pill, riskColor } from "./styles";
import type { Category, Label, ModLog } from "./types";
import { drawerBackdropVariants, drawerVariants } from "./animations";

/** Moderation detail slide-over. Surfaces the ModerateAPI-specific brandSafety
 *  and compliance blocks alongside the decision summary and detected labels. */
export function ModDetail({ mod, onClose }: { mod: ModLog; onClose: () => void }) {
  const c = decColors(mod.action);
  const [imageState, setImageState] = useState({
    moderationId: mod.moderationId,
    revealed: false,
    failed: false,
  });

  const imageStateMatches = imageState.moderationId === mod.moderationId;
  const revealRejectedImage = imageStateMatches ? imageState.revealed : false;
  const imageFailed = imageStateMatches ? imageState.failed : false;

  const imageBlurred = mod.action === "reject" && !revealRejectedImage;

  const summary: { k: string; v: React.ReactNode }[] = [
    { k: "Decision", v: <span style={{ color: c.color, fontWeight: 500 }}>{cap(mod.action)}</span> },
    { k: "Safe", v: <span style={{ color: "rgba(255,255,255,0.85)" }}>{mod.action === "allow" ? "true" : "false"}</span> },
    { k: "Category", v: <span style={{ color: "rgba(255,255,255,0.85)" }}>{mod.category ? CATEGORY_LABEL[mod.category] : "Safe"}</span> },
    { k: "Risk score", v: <span style={{ color: riskColor(mod.riskScore), fontFamily: "'JetBrains Mono', monospace" }}>{fmtRisk(mod.riskScore)}</span> },
    { k: "Project", v: <span style={{ color: "rgba(255,255,255,0.85)" }}>{mod.project}</span> },
    { k: "Plan", v: <span style={{ color: "rgba(255,255,255,0.85)" }}>{cap(mod.planId)}</span> },
    { k: "Date", v: <span style={{ color: "rgba(255,255,255,0.85)" }}>{mod.date}</span> },
  ];

  const labels: Label[] = mod.labels?.length
    ? mod.labels
    : [{ name: mod.category ? CATEGORY_LABEL[mod.category] : "Safe", confidence: mod.riskScore, category: mod.category }];

  const policyRows = [
    { k: "Mode", v: cap(mod.policyMode) },
    { k: "Min confidence", v: `${MODE_PRESET[mod.policyMode].minConfidence}%` },
    { k: "Review threshold", v: String(MODE_PRESET[mod.policyMode].reviewThreshold) },
    { k: "Reject threshold", v: String(MODE_PRESET[mod.policyMode].rejectThreshold) },
  ];

  return (
    <>
      <motion.div variants={drawerBackdropVariants} initial="initial" animate="animate" exit="exit" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", zIndex: 40 }} />
      <motion.div variants={drawerVariants} initial="initial" animate="animate" exit="exit" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "560px", maxWidth: "92vw", background: "#000", borderLeft: "1px solid rgba(255,255,255,0.1)", zIndex: 41, overflowY: "auto", boxShadow: "-30px 0 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 26px", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, background: "#000", zIndex: 2 }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.02em" }}>Moderation detail</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "3px" }}>{mod.moderationId}</div>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#050505", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "15px" }}>✕</button>
        </div>

        <div style={{ padding: "24px 26px" }}>
          <div style={{ position: "relative", height: "230px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, rgba(255,255,255,0.015) 12px 24px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {mod.imageUrl && !imageFailed ? (
              <img
                src={mod.imageUrl}
                alt={`Moderated upload ${mod.moderationId}`}
                onError={() => setImageState({ moderationId: mod.moderationId, revealed: revealRejectedImage, failed: true })}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: imageBlurred ? "blur(18px)" : "none", transform: imageBlurred ? "scale(1.04)" : "scale(1)", transition: "filter .2s, transform .2s" }}
              />
            ) : (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.35)", padding: "0 20px", textAlign: "center", wordBreak: "break-all" }}>{mod.imageKey}</span>
            )}
            <span style={{ position: "absolute", top: "12px", left: "12px" }}><span style={pill(mod.action)}>{cap(mod.action)}</span></span>
            {imageBlurred && mod.imageUrl && !imageFailed && (
              <button onClick={() => setImageState({ moderationId: mod.moderationId, revealed: true, failed: imageFailed })} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", border: "1px solid rgba(255,255,255,0.18)", background: "rgba(11,11,11,0.78)", color: "#fff", borderRadius: "10px", padding: "10px 14px", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)" }}>Reveal image</button>
            )}
          </div>
          <div style={{ marginTop: "10px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", lineHeight: 1.5, color: "rgba(255,255,255,0.35)", wordBreak: "break-all" }}>{mod.imageKey}</div>

          <div style={drawerLabel}>DECISION SUMMARY</div>
          <div style={{ ...card, padding: "6px 18px" }}>
            {summary.map((s) => (
              <div key={s.k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>{s.k}</span>
                <span>{s.v}</span>
              </div>
            ))}
          </div>

          {mod.explanation && (
            <>
              <div style={drawerLabel}>POLICY DECISION</div>
              <div style={{ ...card, padding: "16px 18px", borderColor: c.bd, background: c.bg }}>
                <div style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{mod.explanation.message}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "4px" }}>Reason</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.72)" }}>{mod.explanation.reason}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "4px" }}>Matched action</div>
                    <div style={{ color: c.color, fontSize: "13px", fontWeight: 600 }}>{mod.explanation.configuredAction ? cap(mod.explanation.configuredAction) : cap(mod.action)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "4px" }}>Matched label</div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)" }}>{mod.explanation.matchedLabel ?? "None"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "4px" }}>Confidence</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.72)" }}>{typeof mod.explanation.matchedConfidence === "number" ? mod.explanation.matchedConfidence.toFixed(1) + "%" : "—"}</div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={drawerLabel}>BRAND SAFETY</div>
          <div style={{ ...card, padding: "6px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>Level</span>
              <span style={brandPill(mod.brandLevel)}>{cap(mod.brandLevel)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>Score</span>
              <span style={{ color: riskColor(mod.riskScore), fontFamily: "'JetBrains Mono', monospace" }}>{fmtRisk(mod.riskScore)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>Reasons</span>
              <span style={{ color: "rgba(255,255,255,0.85)" }}>{mod.category ? CATEGORY_LABEL[mod.category] : "—"}</span>
            </div>
          </div>

          {mod.compliancePack && (
            <>
              <div style={drawerLabel}>COMPLIANCE</div>
              <div style={{ ...card, padding: "6px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>Pack</span>
                  <span style={{ color: "rgba(255,255,255,0.85)" }}>{PACK_LABEL[mod.compliancePack]}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>Passed</span>
                  <span style={mod.compliancePassed ? brandPill("safe") : brandPill("unsafe")}>{mod.compliancePassed ? "Pass" : "Fail"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>Violations</span>
                  <span style={{ color: "rgba(255,255,255,0.85)" }}>{mod.complianceViolations && mod.complianceViolations.length ? mod.complianceViolations.map((v) => CATEGORY_LABEL[v as Category] ?? v).join(", ") : "None"}</span>
                </div>
              </div>
            </>
          )}

          <div style={drawerLabel}>DETECTED LABELS</div>
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", padding: "11px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
              <span>Label</span><span>Confidence</span><span>Category</span>
            </div>
            {labels.map((l, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{l.name}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.65)" }}>{l.confidence.toFixed(1)}%</span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{l.category ? CATEGORY_LABEL[l.category] : "Safe"}</span>
              </div>
            ))}
          </div>

          <div style={drawerLabel}>POLICY USED</div>
          <div style={{ ...card, padding: "6px 18px" }}>
            {policyRows.map((s) => (
              <div key={s.k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>{s.k}</span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
