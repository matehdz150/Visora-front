"use client";

import React, { useMemo } from "react";
import { MONO, surface, text } from "../theme";
import { CodeBody, CodeCard, CodeCardHeader } from "../code/CodeCard";
import { CodeLines } from "../code/CodeLines";
import { CopyButton } from "../code/CopyButton";
import { highlightCode } from "../code/highlight";
import { Callout, DocFooterNav, InlineCode, Lead, SectionHeading } from "../primitives";

const eventRows = [
  ["moderation.completed", "Every successful POST /moderate decision."],
  ["moderation.review_required", "A moderation decision was queued for manual review."],
  ["review.approved", "A queued review was approved in the dashboard."],
  ["review.rejected", "A queued review was rejected in the dashboard."],
  ["redaction.completed", "Every successful POST /redact on a redaction project."],
];

const headerRows = [
  ["visora-event-id", "Unique event id (also in the body as id)."],
  ["visora-event-type", "Event type, e.g. redaction.completed."],
  ["visora-timestamp", "Unix seconds when the delivery was signed."],
  ["visora-signature", "Signature in the form v1=<hex>."],
];

const deliveryRows = [
  ["Async", "Deliveries never block the /moderate or /redact response."],
  ["Signed", "HMAC SHA-256 over `timestamp.rawBody` with your endpoint secret."],
  ["Retried", "Failed deliveries are retried with backoff."],
  ["Dead-letter", "After repeated failures the event moves to a DLQ; you can retry it from the dashboard."],
  ["Per project", "Each endpoint belongs to a project and only receives that project's events."],
];

const eventBodyCode = `{
  "id": "evt_01KVMZ7P2YQ9XJ8R5C3F0N2T6B",
  "type": "redaction.completed",
  "createdAt": "2026-06-22T18:24:11.482Z",
  "accountId": "acc_123",
  "projectId": "proj_123",
  "data": {
    "redactionId": "red_01KVMZ6K4RBZ1PAMWJH7EK4XQW",
    "imageKey": "accounts/acc_123/projects/proj_123/uploads/profile.jpg",
    "redactedImageKey": "accounts/acc_123/projects/proj_123/redacted/01KVMZ6K.jpg",
    "style": "blur",
    "facesBlurred": 1,
    "textBlurred": 2,
    "licensePlatesBlurred": 1,
    "regions": [/* RedactionRegion[] */],
    "createdAt": "2026-06-22T18:24:11.300Z"
  }
}`;

const verifyCode = `import { verifyWebhookSignature } from "@visoracloud/client";

const valid = verifyWebhookSignature({
  secret: process.env.VISORA_WEBHOOK_SECRET!,
  payload: rawBody, // the exact raw request body string
  timestamp: req.headers["visora-timestamp"],
  signature: req.headers["visora-signature"],
});

if (!valid) {
  return res.status(401).json({ error: "Invalid signature" });
}`;

const nextHandlerCode = `import { createNextWebhookHandler } from "@visoracloud/client";

// Verifies the signature and parses the event for you.
export const POST = createNextWebhookHandler({
  secret: process.env.VISORA_WEBHOOK_SECRET!,
  onEvent: async (event) => {
    switch (event.type) {
      case "moderation.completed":
        await onModerated(event.data.moderationId, event.data.action);
        break;
      case "moderation.review_required":
        await notifyReviewTeam(event.data.reviewId);
        break;
      case "review.approved":
      case "review.rejected":
        await syncReviewDecision(event.data.reviewId, event.type);
        break;
      case "redaction.completed":
        // event.data is narrowed to VisoraRedactionCompletedData
        await storeRedactedImage(event.data.redactionId, event.data.redactedImageKey);
        break;
    }
  },
});`;

