"use client";

import React, { useMemo, useState } from "react";
import { MONO, surface, text } from "../theme";
import { CODE_SAMPLES, ENV_SAMPLE, INSTALL_COMMANDS, LANG_TABS, PKG_TABS, RESPONSE_SAMPLE, codeToText, type CodeLine, type Lang, type Pkg } from "../code-samples";
import { DECISIONS, FOOTER_NAV, NEXT_STEPS } from "../data";
import { CodeBody, CodeCard, CodeCardHeader } from "../code/CodeCard";
import { CodeLines } from "../code/CodeLines";
import { CodeTabs } from "../code/CodeTabs";
import { CopyButton } from "../code/CopyButton";
import { Callout, DecisionCard, DocFooterNav, InlineCode, Lead, NextStepCard, SectionHeading, StepHeading } from "../primitives";

const API_BASE_URL = "https://6p0ws7vu2f.execute-api.us-east-1.amazonaws.com/dev";

const categories = ["nudity", "suggestive", "violence", "weapons", "drugs", "hate_symbols", "gambling", "alcohol"];
const compliancePacks = ["marketplace", "kids", "education", "social", "dating", "ads"];

const planRows = [
  ["Free", "$0", "500/month", "1", "1", "7 days", "Blocked at limit"],
  ["Starter", "$29/month", "10,000/month", "3", "3", "30 days", "$4 per 1k overage"],
  ["Growth", "$149/month", "50,000/month", "10", "10", "90 days", "$3 per 1k overage"],
  ["Scale", "$399/month", "150,000/month", "50", "50", "180 days", "$2.50 per 1k overage"],
];

const errorRows = [
  ["400", "Bad request", "Invalid JSON, missing imageKey, missing file, unsupported content type, or file too large."],
  ["401", "Unauthorized", "Missing or invalid x-api-key, or missing/invalid Cognito Bearer token on dashboard routes."],
  ["403", "Forbidden", "API key is inactive/revoked or the imageKey does not belong to the authenticated project."],
  ["404", "Not found", "Route does not exist."],
  ["429", "Limit exceeded", "Free plan monthly limit has been reached. Paid plans can continue and accrue overage usage."],
  ["500", "Internal server error", "Unexpected DynamoDB, S3, Rekognition, or Lambda failure."],
];

const multipartCurl = [
  "curl -X POST \"$VISORA_API_URL/moderate\" \\",
  "  -H \"x-api-key: $VISORA_API_KEY\" \\",
  "  -F \"image=@./image.jpg;type=image/jpeg\"",
].join("\n");

const imageKeyCurl = [
  "curl -X POST \"$VISORA_API_URL/moderate\" \\",
  "  -H \"content-type: application/json\" \\",
  "  -H \"x-api-key: $VISORA_API_KEY\" \\",
  "  -d '{\"imageKey\":\"accounts/acc_123/projects/proj_123/uploads/image.jpg\"}'",
].join("\n");

const uploadUrlCurl = [
  "curl -X POST \"$VISORA_API_URL/upload-url\" \\",
  "  -H \"x-api-key: $VISORA_API_KEY\"",
].join("\n");

const logsCurl = [
  "curl \"$VISORA_API_URL/moderation-logs\" \\",
  "  -H \"x-api-key: $VISORA_API_KEY\"",
].join("\n");


const webhookPayloadJson = String.raw`{
  "id": "evt_01KW0WEBHOOK7R6Z4C2J5K8",
  "type": "moderation.completed",
  "createdAt": "2026-06-19T14:32:08.000Z",
  "accountId": "acc_123",
  "projectId": "proj_123",
  "data": {
    "moderationId": "mod_01KV9F2X3Q",
    "imageKey": "accounts/acc_123/projects/proj_123/uploads/image.jpg",
    "safe": false,
    "action": "reject",
    "riskScore": 92,
    "category": "weapons",
    "labels": [
      { "name": "Weapon", "confidence": 93.14, "category": "weapons" }
    ],
    "explanation": {
      "message": "Rejected because weapons matched reject action."
    }
  }
}`;

