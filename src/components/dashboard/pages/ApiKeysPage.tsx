"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ConfirmDialog } from "../ConfirmDialog";
import { cap, card, planBadge } from "../styles";
import type { ApiKey, Project } from "../types";
import type { DashboardNotify } from "../Toast";
import { ApiKeysEmptyState } from "@/components/empty-states";

function actionButtonStyle(disabled = false): React.CSSProperties {
  return {
    background: "none",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "12px",
    color: disabled ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.58)",
    fontFamily: "inherit",
    padding: 0,
  };
}

export function ApiKeysPage({
  projects,
  apiKeys,
  rawApiKey,
  onDismissRawKey,
  onCreateApiKey,
  onRenameApiKey,
  onRevokeApiKey,
  onRotateApiKey,
  notify,
}: {
  projects: Project[];
  apiKeys: ApiKey[];
  rawApiKey: string | null;
  onDismissRawKey: () => void;
  onCreateApiKey: (projectId?: string) => void;
  onRenameApiKey: (apiKeyHash: string, name: string) => Promise<void>;
  onRevokeApiKey: (apiKeyHash: string) => Promise<void>;
  onRotateApiKey: (apiKeyHash: string) => Promise<void>;
  notify: DashboardNotify;
}) {
  const [pendingRevoke, setPendingRevoke] = useState<ApiKey | null>(null);
  const [pendingRotate, setPendingRotate] = useState<ApiKey | null>(null);
  const [renamingKey, setRenamingKey] = useState<ApiKey | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const projectName = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  const copyRawKey = async () => {
    if (!rawApiKey) return;
    await navigator.clipboard?.writeText(rawApiKey);
    notify({ kind: "success", title: "API key copied", message: "Store it somewhere safe. Visora only shows raw keys once." });
  };

  const openRename = (apiKey: ApiKey) => {
    setRenamingKey(apiKey);
    setRenameValue(apiKey.name);
  };

  const confirmRename = async () => {
    if (!renamingKey) return;
    const name = renameValue.trim();
    if (!name) {
      notify({ kind: "error", title: "Name is required", message: "API key names cannot be empty." });
      return;
    }

    setBusyKey(renamingKey.apiKeyHash);
    try {
      await onRenameApiKey(renamingKey.apiKeyHash, name);
      setRenamingKey(null);
      setRenameValue("");
    } catch {
      return;
    } finally {
      setBusyKey(null);
    }
  };

  const confirmRevoke = async () => {
    if (!pendingRevoke) return;
    setBusyKey(pendingRevoke.apiKeyHash);
    try {
      await onRevokeApiKey(pendingRevoke.apiKeyHash);
      setPendingRevoke(null);
    } catch {
      return;
    } finally {
      setBusyKey(null);
    }
  };

  const confirmRotate = async () => {
    if (!pendingRotate) return;
    setBusyKey(pendingRotate.apiKeyHash);
    try {
      await onRotateApiKey(pendingRotate.apiKeyHash);
      setPendingRotate(null);
    } catch {
      return;
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>API Keys</h1>
          <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Authenticate customer requests with the <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>x-api-key</span> header.</p>
        </div>
        <button className="v-cta" onClick={() => onCreateApiKey()} disabled={projects.length === 0} style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: projects.length ? "#fff" : "rgba(255,255,255,0.35)", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: projects.length ? "pointer" : "not-allowed", fontFamily: "inherit" }}>Create API Key</button>
      </div>

      {rawApiKey && (
        <div style={{ marginTop: "24px", padding: "18px 20px", borderRadius: "14px", border: "1px solid rgba(126,155,255,0.3)", background: "rgba(126,155,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Copy your API key now</div>
            <button onClick={onDismissRawKey} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "14px" }}>x</button>
          </div>
          <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.5)", fontWeight: 300, marginBottom: "12px" }}>The raw key is shown once and never stored. Only a SHA-256 hash is kept server-side.</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "10px", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)" }}>
            <code style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#aebfff", wordBreak: "break-all" }}>{rawApiKey}</code>
            <button onClick={copyRawKey} style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.14)", background: "#000", color: "#fff", fontFamily: "inherit", fontSize: "12px", cursor: "pointer" }}>Copy</button>
          </div>
        </div>
      )}

      {apiKeys.length === 0 ? (
        <ApiKeysEmptyState onCta={() => onCreateApiKey()} onSecondary={() => window.open("/docs", "_blank")} />
      ) : (
        <div className="dash-scroll" style={{ ...card, overflow: "hidden", marginTop: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1.3fr 0.7fr 0.75fr 0.85fr 1fr", padding: "13px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
            <span>Project</span><span>Key</span><span>Plan</span><span>Status</span><span>Last used</span><span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {apiKeys.map((k) => {
            const isRevoked = k.status === "Revoked";
            const isBusy = busyKey === k.apiKeyHash;
            const sc = !isRevoked ? { color: "#7ee0a8", bg: "rgba(120,224,168,0.1)", bd: "rgba(120,224,168,0.22)" } : { color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.04)", bd: "rgba(255,255,255,0.12)" };
            return (
              <div key={k.apiKeyHash} style={{ display: "grid", gridTemplateColumns: "1.15fr 1.3fr 0.7fr 0.75fr 0.85fr 1fr", alignItems: "center", padding: "15px 22px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{projectName[k.projectId] ?? k.projectId}</div>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12.5px", color: "rgba(255,255,255,0.55)" }}>{k.displayKey}</span>
                <span><span style={planBadge()}>{cap(k.planId)}</span></span>
                <span><span style={{ fontSize: "11px", fontWeight: 500, color: sc.color, background: sc.bg, border: "1px solid " + sc.bd, padding: "3px 10px", borderRadius: "20px" }}>{k.status}</span></span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.48)" }}>{k.lastUsedAt}</span>
                <span style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button onClick={() => openRename(k)} disabled={isBusy} style={actionButtonStyle(isBusy)}>Rename</button>
                  <button onClick={() => setPendingRotate(k)} disabled={isRevoked || isBusy} style={actionButtonStyle(isRevoked || isBusy)}>Rotate</button>
                  <button onClick={() => setPendingRevoke(k)} disabled={isRevoked || isBusy} style={{ ...actionButtonStyle(isRevoked || isBusy), color: isRevoked || isBusy ? "rgba(255,255,255,0.28)" : "rgba(255,155,155,0.72)" }}>{isRevoked ? "Revoked" : "Revoke"}</button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {renamingKey && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRenamingKey(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", zIndex: 70 }} />
            <motion.div role="dialog" aria-modal="true" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.2, ease: "easeOut" }} style={{ position: "fixed", left: "50%", top: "50%", translate: "-50% -50%", zIndex: 71, width: "420px", maxWidth: "calc(100vw - 40px)", background: "#050505", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "24px", boxShadow: "0 34px 90px rgba(0,0,0,0.62)" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em" }}>Rename API key</h2>
              <p style={{ margin: "10px 0 16px", fontSize: "13.5px", lineHeight: 1.6, color: "rgba(255,255,255,0.55)", fontWeight: 300 }}>Give this key a name your team can recognize later.</p>
              <input autoFocus value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void confirmRename(); }} style={{ width: "100%", boxSizing: "border-box", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "#000", color: "#fff", fontFamily: "inherit", fontSize: "14px", padding: "11px 12px", outline: "none" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button onClick={() => setRenamingKey(null)} style={{ padding: "9px 14px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.12)", background: "#000", color: "rgba(255,255,255,0.72)", fontFamily: "inherit", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => void confirmRename()} disabled={busyKey === renamingKey.apiKeyHash} style={{ padding: "9px 15px", borderRadius: "9px", border: "none", background: "#fff", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: busyKey === renamingKey.apiKeyHash ? "not-allowed" : "pointer" }}>{busyKey === renamingKey.apiKeyHash ? "Saving..." : "Save name"}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingRevoke && (
          <ConfirmDialog
            open
            tone="danger"
            title="Revoke this API key?"
            message={`Requests using ${pendingRevoke.name} will stop working immediately. This change is persisted in the backend.`}
            confirmLabel={busyKey === pendingRevoke.apiKeyHash ? "Revoking..." : "Revoke key"}
            onCancel={() => setPendingRevoke(null)}
            onConfirm={() => void confirmRevoke()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingRotate && (
          <ConfirmDialog
            open
            tone="danger"
            title="Rotate this API key?"
            message={`Visora will revoke ${pendingRotate.name} and create a replacement key for the same project. Copy the new raw key when it appears.`}
            confirmLabel={busyKey === pendingRotate.apiKeyHash ? "Rotating..." : "Rotate key"}
            onCancel={() => setPendingRotate(null)}
            onConfirm={() => void confirmRotate()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