const expressHandlerCode = `import express from "express";
import { createExpressWebhookHandler } from "@visoracloud/client";

const app = express();

// Visora handlers need the raw body — mount express.raw() on the route.
app.post(
  "/webhooks/visora",
  express.raw({ type: "application/json" }),
  createExpressWebhookHandler({
    secret: process.env.VISORA_WEBHOOK_SECRET!,
    onEvent: async (event) => {
      if (event.type === "redaction.completed") {
        await storeRedactedImage(event.data.redactionId);
      }
    },
  }),
);`;

const manualVerifyCode = `import { constructWebhookEvent } from "@visoracloud/client";

// Throws VisoraWebhookSignatureError if the signature is invalid.
const event = constructWebhookEvent({
  secret: process.env.VISORA_WEBHOOK_SECRET!,
  payload: rawBody,
  timestamp: req.headers["visora-timestamp"],
  signature: req.headers["visora-signature"],
});`;

const rotationCode = `// During rotation, accept the current and previous secret for 24 hours.
const valid = verifyWebhookSignature({
  secret: [
    process.env.VISORA_WEBHOOK_SECRET!,
    process.env.VISORA_PREVIOUS_WEBHOOK_SECRET!,
  ],
  payload: rawBody,
  timestamp,
  signature,
});`;

