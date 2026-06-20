"use client";

import React, { useState } from "react";
import { cap, card, sectionLabel } from "../styles";
import type { WebhookEndpoint, WebhookEventType } from "../types";

const WEBHOOK_EVENTS: WebhookEventType[] = [
  "moderation.completed",
  "moderation.review_required",
  "review.approved",
  "review.rejected",
];

const EVENT_LABEL: Record<WebhookEventType, string> = {
  "moderation.completed": "Moderation completed",
  "moderation.review_required": "Review required",
  "review.approved": "Review approved",
  "review.rejected": "Review rejected",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontFamily: "inherit",
  fontSize: "14px",
  padding: "11px 12px",
  outline: "none",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function eventPill(event: WebhookEventType) {
  return (
    <span key={event} style={{ padding: "4px 8px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.035)", color: "rgba(255,255,255,0.62)", fontSize: "11px", whiteSpace: "nowrap" }}>
      {EVENT_LABEL[event]}
    </span>
  );
}

export function ProjectWebhooksSection({
  webhooks,
  webhookSecret,
  loading,
  onCreateWebhook,
  onDisableWebhook,
  onRotateWebhookSecret,
  onDismissWebhookSecret,
}: {
  webhooks: WebhookEndpoint[];
  webhookSecret?: string | null;
  loading?: boolean;
  onCreateWebhook: (input: { name?: string; url: string; events: WebhookEventType[] }) => Promise<void>;
  onDisableWebhook: (webhookId: string) => Promise<void>;
  onRotateWebhookSecret: (webhookId: string) => Promise<void>;
  onDismissWebhookSecret: () => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<WebhookEventType[]>(["moderation.completed"]);
  const [creating, setCreating] = useState(false);
  const [disablingWebhookId, setDisablingWebhookId] = useState<string | null>(null);
  const [rotatingWebhookId, setRotatingWebhookId] = useState<string | null>(null);

  const toggleEvent = (event: WebhookEventType) => {
    setEvents((current) => {
      if (current.includes(event)) {
        return current.length === 1 ? current : current.filter((item) => item !== event);
      }

      return [...current, event];
    });
  };

  const createWebhook = async () => {
    const nextUrl = url.trim();
    if (!nextUrl) return;

    setCreating(true);
    try {
      await onCreateWebhook({
        url: nextUrl,
        name: name.trim() || undefined,
        events,
      });
      setName("");
      setUrl("");
      setEvents(["moderation.completed"]);
    } finally {
      setCreating(false);
    }
  };


  const rotateWebhook = async (webhookId: string) => {
    setRotatingWebhookId(webhookId);
    try {
      await onRotateWebhookSecret(webhookId);
    } finally {
      setRotatingWebhookId(null);
    }
  };

  const disableWebhook = async (webhookId: string) => {
    setDisablingWebhookId(webhookId);
    try {
      await onDisableWebhook(webhookId);
    } finally {
      setDisablingWebhookId(null);
    }
  };

  return (
    <div style={{ ...card, padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "18px", marginBottom: "18px" }}>
        <div>
          <div style={sectionLabel}>WEBHOOKS</div>
          <p style={{ margin: "8px 0 0", maxWidth: "540px", fontSize: "12.5px", lineHeight: 1.6, color: "rgba(255,255,255,0.42)", fontWeight: 300 }}>
            Send project events to your backend after moderation and review decisions. Deliveries are async, signed, retried, and moved to a dead-letter queue after repeated failures.
          </p>
        </div>
        <span style={{ padding: "6px 10px", borderRadius: "999px", background: "rgba(126,155,255,0.1)", border: "1px solid rgba(126,155,255,0.25)", color: "#aebfff", fontSize: "11.5px", whiteSpace: "nowrap" }}>
          {loading ? "Loading..." : webhooks.filter((item) => item.status === "active").length + " active"}
        </span>
      </div>

      {webhookSecret && (
        <div style={{ marginBottom: "18px", padding: "14px", borderRadius: "12px", border: "1px solid rgba(126,155,255,0.28)", background: "rgba(126,155,255,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "13px", color: "#fff", fontWeight: 600 }}>Signing secret ready</div>
              <p style={{ margin: "6px 0 10px", fontSize: "12px", lineHeight: 1.5, color: "rgba(255,255,255,0.48)" }}>Copy this now. It will not be shown again. If this was a rotation, the previous secret remains valid for 24 hours.</p>
              <code style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#dfe6ff" }}>{webhookSecret}</code>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button onClick={() => void navigator.clipboard.writeText(webhookSecret)} style={{ padding: "8px 11px", borderRadius: "8px", border: "none", background: "#fff", color: "#050505", fontFamily: "inherit", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Copy</button>
              <button onClick={onDismissWebhookSecret} style={{ padding: "8px 11px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.65)", fontFamily: "inherit", fontSize: "12px", cursor: "pointer" }}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "0.75fr 1.25fr", gap: "12px", marginBottom: "12px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "8px" }}>Name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Production webhook" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "8px" }}>Endpoint URL</label>
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://api.example.com/visora/webhooks" style={inputStyle} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "end" }}>
        <div>
          <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)", marginBottom: "8px" }}>Subscribed events</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {WEBHOOK_EVENTS.map((event) => {
              const checked = events.includes(event);
              return (
                <button key={event} onClick={() => toggleEvent(event)} style={{ padding: "7px 10px", borderRadius: "9px", border: "1px solid " + (checked ? "rgba(126,155,255,0.4)" : "rgba(255,255,255,0.08)"), background: checked ? "rgba(126,155,255,0.12)" : "rgba(255,255,255,0.02)", color: checked ? "#fff" : "rgba(255,255,255,0.55)", fontFamily: "inherit", fontSize: "12px", cursor: "pointer" }}>
                  {EVENT_LABEL[event]}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={() => void createWebhook()} disabled={creating || !url.trim()} style={{ padding: "10px 14px", borderRadius: "10px", border: "none", background: creating || !url.trim() ? "rgba(255,255,255,0.35)" : "#fff", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: creating || !url.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
          {creating ? "Creating..." : "Create webhook"}
        </button>
      </div>

      <div style={{ marginTop: "18px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {webhooks.length === 0 ? (
          <div style={{ paddingTop: "18px" }}>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>No webhook endpoints yet</div>
            <p style={{ margin: "7px 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}>Create one endpoint per environment, then verify incoming requests with the signing secret.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {webhooks.map((webhook) => (
              <div key={webhook.webhookId} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
                    <span style={{ fontSize: "14px", color: "#fff", fontWeight: 600 }}>{webhook.name || "Webhook endpoint"}</span>
                    <span style={{ padding: "3px 8px", borderRadius: "999px", background: webhook.status === "active" ? "rgba(126,224,168,0.1)" : "rgba(255,255,255,0.05)", color: webhook.status === "active" ? "#7ee0a8" : "rgba(255,255,255,0.42)", fontSize: "11px" }}>{cap(webhook.status)}</span>
                  </div>
                  <div style={{ marginTop: "7px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11.5px", color: "rgba(255,255,255,0.42)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{webhook.url}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>{webhook.events.map(eventPill)}</div>
                  <div style={{ marginTop: "9px", fontSize: "11.5px", color: "rgba(255,255,255,0.32)" }}>Created {formatDate(webhook.createdAt)} · Updated {formatDate(webhook.updatedAt)}</div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignSelf: "start" }}>
                  <button onClick={() => void rotateWebhook(webhook.webhookId)} disabled={webhook.status !== "active" || rotatingWebhookId === webhook.webhookId} style={{ padding: "8px 11px", borderRadius: "8px", border: "1px solid rgba(126,155,255,0.24)", background: webhook.status === "active" ? "rgba(126,155,255,0.08)" : "rgba(255,255,255,0.03)", color: webhook.status === "active" ? "#cbd6ff" : "rgba(255,255,255,0.35)", fontFamily: "inherit", fontSize: "12px", cursor: webhook.status === "active" ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>
                    {rotatingWebhookId === webhook.webhookId ? "Rotating..." : "Rotate secret"}
                  </button>
                  <button onClick={() => void disableWebhook(webhook.webhookId)} disabled={webhook.status !== "active" || disablingWebhookId === webhook.webhookId} style={{ padding: "8px 11px", borderRadius: "8px", border: "1px solid rgba(255,155,155,0.24)", background: webhook.status === "active" ? "rgba(255,90,90,0.07)" : "rgba(255,255,255,0.03)", color: webhook.status === "active" ? "#ffb7b7" : "rgba(255,255,255,0.35)", fontFamily: "inherit", fontSize: "12px", cursor: webhook.status === "active" ? "pointer" : "not-allowed" }}>
                    {disablingWebhookId === webhook.webhookId ? "Disabling..." : webhook.status === "active" ? "Disable" : "Disabled"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
