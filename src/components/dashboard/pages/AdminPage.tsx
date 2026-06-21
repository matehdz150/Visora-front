"use client";

import React from "react";
import type { AdminOverviewData } from "@/lib/visora-api";
import { card, sectionLabel } from "../styles";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function percent(value: number) {
  return Math.round(value * 10) / 10 + "%";
}

function Metric({ label, value, hint, tone = "default" }: { label: string; value: string; hint: string; tone?: "default" | "warn" | "bad" }) {
  const color = tone === "bad" ? "#ff9b9b" : tone === "warn" ? "#e8c98a" : "#fff";
  return (
    <div style={{ ...card, padding: "18px" }}>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)", marginBottom: "10px" }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "25px", color, fontWeight: 600 }}>{value}</div>
      <div style={{ marginTop: "8px", fontSize: "12px", color: "rgba(255,255,255,0.38)" }}>{hint}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "24px", color: "rgba(255,255,255,0.42)", fontSize: "13px" }}>{children}</div>;
}

export function AdminPage({ data, loading, error, onRefresh }: { data: AdminOverviewData | null; loading: boolean; error: string | null; onRefresh: () => Promise<void> }) {
  const usagePercent = data?.usage.totalMonthlyLimit
    ? Math.min(100, (data.usage.totalRequestsUsed / data.usage.totalMonthlyLimit) * 100)
    : 0;
  const topAccount = data?.accounts[0];

  return (
    <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "18px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>Admin</h1>
          <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Private operational view for accounts, usage, errors, and webhook delivery.</p>
        </div>
        <button onClick={() => void onRefresh()} disabled={loading} style={{ padding: "10px 15px", borderRadius: "10px", border: "none", background: loading ? "rgba(255,255,255,0.35)" : "#fff", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: loading ? "wait" : "pointer" }}>{loading ? "Refreshing..." : "Refresh"}</button>
      </div>

      {error && (
        <div style={{ marginTop: "22px", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,90,90,0.2)", background: "rgba(255,90,90,0.07)", color: "#ffb7b7", fontSize: "13px" }}>{error}</div>
      )}

      {!data ? (
        <div style={{ ...card, marginTop: "28px" }}><Empty>{loading ? "Loading admin data..." : "Admin data is not available."}</Empty></div>
      ) : (
        <>
          <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginTop: "28px" }}>
            <Metric label="Accounts" value={formatNumber(data.accounts.length)} hint={topAccount ? "Top: " + topAccount.email : "No accounts yet"} />
            <Metric label="Monthly usage" value={formatNumber(data.usage.totalRequestsUsed)} hint={percent(usagePercent) + " of visible limits"} tone={usagePercent >= 90 ? "bad" : usagePercent >= 75 ? "warn" : "default"} />
            <Metric label="Active projects" value={formatNumber(data.topProjects.filter((project) => project.monthModerations > 0).length)} hint={formatNumber(data.topProjects.length) + " projects sampled"} />
            <Metric label="Recent errors" value={formatNumber(data.recentErrors.length)} hint="Last 24 hours" tone={data.recentErrors.length ? "bad" : "default"} />
            <Metric label="Failed webhooks" value={formatNumber(data.failedWebhooks.length)} hint="Recent failed events" tone={data.failedWebhooks.length ? "bad" : "default"} />
          </div>

          <div className="r-stack" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "18px", marginTop: "18px", alignItems: "start" }}>
            <Panel title="Accounts">
              <Header columns="1.2fr 0.7fr 0.8fr 0.8fr 0.7fr" labels={["Email", "Plan", "Usage", "Projects", "Keys"]} />
              {data.accounts.length === 0 ? <Empty>No accounts found.</Empty> : data.accounts.map((account) => (
                <Row key={account.accountId} columns="1.2fr 0.7fr 0.8fr 0.8fr 0.7fr">
                  <Cell main={account.email} sub={account.accountId} />
                  <span style={{ color: "rgba(255,255,255,0.72)", fontSize: "12.5px" }}>{account.planId}</span>
                  <Cell main={formatNumber(account.requestsUsed) + " / " + formatNumber(account.monthlyLimit)} sub={percent(account.usagePercent)} />
                  <span style={{ color: "rgba(255,255,255,0.62)", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>{account.projectsCount}/{account.projectLimit}</span>
                  <span style={{ color: "rgba(255,255,255,0.62)", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>{account.activeApiKeys}/{account.apiKeyLimit}</span>
                </Row>
              ))}
            </Panel>

            <Panel title="Users near limit">
              <Header columns="1.3fr 0.7fr 0.6fr" labels={["Account", "Usage", "Plan"]} />
              {data.usersNearLimit.length === 0 ? <Empty>No users are near their monthly limit.</Empty> : data.usersNearLimit.map((account) => (
                <Row key={account.accountId} columns="1.3fr 0.7fr 0.6fr">
                  <Cell main={account.email} sub={account.accountId} />
                  <span style={{ color: account.usagePercent >= 100 ? "#ff9b9b" : "#e8c98a", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>{percent(account.usagePercent)}</span>
                  <span style={{ color: "rgba(255,255,255,0.62)", fontSize: "12px" }}>{account.planId}</span>
                </Row>
              ))}
            </Panel>
          </div>

          <div className="r-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginTop: "18px", alignItems: "start" }}>
            <Panel title="Most active projects">
              <Header columns="1.2fr 0.9fr 0.55fr" labels={["Project", "Account", "Moderations"]} />
              {data.topProjects.length === 0 ? <Empty>No projects found.</Empty> : data.topProjects.map((project) => (
                <Row key={project.projectId} columns="1.2fr 0.9fr 0.55fr">
                  <Cell main={project.name} sub={project.projectId} />
                  <span style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.accountId}</span>
                  <span style={{ color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>{formatNumber(project.monthModerations)}</span>
                </Row>
              ))}
            </Panel>

            <Panel title="Failed webhooks">
              <Header columns="1fr 0.55fr 0.75fr" labels={["Event", "Attempts", "Updated"]} />
              {data.failedWebhooks.length === 0 ? <Empty>No failed webhooks found.</Empty> : data.failedWebhooks.map((event) => (
                <Row key={event.eventId} columns="1fr 0.55fr 0.75fr">
                  <Cell main={event.type} sub={event.lastError ?? event.eventId} />
                  <span style={{ color: "#ffb7b7", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>{event.attempts}</span>
                  <span style={{ color: "rgba(255,255,255,0.48)", fontSize: "12px" }}>{formatDate(event.updatedAt)}</span>
                </Row>
              ))}
            </Panel>
          </div>

          <div style={{ ...card, marginTop: "18px", overflow: "hidden" }}>
            <div style={{ padding: "17px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div style={sectionLabel}>RECENT ERRORS</div>
              {data.recentErrorsUnavailable && <span style={{ color: "#e8c98a", fontSize: "12px" }}>{data.recentErrorsUnavailable}</span>}
            </div>
            <Header columns="0.75fr 0.75fr 0.75fr 1.3fr" labels={["Time", "Event", "Route", "Message"]} />
            {data.recentErrors.length === 0 ? <Empty>No structured errors in the last 24 hours.</Empty> : data.recentErrors.map((error, index) => (
              <Row key={error.timestamp + "-" + index} columns="0.75fr 0.75fr 0.75fr 1.3fr">
                <span style={{ color: "rgba(255,255,255,0.48)", fontSize: "12px" }}>{formatDate(error.timestamp)}</span>
                <Cell main={error.event ?? "error"} sub={error.logGroupName.split("/").pop() ?? error.logGroupName} />
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{error.route ?? "-"}</span>
                <span style={{ color: "#ffb7b7", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{error.message}</span>
              </Row>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...card, overflow: "hidden" }}>
      <div style={{ padding: "17px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={sectionLabel}>{title.toUpperCase()}</div>
      </div>
      {children}
    </div>
  );
}

function Header({ columns, labels }: { columns: string; labels: string[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: columns, gap: "12px", padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
      {labels.map((label) => <span key={label}>{label}</span>)}
    </div>
  );
}

function Row({ columns, children }: { columns: string; children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: columns, gap: "12px", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.045)" }}>{children}</div>;
}

function Cell({ main, sub }: { main: string; sub?: string }) {
  return (
    <span style={{ minWidth: 0 }}>
      <span style={{ display: "block", color: "rgba(255,255,255,0.82)", fontSize: "12.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{main}</span>
      {sub && <span style={{ display: "block", marginTop: "4px", color: "rgba(255,255,255,0.34)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</span>}
    </span>
  );
}
