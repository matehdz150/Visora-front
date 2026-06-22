"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CATEGORIES, CATEGORY_LABEL, COMPLIANCE_PACKS, MODE_ACTIONS, MODE_PRESET, PACK_LABEL } from "../constants";
import { SAMPLE } from "../data";
import { moderate } from "../engine";
import { ConfirmDialog } from "../ConfirmDialog";
import { ProjectWebhooksSection } from "./ProjectWebhooksSection";
import { LabelBars, Row } from "../shared";
import { cap, card, fmtRisk, modeBadge, pill, planBadge, riskCell, riskColor, sectionLabel } from "../styles";
import type { Action, CompliancePack, ModLog, Mode, Policy, Project, RedactionSettings, RedactionTextCategory, WebhookEndpoint, WebhookEventType } from "../types";
import type { PolicyPatch } from "../usePolicyStore";

function catText(category: ModLog["category"]) {
  return category ? CATEGORY_LABEL[category] : "Safe";
}

const redactionStyleOptions = [
  { value: "blur", label: "Blur", description: "Softly obscure detected regions." },
  { value: "black_box", label: "Black box", description: "Cover detected regions with a solid rectangle." },
] as const;

const textCategoryOptions: Array<{ value: RedactionTextCategory; label: string; description: string }> = [
  { value: "id_document", label: "ID documents", description: "Blur values while keeping labels readable." },
  { value: "sexual", label: "Sexual text", description: "Adult and explicit wording." },
  { value: "profanity", label: "Profanity", description: "Offensive or vulgar words." },
  { value: "credentials", label: "Credentials", description: "Passwords, tokens, and secrets." },
];

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
  onSaveRedactionSettings,
  savingRedactionSettings,
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
  onSaveRedactionSettings: (settings: RedactionSettings) => void;
  savingRedactionSettings?: boolean;
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
  const [redactionSettings, setRedactionSettings] = useState<RedactionSettings>(project.redactionSettings);
  const [customWordInput, setCustomWordInput] = useState("");
  const [ignoredWordInput, setIgnoredWordInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const update = (patch: PolicyPatch) => setPolicy(patch);
  const nameChanged = projectName.trim() !== project.name;
  const redactionChanged =
    redactionSettings.faceBlur !== project.redactionSettings.faceBlur ||
    redactionSettings.textBlur !== project.redactionSettings.textBlur ||
    redactionSettings.licensePlateBlur !== project.redactionSettings.licensePlateBlur ||
    redactionSettings.redactionStyle !== project.redactionSettings.redactionStyle ||
    JSON.stringify(redactionSettings.textCategories) !== JSON.stringify(project.redactionSettings.textCategories) ||
    JSON.stringify(redactionSettings.customWords) !== JSON.stringify(project.redactionSettings.customWords) ||
    JSON.stringify(redactionSettings.ignoredWords) !== JSON.stringify(project.redactionSettings.ignoredWords) ||
    redactionSettings.minConfidence !== project.redactionSettings.minConfidence;

  useEffect(() => {
    setProjectName(project.name);
    setRedactionSettings(project.redactionSettings);
    setCustomWordInput("");
    setIgnoredWordInput("");
  }, [project]);

  const updateRedactionSettings = (patch: Partial<RedactionSettings>) => {
    setRedactionSettings((current) => ({ ...current, ...patch }));
  };

  const toggleTextCategory = (category: RedactionTextCategory) => {
    setRedactionSettings((current) => {
      const enabled = current.textCategories.includes(category);
      return {
        ...current,
        textCategories: enabled
          ? current.textCategories.filter((item) => item !== category)
          : [...current.textCategories, category],
      };
    });
  };

  const addWords = (
    key: "customWords" | "ignoredWords",
    value: string,
    clear: () => void
  ) => {
    const words = value
      .split(",")
      .map((word) => word.trim().toLowerCase())
      .filter(Boolean);

    if (words.length === 0) return;

    setRedactionSettings((current) => ({
      ...current,
      [key]: Array.from(new Set([...current[key], ...words])).slice(0, 50),
    }));
    clear();
  };

  const removeWord = (key: "customWords" | "ignoredWords", word: string) => {
    updateRedactionSettings({
      [key]: redactionSettings[key].filter((item) => item !== word),
    });
  };

  const handleWordKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    key: "customWords" | "ignoredWords",
    value: string,
    clear: () => void
  ) => {
    if (event.key !== "Enter" && event.key !== ",") return;

    event.preventDefault();
    addWords(key, value, clear);
  };

  const redactionSummary = [
    redactionSettings.faceBlur ? "Faces" : null,
    redactionSettings.textBlur ? "Text" : null,
    redactionSettings.licensePlateBlur ? "License plates" : null,
    redactionSettings.textBlur && redactionSettings.textCategories.length > 0 ? "Text categories" : null,
    redactionSettings.textBlur && redactionSettings.customWords.length > 0 ? "Custom words" : null,
    redactionSettings.textBlur && redactionSettings.ignoredWords.length > 0 ? "Ignored words" : null,
  ].filter(Boolean).join(", ") || "No blur targets enabled";

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
            <span style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#000", border: "1px solid rgba(255,255,255,0.1)", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "4px", padding: "9px" }}>
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
          <p style={{ margin: "10px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{project.projectType === "redaction" ? "Configure blur targets, credentials, webhooks, and activity." : "Configure project settings, moderation policy, credentials, and activity."}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={onCreateApiKey} style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.75)", background: "#000", padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontFamily: "inherit" }}>Create API Key</button>
          {project.projectType === "redaction" ? (
            <button onClick={() => onSaveRedactionSettings(redactionSettings)} disabled={savingRedactionSettings || !redactionChanged} className="v-cta" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: savingRedactionSettings || !redactionChanged ? "rgba(255,255,255,0.65)" : "#fff", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: savingRedactionSettings ? "wait" : redactionChanged ? "pointer" : "not-allowed", fontFamily: "inherit" }}>{savingRedactionSettings ? "Saving..." : "Save settings"}</button>
          ) : (
            <button onClick={onSavePolicy} disabled={savingPolicy} className="v-cta" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: savingPolicy ? "rgba(255,255,255,0.65)" : "#fff", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: savingPolicy ? "wait" : "pointer", fontFamily: "inherit" }}>{savingPolicy ? "Saving..." : "Save policy"}</button>
          )}
        </div>
      </div>

      <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginTop: "28px" }}>
        <div style={{ ...card, padding: "18px" }}><Row k="Plan" v={<span style={planBadge()}>{cap(project.planId)}</span>} top /></div>
        <div style={{ ...card, padding: "18px" }}><Row k="Type" v={<span style={modeBadge(project.projectType === "redaction" ? "relaxed" : policy.mode)}>{project.projectType === "redaction" ? "Redaction" : cap(policy.mode)}</span>} top /></div>
        <div style={{ ...card, padding: "18px" }}><Row k={project.projectType === "redaction" ? "Project redactions" : "Project moderations"} v={project.monthMods} top /></div>
        <div style={{ ...card, padding: "18px" }}><Row k="Last updated" v={project.updated} top /></div>
      </div>

      <div className="r-stack" style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "22px", marginTop: "22px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>PROJECT SETTINGS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "8px" }}>Project name</label>
                <input value={projectName} onChange={(event) => setProjectName(event.target.value)} style={{ width: "100%", boxSizing: "border-box", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "#000", color: "#fff", fontFamily: "inherit", fontSize: "14px", padding: "11px 12px", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "8px" }}>Project ID</label>
                <div style={{ height: "41px", display: "flex", alignItems: "center", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", background: "#000", padding: "0 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis" }}>{project.id}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "16px" }}>
              <div style={{ padding: "13px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "#000" }}><Row k="Created" v={project.created} top /></div>
              <div style={{ padding: "13px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "#000" }}><Row k="Updated" v={project.updated} top /></div>
              <div style={{ padding: "13px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "#000" }}><Row k={project.projectType === "redaction" ? "Blur targets" : "Compliance"} v={project.projectType === "redaction" ? redactionSummary : project.compliancePack ? PACK_LABEL[project.compliancePack] : "None"} top /></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginTop: "18px" }}>
              <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.42)", lineHeight: 1.55 }}>Deleting a project revokes its API keys and removes policy configuration. Moderation logs are kept for audit history until retention expires.</p>
              <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                <button onClick={saveProjectName} disabled={!nameChanged || savingName || !projectName.trim()} style={{ padding: "9px 13px", borderRadius: "9px", border: "none", background: !nameChanged || savingName || !projectName.trim() ? "rgba(255,255,255,0.35)" : "#fff", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: !nameChanged || savingName || !projectName.trim() ? "not-allowed" : "pointer" }}>{savingName ? "Saving..." : "Save name"}</button>
                <button onClick={() => setConfirmDelete(true)} style={{ padding: "9px 13px", borderRadius: "9px", border: "1px solid rgba(255,155,155,0.28)", background: "rgba(255,90,90,0.08)", color: "#ffb7b7", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          </div>

          {project.projectType === "redaction" && (
            <div style={{ ...card, padding: "24px" }}>
              <div style={sectionLabel}>REDACTION SETTINGS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  ["faceBlur", "Face blur", "Blur detected faces with a padded bounding box."],
                  ["textBlur", "Text blur", "Blur visible words and lines detected in the image."],
                  ["licensePlateBlur", "License plate blur", "Blur detected text that matches a vehicle plate pattern."],
                ].map(([key, title, description]) => {
                  const settingKey = key as keyof Pick<RedactionSettings, "faceBlur" | "textBlur" | "licensePlateBlur">;
                  const enabled = redactionSettings[settingKey];
                  return (
                    <button key={key} onClick={() => updateRedactionSettings({ [settingKey]: !enabled })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", width: "100%", padding: "15px", borderRadius: "12px", border: "1px solid " + (enabled ? "rgba(126,224,168,0.38)" : "rgba(255,255,255,0.08)"), background: enabled ? "rgba(126,224,168,0.08)" : "rgba(255,255,255,0.015)", color: "inherit", fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
                      <span>
                        <span style={{ display: "block", fontSize: "14px", fontWeight: 650 }}>{title}</span>
                        <span style={{ display: "block", marginTop: "3px", fontSize: "12.5px", lineHeight: 1.45, color: "rgba(255,255,255,0.45)" }}>{description}</span>
                      </span>
                      <span style={{ position: "relative", width: "42px", height: "24px", borderRadius: "20px", flexShrink: 0, background: enabled ? "#7ee0a8" : "rgba(255,255,255,0.14)", transition: "background .2s" }}>
                        <span style={{ position: "absolute", top: "3px", left: enabled ? "21px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: enabled ? "#050505" : "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: "20px" }}>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", marginBottom: "10px" }}>Redaction style</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                  {redactionStyleOptions.map((option) => {
                    const selected = redactionSettings.redactionStyle === option.value;
                    return (
                      <button key={option.value} onClick={() => updateRedactionSettings({ redactionStyle: option.value })} style={{ padding: "13px", borderRadius: "11px", border: "1px solid " + (selected ? "rgba(126,224,168,0.38)" : "rgba(255,255,255,0.08)"), background: selected ? "rgba(126,224,168,0.08)" : "rgba(255,255,255,0.015)", color: "inherit", fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
                        <span style={{ display: "block", fontSize: "13px", fontWeight: 650 }}>{option.label}</span>
                        <span style={{ display: "block", marginTop: "3px", fontSize: "11.5px", lineHeight: 1.45, color: "rgba(255,255,255,0.45)" }}>{option.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {redactionSettings.textBlur && (
                <>
                  <div style={{ marginTop: "20px" }}>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", marginBottom: "10px" }}>Text handling</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                      {textCategoryOptions.map((option) => {
                        const selected = redactionSettings.textCategories.includes(option.value);
                        return (
                          <button key={option.value} onClick={() => toggleTextCategory(option.value)} style={{ padding: "12px", borderRadius: "11px", border: "1px solid " + (selected ? "rgba(126,224,168,0.38)" : "rgba(255,255,255,0.08)"), background: selected ? "rgba(126,224,168,0.08)" : "rgba(255,255,255,0.015)", color: "inherit", fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
                            <span style={{ display: "block", fontSize: "12.5px", fontWeight: 650 }}>{option.label}</span>
                            <span style={{ display: "block", marginTop: "3px", fontSize: "11px", lineHeight: 1.4, color: "rgba(255,255,255,0.45)" }}>{option.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ marginTop: "20px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.72)", marginBottom: "8px" }}>Additional words to redact</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", minHeight: "43px", alignItems: "center", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "#000", padding: "7px 9px" }}>
                      {redactionSettings.customWords.map((word) => (
                        <span key={word} style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "5px 8px", borderRadius: "999px", background: "rgba(126,224,168,0.1)", border: "1px solid rgba(126,224,168,0.28)", color: "#bff2d0", fontSize: "12px" }}>
                          {word}
                          <button type="button" onClick={() => removeWord("customWords", word)} aria-label={`Remove ${word}`} style={{ border: "none", background: "transparent", color: "rgba(255,255,255,0.58)", cursor: "pointer", padding: 0, fontSize: "14px", lineHeight: 1 }}>×</button>
                        </span>
                      ))}
                      <input value={customWordInput} onChange={(event) => setCustomWordInput(event.target.value)} onKeyDown={(event) => handleWordKeyDown(event, "customWords", customWordInput, () => setCustomWordInput(""))} onBlur={() => addWords("customWords", customWordInput, () => setCustomWordInput(""))} placeholder={redactionSettings.customWords.length ? "Add another..." : "Type a word and press Enter"} style={{ flex: "1 1 180px", minWidth: 0, background: "transparent", border: "none", color: "#fff", fontFamily: "inherit", fontSize: "13px", outline: "none", padding: "5px 2px" }} />
                    </div>
                    <p style={{ margin: "9px 0 0", fontSize: "11.5px", lineHeight: 1.5, color: "rgba(255,255,255,0.38)", fontWeight: 300 }}>Press Enter or comma to add a word that should always be redacted.</p>
                  </div>
                  <div style={{ marginTop: "20px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.72)", marginBottom: "8px" }}>Do not redact words</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", minHeight: "43px", alignItems: "center", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "#000", padding: "7px 9px" }}>
                      {redactionSettings.ignoredWords.map((word) => (
                        <span key={word} style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "5px 8px", borderRadius: "999px", background: "rgba(174,191,255,0.1)", border: "1px solid rgba(174,191,255,0.28)", color: "#d9e1ff", fontSize: "12px" }}>
                          {word}
                          <button type="button" onClick={() => removeWord("ignoredWords", word)} aria-label={`Remove ${word}`} style={{ border: "none", background: "transparent", color: "rgba(255,255,255,0.58)", cursor: "pointer", padding: 0, fontSize: "14px", lineHeight: 1 }}>×</button>
                        </span>
                      ))}
                      <input value={ignoredWordInput} onChange={(event) => setIgnoredWordInput(event.target.value)} onKeyDown={(event) => handleWordKeyDown(event, "ignoredWords", ignoredWordInput, () => setIgnoredWordInput(""))} onBlur={() => addWords("ignoredWords", ignoredWordInput, () => setIgnoredWordInput(""))} placeholder={redactionSettings.ignoredWords.length ? "Add another..." : "Example: name, nombre"} style={{ flex: "1 1 180px", minWidth: 0, background: "transparent", border: "none", color: "#fff", fontFamily: "inherit", fontSize: "13px", outline: "none", padding: "5px 2px" }} />
                    </div>
                    <p style={{ margin: "9px 0 0", fontSize: "11.5px", lineHeight: 1.5, color: "rgba(255,255,255,0.38)", fontWeight: 300 }}>Use this for labels that should remain visible, like name, nombre, date, or address.</p>
                  </div>
                </>
              )}
              <div style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)" }}>Minimum confidence</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#7ee0a8" }}>{redactionSettings.minConfidence}%</span>
                </div>
                <input type="range" min={40} max={99} value={redactionSettings.minConfidence} onChange={(event) => updateRedactionSettings({ minConfidence: Number(event.target.value) })} style={{ width: "100%" }} />
                <p style={{ margin: "12px 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Lower values catch more regions. Higher values reduce false positives.</p>
              </div>
            </div>
          )}

          <ProjectWebhooksSection
            webhooks={webhooks}
            webhookSecret={webhookSecret}
            loading={loadingWebhooks}
            onCreateWebhook={onCreateWebhook}
            onDisableWebhook={onDisableWebhook}
            onRotateWebhookSecret={onRotateWebhookSecret}
            onDismissWebhookSecret={onDismissWebhookSecret}
          />

          {project.projectType === "moderation" && (
          <>
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
                  <div key={c} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "#000" }}>
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
          </>
          )}
        </div>

        <div style={{ position: "sticky", top: "30px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {project.projectType === "redaction" ? (
          <div style={{ ...card, borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#7ee0a8", boxShadow: "0 0 8px 1px rgba(126,224,168,0.8)" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)" }}>REDACTION OUTPUT</span>
            </div>
            <div style={{ padding: "22px" }}>
              <div style={{ position: "relative", height: "150px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(135deg, rgba(126,224,168,0.08), rgba(255,255,255,0.02))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <span style={{ position: "absolute", width: "62px", height: "30px", left: "32%", top: "32%", borderRadius: redactionSettings.redactionStyle === "black_box" ? "2px" : "999px", background: redactionSettings.redactionStyle === "black_box" ? "#000" : "rgba(126,224,168,0.28)", filter: redactionSettings.faceBlur && redactionSettings.redactionStyle === "blur" ? "blur(9px)" : "none", border: "1px solid rgba(126,224,168,0.35)" }} />
                <span style={{ position: "absolute", width: "86px", height: "18px", right: "16%", bottom: "28%", borderRadius: redactionSettings.redactionStyle === "black_box" ? "2px" : "5px", background: redactionSettings.redactionStyle === "black_box" ? "#000" : "rgba(255,255,255,0.2)", filter: (redactionSettings.textBlur || redactionSettings.licensePlateBlur || redactionSettings.textCategories.length > 0 || redactionSettings.customWords.length > 0) && redactionSettings.redactionStyle === "blur" ? "blur(7px)" : "none" }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>processed-image.jpg</span>
              </div>
              {[
                ["Endpoint", "POST /redact"],
                ["Blur targets", redactionSummary],
                ["Style", redactionSettings.redactionStyle === "black_box" ? "Black box" : "Blur"],
                ["Min confidence", `${redactionSettings.minConfidence}%`],
                ["Response", "redactedImageUrl"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "14px", padding: "11px 0", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "13px" }}>
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                  <span style={{ color: label === "Endpoint" ? "#7ee0a8" : "rgba(255,255,255,0.78)", fontFamily: label === "Endpoint" || label === "Response" ? "'JetBrains Mono', monospace" : "inherit", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          ) : (
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
                <div style={{ flex: 1, padding: "16px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "10px" }}>Decision</div>
                  <span style={{ ...pill(preview.action), fontSize: "14px", padding: "5px 14px" }}>{cap(preview.action)}</span>
                </div>
                <div style={{ flex: 1, padding: "16px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginBottom: "6px" }}>Risk score</div>
                  <div style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.03em", color: riskColor(preview.risk) }}>{fmtRisk(preview.risk)}</div>
                </div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", marginBottom: "12px" }}>DETECTED LABELS</div>
              <LabelBars scored={preview.scored} />
            </div>
          </div>
          )}

          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)" }}>ACTIVITY TIMELINE</span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.34)" }}>{projectLogs.length} recent</span>
            </div>
            {projectLogs.length === 0 ? (
              <div style={{ padding: "26px 22px" }}>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>No {project.projectType === "redaction" ? "redaction" : "moderation"} activity yet</div>
                <p style={{ margin: "8px 0 0", fontSize: "12.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.42)", fontWeight: 300 }}>Run an image through the {project.projectType === "redaction" ? "redaction API" : "playground or API"} and this project timeline will update automatically.</p>
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
