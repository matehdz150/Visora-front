"use client";

import React, { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Project, WebhookEventLog, WebhookEventStatus, WebhookEventType } from "../types";
import { card, sectionLabel } from "../styles";

const EVENT_LABEL: Record<WebhookEventType, string> = {
  "moderation.completed": "Moderation completed",
  "moderation.review_required": "Review required",
  "review.approved": "Review approved",
  "review.rejected": "Review rejected",
  "redaction.completed": "Redaction completed",
};

const STATUS_LABEL: Record<WebhookEventStatus, string> = {
  pending: "Pending",
  delivered: "Delivered",
  failed: "Failed",
  skipped: "Skipped",
};

const STATUS_STYLE: Record<WebhookEventStatus, { color: string; bg: string; bd: string }> = {
  delivered: { color: "#7ee0a8", bg: "rgba(126,224,168,0.1)", bd: "rgba(126,224,168,0.22)" },
  pending: { color: "#aebfff", bg: "rgba(126,155,255,0.1)", bd: "rgba(126,155,255,0.22)" },
  failed: { color: "#ff9b9b", bg: "rgba(255,90,90,0.1)", bd: "rgba(255,90,90,0.24)" },
  skipped: { color: "rgba(255,255,255,0.55)", bg: "rgba(255,255,255,0.04)", bd: "rgba(255,255,255,0.1)" },
};