function TextCodeCard({ title, code, status }: { title: string; code: string; status?: string }) {
  const lines = useMemo(() => highlightCode(code), [code]);

  return (
    <CodeCard>
      <CodeCardHeader style={{ padding: "11px 18px", gap: "12px" }}>
        <span style={{ fontFamily: MONO, fontSize: "12px", color: text.faint }}>{title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {status ? <span style={{ fontFamily: MONO, fontSize: "11px", color: "#7ee0a8", background: "rgba(120,224,168,0.1)", border: "1px solid rgba(120,224,168,0.25)", padding: "2px 8px", borderRadius: "5px" }}>{status}</span> : null}
          <CopyButton text={code.trim()} />
        </div>
      </CodeCardHeader>
      <CodeBody>
        <CodeLines lines={lines} />
      </CodeBody>
    </CodeCard>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ marginTop: "20px", overflowX: "auto", border: "1px solid " + surface.borderFaint, borderRadius: "12px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.035)" }}>
            {headers.map((header) => (
              <th key={header} style={{ padding: "12px 14px", textAlign: "left", fontFamily: MONO, fontSize: "11px", color: text.faint, fontWeight: 500, borderBottom: "1px solid " + surface.borderFaint }}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell, index) => (
                <td key={cell + "-" + index} style={{ padding: "13px 14px", fontSize: "13.5px", lineHeight: 1.45, color: index === 0 ? "rgba(255,255,255,0.88)" : text.muted, fontFamily: index === 0 ? MONO : undefined, borderBottom: "1px solid " + surface.borderFaint }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const WEBHOOKS_NAV_GROUPS = [
  {
    title: "Webhooks",
    items: [
      { label: "Overview", href: "#overview" },
      { label: "Event types", href: "#events" },
      { label: "Event payload", href: "#payload" },
      { label: "Verify signatures", href: "#verify" },
      { label: "SDK handlers", href: "#sdk" },
      { label: "Secret rotation", href: "#rotation" },
      { label: "Delivery", href: "#delivery" },
    ],
  },
  {
    title: "More Docs",
    items: [
      { label: "Moderation API", href: "/docs" },
      { label: "Redaction API", href: "/docs/redaction" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
];

export const WEBHOOKS_TOC_ITEMS = [
  { label: "Overview", href: "#overview" },
  { label: "Events", href: "#events" },
  { label: "Payload", href: "#payload" },
  { label: "Verify", href: "#verify" },
  { label: "SDK", href: "#sdk" },
  { label: "Rotation", href: "#rotation" },
  { label: "Delivery", href: "#delivery" },
];

export function WebhooksArticle({ articleRef }: { articleRef?: React.Ref<HTMLElement> }) {
  return (
    <main ref={articleRef} className="docs-article" style={{ padding: "44px 56px 120px", minWidth: 0 }}>
      <div id="overview" style={{ scrollMarginTop: "80px", fontFamily: MONO, fontSize: "12px", letterSpacing: "0.06em", color: "#8fa0d8", marginBottom: "14px" }}>VISORA WEBHOOKS DOCS</div>
      <h1 style={{ margin: 0, fontSize: "38px", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08 }}>React to moderation and redaction events</h1>
      <p style={{ margin: "16px 0 0", fontSize: "16.5px", lineHeight: 1.6, color: text.body, fontWeight: 300, maxWidth: "760px" }}>
        Webhooks push signed events to your backend when a moderation decision is made, a review is resolved, or a redaction finishes. Deliveries are asynchronous, so they never slow your API calls.
      </p>
      <Lead>Create endpoints per project from <InlineCode>Dashboard → Webhooks</InlineCode> and subscribe to the events you care about.</Lead>

      <Callout>
        Every delivery is HMAC-signed. Always verify the signature before trusting an event — the SDK helpers do this for you.
      </Callout>

      <SectionHeading id="events">Event types</SectionHeading>
      <Lead>Subscribe an endpoint to one or more events. Moderation projects emit moderation and review events; redaction projects emit <InlineCode>redaction.completed</InlineCode>.</Lead>
      <SimpleTable headers={["Event", "Fired when"]} rows={eventRows} />

      <SectionHeading id="payload">Event payload</SectionHeading>
      <Lead>Every delivery is a JSON envelope with a stable shape. The event-specific fields live under <InlineCode>data</InlineCode>.</Lead>
      <TextCodeCard title="redaction.completed delivery" code={eventBodyCode} status="POST to your endpoint" />
      <Lead>These headers accompany every request:</Lead>
      <SimpleTable headers={["Header", "Description"]} rows={headerRows} />

      <SectionHeading id="verify">Verify signatures</SectionHeading>
      <Lead>The signature is <InlineCode>v1=&lt;hex&gt;</InlineCode> where the HMAC SHA-256 is computed over <InlineCode>{"`${timestamp}.${rawBody}`"}</InlineCode> using your endpoint secret. Verify against the <strong>raw</strong> request body — not a re-serialized object.</Lead>
      <TextCodeCard title="Verify a delivery" code={verifyCode} />

      <SectionHeading id="sdk">SDK handlers</SectionHeading>
      <Lead>Install <InlineCode>@visoracloud/client</InlineCode>. The framework handlers verify the signature, parse the event, and narrow <InlineCode>event.data</InlineCode> by <InlineCode>event.type</InlineCode> so no casting is required.</Lead>
      <TextCodeCard title="Next.js route handler" code={nextHandlerCode} />
      <TextCodeCard title="Express handler (raw body required)" code={expressHandlerCode} />
      <Lead>Prefer to verify and parse manually? Use <InlineCode>constructWebhookEvent</InlineCode>, which throws on an invalid signature.</Lead>
      <TextCodeCard title="Manual verification" code={manualVerifyCode} />

      <SectionHeading id="rotation">Secret rotation</SectionHeading>
      <Lead>Rotate a signing secret from the webhook detail page. The previous secret stays valid for 24 hours so in-flight deliveries keep verifying. Accept both during the window:</Lead>
      <TextCodeCard title="Verify during rotation" code={rotationCode} />

      <SectionHeading id="delivery">Delivery semantics</SectionHeading>
      <SimpleTable headers={["Property", "Behavior"]} rows={deliveryRows} />
      <Lead>Respond with a <InlineCode>2xx</InlineCode> quickly to acknowledge receipt. Non-2xx responses and timeouts are retried; persistent failures land in the dead-letter queue, where you can inspect and retry them from <InlineCode>Dashboard → Webhooks</InlineCode>.</Lead>

      <DocFooterNav prev={{ label: "Redaction docs", href: "/docs/redaction" }} next={{ label: "Dashboard", href: "/dashboard" }} />
    </main>
  );
}
