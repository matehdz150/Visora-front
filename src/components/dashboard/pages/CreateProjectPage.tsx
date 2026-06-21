import React, { useMemo, useState } from "react";
import { MODE_PRESET } from "../constants";
import { cap, card } from "../styles";
import type { Mode } from "../types";
import type { DashboardNotify } from "../Toast";

type Region = "us-east-1" | "eu-west-1" | "ap-southeast-1";

export interface CreateProjectInput {
  name: string;
  mode: Mode;
  region: Region;
  generateApiKey: boolean;
  sandbox: boolean;
}

export interface CreateProjectResult {
  projectId: string;
  name: string;
  rawApiKey?: string;
}

const modeOptions: Array<{ mode: Mode; description: string }> = [
  { mode: "strict", description: "Flags borderline content. Best for brand-safe surfaces." },
  { mode: "balanced", description: "Catches clear violations while letting safe content through." },
  { mode: "relaxed", description: "Blocks only high-confidence violations." },
];

const regionOptions: Array<{ region: Region; label: string; enabled: boolean }> = [
  { region: "us-east-1", label: "N. Virginia", enabled: true },
  { region: "eu-west-1", label: "Ireland", enabled: false },
  { region: "ap-southeast-1", label: "Singapore", enabled: false },
];

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 18);

  return `proj_${base || "untitled"}`;
}