function statusPill(status: WebhookEventStatus) {
  const style = STATUS_STYLE[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: "999px", border: "1px solid " + style.bd, background: style.bg, color: style.color, fontSize: "11.5px", fontWeight: 500 }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function getPayloadSummary(payload: Record<string, unknown>) {
  const moderationId = typeof payload.moderationId === "string" ? payload.moderationId : undefined;
  const imageKey = typeof payload.imageKey === "string" ? payload.imageKey : undefined;
  const status = typeof payload.status === "string" ? payload.status : undefined;

  return moderationId ?? status ?? imageKey ?? "Webhook event";
}

export function WebhooksPage({
  projects,
  events,
  loading,
  onRefresh,
  onRetryWebhook,
}: {
  projects: Project[];
  events: WebhookEventLog[];
  loading: boolean;
  onRefresh: (filters: { projectId?: string; status?: WebhookEventStatus | "all"; eventType?: WebhookEventType | "all" }) => Promise<void>;
  onRetryWebhook: (eventId: string) => Promise<void>;
}) {
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<WebhookEventStatus | "all">("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<WebhookEventType | "all">("all");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [retryingEventId, setRetryingEventId] = useState<string | null>(null);
  const projectName = useMemo(() => Object.fromEntries(projects.map((project) => [project.id, project.name])), [projects]);
  const selectedEvent = events.find((event) => event.eventId === selectedEventId) ?? events[0] ?? null;
  const stats = useMemo(() => ({
    delivered: events.filter((event) => event.status === "delivered").length,
    failed: events.filter((event) => event.status === "failed").length,
    pending: events.filter((event) => event.status === "pending").length,
    skipped: events.filter((event) => event.status === "skipped").length,
  }), [events]);


  const retrySelectedEvent = async () => {
    if (!selectedEvent || selectedEvent.status === "delivered") return;

    setRetryingEventId(selectedEvent.eventId);
    try {
      await onRetryWebhook(selectedEvent.eventId);
    } finally {
      setRetryingEventId(null);
    }
  };

  const refresh = async (next?: Partial<{ projectId: string; status: WebhookEventStatus | "all"; eventType: WebhookEventType | "all" }>) => {
    const filters = {
      projectId: next?.projectId ?? projectFilter,
      status: next?.status ?? statusFilter,
      eventType: next?.eventType ?? eventTypeFilter,
    };

    await onRefresh({
      projectId: filters.projectId === "all" ? undefined : filters.projectId,
      status: filters.status,
      eventType: filters.eventType,
    });
  };

  return (
    <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>Webhooks</h1>
          <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Monitor webhook delivery events across your projects.</p>
        </div>
        <button onClick={() => void refresh()} disabled={loading} style={{ padding: "10px 15px", borderRadius: "10px", border: "none", background: loading ? "rgba(255,255,255,0.35)" : "#fff", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: loading ? "wait" : "pointer" }}>{loading ? "Refreshing..." : "Refresh"}</button>
      </div>

      <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginTop: "28px" }}>
        <Metric label="Delivered" value={stats.delivered} color="#7ee0a8" />
        <Metric label="Failed" value={stats.failed} color="#ff9b9b" />
        <Metric label="Pending" value={stats.pending} color="#aebfff" />
        <Metric label="Skipped" value={stats.skipped} color="rgba(255,255,255,0.55)" />
      </div>

      <div className="r-cols-2" style={{ ...card, padding: "16px", marginTop: "18px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        <Select value={projectFilter} onValueChange={(value) => { setProjectFilter(value); void refresh({ projectId: value }); }}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => { const status = value as WebhookEventStatus | "all"; setStatusFilter(status); void refresh({ status }); }}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="skipped">Skipped</SelectItem>
          </SelectContent>
        </Select>
        <Select value={eventTypeFilter} onValueChange={(value) => { const eventType = value as WebhookEventType | "all"; setEventTypeFilter(eventType); void refresh({ eventType }); }}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All event types</SelectItem>
            <SelectItem value="moderation.completed">Moderation completed</SelectItem>
            <SelectItem value="moderation.review_required">Review required</SelectItem>
            <SelectItem value="review.approved">Review approved</SelectItem>
            <SelectItem value="review.rejected">Review rejected</SelectItem>
            <SelectItem value="redaction.completed">Redaction completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="r-stack" style={{ display: "grid", gridTemplateColumns: "1.45fr 0.95fr", gap: "20px", marginTop: "18px", alignItems: "start" }}>
        <div className="dash-scroll" style={{ ...card, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.9fr 0.8fr 0.55fr 0.9fr", gap: "12px", padding: "13px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.38)", textTransform: "uppercase" }}>
            <span>Event</span><span>Project</span><span>Status</span><span>Attempts</span><span>Created</span>
          </div>
          {loading && events.length === 0 ? (
            <div style={{ padding: "28px 20px", color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>Loading webhook events...</div>
          ) : events.length === 0 ? (
            <div style={{ padding: "30px 20px" }}>
              <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>No webhook events yet</div>
              <p style={{ margin: "8px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.42)", lineHeight: 1.55 }}>Create a webhook endpoint inside a project, then run moderation or resolve reviews.</p>
            </div>
          ) : events.map((event) => (
            <button key={event.eventId} onClick={() => setSelectedEventId(event.eventId)} style={{ display: "grid", gridTemplateColumns: "1.15fr 0.9fr 0.8fr 0.55fr 0.9fr", gap: "12px", width: "100%", padding: "15px 18px", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", background: selectedEvent?.eventId === event.eventId ? "rgba(126,155,255,0.06)" : "transparent", color: "inherit", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", color: "rgba(255,255,255,0.86)", fontSize: "13px", fontWeight: 600 }}>{EVENT_LABEL[event.type]}</span>
                <span style={{ display: "block", marginTop: "5px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.eventId}</span>
              </span>
              <span style={{ minWidth: 0, color: "rgba(255,255,255,0.58)", fontSize: "12.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{projectName[event.projectId] ?? event.projectId}</span>
              <span>{statusPill(event.status)}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.58)" }}>{event.attempts}</span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{formatDate(event.createdAt)}</span>
            </button>
          ))}
        </div>

        <div style={{ ...card, padding: "22px", position: "sticky", top: "30px" }}>
          <div style={sectionLabel}>EVENT DETAIL</div>
          {selectedEvent ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "14px", color: "#fff", fontWeight: 600 }}>{EVENT_LABEL[selectedEvent.type]}</div>
                  <div style={{ marginTop: "5px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.36)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedEvent.eventId}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  {statusPill(selectedEvent.status)}
                  {(selectedEvent.status === "failed" || selectedEvent.status === "skipped" || selectedEvent.status === "pending") && (
                    <button onClick={() => void retrySelectedEvent()} disabled={retryingEventId === selectedEvent.eventId || selectedEvent.status === "pending"} style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid rgba(126,155,255,0.24)", background: selectedEvent.status === "pending" ? "rgba(255,255,255,0.04)" : "rgba(126,155,255,0.1)", color: selectedEvent.status === "pending" ? "rgba(255,255,255,0.38)" : "#cbd6ff", fontFamily: "inherit", fontSize: "12px", cursor: selectedEvent.status === "pending" ? "not-allowed" : "pointer" }}>
                      {retryingEventId === selectedEvent.eventId ? "Queueing..." : selectedEvent.status === "pending" ? "Queued" : "Retry"}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gap: "10px", marginTop: "18px" }}>
                <Detail label="Project" value={projectName[selectedEvent.projectId] ?? selectedEvent.projectId} />
                <Detail label="Attempts" value={String(selectedEvent.attempts)} />
                <Detail label="Created" value={formatDate(selectedEvent.createdAt)} />
                <Detail label="Last attempt" value={formatDate(selectedEvent.lastAttemptAt)} />
                <Detail label="Delivered" value={formatDate(selectedEvent.deliveredAt)} />
              </div>

              {selectedEvent.lastError && (
                <div style={{ marginTop: "16px", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,90,90,0.18)", background: "rgba(255,90,90,0.07)", color: "#ffb7b7", fontSize: "12.5px", lineHeight: 1.5 }}>{selectedEvent.lastError}</div>
              )}

              <div style={{ marginTop: "18px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.36)", marginBottom: "9px" }}>PAYLOAD</div>
                <div style={{ marginBottom: "9px", fontSize: "12px", color: "rgba(255,255,255,0.54)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getPayloadSummary(selectedEvent.payload)}</div>
                <pre style={{ margin: 0, maxHeight: "360px", overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", padding: "13px", borderRadius: "10px", background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.64)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", lineHeight: 1.55 }}>{JSON.stringify(selectedEvent.payload, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.42)", lineHeight: 1.55 }}>Select a webhook event to inspect its delivery metadata and payload.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ ...card, padding: "18px" }}>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "24px", color, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)" }}>{label}</span>
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", textAlign: "right", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}