const webhookVerifyCode = String.raw`import { verifyWebhookSignature } from "@visoracloud/client";

const valid = verifyWebhookSignature({
  secret: process.env.VISORA_WEBHOOK_SECRET!,
  payload: rawBody,
  timestamp: request.headers["visora-timestamp"] as string,
  signature: request.headers["visora-signature"] as string,
});

if (!valid) {
  throw new Error("Invalid Visora webhook signature");
}`;

const webhookNextHandlerCode = String.raw`import { createNextWebhookHandler } from "@visoracloud/client";

export const POST = createNextWebhookHandler({
  secret: process.env.VISORA_WEBHOOK_SECRET!,
  async onEvent(event) {
    switch (event.type) {
      case "moderation.completed":
        await updateImageModeration(event.data.moderationId, event.data.action);
        break;
      case "moderation.review_required":
        await notifyReviewTeam(event.data.reviewId);
        break;
      case "review.approved":
      case "review.rejected":
        await syncReviewDecision(event.data.reviewId, event.type);
        break;
    }
  },
});`;

const webhookExpressHandlerCode = String.raw`import express from "express";
import { createExpressWebhookHandler } from "@visoracloud/client";

const app = express();

app.post(
  "/webhooks/visora",
  express.raw({ type: "application/json" }),
  createExpressWebhookHandler({
    secret: process.env.VISORA_WEBHOOK_SECRET!,
    async onEvent(event) {
      if (event.type === "moderation.completed") {
        await updateImageModeration(event.data.moderationId, event.data.action);
      }
    },
  })
);`;

const webhookRotationCode = String.raw`import { constructWebhookEvent } from "@visoracloud/client";

const event = constructWebhookEvent({
  secret: [
    process.env.VISORA_WEBHOOK_SECRET!,
    process.env.VISORA_PREVIOUS_WEBHOOK_SECRET!,
  ].filter(Boolean),
  payload: rawBody,
  timestamp,
  signature,
});`;


const sdkWebhookImportsCode = String.raw`import {
  constructWebhookEvent,
  createExpressWebhookHandler,
  createNextWebhookHandler,
  verifyWebhookSignature,
  type VisoraWebhookEvent,
  type VisoraWebhookEventType,
} from "@visoracloud/client";`;

const sdkWebhookTypesCode = String.raw`import type { VisoraWebhookEvent, VisoraWebhookEventType } from "@visoracloud/client";

const eventTypes: VisoraWebhookEventType[] = [
  "moderation.completed",
  "moderation.review_required",
  "review.approved",
  "review.rejected",
];

async function handleVisoraEvent(event: VisoraWebhookEvent) {
  switch (event.type) {
    case "moderation.completed":
      await saveModerationResult(event.data.moderationId, event.data.action);
      break;
    case "moderation.review_required":
      await createInternalReviewTask(event.data.reviewId, event.data.imageKey);
      break;
    case "review.approved":
      await publishImage(event.data.moderationId);
      break;
    case "review.rejected":
      await hideImage(event.data.moderationId, event.data.decisionReason);
      break;
  }
}`;

const webhookHeadersCode = String.raw`Content-Type: application/json
User-Agent: Visora-Webhooks/1.0
visora-event-id: evt_01KW0WEBHOOK7R6Z4C2J5K8
visora-event-type: moderation.completed
visora-timestamp: 1781889128
visora-signature: v1=4e8c...`;

const handleDecisionCode = [
  "switch (result.action) {",
  "  case \"allow\":",
  "    await publishImage(result.moderationId);",
  "    break;",
  "  case \"review\":",
  "    await markAsPendingReview(result.moderationId, result.explanation?.message);",
  "    break;",
  "  case \"reject\":",
  "    await blockImageUpload(result.explanation?.message ?? \"Image rejected\");",
  "    break;",
  "}",
].join("\n");

const retryCode = [
  "import { VisoraRateLimitError, VisoraTimeoutError } from \"@visoracloud/client\";",
  "",
  "try {",
  "  const result = await visora.moderateImage({ file, filename, contentType });",
  "  return result;",
  "} catch (error) {",
  "  if (error instanceof VisoraRateLimitError) {",
  "    return { error: \"Monthly moderation limit exceeded\" };",
  "  }",
  "  if (error instanceof VisoraTimeoutError) {",
  "    // Safe to retry once from your server worker or request handler.",
  "  }",
  "  throw error;",
  "}",
].join("\n");


