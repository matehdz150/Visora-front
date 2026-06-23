"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CATEGORIES, CATEGORY_LABEL, COMPLIANCE_PACKS, MODE_ACTIONS, MODE_PRESET, PACK_LABEL } from "../constants";
import { ConfirmDialog } from "../ConfirmDialog";
import { ProjectWebhooksSection } from "./ProjectWebhooksSection";
import { Breadcrumbs, Row } from "../shared";
import { cap, card, sectionLabel } from "../styles";
import type { Action, CompliancePack, ModLog, Mode, Policy, Project, RedactionSettings, RedactionTextCategory, VerifySettings, WebhookEndpoint, WebhookEventType } from "../types";
import type { PolicyPatch } from "../usePolicyStore";

const redactionStyleOptions = [
  { value: "blur", label: "Blur", description: "Softly obscure detected regions." },
  { value: "black_box", label: "Black box", description: "Cover detected regions with a solid rectangle." },
] as const;

const textCategoryOptions: Array<{ value: RedactionTextCategory; label: string; description: string }> = [
  { value: "id_document", label: "Identity documents", description: "Passport, license, national ID — blur sensitive fields, not the whole document." },
  { value: "pii", label: "PII text", description: "Emails, phone numbers, addresses, IDs, and tax numbers (RFC, CURP, SSN)." },
  { value: "dates", label: "Dates", description: "Dates in any format — DOB, issue, and expiry (01/02/2024, 2024-01-02, Jan 5 2024)." },
  { value: "financial", label: "Financial data", description: "Card numbers (Luhn-checked), bank accounts, IBAN, and CLABE." },
  { value: "credentials", label: "Credentials", description: "Passwords, API keys, tokens, and secrets." },
  { value: "medical", label: "Legal / medical", description: "Patient IDs, record numbers, and case numbers near their labels." },
  { value: "sexual", label: "Sexual text", description: "Adult and explicit wording." },
  { value: "profanity", label: "Profanity", description: "Offensive or vulgar words." },
];

const MODE_DESC: Record<Mode, { tag: string; description: string }> = {
  strict: {
    tag: "Toughest",
    description: "Rejects most unsafe content outright and reviews the rest. Uses the lowest confidence bar, so even borderline images get caught.",
  },
  balanced: {
    tag: "Recommended",
    description: "Rejects clear violations, sends ambiguous content to human review, and allows low-risk categories. A safe default for most apps.",
  },
  relaxed: {
    tag: "Permissive",
    description: "Only the worst content (nudity, hate symbols) is rejected. Most categories are allowed, and a few are sent to review.",
  },
};

const ACTION_LABEL: Record<Action, string> = { allow: "Allow", review: "Review", reject: "Reject" };
const ACTION_COLOR: Record<Action, string> = { allow: "#7ee0a8", review: "#e8c98a", reject: "#ff9b9b" };

