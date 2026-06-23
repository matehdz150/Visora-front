import React from "react";
import { motion } from "framer-motion";
import { card, drawerLabel } from "./styles";
import type { VerifyDecision } from "./types";
import type { VerifyLogEntry } from "@/lib/visora-api";
import { drawerBackdropVariants, drawerVariants } from "./animations";

export const DECISION_STYLE: Record<VerifyDecision, { label: string; color: string; bg: string }> = {
  verified: { label: "Verified", color: "#7ee0a8", bg: "rgba(126,224,168,0.12)" },
  review: { label: "Review", color: "#e8c98a", bg: "rgba(232,201,138,0.12)" },
  rejected: { label: "Rejected", color: "#ff9b9b", bg: "rgba(255,155,155,0.12)" },
};

function ImagePanel({ label, url }: { label: string; url?: string }) {
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "7px" }}>{label}</div>
      <div style={{ height: "150px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, rgba(255,255,255,0.015) 12px 24px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Not available</span>
        )}
      </div>
    </div>
  );
}

export function VerifyDetail({
  log,
  projectName,
  onClose,
}: {
  log: VerifyLogEntry;
  projectName: string;
  onClose: () => void;
}) {
  const decision = DECISION_STYLE[log.decision];

  const summary: { k: string; v: React.ReactNode }[] = [
    { k: "Project", v: projectName },
    { k: "Face match", v: `${log.faceMatchSimilarity}%` },
    { k: "Document", v: log.documentDetected ? log.documentType ?? "Detected" : "Not detected" },
    { k: "Document expired", v: log.documentExpired ? "Yes" : "No" },
    { k: "Selfie quality", v: log.selfieQuality === "pass" ? "Pass" : "Fail" },
    { k: "Confidence", v: `${log.confidence}%` },
    { k: "Plan", v: log.planId },
    { k: "Date", v: new Date(log.createdAt).toLocaleString() },
  ];

  return (
    <>
      <motion.div variants={drawerBackdropVariants} initial="initial" animate="animate" exit="exit" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", zIndex: 40 }} />
      <motion.div variants={drawerVariants} initial="initial" animate="animate" exit="exit" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "560px", maxWidth: "92vw", background: "#000", borderLeft: "1px solid rgba(255,255,255,0.1)", zIndex: 41, overflowY: "auto", boxShadow: "-30px 0 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 26px", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, background: "#000", zIndex: 2 }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.02em" }}>Verification detail</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "3px" }}>{log.verificationId}</div>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#050505", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "15px" }}>✕</button>
        </div>

        <div style={{ padding: "24px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "999px", background: decision.bg, border: `1px solid ${decision.color}55`, color: decision.color, fontSize: "15px", fontWeight: 600 }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: decision.color }} />
              {decision.label}
            </span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>{log.confidence}% confidence</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <ImagePanel label="Document" url={log.documentImageUrl} />
            <ImagePanel label="Selfie" url={log.selfieImageUrl} />
          </div>

          <div style={drawerLabel}>SUMMARY</div>
          <div style={{ ...card, padding: "6px 18px" }}>
            {summary.map((s) => (
              <div key={s.k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>{s.k}</span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{s.v}</span>
              </div>
            ))}
          </div>

          <div style={drawerLabel}>REASONS ({log.reasons.length})</div>
          <div style={{ ...card, padding: log.reasons.length ? "14px 18px" : "14px 18px" }}>
            {log.reasons.length === 0 ? (
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>No flags — all checks passed.</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {log.reasons.map((reason, index) => (
                  <li key={index} style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(255,255,255,0.72)" }}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
