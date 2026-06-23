"use client";

import React, { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Project, ProjectType, WebhookEndpoint, WebhookEventLog, WebhookEventStatus, WebhookEventType } from "../types";
import { card } from "../styles";
import { Breadcrumbs } from "../shared";

const EVENT_LABEL: Record<WebhookEventType, string> = {
  "moderation.completed": "Moderation completed",
  "moderation.review_required": "Review required",
  "review.approved": "Review approved",
  "review.rejected": "Review rejected",
  "redaction.completed": "Redaction completed",
  "verification.completed": "Verification completed",
};

const MODERATION_EVENTS: WebhookEventType[] = [
  "moderation.completed",
  "moderation.review_required",
  "review.approved",
  "review.rejected",
];
const REDACTION_EVENTS: WebhookEventType[] = ["redaction.completed"];

function eventsForProjectType(projectType?: ProjectType): WebhookEventType[] {
  return projectType === "redaction" ? REDACTION_EVENTS : MODERATION_EVENTS;
}

const STATUS_STYLE: Record<WebhookEventStatus, { color: string; bg: string; bd: string }> = {
  delivered: { color: "#7ee0a8", bg: "rgba(126,224,168,0.1)", bd: "rgba(126,224,168,0.22)" },
  pending: { color: "#aebfff", bg: "rgba(126,155,255,0.1)", bd: "rgba(126,155,255,0.22)" },
  failed: { color: "#ff9b9b", bg: "rgba(255,90,90,0.1)", bd: "rgba(255,90,90,0.24)" },
  skipped: { color: "rgba(255,255,255,0.55)", bg: "rgba(255,255,255,0.04)", bd: "rgba(255,255,255,0.1)" },
};

function relativeTime(value?: string) {
  if (!value) return "—";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return value;
  const diff = Math.max(0, Date.now() - then);
  const s = Math.floor(diff / 1000);
  if (s < 10) return "just now";
  if (s < 60) return "less than a minute ago";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function WebhookGlyph({ size = 44 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "12px", flexShrink: 0, background: "linear-gradient(160deg, rgba(126,224,168,0.14), rgba(126,224,168,0.04))", border: "1px solid rgba(126,224,168,0.28)", display: "grid", placeItems: "center" }}>
      <svg width={size * 0.46} height={size * 0.46} viewBox="0 0 24 24" fill="none" stroke="#7ee0a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7l-4 5 4 5" /><path d="M17 7l4 5-4 5" /><path d="M14 4l-4 16" />
      </svg>
    </span>
  );
}

function statusBadge(active: boolean) {
  const s = active
    ? { color: "#7ee0a8", bg: "rgba(126,224,168,0.1)", bd: "rgba(126,224,168,0.22)", label: "Enabled" }
    : { color: "rgba(255,255,255,0.55)", bg: "rgba(255,255,255,0.04)", bd: "rgba(255,255,255,0.12)", label: "Disabled" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "999px", border: "1px solid " + s.bd, background: s.bg, color: s.color, fontSize: "12px", fontWeight: 500 }}>
      {s.label}
    </span>
  );
}

const monoLabel: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "10.5px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)",
};