const PACK_DESC: Record<CompliancePack | "none", string> = {
  none: "No extra rules. Only your moderation mode and category actions apply.",
  marketplace: "For buy/sell listings and product photos. Tightens weapons, drugs, and counterfeit or adult items so unsafe listings never go live.",
  kids: "Child-directed apps (under-13 audiences). Zero tolerance — rejects any nudity, suggestive, violence, or substance content.",
  education: "Classrooms and e-learning. Allows educational context (art, history, biology) while blocking explicit or graphic material.",
  social: "Social feeds and profiles. Balances free expression with safety — borderline posts go to review instead of an instant block.",
  dating: "Dating profiles. Permits mild suggestive content within limits but rejects explicit nudity and harassment.",
  ads: "Ad creatives and sponsored content. Brand-safety first — rejects anything advertisers commonly block (nudity, violence, drugs, weapons).",
};

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
  onSaveVerifySettings,
  savingVerifySettings,
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
  onSaveVerifySettings: (settings: VerifySettings) => void;
  savingVerifySettings?: boolean;
  onCreateApiKey: () => void;
  onRenameProject: (name: string) => Promise<void>;
  onDeleteProject: () => Promise<void>;
  onCreateWebhook: (input: { name?: string; url: string; events: WebhookEventType[] }) => Promise<void>;
  onDisableWebhook: (webhookId: string) => Promise<void>;
  onRotateWebhookSecret: (webhookId: string) => Promise<void>;
  onDismissWebhookSecret: () => void;
  onSelectMod: (mod: ModLog) => void;
}) {
  const [projectName, setProjectName] = useState(project.name);
  const [redactionSettings, setRedactionSettings] = useState<RedactionSettings>(project.redactionSettings);
  const [verifySettings, setVerifySettings] = useState<VerifySettings>(project.verifySettings);
  const [customWordInput, setCustomWordInput] = useState("");
  const [ignoredWordInput, setIgnoredWordInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeSection, setActiveSection] = useState("settings");
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
  const verifyChanged =
    verifySettings.faceMatchThreshold !== project.verifySettings.faceMatchThreshold ||
    verifySettings.faceMatchRejectBelow !== project.verifySettings.faceMatchRejectBelow ||
    verifySettings.requireUnexpiredDocument !== project.verifySettings.requireUnexpiredDocument;
  const updateVerify = (patch: Partial<VerifySettings>) =>
    setVerifySettings((prev) => {
      const next = { ...prev, ...patch };
      // Keep the reject cutoff at or below the auto-approve threshold.
      if (next.faceMatchRejectBelow > next.faceMatchThreshold) {
        if ("faceMatchThreshold" in patch) next.faceMatchRejectBelow = next.faceMatchThreshold;
        else next.faceMatchThreshold = next.faceMatchRejectBelow;
      }
      return next;
    });

  useEffect(() => {
    setProjectName(project.name);
    setRedactionSettings(project.redactionSettings);
    setVerifySettings(project.verifySettings);
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
    redactionSettings.textBlur && redactionSettings.textCategories.length > 0 ? `${redactionSettings.textCategories.length} categories` : null,
    redactionSettings.textBlur && redactionSettings.customWords.length > 0 ? "Custom words" : null,
    redactionSettings.textBlur && redactionSettings.ignoredWords.length > 0 ? "Ignored words" : null,
  ].filter(Boolean).join(", ") || "No blur targets enabled";

  const sectionNav: { key: string; label: string }[] =
    project.projectType === "verify"
      ? [
          { key: "settings", label: "Project settings" },
          { key: "verify", label: "Verify settings" },
          { key: "webhooks", label: "Webhooks" },
        ]
      : project.projectType === "redaction"
      ? [
          { key: "settings", label: "Project settings" },
          { key: "redaction", label: "Redaction settings" },
          { key: "webhooks", label: "Webhooks" },
        ]
      : [
          { key: "settings", label: "Project settings" },
          { key: "webhooks", label: "Webhooks" },
          { key: "mode", label: "Moderation mode" },
          { key: "compliance", label: "Compliance pack" },
          { key: "review", label: "Human review" },
          { key: "confidence", label: "Minimum confidence" },
          { key: "blocked", label: "Blocked categories" },
          { key: "risk", label: "Risk thresholds" },
        ];

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
      <Breadcrumbs items={[{ label: "Projects", onClick: onBack }, { label: project.name }]} />

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
          <p style={{ margin: "10px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{project.projectType === "redaction" ? "Configure blur targets, credentials, webhooks, and activity." : project.projectType === "verify" ? "Manage identity checks, credentials, webhooks, and activity." : "Configure project settings, moderation policy, credentials, and activity."}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={onCreateApiKey} style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.75)", background: "#000", padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontFamily: "inherit" }}>Create API Key</button>
          {project.projectType === "redaction" ? (
            <button onClick={() => onSaveRedactionSettings(redactionSettings)} disabled={savingRedactionSettings || !redactionChanged} className="v-cta" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: savingRedactionSettings || !redactionChanged ? "rgba(255,255,255,0.65)" : "#fff", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: savingRedactionSettings ? "wait" : redactionChanged ? "pointer" : "not-allowed", fontFamily: "inherit" }}>{savingRedactionSettings ? "Saving..." : "Save settings"}</button>
          ) : project.projectType === "verify" ? (
            <button onClick={() => onSaveVerifySettings(verifySettings)} disabled={savingVerifySettings || !verifyChanged} className="v-cta" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: savingVerifySettings || !verifyChanged ? "rgba(255,255,255,0.65)" : "#fff", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: savingVerifySettings ? "wait" : verifyChanged ? "pointer" : "not-allowed", fontFamily: "inherit" }}>{savingVerifySettings ? "Saving..." : "Save settings"}</button>
          ) : (
            <button onClick={onSavePolicy} disabled={savingPolicy} className="v-cta" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: savingPolicy ? "rgba(255,255,255,0.65)" : "#fff", padding: "10px 18px", borderRadius: "10px", border: "none", cursor: savingPolicy ? "wait" : "pointer", fontFamily: "inherit" }}>{savingPolicy ? "Saving..." : "Save policy"}</button>
          )}
        </div>
      </div>

      <div className="r-stack" style={{ display: "grid", gridTemplateColumns: "232px 1fr", gap: "28px", marginTop: "32px", alignItems: "start" }}>
        <nav style={{ position: "sticky", top: "30px", display: "flex", flexDirection: "column", gap: "1px" }}>
          {sectionNav.map((item) => {
            const on = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 13px",
                  borderRadius: "9px",
                  border: "none",
                  background: on ? "rgba(255,255,255,0.06)" : "transparent",
                  color: on ? "#fff" : "rgba(255,255,255,0.5)",
                  fontFamily: "inherit",
                  fontSize: "13.5px",
                  fontWeight: on ? 600 : 400,
                  cursor: "pointer",
                  transition: "background .15s, color .15s",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {activeSection === "settings" && (
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
              <div style={{ padding: "13px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", background: "#000" }}><Row k={project.projectType === "redaction" ? "Blur targets" : project.projectType === "verify" ? "Type" : "Compliance"} v={project.projectType === "redaction" ? redactionSummary : project.projectType === "verify" ? "Verify" : project.compliancePack ? PACK_LABEL[project.compliancePack] : "None"} top /></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginTop: "18px" }}>
              <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.42)", lineHeight: 1.55 }}>Deleting a project revokes its API keys and removes policy configuration. Moderation logs are kept for audit history until retention expires.</p>
              <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                <button onClick={saveProjectName} disabled={!nameChanged || savingName || !projectName.trim()} style={{ padding: "9px 13px", borderRadius: "9px", border: "none", background: !nameChanged || savingName || !projectName.trim() ? "rgba(255,255,255,0.35)" : "#fff", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: !nameChanged || savingName || !projectName.trim() ? "not-allowed" : "pointer" }}>{savingName ? "Saving..." : "Save name"}</button>
                <button onClick={() => setConfirmDelete(true)} style={{ padding: "9px 13px", borderRadius: "9px", border: "1px solid rgba(255,155,155,0.28)", background: "rgba(255,90,90,0.08)", color: "#ffb7b7", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          </div>
          )}

          {project.projectType === "verify" && activeSection === "verify" && (
            <div style={{ ...card, padding: "24px" }}>
              <div style={sectionLabel}>VERIFY SETTINGS</div>
              <p style={{ margin: "0 0 18px", fontSize: "12.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>Every call to <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>/verify</span> runs these three checks and returns a single decision: <span style={{ color: "#7ee0a8" }}>verified</span>, <span style={{ color: "#e8c98a" }}>review</span> or <span style={{ color: "#ff9b9b" }}>rejected</span>.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  ["Document authenticity", "Reads the ID with OCR (Textract) and verifies it is a real, unexpired document."],
                  ["Face match", "Compares the selfie against the document portrait."],
                  ["Selfie quality", "Anti-spoof checks: a single, clear, well-lit face."],
                ].map(([title, desc]) => (
                  <div key={title} style={{ padding: "14px 15px", borderRadius: "11px", border: "1px solid rgba(255,255,255,0.07)", background: "#000" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{title}</div>
                    <div style={{ marginTop: "3px", fontSize: "12.5px", lineHeight: 1.45, color: "rgba(255,255,255,0.45)" }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>Auto-approve at</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#7ee0a8" }}>{verifySettings.faceMatchThreshold}%</span>
                </div>
                <input type="range" min={50} max={99} value={verifySettings.faceMatchThreshold} onChange={(e) => updateVerify({ faceMatchThreshold: +e.target.value })} style={{ width: "100%" }} />
                <p style={{ margin: "8px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Face match at or above this is <span style={{ color: "#7ee0a8" }}>verified</span> automatically (if the document and selfie checks pass).</p>
              </div>

              <div style={{ marginTop: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>Reject below</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#ff9b9b" }}>{verifySettings.faceMatchRejectBelow}%</span>
                </div>
                <input type="range" min={0} max={99} value={verifySettings.faceMatchRejectBelow} onChange={(e) => updateVerify({ faceMatchRejectBelow: +e.target.value })} style={{ width: "100%" }} />
                <p style={{ margin: "8px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Face match below this is <span style={{ color: "#ff9b9b" }}>rejected</span>. Between the two cutoffs, the result is sent to <span style={{ color: "#e8c98a" }}>review</span>.</p>
              </div>

              <button onClick={() => updateVerify({ requireUnexpiredDocument: !verifySettings.requireUnexpiredDocument })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", width: "100%", marginTop: "22px", padding: "15px", borderRadius: "12px", border: "1px solid " + (verifySettings.requireUnexpiredDocument ? "rgba(126,224,168,0.38)" : "rgba(255,255,255,0.08)"), background: verifySettings.requireUnexpiredDocument ? "rgba(126,224,168,0.08)" : "rgba(255,255,255,0.015)", color: "inherit", fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
                <span>
                  <span style={{ display: "block", fontSize: "14px", fontWeight: 650 }}>Require an unexpired document</span>
                  <span style={{ display: "block", marginTop: "3px", fontSize: "12.5px", lineHeight: 1.45, color: "rgba(255,255,255,0.45)" }}>Reject the verification if the document&apos;s expiration date has passed.</span>
                </span>
                <span style={{ position: "relative", width: "42px", height: "24px", borderRadius: "20px", flexShrink: 0, background: verifySettings.requireUnexpiredDocument ? "#7ee0a8" : "rgba(255,255,255,0.14)", transition: "background .2s" }}>
                  <span style={{ position: "absolute", top: "3px", left: verifySettings.requireUnexpiredDocument ? "21px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: verifySettings.requireUnexpiredDocument ? "#050505" : "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
                </span>
              </button>
            </div>
          )}

          {project.projectType === "redaction" && activeSection === "redaction" && (
            <div style={{ ...card, padding: "24px" }}>
              <div style={sectionLabel}>REDACTION SETTINGS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  ["faceBlur", "Face blur", "Blur detected faces with a padded bounding box."],
                  ["textBlur", "Text blur", "Redact text in the image. Leave categories empty to blur all text, or pick categories below to redact only specific data."],
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
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", marginBottom: "4px" }}>Detection categories</div>
                    <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.4)", marginBottom: "10px", lineHeight: 1.45 }}>Leave empty to blur all text, or pick categories to redact only those data types.</div>
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

          {activeSection === "webhooks" && (
          <ProjectWebhooksSection
            webhooks={webhooks}
            webhookSecret={webhookSecret}
            loading={loadingWebhooks}
            projectType={project.projectType}
            onCreateWebhook={onCreateWebhook}
            onDisableWebhook={onDisableWebhook}
            onRotateWebhookSecret={onRotateWebhookSecret}
            onDismissWebhookSecret={onDismissWebhookSecret}
          />
          )}

          {project.projectType === "moderation" && activeSection === "mode" && (
          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>MODERATION MODE</div>
            <p style={{ margin: "0 0 16px", fontSize: "12.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>A preset that sets a default action for every category. Pick one as your starting point — you can still fine-tune each category below.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
              {(["strict", "balanced", "relaxed"] as Mode[]).map((m) => {
                const on = policy.mode === m;
                return (
                  <button key={m} onClick={() => update(() => ({ mode: m, ...MODE_PRESET[m], categoryActions: { ...MODE_ACTIONS[m] } }))} style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start", padding: "14px", borderRadius: "11px", cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: on ? "rgba(126,155,255,0.1)" : "rgba(255,255,255,0.02)", border: "1px solid " + (on ? "rgba(126,155,255,0.4)" : "rgba(255,255,255,0.08)"), color: on ? "#fff" : "rgba(255,255,255,0.7)" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>{cap(m)}</span>
                    <span style={{ fontSize: "11.5px", opacity: 0.7, fontWeight: 300 }}>{MODE_DESC[m].tag}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: "16px", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "#000" }}>
              <p style={{ margin: "0 0 14px", fontSize: "13px", lineHeight: 1.55, color: "rgba(255,255,255,0.7)", fontWeight: 300 }}>{MODE_DESC[policy.mode].description}</p>
              {(["reject", "review", "allow"] as Action[]).map((act) => {
                const cats = CATEGORIES.filter((c) => MODE_ACTIONS[policy.mode][c] === act);
                if (cats.length === 0) return null;
                return (
                  <div key={act} style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "8px" }}>
                    <span style={{ flexShrink: 0, width: "52px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: ACTION_COLOR[act] }}>{ACTION_LABEL[act]}</span>
                    <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.62)" }}>{cats.map((c) => CATEGORY_LABEL[c]).join(", ")}</span>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {project.projectType === "moderation" && activeSection === "compliance" && (
          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>COMPLIANCE PACK</div>
            <p style={{ margin: "0 0 16px", fontSize: "12.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>A curated, industry-specific rule set layered on top of your mode. Pick the one that matches your audience.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {(["none", ...COMPLIANCE_PACKS] as (CompliancePack | "none")[]).map((pk) => {
                const on = (policy.compliancePack ?? "none") === pk;
                return (
                  <button key={pk} onClick={() => update(() => ({ compliancePack: pk }))} style={{ padding: "7px 13px", borderRadius: "9px", cursor: "pointer", fontFamily: "inherit", fontSize: "12.5px", fontWeight: on ? 500 : 400, background: on ? "rgba(126,155,255,0.12)" : "rgba(255,255,255,0.02)", border: "1px solid " + (on ? "rgba(126,155,255,0.4)" : "rgba(255,255,255,0.08)"), color: on ? "#fff" : "rgba(255,255,255,0.6)" }}>{pk === "none" ? "None" : PACK_LABEL[pk]}</button>
                );
              })}
            </div>
            <div style={{ marginTop: "16px", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "#000" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>{(policy.compliancePack ?? "none") === "none" ? "No pack" : PACK_LABEL[policy.compliancePack as CompliancePack]}</div>
              <p style={{ margin: 0, fontSize: "12.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.62)", fontWeight: 300 }}>{PACK_DESC[policy.compliancePack ?? "none"]}</p>
            </div>
            <p style={{ margin: "12px 0 0", fontSize: "11.5px", color: "rgba(255,255,255,0.36)", fontWeight: 300 }}>The applied pack is returned as <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>compliance</span> in the /moderate response.</p>
          </div>
          )}

          {project.projectType === "moderation" && activeSection === "review" && (
          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>HUMAN REVIEW</div>
            <p style={{ margin: "0 0 16px", fontSize: "12.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>Decides what happens when a rule lands on the <span style={{ color: "#e8c98a" }}>review</span> action — keep it for a human to decide, or resolve it automatically.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {(["enabled", "disabled"] as const).map((mode) => {
                const on = policy.reviewMode === mode;
                return (
                  <button key={mode} onClick={() => update(() => ({ reviewMode: mode }))} style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "flex-start", padding: "15px", borderRadius: "11px", cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: on ? "rgba(126,155,255,0.1)" : "rgba(255,255,255,0.02)", border: "1px solid " + (on ? "rgba(126,155,255,0.4)" : "rgba(255,255,255,0.08)"), color: on ? "#fff" : "rgba(255,255,255,0.7)" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>{mode === "enabled" ? "Review queue" : "Binary decisions"}</span>
                    <span style={{ fontSize: "12px", lineHeight: 1.5, opacity: 0.75, fontWeight: 300 }}>{mode === "enabled" ? "The API returns action: \"review\" and the image lands in your Reviews dashboard for a person to decide." : "The API never returns review — each one is auto-resolved to the fallback below, so your app only sees allow or reject."}</span>
                  </button>
                );
              })}
            </div>

            {policy.reviewMode === "disabled" && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "10px" }}>Resolve every review to</div>
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

            <p style={{ margin: "14px 0 0", fontSize: "12.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>{policy.reviewMode === "enabled" ? "Pick this if you have moderators. Flagged images wait in the queue until someone approves or rejects them." : `Pick this for a fully automated pipeline. Anything uncertain is treated as ${policy.reviewFallbackAction}.`}</p>
          </div>
          )}

          {project.projectType === "moderation" && activeSection === "confidence" && (
          <div style={{ ...card, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ ...sectionLabel, marginBottom: 0 }}>MINIMUM CONFIDENCE</div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#aebfff" }}>{policy.minConfidence}%</span>
            </div>
            <input type="range" min={0} max={100} value={policy.minConfidence} onChange={(e) => update(() => ({ minConfidence: +e.target.value }))} style={{ width: "100%" }} />
            <p style={{ margin: "12px 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Labels below this confidence are ignored when scoring.</p>
          </div>
          )}

          {project.projectType === "moderation" && activeSection === "blocked" && (
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
          )}

          {project.projectType === "moderation" && activeSection === "risk" && (
          <div style={{ ...card, padding: "24px" }}>
            <div style={sectionLabel}>RISK THRESHOLDS</div>
            <p style={{ margin: "0 0 20px", fontSize: "12.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>Every image gets a <span style={{ color: "#fff" }}>risk score from 0 to 100</span> based on what was detected. These two cutoffs turn that score into a decision.</p>

            <div style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>Review threshold</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#e8c98a" }}>{policy.reviewThreshold}</span>
              </div>
              <input type="range" min={0} max={100} value={policy.reviewThreshold} onChange={(e) => update(() => ({ reviewThreshold: +e.target.value }))} style={{ width: "100%" }} />
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Risk at or above <span style={{ color: "#e8c98a" }}>{policy.reviewThreshold}</span> is flagged for review.</p>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>Reject threshold</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#ff9b9b" }}>{policy.rejectThreshold}</span>
              </div>
              <input type="range" min={0} max={100} value={policy.rejectThreshold} onChange={(e) => update(() => ({ rejectThreshold: +e.target.value }))} style={{ width: "100%" }} />
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Risk at or above <span style={{ color: "#ff9b9b" }}>{policy.rejectThreshold}</span> is rejected.</p>
            </div>

            {(() => {
              const rev = Math.min(policy.reviewThreshold, policy.rejectThreshold);
              const rej = Math.max(policy.reviewThreshold, policy.rejectThreshold);
              const zones = [
                { label: "Allow", color: "#7ee0a8", width: rev },
                { label: "Review", color: "#e8c98a", width: rej - rev },
                { label: "Reject", color: "#ff9b9b", width: 100 - rej },
              ];
              return (
                <div style={{ marginTop: "22px", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", background: "#000" }}>
                  <div style={{ display: "flex", height: "10px", borderRadius: "999px", overflow: "hidden" }}>
                    {zones.map((z) => (
                      <div key={z.label} style={{ width: `${z.width}%`, background: z.color, opacity: 0.55 }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                    {zones.map((z) => (
                      <span key={z.label} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(255,255,255,0.62)" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: z.color }} />
                        {z.label}
                      </span>
                    ))}
                  </div>
                  <p style={{ margin: "14px 0 0", fontSize: "12px", lineHeight: 1.55, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>Score 0–{rev} → allow · {rev}–{rej} → review · {rej}–100 → reject.</p>
                </div>
              );
            })()}
          </div>
          )}
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