const policyJson = [
  "{",
  "  \"reviewEnabled\": true,",
  "  \"reviewDisabledAction\": \"reject\",",
  "  \"minConfidence\": 70,",
  "  \"reviewThreshold\": 50,",
  "  \"rejectThreshold\": 80,",
  "  \"blockedCategories\": [\"nudity\", \"violence\", \"weapons\", \"drugs\"],",
  "  \"categoryActions\": {",
  "    \"nudity\": \"allow\",",
  "    \"violence\": \"review\",",
  "    \"weapons\": \"reject\",",
  "    \"drugs\": \"reject\"",
  "  },",
  "  \"compliancePack\": \"marketplace\"",
  "}",
].join("\n");

function plainLines(code: string): CodeLine[] {
  return code.trim().split("\n").map((value) => ({ tokens: [[value, "rgba(255,255,255,0.86)"]] }));
}


function TextCodeCard({ title, code, status }: { title: string; code: string; status?: string }) {
  const lines = useMemo(() => plainLines(code), [code]);

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

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "18px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid " + surface.borderFaint }}>
      <div style={{ fontSize: "14.5px", fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: "7px" }}>{title}</div>
      <div style={{ fontSize: "13.5px", lineHeight: 1.6, color: text.muted, fontWeight: 300 }}>{children}</div>
    </div>
  );
}