function modeTone(mode: Mode) {
  if (mode === "strict") return { color: "#c4b5ff", bg: "rgba(196,181,255,0.1)", border: "rgba(196,181,255,0.28)" };
  if (mode === "relaxed") return { color: "#7ee0a8", bg: "rgba(126,224,168,0.1)", border: "rgba(126,224,168,0.25)" };
  return { color: "#aebfff", bg: "rgba(126,155,255,0.1)", border: "rgba(126,155,255,0.3)" };
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      style={{ position: "relative", width: "42px", height: "24px", borderRadius: "20px", border: "none", cursor: "pointer", flexShrink: 0, background: checked ? "#aebfff" : "rgba(255,255,255,0.14)", transition: "background .2s" }}
    >
      <span style={{ position: "absolute", top: "3px", left: checked ? "21px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: checked ? "#050505" : "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
    </button>
  );
}

export function CreateProjectPage({
  onCancel,
  onCreateProject,
  notify,
}: {
  onCancel: () => void;
  onCreateProject: (input: CreateProjectInput) => Promise<CreateProjectResult>;
  notify: DashboardNotify;
}) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("balanced");
  const [region, setRegion] = useState<Region>("us-east-1");
  const [generateApiKey, setGenerateApiKey] = useState(true);
  const [sandbox, setSandbox] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreateProjectResult | null>(null);

  const trimmedName = name.trim();
  const displayName = trimmedName || "Untitled project";
  const previewProjectId = useMemo(() => slugify(name), [name]);
  const selectedRegion = regionOptions.find((item) => item.region === region) ?? regionOptions[0];
  const selectedTone = modeTone(mode);
  const canCreate = trimmedName.length > 0 && !creating;

  const submit = async () => {
    if (!canCreate) return;

    setCreating(true);
    setError(null);
    try {
      const result = await onCreateProject({ name: trimmedName, mode, region, generateApiKey, sandbox });
      setCreated(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create project";
      setError(message);
      notify({ kind: "error", title: "Could not create project", message });
    } finally {
      setCreating(false);
    }
  };

  const copyKey = async () => {
    if (!created?.rawApiKey) return;
    await navigator.clipboard.writeText(created.rawApiKey);
    setCopied(true);
    notify({ kind: "success", title: "API key copied", message: "Store it somewhere safe. It will not be shown again." });
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <button onClick={onCancel} style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "26px", background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontFamily: "inherit", fontSize: "14px", cursor: "pointer" }}>← Projects</button>

      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 600, letterSpacing: "-0.03em" }}>Create project</h1>
        <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Create an isolated moderation environment with its own policy and API key.</p>
      </div>

      <div className="r-stack" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: "28px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ ...card, padding: "24px" }}>
            <label htmlFor="project-name" style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Project name</label>
            <input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Marketplace moderation"
              autoFocus
              style={{ width: "100%", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "11px", padding: "12px 14px", color: "#fff", fontFamily: "inherit", fontSize: "14px", outline: "none" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>Project ID preview</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#aebfff", background: "rgba(126,155,255,0.08)", border: "1px solid rgba(126,155,255,0.2)", padding: "4px 10px", borderRadius: "7px" }}>{previewProjectId}</span>
            </div>
          </div>

          <div style={{ ...card, padding: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Moderation mode</label>
            <p style={{ margin: "0 0 16px", fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>Sets default thresholds and blocked categories. You can fine-tune this later in Policies.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {modeOptions.map((option) => {
                const selected = option.mode === mode;
                const tone = modeTone(option.mode);
                return (
                  <button
                    key={option.mode}
                    type="button"
                    onClick={() => setMode(option.mode)}
                    style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", padding: "15px 16px", borderRadius: "12px", cursor: "pointer", fontFamily: "inherit", background: selected ? "rgba(126,155,255,0.08)" : "rgba(255,255,255,0.015)", border: `1px solid ${selected ? "rgba(126,155,255,0.4)" : "rgba(255,255,255,0.08)"}`, transition: "all .15s" }}
                  >
                    <span style={{ flexShrink: 0, width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${selected ? "#aebfff" : "rgba(255,255,255,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{selected && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#aebfff", boxShadow: "0 0 8px 1px rgba(126,155,255,0.7)" }} />}</span>
                    <span style={{ flex: 1, textAlign: "left" }}>
                      <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#fff" }}>{cap(option.mode)}</span>
                      <span style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.5)", fontWeight: 300, marginTop: "2px" }}>{option.description}</span>
                    </span>
                    <span style={{ flexShrink: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: tone.color, background: tone.bg, border: `1px solid ${tone.border}`, padding: "3px 9px", borderRadius: "20px" }}>min {MODE_PRESET[option.mode].minConfidence}%</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ ...card, padding: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Storage region</label>
            <p style={{ margin: "0 0 14px", fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>Uploads are stored in the configured Visora project storage.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
              {regionOptions.map((option) => {
                const selected = option.region === region;
                return (
                  <button
                    key={option.region}
                    type="button"
                    disabled={!option.enabled}
                    onClick={() => setRegion(option.region)}
                    style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-start", padding: "13px 14px", borderRadius: "11px", cursor: option.enabled ? "pointer" : "not-allowed", fontFamily: "inherit", textAlign: "left", background: selected ? "rgba(126,155,255,0.08)" : "rgba(255,255,255,0.015)", border: `1px solid ${selected ? "rgba(126,155,255,0.4)" : "rgba(255,255,255,0.08)"}`, color: selected ? "#fff" : "rgba(255,255,255,0.7)", opacity: option.enabled ? 1 : 0.42, transition: "all .15s" }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 500 }}>{option.region}</span>
                    <span style={{ fontSize: "11.5px", opacity: 0.65, fontWeight: 300 }}>{option.enabled ? option.label : `${option.label} · Future`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ ...card, padding: "8px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ paddingRight: "20px" }}>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>Generate API key</div>
                <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)", fontWeight: 300, marginTop: "3px" }}>Create a production key when the project is created.</div>
              </div>
              <Toggle checked={generateApiKey} onChange={() => setGenerateApiKey((value) => !value)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
              <div style={{ paddingRight: "20px" }}>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>Start in sandbox mode</div>
                <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)", fontWeight: 300, marginTop: "3px" }}>Local setup preference for now; billing is not enabled yet.</div>
              </div>
              <Toggle checked={sandbox} onChange={() => setSandbox((value) => !value)} />
            </div>
          </div>
        </div>

        <div style={{ position: "sticky", top: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ ...card, borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "9px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#aebfff", boxShadow: "0 0 8px 1px rgba(126,155,255,0.8)" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)" }}>PROJECT SUMMARY</span>
            </div>
            <div style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "13px", marginBottom: "18px" }}>
                <span style={{ width: "42px", height: "42px", borderRadius: "11px", background: "linear-gradient(140deg,#23252c,#101116)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>{displayName[0]?.toUpperCase() ?? "U"}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{previewProjectId}</div>
                </div>
              </div>
              {[
                ["Moderation mode", cap(mode), selectedTone.color],
                ["Storage region", selectedRegion.region, "rgba(255,255,255,0.85)"],
                ["API key", generateApiKey ? "Auto-generated" : "Manual", "rgba(255,255,255,0.85)"],
                ["Environment", sandbox ? "Sandbox" : "Live", sandbox ? "#e8c98a" : "#7ee0a8"],
              ].map(([label, value, color]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "13px" }}>
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                  <span style={{ color, fontWeight: label === "Moderation mode" || label === "Environment" ? 500 : 400, fontFamily: label === "Storage region" ? "'JetBrains Mono', monospace" : "inherit", fontSize: label === "Storage region" ? "12px" : "13px" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {error && <div style={{ border: "1px solid rgba(255,90,90,0.22)", background: "rgba(255,90,90,0.08)", color: "#ffb7b7", borderRadius: "11px", padding: "11px 13px", fontSize: "13px" }}>{error}</div>}

          <button onClick={submit} disabled={!canCreate} style={{ width: "100%", padding: "13px", borderRadius: "11px", border: "none", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, cursor: canCreate ? "pointer" : "not-allowed", background: canCreate ? "#fff" : "rgba(255,255,255,0.1)", color: canCreate ? "#050505" : "rgba(255,255,255,0.4)", transition: "background .2s, transform .15s" }}>{creating ? "Creating..." : trimmedName ? "Create project" : "Enter a project name"}</button>
          <button onClick={onCancel} disabled={creating} style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "11px", color: "rgba(255,255,255,0.7)", fontFamily: "inherit", fontSize: "14px", fontWeight: 500, cursor: creating ? "not-allowed" : "pointer" }}>Cancel</button>

          <p style={{ margin: "4px 4px 0", fontSize: "11.5px", lineHeight: 1.6, color: "rgba(255,255,255,0.3)", fontWeight: 300, textAlign: "center" }}>{generateApiKey ? "The generated API key is shown once after creation." : "You can create an API key later from the API Keys page."}</p>
        </div>
      </div>

      {created && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(5,5,5,0.7)", backdropFilter: "blur(6px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ width: "100%", maxWidth: "440px", background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "18px", padding: "30px", textAlign: "center", boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }}>
            <div style={{ width: "56px", height: "56px", margin: "0 auto 20px", borderRadius: "50%", background: "rgba(126,224,168,0.12)", border: "1px solid rgba(126,224,168,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "#7ee0a8" }}>✓</div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600, letterSpacing: "-0.02em" }}>Project created</h2>
            <p style={{ margin: "10px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{created.name} is ready{created.rawApiKey ? ". Copy this API key now; it will not be shown again." : ". You can create an API key from the API Keys page."}</p>
            {created.rawApiKey && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "22px 0", padding: "12px 14px", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "11px" }}>
                <span style={{ flex: 1, textAlign: "left", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{created.rawApiKey}</span>
                <button onClick={copyKey} style={{ fontSize: "12px", fontWeight: 500, color: "#050505", background: "#aebfff", border: "none", padding: "7px 13px", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap" }}>{copied ? "Copied" : "Copy"}</button>
              </div>
            )}
            <button onClick={onCancel} style={{ width: "100%", marginTop: created.rawApiKey ? 0 : "22px", padding: "12px", background: "#fff", color: "#050505", border: "none", borderRadius: "11px", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Go to projects</button>
          </div>
        </div>
      )}
    </div>
  );
}