export function WebhooksPage({
  projects,
  webhooks,
  events,
  loading,
  loadingWebhooks,
  newSecret,
  onCreateWebhook,
  onDisableWebhook,
  onRotateSecret,
  onDismissSecret,
  onRefresh,
  onRetryWebhook,
}: {
  projects: Project[];
  webhooks: WebhookEndpoint[];
  events: WebhookEventLog[];
  loading: boolean;
  loadingWebhooks: boolean;
  newSecret: { projectId: string; webhookId?: string; secret: string } | null;
  onCreateWebhook: (projectId: string, input: { name?: string; url: string; events: WebhookEventType[] }) => Promise<void>;
  onDisableWebhook: (projectId: string, webhookId: string) => Promise<void>;
  onRotateSecret: (projectId: string, webhookId: string) => Promise<void>;
  onDismissSecret: () => void;
  onRefresh: (filters: { projectId?: string }) => Promise<void>;
  onRetryWebhook: (eventId: string) => Promise<void>;
}) {
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const projectName = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p.name])), [projects]);
  const selectedWebhook = webhooks.find((w) => w.webhookId === selectedWebhookId) ?? null;

  const openWebhook = (webhook: WebhookEndpoint) => {
    setSelectedWebhookId(webhook.webhookId);
    void onRefresh({ projectId: webhook.projectId });
  };

  if (selectedWebhook) {
    return (
      <WebhookDetail
        webhook={selectedWebhook}
        projectName={projectName[selectedWebhook.projectId] ?? selectedWebhook.projectId}
        events={events.filter((e) => e.projectId === selectedWebhook.projectId)}
        loadingEvents={loading}
        revealedSecret={newSecret?.webhookId === selectedWebhook.webhookId ? newSecret.secret : null}
        onBack={() => { setSelectedWebhookId(null); onDismissSecret(); }}
        onDisable={() => onDisableWebhook(selectedWebhook.projectId, selectedWebhook.webhookId)}
        onRotate={() => onRotateSecret(selectedWebhook.projectId, selectedWebhook.webhookId)}
        onRetryWebhook={onRetryWebhook}
      />
    );
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>Webhooks</h1>
          <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Send signed events to your backend after moderation and redaction.</p>
        </div>
        {!creating && (
          <button onClick={() => setCreating(true)} className="v-cta" style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "14px", fontWeight: 500, color: "#050505", background: "#fff", padding: "10px 16px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span> Add webhook
          </button>
        )}
      </div>

      {creating && (
        <CreateWebhookForm
          projects={projects}
          onCancel={() => setCreating(false)}
          onCreate={async (projectId, input) => {
            await onCreateWebhook(projectId, input);
            setCreating(false);
          }}
        />
      )}

      <div style={{ ...card, padding: 0, overflow: "hidden", marginTop: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.7fr 0.7fr 0.7fr 40px", gap: "12px", padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", ...monoLabel }}>
          <span>Endpoint</span><span>Status</span><span>Created</span><span />
        </div>

        {loadingWebhooks && webhooks.length === 0 ? (
          <div style={{ padding: "28px 20px", color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>Loading webhooks…</div>
        ) : webhooks.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div style={{ margin: "0 auto 16px", width: "fit-content" }}><WebhookGlyph size={52} /></div>
            <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.86)", fontWeight: 600 }}>No webhooks yet</div>
            <p style={{ margin: "8px auto 0", maxWidth: "360px", fontSize: "13.5px", color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>Add an endpoint to receive signed events when moderation or redaction completes.</p>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <button key={webhook.webhookId} onClick={() => openWebhook(webhook)} style={{ display: "grid", gridTemplateColumns: "1.7fr 0.7fr 0.7fr 40px", gap: "12px", alignItems: "center", width: "100%", padding: "16px 20px", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "transparent", color: "inherit", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "13px", minWidth: 0 }}>
                <WebhookGlyph size={38} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "14px", color: "rgba(255,255,255,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{webhook.url}</span>
                  <span style={{ display: "block", marginTop: "3px", fontSize: "12px", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{projectName[webhook.projectId] ?? webhook.projectId}</span>
                </span>
              </span>
              <span>{statusBadge(webhook.status === "active")}</span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{relativeTime(webhook.createdAt)}</span>
              <span style={{ color: "rgba(255,255,255,0.35)", textAlign: "right", fontSize: "18px" }}>›</span>
            </button>
          ))
        )}
      </div>

      {webhooks.length > 0 && (
        <div style={{ marginTop: "14px", fontSize: "12.5px", color: "rgba(255,255,255,0.4)" }}>
          {webhooks.length} webhook{webhooks.length === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}

function CreateWebhookForm({
  projects,
  onCreate,
  onCancel,
}: {
  projects: Project[];
  onCreate: (projectId: string, input: { url: string; name?: string; events: WebhookEventType[] }) => Promise<void>;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const project = projects.find((p) => p.id === projectId);
  const available = eventsForProjectType(project?.projectType);
  const [events, setEvents] = useState<WebhookEventType[]>(available.slice(0, 1));
  const [busy, setBusy] = useState(false);

  const pickProject = (id: string) => {
    setProjectId(id);
    const next = eventsForProjectType(projects.find((p) => p.id === id)?.projectType);
    setEvents(next.slice(0, 1));
  };

  const toggle = (event: WebhookEventType) => {
    setEvents((current) => (current.includes(event) ? (current.length === 1 ? current : current.filter((e) => e !== event)) : [...current, event]));
  };

  const submit = async () => {
    if (!url.trim() || !projectId) return;
    setBusy(true);
    try {
      await onCreate(projectId, { url: url.trim(), name: name.trim() || undefined, events });
    } finally {
      setBusy(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "#000", color: "#fff", fontFamily: "inherit", fontSize: "14px", padding: "11px 12px", outline: "none" };

  return (
    <div style={{ ...card, padding: "22px", marginTop: "24px" }}>
      <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>Add webhook</div>
      <div style={{ display: "grid", gap: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "7px" }}>Endpoint URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.yourapp.com/webhooks/visora" style={inputStyle} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "7px" }}>Project</label>
            <Select value={projectId} onValueChange={pickProject}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "7px" }}>Name (optional)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Production" style={inputStyle} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "8px" }}>Subscribed events</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {available.map((event) => {
              const checked = events.includes(event);
              return (
                <button key={event} type="button" onClick={() => toggle(event)} style={{ padding: "7px 11px", borderRadius: "9px", border: "1px solid " + (checked ? "rgba(126,155,255,0.4)" : "rgba(255,255,255,0.08)"), background: checked ? "rgba(126,155,255,0.12)" : "rgba(255,255,255,0.02)", color: checked ? "#fff" : "rgba(255,255,255,0.55)", fontFamily: "inherit", fontSize: "12px", cursor: "pointer" }}>
                  {EVENT_LABEL[event]}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <button onClick={() => void submit()} disabled={busy || !url.trim() || !projectId} style={{ padding: "10px 16px", borderRadius: "10px", border: "none", background: busy || !url.trim() ? "rgba(255,255,255,0.4)" : "#fff", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: busy || !url.trim() ? "not-allowed" : "pointer" }}>{busy ? "Creating…" : "Create webhook"}</button>
          <button onClick={onCancel} style={{ padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.7)", fontFamily: "inherit", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function WebhookDetail({
  webhook,
  projectName,
  events,
  loadingEvents,
  revealedSecret,
  onBack,
  onDisable,
  onRotate,
  onRetryWebhook,
}: {
  webhook: WebhookEndpoint;
  projectName: string;
  events: WebhookEventLog[];
  loadingEvents: boolean;
  revealedSecret: string | null;
  onBack: () => void;
  onDisable: () => Promise<void>;
  onRotate: () => Promise<void>;
  onRetryWebhook: (eventId: string) => Promise<void>;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"rotate" | "disable" | null>(null);

  const copySecret = () => {
    if (!revealedSecret) return;
    void navigator.clipboard?.writeText(revealedSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const secretDisplay = revealedSecret ? (revealed ? revealedSecret : "•".repeat(Math.min(revealedSecret.length, 28))) : "•".repeat(28);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 44px 80px" }}>
      <Breadcrumbs items={[{ label: "Webhooks", onClick: onBack }, { label: webhook.url }]} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
          <WebhookGlyph size={56} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>Webhook</div>
            <div style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{webhook.url}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
          <button onClick={async () => { setBusy("rotate"); try { await onRotate(); setRevealed(true); } finally { setBusy(null); } }} disabled={busy !== null} style={{ padding: "9px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "rgba(255,255,255,0.75)", fontFamily: "inherit", fontSize: "13px", cursor: busy ? "wait" : "pointer" }}>{busy === "rotate" ? "Rotating…" : "Rotate secret"}</button>
          {webhook.status === "active" && (
            <button onClick={async () => { setBusy("disable"); try { await onDisable(); } finally { setBusy(null); } }} disabled={busy !== null} style={{ padding: "9px 14px", borderRadius: "10px", border: "1px solid rgba(255,90,90,0.25)", background: "rgba(255,90,90,0.08)", color: "#ff9b9b", fontFamily: "inherit", fontSize: "13px", cursor: busy ? "wait" : "pointer" }}>{busy === "disable" ? "Disabling…" : "Disable"}</button>
          )}
        </div>
      </div>

      <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "1.4fr 0.7fr 0.9fr 1.3fr", gap: "28px", marginTop: "30px", paddingBottom: "26px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <div style={monoLabel}>Listening for</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
            {webhook.events.map((event) => (
              <span key={event} style={{ padding: "4px 9px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.1)", background: "#000", color: "rgba(255,255,255,0.66)", fontSize: "11.5px", whiteSpace: "nowrap" }}>{EVENT_LABEL[event]}</span>
            ))}
          </div>
        </div>
        <div>
          <div style={monoLabel}>Status</div>
          <div style={{ marginTop: "10px" }}>{statusBadge(webhook.status === "active")}</div>
        </div>
        <div>
          <div style={monoLabel}>Created</div>
          <div style={{ marginTop: "10px", fontSize: "13.5px", color: "rgba(255,255,255,0.78)" }}>{relativeTime(webhook.createdAt)}</div>
          <div style={{ marginTop: "4px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{projectName}</div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={monoLabel}>Signing secret</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", padding: "8px 10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "#000" }}>
            <span style={{ flex: 1, minWidth: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{secretDisplay}</span>
            {revealedSecret ? (
              <>
                <button onClick={copySecret} title="Copy" style={{ background: "transparent", border: "none", color: copied ? "#7ee0a8" : "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: "14px", padding: 0 }}>{copied ? "✓" : "⧉"}</button>
                <button onClick={() => setRevealed((v) => !v)} title="Reveal" style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: "13px", padding: 0 }}>{revealed ? "🙈" : "👁"}</button>
              </>
            ) : (
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>rotate to reveal</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "28px" }}>
        {events.length === 0 ? (
          <div style={{ ...card, padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>{loadingEvents ? "Loading events…" : "No webhook events yet"}</div>
            {!loadingEvents && <p style={{ margin: "10px auto 0", maxWidth: "380px", fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>Once this project starts sending events, you&apos;ll see every delivery attempt here.</p>}
          </div>
        ) : (
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.7fr 0.5fr 0.9fr 70px", gap: "12px", padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", ...monoLabel }}>
              <span>Event</span><span>Status</span><span>Attempts</span><span>Created</span><span />
            </div>
            {events.map((event) => {
              const s = STATUS_STYLE[event.status];
              return (
                <div key={event.eventId} style={{ display: "grid", gridTemplateColumns: "1.4fr 0.7fr 0.5fr 0.9fr 70px", gap: "12px", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", color: "rgba(255,255,255,0.86)", fontWeight: 500 }}>{EVENT_LABEL[event.type]}</span>
                    <span style={{ display: "block", marginTop: "3px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.32)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.eventId}</span>
                  </span>
                  <span><span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: "999px", border: "1px solid " + s.bd, background: s.bg, color: s.color, fontSize: "11.5px", fontWeight: 500 }}>{event.status}</span></span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.55)" }}>{event.attempts}</span>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>{relativeTime(event.createdAt)}</span>
                  <span style={{ textAlign: "right" }}>
                    {event.status !== "delivered" && event.status !== "pending" && (
                      <button onClick={() => void onRetryWebhook(event.eventId)} style={{ padding: "5px 9px", borderRadius: "8px", border: "1px solid rgba(126,155,255,0.24)", background: "rgba(126,155,255,0.1)", color: "#cbd6ff", fontFamily: "inherit", fontSize: "11.5px", cursor: "pointer" }}>Retry</button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
