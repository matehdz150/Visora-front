"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CATEGORIES, CATEGORY_LABEL, COMPLIANCE_PACKS, MODE_ACTIONS, MODE_PRESET, PACK_LABEL } from "../constants";
import { SAMPLE } from "../data";
import { moderate } from "../engine";
import { ConfirmDialog } from "../ConfirmDialog";
import { ProjectWebhooksSection } from "./ProjectWebhooksSection";
import { LabelBars, Row } from "../shared";
import { cap, card, fmtRisk, modeBadge, pill, planBadge, riskCell, riskColor, sectionLabel } from "../styles";
import type { Action, CompliancePack, ModLog, Mode, Policy, Project, WebhookEndpoint, WebhookEventType } from "../types";
import type { PolicyPatch } from "../usePolicyStore";

function catText(category: ModLog["category"]) {
  return category ? CATEGORY_LABEL[category] : "Safe";
}

export function ProjectDetailPage({
  project,
  policy,
  projectLogs,
  webhooks,
  webhookSecret,
  loadingWebhooks,
  setPolicy,
  onBack,
  onSavePolicy,
  savingPolicy,
  onCreateApiKey,
  onRenameProject,
  onDeleteProject,
  onCreateWebhook,
  onDisableWebhook,
  onRotateWebhookSecret,
  onDismissWebhookSecret,
  onSelectMod,
}: {
  project: Project;
  policy: Policy;
  projectLogs: ModLog[];
  webhooks: WebhookEndpoint[];
  webhookSecret?: string | null;
  loadingWebhooks?: boolean;
  setPolicy: (patch: PolicyPatch) => void;
  onBack: () => void;
  onSavePolicy: () => void;
  savingPolicy?: boolean;
  onCreateApiKey: () => void;
  onRenameProject: (name: string) => Promise<void>;
  onDeleteProject: () => Promise<void>;
  onCreateWebhook: (input: { name?: string; url: string; events: WebhookEventType[] }) => Promise<void>;
  onDisableWebhook: (webhookId: string) => Promise<void>;
  onRotateWebhookSecret: (webhookId: string) => Promise<void>;
  onDismissWebhookSecret: () => void;
  onSelectMod: (mod: ModLog) => void;
}) {
  const preview = useMemo(() => moderate(policy, SAMPLE), [policy]);
  const [projectName, setProjectName] = useState(project.name);
  const [savingName, setSavingName] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const update = (patch: PolicyPatch) => setPolicy(patch);
  const nameChanged = projectName.trim() !== project.name;

  const saveProjectName = async () => {
    const nextName = projectName.trim();
    if (!nextName || !nameChanged) return;

    setSavingName(true);
    try {
      await onRenameProject(nextName);
    } finally {
      setSavingName(false);
    }
  };

  const deleteProject = async () => {
    setDeletingProject(true);
    try {
      await onDeleteProject();
    } finally {
      setDeletingProject(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "24px", background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontFamily: "inherit", fontSize: "14px", cursor: "pointer" }}>← Projects</button>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <span style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#151515", border: "1px solid rgba(255,255,255,0.1)", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "4px", padding: "9px" }}>
              <span style={{ borderRadius: "2px", background: "rgba(255,255,255,0.9)" }} />
              <span style={{ borderRadius: "2px", background: "rgba(255,255,255,0.9)" }} />
              <span style={{ borderRadius: "2px", background: "rgba(255,255,255,0.38)" }} />
              <span style={{ borderRadius: "2px", background: "rgba(255,255,255,0.9)" }} />
            </span>
            <div>
              <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>{project.name}</h1>
              <div style={{ marginTop: "4px", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.42)" }}>{project.id}</div>
            </div>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Configure project settings, moderation policy, credentials, and activity.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={onCreateApiKey} style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.03)", padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontFamily: "inherit" }}>Create API Key</button>
          <button onClick={onSavePolicy} disabled={savingPolicy} className="v-cta" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: savingPolicy ? "rgba(255,255,255,0.65)" : "#fff", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: savingPolicy ? "wait" : "pointer", fontFamily: "inherit" }}>{savingPolicy ? "Saving..." : "Save policy"}</button>
        </div>
      </div>

      <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginTop: "28px" }}>
        <div style={{ ...card, padding: "18px" }}><Row k="Plan" v={<span style={planBadge()}>{cap(project.planId)}</span>} top /></div>
        <div style={{ ...card, padding: "18px" }}><Row k="Mode" v={<span style={modeBadge(policy.mode)}>{cap(policy.mode)}</span>} top /></div>
        <div style={{ ...card, padding: "18px" }}><Row k="Project moderations" v={project.monthMods} top /></div>
        <div style={{ ...card, padding: "18px" }}><Row k="Last updated" v={project.updated} top /></div>
      </div>

      <div className="r-stack" style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "22px", marginTop: "22px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>PROJECT SETTINGS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "8px" }}>Project name</label>
                <input value={projectName} onChange={(event) => setProjectName(event.target.value)} style={{ width: "100%", boxSizing: "border-box", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#fff", fontFamily: "inherit", fontSize: "14px", padding: "11px 12px", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "8px" }}>Project ID</label>
                <div style={{ height: "41px", display: "flex", alignItems: "center", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)", padding: "0 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis" }}>{project.id}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "16px" }}>
              <div style={{ padding: "13px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}><Row k="Created" v={project.created} top /></div>
              <div style={{ padding: "13px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}><Row k="Updated" v={project.updated} top /></div>
              <div style={{ padding: "13px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}><Row k="Compliance" v={project.compliancePack ? PACK_LABEL[project.compliancePack] : "None"} top /></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginTop: "18px" }}>
              <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.42)", lineHeight: 1.55 }}>Deleting a project revokes its API keys and removes policy configuration. Moderation logs are kept for audit history until retention expires.</p>
              <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                <button onClick={saveProjectName} disabled={!nameChanged || savingName || !projectName.trim()} style={{ padding: "9px 13px", borderRadius: "9px", border: "none", background: !nameChanged || savingName || !projectName.trim() ? "rgba(255,255,255,0.35)" : "#fff", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: !nameChanged || savingName || !projectName.trim() ? "not-allowed" : "pointer" }}>{savingName ? "Saving..." : "Save name"}</button>
                <button onClick={() => setConfirmDelete(true)} style={{ padding: "9px 13px", borderRadius: "9px", border: "1px solid rgba(255,155,155,0.28)", background: "rgba(255,90,90,0.08)", color: "#ffb7b7", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          </div>

          <ProjectWebhooksSection
            webhooks={webhooks}
            webhookSecret={webhookSecret}
            loading={loadingWebhooks}
            onCreateWebhook={onCreateWebhook}
            onDisableWebhook={onDisableWebhook}
            onRotateWebhookSecret={onRotateWebhookSecret}
            onDismissWebhookSecret={onDismissWebhookSecret}
          />

          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>MODERATION MODE</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
              {(["strict", "balanced", "relaxed"] as Mode[]).map((m) => {
                const on = policy.mode === m;
                const desc = m === "strict" ? "Maximum caution" : m === "balanced" ? "Recommended" : "Permissive";
                return (
                  <button key={m} onClick={() => update(() => ({ mode: m, ...MODE_PRESET[m], categoryActions: { ...MODE_ACTIONS[m] } }))} style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start", padding: "14px", borderRadius: "11px", cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: on ? "rgba(126,155,255,0.1)" : "rgba(255,255,255,0.02)", border: "1px solid " + (on ? "rgba(126,155,255,0.4)" : "rgba(255,255,255,0.08)"), color: on ? "#fff" : "rgba(255,255,255,0.7)" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>{cap(m)}</span>
                    <span style={{ fontSize: "11.5px", opacity: 0.7, fontWeight: 300 }}>{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>COMPLIANCE PACK</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {(["none", ...COMPLIANCE_PACKS] as (CompliancePack | "none")[]).map((pk) => {
                const on = (policy.compliancePack ?? "none") === pk;
                return (
                  <button key={pk} onClick={() => update(() => ({ compliancePack: pk }))} style={{ padding: "7px 13px", borderRadius: "9px", cursor: "pointer", fontFamily: "inherit", fontSize: "12.5px", fontWeight: on ? 500 : 400, background: on ? "rgba(126,155,255,0.12)" : "rgba(255,255,255,0.02)", border: "1px solid " + (on ? "rgba(126,155,255,0.4)" : "rgba(255,255,255,0.08)"), color: on ? "#fff" : "rgba(255,255,255,0.6)" }}>{pk === "none" ? "None" : PACK_LABEL[pk]}</button>
                );
              })}
            </div>
            <p style={{ margin: "14px 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Adds a curated rule set to <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>compliance</span> in the /moderate response.</p>
          </div>

          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>HUMAN REVIEW</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {(["enabled", "disabled"] as const).map((mode) => {
                const on = policy.reviewMode === mode;
                return (
                  <button key={mode} onClick={() => update(() => ({ reviewMode: mode }))} style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start", padding: "14px", borderRadius: "11px", cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: on ? "rgba(126,155,255,0.1)" : "rgba(255,255,255,0.02)", border: "1px solid " + (on ? "rgba(126,155,255,0.4)" : "rgba(255,255,255,0.08)"), color: on ? "#fff" : "rgba(255,255,255,0.7)" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>{mode === "enabled" ? "Review queue" : "Binary decisions"}</span>
                    <span style={{ fontSize: "11.5px", opacity: 0.7, fontWeight: 300 }}>{mode === "enabled" ? "Return review when policy asks for it." : "Convert review to allow or reject."}</span>
                  </button>
                );
              })}
            </div>

            {policy.reviewMode === "disabled" && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "10px" }}>When a rule would return review</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["allow", "reject"] as const).map((fallback) => {
                    const on = policy.reviewFallbackAction === fallback;
                    const color = fallback === "allow" ? "#7ee0a8" : "#ff9b9b";
                    return (
                      <button key={fallback} onClick={() => update(() => ({ reviewFallbackAction: fallback }))} style={{ padding: "7px 13px", borderRadius: "9px", cursor: "pointer", fontFamily: "inherit", fontSize: "12.5px", fontWeight: on ? 500 : 400, background: on ? color + "1f" : "rgba(255,255,255,0.02)", border: "1px solid " + (on ? color + "66" : "rgba(255,255,255,0.08)"), color: on ? color : "rgba(255,255,255,0.6)" }}>{cap(fallback)}</button>
                    );
                  })}
                </div>
              </div>
            )}

            <p style={{ margin: "14px 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>{policy.reviewMode === "enabled" ? "Review decisions can be handled by a human moderation queue." : `Review decisions are automatically converted to ${policy.reviewFallbackAction}.`}</p>
          </div>

          <div style={{ ...card, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ ...sectionLabel, marginBottom: 0 }}>MINIMUM CONFIDENCE</div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#aebfff" }}>{policy.minConfidence}%</span>
            </div>
            <input type="range" min={0} max={100} value={policy.minConfidence} onChange={(e) => update(() => ({ minConfidence: +e.target.value }))} style={{ width: "100%" }} />
            <p style={{ margin: "12px 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Labels below this confidence are ignored when scoring.</p>
          </div>

          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>BLOCKED CATEGORIES &amp; ACTIONS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {CATEGORIES.map((c) => {
                const blocked = policy.blockedCategories.includes(c);
                const action = policy.categoryActions[c] || "review";
                const setAct = (a: Action) => update((p) => ({ categoryActions: { ...p.categoryActions, [c]: a } }));
                const seg = (a: Action, color: string): React.CSSProperties => ({ fontSize: "11px", fontFamily: "inherit", fontWeight: 500, padding: "4px 9px", borderRadius: "6px", border: "none", cursor: "pointer", background: action === a ? color + "22" : "transparent", color: action === a ? color : "rgba(255,255,255,0.4)" });
                return (
                  <div key={c} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
                    <button onClick={() => update((p) => ({ blockedCategories: p.blockedCategories.includes(c) ? p.blockedCategories.filter((x) => x !== c) : [...p.blockedCategories, c] }))} style={{ display: "flex", alignItems: "center", gap: "10px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", borderRadius: "5px", fontSize: "11px", color: blocked ? "#050505" : "transparent", background: blocked ? "#aebfff" : "transparent", border: "1px solid " + (blocked ? "#aebfff" : "rgba(255,255,255,0.2)") }}>✓</span>
                      <span style={{ fontSize: "13px", color: blocked ? "#fff" : "rgba(255,255,255,0.55)" }}>{CATEGORY_LABEL[c]}</span>
                    </button>
                    <div style={{ display: "flex", gap: "3px", padding: "3px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", opacity: blocked ? 1 : 0.35 }}>
                      <button onClick={() => setAct("allow")} style={seg("allow", "#7ee0a8")}>Allow</button>
                      <button onClick={() => setAct("review")} style={seg("review", "#e8c98a")}>Review</button>
                      <button onClick={() => setAct("reject")} style={seg("reject", "#ff9b9b")}>Reject</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>RISK THRESHOLDS</div>
            <div style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>Review threshold</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#e8c98a" }}>{policy.reviewThreshold}</span>
              </div>
              <input type="range" min={0} max={100} value={policy.reviewThreshold} onChange={(e) => update(() => ({ reviewThreshold: +e.target.value }))} style={{ width: "100%" }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>Reject threshold</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#ff9b9b" }}>{policy.rejectThreshold}</span>
              </div>
              <input type="range" min={0} max={100} value={policy.rejectThreshold} onChange={(e) => update(() => ({ rejectThreshold: +e.target.value }))} style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        <div style={{ position: "sticky", top: "30px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ ...card, borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#aebfff", boxShadow: "0 0 8px 1px rgba(126,155,255,0.8)" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)" }}>LIVE DECISION PREVIEW</span>
            </div>
            <div style={{ padding: "22px" }}>
              <div style={{ position: "relative", height: "150px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 10px, rgba(255,255,255,0.015) 10px 20px)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>sample-upload.jpg</span>
              </div>
              <div style={{ display: "flex", gap: "12px", marginBottom: "22px" }}>
                <div style={{ flex: 1, padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "10px" }}>Decision</div>
                  <span style={{ ...pill(preview.action), fontSize: "14px", padding: "5px 14px" }}>{cap(preview.action)}</span>
                </div>
                <div style={{ flex: 1, padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "6px" }}>Risk score</div>
                  <div style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.03em", color: riskColor(preview.risk) }}>{fmtRisk(preview.risk)}</div>
                </div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "12px" }}>DETECTED LABELS</div>
              <LabelBars scored={preview.scored} />
            </div>
          </div>

          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)" }}>ACTIVITY TIMELINE</span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.34)" }}>{projectLogs.length} recent</span>
            </div>
            {projectLogs.length === 0 ? (
              <div style={{ padding: "26px 22px" }}>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>No moderation activity yet</div>
                <p style={{ margin: "8px 0 0", fontSize: "12.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.42)", fontWeight: 300 }}>Run an image through the playground or API and this project timeline will update automatically.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {projectLogs.slice(0, 8).map((log) => (
                  <button key={log.moderationId} onClick={() => onSelectMod(log)} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", width: "100%", padding: "14px 18px", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "transparent", color: "inherit", fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={pill(log.action)}>{cap(log.action)}</span>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.52)" }}>{catText(log.category)}</span>
                      </div>
                      <div style={{ marginTop: "7px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.36)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.moderationId}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={riskCell(log.riskScore)}>{fmtRisk(log.riskScore)}</div>
                      <div style={{ marginTop: "7px", fontSize: "11px", color: "rgba(255,255,255,0.36)" }}>{log.date}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            open
            tone="danger"
            title="Delete this project?"
            message={`This will delete ${project.name}, remove its saved policy, and revoke API keys attached to it. Moderation logs remain available until retention expires.`}
            confirmLabel={deletingProject ? "Deleting..." : "Delete project"}
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => void deleteProject()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