function EndpointCard({ method, path, auth, children }: { method: string; path: string; auth: string; children: React.ReactNode }) {
  const methodColor = method === "GET" ? "#7ee0a8" : "#aebfff";

  return (
    <div style={{ marginTop: "18px", padding: "20px", borderRadius: "12px", background: surface.card, border: "1px solid " + surface.borderFaint }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ fontFamily: MONO, fontSize: "12px", color: methodColor, background: "rgba(255,255,255,0.045)", border: "1px solid " + surface.border, borderRadius: "6px", padding: "4px 8px" }}>{method}</span>
        <code style={{ fontFamily: MONO, fontSize: "14px", color: "rgba(255,255,255,0.88)" }}>{path}</code>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: text.faint }}>{auth}</span>
      </div>
      <div style={{ marginTop: "13px", fontSize: "13.5px", lineHeight: 1.6, color: text.muted, fontWeight: 300 }}>{children}</div>
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ marginTop: "20px", overflowX: "auto", border: "1px solid " + surface.borderFaint, borderRadius: "12px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "680px" }}>
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
                <td key={cell + "-" + index} style={{ padding: "13px 14px", fontSize: "13.5px", lineHeight: 1.45, color: index === 0 ? "rgba(255,255,255,0.88)" : text.muted, borderBottom: "1px solid " + surface.borderFaint }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QuickstartArticle({ articleRef }: { articleRef?: React.Ref<HTMLElement> }) {
  const [pkg, setPkg] = useState<Pkg>("npm");
  const [lang, setLang] = useState<Lang>("node");

  return (
    <main ref={articleRef} className="docs-article" style={{ padding: "44px 56px 120px", minWidth: 0 }}>
      <div id="overview" style={{ scrollMarginTop: "80px", fontFamily: MONO, fontSize: "12px", letterSpacing: "0.06em", color: "#8fa0d8", marginBottom: "14px" }}>VISORA DEVELOPER DOCS</div>
      <h1 style={{ margin: 0, fontSize: "38px", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08 }}>Integrate image moderation into your app</h1>
      <p style={{ margin: "16px 0 0", fontSize: "16.5px", lineHeight: 1.6, color: text.body, fontWeight: 300, maxWidth: "760px" }}>
        Visora gives your backend one moderation decision per image: allow, review, or reject. Use the Node SDK for uploads, direct REST calls for custom stacks, and project policies to control what your product accepts.
      </p>
      <Lead>Current API base URL: <InlineCode>{API_BASE_URL}</InlineCode></Lead>

      <Callout>
        Treat Visora API keys like server secrets. Call Visora from your backend, API route, worker, or server action. Do not put <InlineCode>x-api-key</InlineCode> in frontend JavaScript, mobile clients, or public repositories.
      </Callout>

      <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginTop: "26px" }}>
        <InfoCard title="Backend-first integration">Your UI sends a file to your backend. Your backend calls Visora, stores the result, then decides whether to publish, queue, or block the image.</InfoCard>
        <InfoCard title="Project scoped security">Each API key belongs to a project. Uploaded S3 objects are scoped to that account/project and cannot be moderated by another project.</InfoCard>
        <InfoCard title="Human-readable decisions">Every moderation can include labels, risk score, brand safety, compliance, and a policy explanation like why weapons caused reject.</InfoCard>
      </div>

      <StepHeading id="install" step={1}>Install the SDK</StepHeading>
      <Lead>Use the official Node and TypeScript package. It wraps multipart uploads, JSON image-key moderation, logs, errors, timeouts, and webhook verification helpers. Webhook helpers are available in SDK v0.2 and newer.</Lead>
      <CodeCard>
        <CodeCardHeader style={{ padding: "6px 6px 0" }}>
          <CodeTabs tabs={PKG_TABS} active={pkg} onChange={setPkg} mono />
        </CodeCardHeader>
        <CodeBody style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
          <code style={{ fontFamily: MONO, fontSize: "14px", color: "rgba(255,255,255,0.9)" }}>
            <span style={{ color: text.ghost }}>$ </span>
            {INSTALL_COMMANDS[pkg]}
          </code>
          <CopyButton text={INSTALL_COMMANDS[pkg]} />
        </CodeBody>
      </CodeCard>

      <SectionHeading id="sdk-webhooks">SDK v0.2 webhook helpers</SectionHeading>
      <Lead>The SDK includes framework-safe helpers for signed webhook deliveries. Use them in backend routes only; webhook signing secrets must never be shipped to browser code.</Lead>
      <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginTop: "20px" }}>
        <InfoCard title="Signature verification"><InlineCode>verifyWebhookSignature()</InlineCode> validates <InlineCode>visora-signature</InlineCode> against the raw body and timestamp.</InfoCard>
        <InfoCard title="Framework helpers"><InlineCode>createNextWebhookHandler()</InlineCode> and <InlineCode>createExpressWebhookHandler()</InlineCode> parse, verify, and dispatch events.</InfoCard>
        <InfoCard title="Typed events"><InlineCode>VisoraWebhookEvent</InlineCode> narrows <InlineCode>event.data</InlineCode> based on <InlineCode>event.type</InlineCode>.</InfoCard>
      </div>
      <SimpleTable
        headers={["Export", "Use it for"]}
        rows={[
          ["verifyWebhookSignature", "Manual verification when you already own request parsing."],
          ["constructWebhookEvent", "Verify the signature and parse the raw payload into a typed event."],
          ["createNextWebhookHandler", "Next.js App Router route handlers that return 401 on invalid signatures."],
          ["createExpressWebhookHandler", "Express routes using express.raw({ type: \"application/json\" })."],
          ["VisoraWebhookEventType", "Event type unions for moderation and review events."],
          ["VisoraWebhookEvent", "Typed webhook envelope with narrowed data payloads."],
        ]}
      />
      <TextCodeCard title="SDK webhook imports" code={sdkWebhookImportsCode} />
      <TextCodeCard title="Typed event handling" code={sdkWebhookTypesCode} />

      <StepHeading id="api-key-auth" step={2}>Authenticate from server code</StepHeading>
      <Lead>Create a project in the dashboard, generate an API key, and store it as an environment variable in your backend runtime.</Lead>
      <CodeCard>
        <CodeCardHeader style={{ padding: "11px 18px" }}>
          <span style={{ fontFamily: MONO, fontSize: "12px", color: text.faint }}>.env</span>
        </CodeCardHeader>
        <CodeBody style={{ padding: "16px 20px" }}>
          <CodeLines lines={ENV_SAMPLE} />
        </CodeBody>
      </CodeCard>
      <Lead>The SDK defaults to the public Visora API URL. Pass <InlineCode>baseUrl</InlineCode> only when you need a staging or custom API Gateway stage.</Lead>

      <SectionHeading id="integration-flow">Recommended integration flow</SectionHeading>
      <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px", marginTop: "20px" }}>
        <InfoCard title="1. User uploads">Your product receives the image in a backend route, not directly in browser code that contains secrets.</InfoCard>
        <InfoCard title="2. Call Visora">Send the file with <InlineCode>moderateImage</InlineCode>. This uploads and scans in one call.</InfoCard>
        <InfoCard title="3. Branch on action">Use <InlineCode>allow</InlineCode>, <InlineCode>review</InlineCode>, or <InlineCode>reject</InlineCode> to control your product flow.</InfoCard>
        <InfoCard title="4. Store ids">Persist <InlineCode>moderationId</InlineCode>, <InlineCode>action</InlineCode>, and <InlineCode>explanation.message</InlineCode> next to your own image record.</InfoCard>
      </div>

      <StepHeading id="first-request" step={3}>Moderate your first image</StepHeading>
      <Lead>Use multipart moderation for most apps. It avoids making your integration manually request an upload URL and then call moderation separately.</Lead>
      <CodeCard shadow>
        <CodeCardHeader>
          <CodeTabs tabs={LANG_TABS} active={lang} onChange={setLang} />
          <CopyButton text={codeToText(CODE_SAMPLES[lang])} style={{ margin: "4px 0" }} />
        </CodeCardHeader>
        <CodeBody>
          <CodeLines lines={CODE_SAMPLES[lang]} />
        </CodeBody>
      </CodeCard>

      <SectionHeading id="handle-decisions">Handle decisions in your product</SectionHeading>
      <Lead>Your application should treat moderation as a product decision, not only as a list of labels. The stable field to branch on is <InlineCode>action</InlineCode>.</Lead>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "22px" }}>
        {DECISIONS.map((decision) => (
          <DecisionCard key={decision.label} decision={decision} />
        ))}
      </div>
      <TextCodeCard title="Application branching" code={handleDecisionCode} />

      <SectionHeading id="response-model">Moderation response</SectionHeading>
      <Lead><InlineCode>POST /moderate</InlineCode> is backward-compatible. Existing integrations can keep using <InlineCode>safe</InlineCode>, <InlineCode>action</InlineCode>, and <InlineCode>labels</InlineCode>; newer integrations can use policy explanations, risk score, brand safety, and compliance.</Lead>
      <CodeCard>
        <CodeCardHeader style={{ padding: "11px 18px", justifyContent: "flex-start", gap: "9px" }}>
          <span style={{ fontFamily: MONO, fontSize: "11px", color: "#7ee0a8", background: "rgba(120,224,168,0.1)", border: "1px solid rgba(120,224,168,0.25)", padding: "2px 8px", borderRadius: "5px" }}>200 OK</span>
          <span style={{ fontFamily: MONO, fontSize: "12px", color: text.faint }}>application/json</span>
        </CodeCardHeader>
        <CodeBody>
          <CodeLines lines={RESPONSE_SAMPLE} />
        </CodeBody>
      </CodeCard>
      <SimpleTable
        headers={["Field", "Type", "How to use it"]}
        rows={[
          ["moderationId", "string", "Store this id for audit trails, support, review queue lookups, and customer debugging."],
          ["safe", "boolean", "Convenience boolean. true only when final action is allow."],
          ["action", "allow | review | reject", "Primary field for product logic."],
          ["riskScore", "number", "0-100 score from matched labels and policy thresholds."],
          ["category", "string | null", "Main normalized category that drove the decision."],
          ["explanation", "object", "Developer-friendly reason for the decision."],
          ["labels", "array", "Detected moderation and supplemental labels with confidence and normalized category."],
          ["brandSafety", "object", "safe, caution, or unsafe assessment for brand suitability."],
          ["compliance", "object | null", "Pack-specific pass/fail result when a compliance pack is configured."],
        ]}
      />

      <SectionHeading id="decision-explanations">Policy decision explanations</SectionHeading>
      <Lead>Use <InlineCode>explanation.message</InlineCode> for dashboards, admin tools, and support logs. It explains the policy decision without requiring your team to reverse-engineer labels.</Lead>
      <SimpleTable
        headers={["Example message", "Meaning"]}
        rows={[
          ["Rejected because weapons matched reject action.", "The project has weapons configured as reject and a matching label crossed confidence rules."],
          ["Allowed because nudity matched allow action.", "The label is still returned, but the project policy explicitly allows that category."],
          ["Rejected because review is disabled and violence matched review action.", "Review mode is off for the project, so review decisions fall back to the configured yes/no behavior."],
          ["Allowed because no configured moderation categories matched this image.", "No policy category or threshold required review/reject."],
        ]}
      />

      <SectionHeading id="api-reference">Customer API reference</SectionHeading>
      <Lead>These routes are for customer integrations and use <InlineCode>x-api-key</InlineCode>. They are metered against the account monthly usage limit.</Lead>

      <EndpointCard method="POST" path="/moderate" auth="x-api-key required">
        Accepts multipart field <InlineCode>image</InlineCode> or JSON body <InlineCode>{"{ \"imageKey\": \"...\" }"}</InlineCode>. Multipart is recommended because it uploads and scans in one request. JSON image keys must belong to the authenticated account/project prefix.
      </EndpointCard>
      <div id="post-moderate" style={{ scrollMarginTop: "80px" }} />
      <TextCodeCard title="Multipart upload" code={multipartCurl} status="200 OK" />
      <TextCodeCard title="Existing S3 object" code={imageKeyCurl} status="200 OK" />

      <EndpointCard method="POST" path="/upload-url" auth="x-api-key required">
        Returns a 5 minute S3 presigned PUT URL and a scoped image key. Use this only when you specifically need direct S3 upload before moderation.
      </EndpointCard>
      <div id="post-upload-url" style={{ scrollMarginTop: "80px" }} />
      <TextCodeCard title="Create upload URL" code={uploadUrlCurl} status="200 OK" />

      <EndpointCard method="GET" path="/moderation-logs" auth="x-api-key required">
        Returns recent moderation logs for the authenticated project only. Logs include labels, decision fields, explanation, brand safety, compliance, imageKey, imageUrl when available, and createdAt.
      </EndpointCard>
      <div id="get-moderation-logs" style={{ scrollMarginTop: "80px" }} />
      <TextCodeCard title="List logs" code={logsCurl} status="200 OK" />

      <EndpointCard method="GET" path="/health" auth="public">
        Returns <InlineCode>{"{\"status\":\"ok\"}"}</InlineCode>. Use it for uptime checks.
      </EndpointCard>

      <SectionHeading id="review-queue">Review queue</SectionHeading>
      <Lead>When a project has review mode enabled, <InlineCode>review</InlineCode> decisions can be sent to the project review queue. This lets a human approve or reject specific images from the dashboard without changing the public moderation response contract.</Lead>
      <SimpleTable
        headers={["Concept", "Behavior"]}
        rows={[
          ["Project setting", "reviewEnabled controls whether review decisions enter manual review or fall back to a yes/no action."],
          ["Queue scope", "Review items are scoped by account and project. The dashboard sidebar shows the count."],
          ["Image previews", "Rejected/review-sensitive images can be blurred in the dashboard and revealed intentionally."],
          ["Developer flow", "Treat action=review as pending in your app, then resolve it with your internal admin process."],
        ]}
      />


      <SectionHeading id="webhooks">Webhooks</SectionHeading>
      <Lead>Use webhooks to receive moderation and review events in your backend without polling. Webhooks are configured per project from the dashboard, and each endpoint subscribes only to the event types you select.</Lead>
      <Callout>
        Copy the webhook signing secret when you create the endpoint. Visora only shows it once. Store it as <InlineCode>VISORA_WEBHOOK_SECRET</InlineCode> in your server environment and verify every delivery before trusting the payload.
      </Callout>
      <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginTop: "20px" }}>
        <InfoCard title="1. Create endpoint">Open a project, add your HTTPS endpoint URL, select the subscribed events, then copy the signing secret.</InfoCard>
        <InfoCard title="2. Verify signature">Use <InlineCode>verifyWebhookSignature()</InlineCode> or a framework helper from <InlineCode>@visoracloud/client</InlineCode>.</InfoCard>
        <InfoCard title="3. Return 2xx">Return any 2xx status after processing. Non-2xx responses are treated as delivery failures and retried.</InfoCard>
      </div>

      <SectionHeading id="webhook-events">Webhook event types</SectionHeading>
      <Lead>Webhook payloads share the same top-level envelope: <InlineCode>id</InlineCode>, <InlineCode>type</InlineCode>, <InlineCode>createdAt</InlineCode>, <InlineCode>accountId</InlineCode>, <InlineCode>projectId</InlineCode>, and <InlineCode>data</InlineCode>.</Lead>
      <SimpleTable
        headers={["Event", "When it fires", "Typical use"]}
        rows={[
          ["moderation.completed", "After a successful POST /moderate request.", "Sync the final action, risk score, explanation, labels, brand safety, and compliance result to your app."],
          ["moderation.review_required", "When a moderation result creates a review queue item.", "Notify reviewers, open an internal task, or mark your own image record as pending."],
          ["review.approved", "When a queued review item is approved in the dashboard.", "Publish or unlock an image that was waiting for human review."],
          ["review.rejected", "When a queued review item is rejected in the dashboard.", "Remove, hide, or keep blocking an image after human review."],
        ]}
      />
      <TextCodeCard title="Webhook payload" code={webhookPayloadJson} status="POST" />

      <SectionHeading id="webhook-signatures">Verify webhook signatures</SectionHeading>
      <Lead>Every delivery includes signing headers. The SDK verifies the HMAC input <InlineCode>{`visora-timestamp + "." + rawBody`}</InlineCode>, supports a five minute replay window by default, and can accept both current and previous secrets during rotation. If verification fails, the Next.js helper returns <InlineCode>401</InlineCode>; the Express helper returns <InlineCode>401</InlineCode> unless you pass your own error middleware.</Lead>
      <TextCodeCard title="Delivery headers" code={webhookHeadersCode} />
      <TextCodeCard title="verifyWebhookSignature()" code={webhookVerifyCode} />
      <TextCodeCard title="Next.js webhook route" code={webhookNextHandlerCode} />
      <TextCodeCard title="Express webhook route" code={webhookExpressHandlerCode} />
      <TextCodeCard title="Secret rotation window" code={webhookRotationCode} />
      <SimpleTable
        headers={["Header", "Description"]}
        rows={[
          ["visora-event-id", "Unique event id. Store it to make your handler idempotent."],
          ["visora-event-type", "One of moderation.completed, moderation.review_required, review.approved, or review.rejected."],
          ["visora-timestamp", "Unix timestamp used in the signature input."],
          ["visora-signature", "HMAC SHA-256 signature in v1=<hex> format. Verify with verifyWebhookSignature()."],
        ]}
      />
      <SimpleTable
        headers={["Delivery status", "Meaning"]}
        rows={[
          ["pending", "The event has been created and is waiting for delivery."],
          ["delivered", "The endpoint returned a successful 2xx response."],
          ["failed", "The endpoint returned a non-2xx response or timed out."],
          ["skipped", "No active webhook endpoint was subscribed to the event type."],
        ]}
      />

      <SectionHeading id="policies">Project policies</SectionHeading>
      <Lead>Policies live inside each project and control the main <InlineCode>action</InlineCode>, <InlineCode>safe</InlineCode>, <InlineCode>riskScore</InlineCode>, and <InlineCode>category</InlineCode>. Category actions take priority over generic thresholds.</Lead>
      <TextCodeCard title="Project policy example" code={policyJson} />
      <Lead>If a project sets <InlineCode>nudity: allow</InlineCode>, nudity labels still appear in responses and logs, but the final action can be <InlineCode>allow</InlineCode> for that project.</Lead>
      <Lead>Supported categories: {categories.map((category, index) => <React.Fragment key={category}><InlineCode>{category}</InlineCode>{index < categories.length - 1 ? " " : ""}</React.Fragment>)}</Lead>

      <SectionHeading id="brand-safety">Brand safety</SectionHeading>
      <Lead>Brand safety is an additional evaluation layer based on the final action, risk score, and detected categories. Use it when your product needs a simpler safe/caution/unsafe signal for business workflows.</Lead>
      <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginTop: "20px" }}>
        <InfoCard title="safe">Final action is allow and no unsafe brand categories are present.</InfoCard>
        <InfoCard title="caution">Final action is review, or detected content is sensitive but not hard-blocked by policy.</InfoCard>
        <InfoCard title="unsafe">Final action is reject, or categories like weapons, drugs, hate symbols, violence, or nudity make it unsuitable.</InfoCard>
      </div>

      <SectionHeading id="compliance-packs">Compliance packs</SectionHeading>
      <Lead>Compliance packs are presets evaluated in addition to the active project policy. They do not replace the main project action; they report whether the image passes a use-case-specific standard.</Lead>
      <Lead>Supported packs: {compliancePacks.map((pack, index) => <React.Fragment key={pack}><InlineCode>{pack}</InlineCode>{index < compliancePacks.length - 1 ? " " : ""}</React.Fragment>)}</Lead>
      <SimpleTable
        headers={["Pack", "Typical use", "Strict areas"]}
        rows={[
          ["marketplace", "Commerce listings and user-generated product images.", "nudity, weapons, drugs, hate symbols; violence usually review."],
          ["kids", "Child-safe products or communities.", "Most sensitive categories reject; alcohol/gambling review."],
          ["education", "Learning platforms and classroom content.", "nudity, suggestive, weapons, drugs, hate symbols."],
          ["social", "Social feeds and community apps.", "Hard-block hate symbols; review several risky categories."],
          ["dating", "Dating and profile content.", "Reject violence, weapons, drugs, hate symbols; suggestive can allow."],
          ["ads", "Ad creative checks.", "Strict on nudity, violence, weapons, drugs; alcohol/gambling review."],
        ]}
      />

      <SectionHeading id="scoped-uploads">Scoped uploads</SectionHeading>
      <Lead>Uploaded images are owned by the account and project from the authenticated API key. Generated keys use this format:</Lead>
      <TextCodeCard title="S3 key format" code="accounts/{accountId}/projects/{projectId}/uploads/{ulid}.jpg" />
      <Lead><InlineCode>POST /moderate</InlineCode> rejects image keys outside the authenticated prefix with <InlineCode>403</InlineCode> and <InlineCode>You do not have access to this image</InlineCode>. This check avoids extra S3 or DynamoDB reads.</Lead>

      <SectionHeading id="plans">Plans, limits, and retention</SectionHeading>
      <Lead>Plans control monthly usage, project/key limits, overage behavior, and S3/log retention. Free plans block at the monthly limit; paid plans can continue and track overage.</Lead>
      <SimpleTable headers={["Plan", "Price", "Moderations", "Projects", "API keys", "Retention", "Overage"]} rows={planRows} />

      <SectionHeading id="errors">Errors and retries</SectionHeading>
      <Lead>Errors are returned as JSON with a clear <InlineCode>error</InlineCode> message. The SDK maps common failures to typed errors so integrations can handle auth, validation, limits, and timeouts cleanly.</Lead>
      <SimpleTable headers={["Status", "Meaning", "When it happens"]} rows={errorRows} />
      <TextCodeCard title="SDK error handling" code={retryCode} />
      <SimpleTable
        headers={["SDK error", "Use case"]}
        rows={[
          ["VisoraApiError", "Base class for non-2xx API responses."],
          ["VisoraAuthError", "401 or 403 authentication/authorization failures."],
          ["VisoraRateLimitError", "429 monthly usage limit exceeded."],
          ["VisoraValidationError", "400 request validation failures."],
          ["VisoraTimeoutError", "Client-side request timeout."],
        ]}
      />

      <SectionHeading>Next steps</SectionHeading>
      <div className="r-cols-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "22px" }}>
        {NEXT_STEPS.map((step) => (
          <NextStepCard key={step.title} step={step} />
        ))}
      </div>

      <DocFooterNav prev={FOOTER_NAV.prev} next={FOOTER_NAV.next} />
    </main>
  );
}
