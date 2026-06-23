"use client";

import React, { useMemo } from "react";
import { MONO, surface, text } from "../theme";
import { CodeBody, CodeCard, CodeCardHeader } from "../code/CodeCard";
import { CodeLines } from "../code/CodeLines";
import { CopyButton } from "../code/CopyButton";
import { highlightCode } from "../code/highlight";
import { Callout, DocFooterNav, InlineCode, Lead, SectionHeading } from "../primitives";

const API_BASE_URL = "https://6p0ws7vu2f.execute-api.us-east-1.amazonaws.com/dev";

const settingsRows = [
  ["faceMatchThreshold", "number", "Face similarity (0-100) at/above which the result is auto-approved as verified. Default 90."],
  ["faceMatchRejectBelow", "number", "Face similarity below which the result is rejected outright. Default 60. Always kept at or below faceMatchThreshold."],
  ["requireUnexpiredDocument", "boolean", "Reject the verification when the document's expiration date has passed. Default true."],
];

const decisionRows = [
  ["verified", "Face match at/above faceMatchThreshold, a detected and unexpired document, and a passing selfie."],
  ["rejected", "No document detected, no face in the document or selfie, an expired document, or face match below faceMatchRejectBelow."],
  ["review", "Anything in between — e.g. a borderline face match, or a low-quality selfie. Hand off to a human."],
];

const errorRows = [
  ["400", "Missing document or selfie, invalid JSON, unsupported image type, empty file, or a file larger than 8 MB."],
  ["401", "Missing or invalid x-api-key."],
  ["403", "Non-verify project API key, revoked key, imageKey outside the project scope, or free-plan monthly verification limit reached."],
  ["429", "Account monthly usage limit exceeded."],
  ["500", "Unexpected document analysis, face comparison, or storage failure."],
];

const sdkUploadCode = `import { readFile } from "node:fs/promises";
import { Visora } from "@visoracloud/client";

const visora = new Visora({
  apiKey: process.env.VISORA_VERIFY_API_KEY!,
});

const [document, selfie] = await Promise.all([
  readFile("./id-document.jpg"),
  readFile("./selfie.jpg"),
]);

const result = await visora.verifyImage({
  document,
  selfie,
  contentType: "image/jpeg",
});

console.log(result.decision);              // "verified" | "review" | "rejected"
console.log(result.faceMatch.similarity);  // 0-100
console.log(result.reasons);`;

const sdkImageKeyCode = `const result = await visora.verifyImageKey({
  documentImageKey: "accounts/acc_123/projects/proj_123/uploads/document.jpg",
  selfieImageKey: "accounts/acc_123/projects/proj_123/uploads/selfie.jpg",
});`;

const curlMultipartCode = `curl -X POST "$VISORA_API_URL/verify" \\
  -H "x-api-key: $VISORA_VERIFY_API_KEY" \\
  -F "document=@./id-document.jpg;type=image/jpeg" \\
  -F "selfie=@./selfie.jpg;type=image/jpeg"`;

const curlImageKeyCode = `curl -X POST "$VISORA_API_URL/verify" \\
  -H "content-type: application/json" \\
  -H "x-api-key: $VISORA_VERIFY_API_KEY" \\
  -d '{
    "documentImageKey": "accounts/acc_123/projects/proj_123/uploads/document.jpg",
    "selfieImageKey": "accounts/acc_123/projects/proj_123/uploads/selfie.jpg"
  }'`;

const responseCode = `{
  "verificationId": "ver_01KVMZ6K4RBZ1PAMWJH7EK4XQW",
  "decision": "verified",
  "confidence": 96,
  "reasons": [],
  "document": {
    "detected": true,
    "type": "DRIVER LICENSE",
    "fields": [
      { "key": "FIRST_NAME", "value": "ALEX", "confidence": 99.1 },
      { "key": "EXPIRATION_DATE", "value": "2029-04-12", "confidence": 98.4 }
    ],
    "expired": false,
    "expirationDate": "2029-04-12"
  },
  "faceMatch": { "matched": true, "similarity": 96 },
  "selfie": {
    "quality": "pass",
    "faceCount": 1,
    "checks": {
      "singleFace": true,
      "eyesOpen": true,
      "noSunglasses": true,
      "sharp": true,
      "wellLit": true
    }
  },
  "documentImageKey": "accounts/acc_123/projects/proj_123/uploads/document.jpg",
  "selfieImageKey": "accounts/acc_123/projects/proj_123/uploads/selfie.jpg",
  "createdAt": "2026-06-23T18:24:11.300Z"
}`;

const typesCode = `interface VerifySettings {
  faceMatchThreshold: number;        // auto-approve at/above this (default 90)
  faceMatchRejectBelow: number;      // reject below this (default 60)
  requireUnexpiredDocument: boolean; // reject expired documents (default true)
}`;

const webhookEventCode = `{
  "id": "evt_01KVMZ7P2YQ9XJ8R5C3F0N2T6B",
  "type": "verification.completed",
  "createdAt": "2026-06-23T18:24:11.482Z",
  "accountId": "acc_123",
  "projectId": "proj_123",
  "data": {
    "verificationId": "ver_01KVMZ6K4RBZ1PAMWJH7EK4XQW",
    "decision": "verified",
    "confidence": 96,
    "faceMatchSimilarity": 96,
    "documentType": "DRIVER LICENSE",
    "documentDetected": true,
    "documentExpired": false,
    "selfieQuality": "pass",
    "reasons": [],
    "createdAt": "2026-06-23T18:24:11.300Z"
  }
}`;

const webhookHandlerCode = `import { createNextWebhookHandler } from "@visoracloud/client";

// Visora signs every delivery; the handler verifies the signature for you.
export const POST = createNextWebhookHandler({
  secret: process.env.VISORA_WEBHOOK_SECRET!,
  onEvent: async (event) => {
    if (event.type === "verification.completed") {
      // event.data is narrowed to VisoraVerificationCompletedData
      const { verificationId, decision, faceMatchSimilarity } = event.data;
      console.log("Verification", verificationId, "->", decision);
      console.log("Face match", faceMatchSimilarity + "%");
    }
  },
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

export const VERIFY_NAV_GROUPS = [
  {
    title: "Verify",
    items: [
      { label: "Overview", href: "#overview" },
      { label: "SDK usage", href: "#sdk" },
      { label: "REST API", href: "#rest" },
      { label: "Decisions", href: "#decisions" },
      { label: "Project settings", href: "#settings" },
      { label: "Response model", href: "#response" },
      { label: "Webhooks", href: "#webhooks" },
      { label: "Errors", href: "#errors" },
    ],
  },
  {
    title: "More Docs",
    items: [
      { label: "Moderation API", href: "/docs" },
      { label: "Redaction API", href: "/docs/redaction" },
      { label: "Webhooks API", href: "/docs/webhooks" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
];

export const VERIFY_TOC_ITEMS = [
  { label: "Overview", href: "#overview" },
  { label: "SDK", href: "#sdk" },
  { label: "REST", href: "#rest" },
  { label: "Decisions", href: "#decisions" },
  { label: "Settings", href: "#settings" },
  { label: "Response", href: "#response" },
  { label: "Webhooks", href: "#webhooks" },
  { label: "Errors", href: "#errors" },
];

export function VerifyArticle({ articleRef }: { articleRef?: React.Ref<HTMLElement> }) {
  return (
    <main ref={articleRef} className="docs-article" style={{ padding: "44px 56px 120px", minWidth: 0 }}>
      <div id="overview" style={{ scrollMarginTop: "80px", fontFamily: MONO, fontSize: "12px", letterSpacing: "0.06em", color: "#8fa0d8", marginBottom: "14px" }}>VISORA VERIFY DOCS</div>
      <h1 style={{ margin: 0, fontSize: "38px", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08 }}>Verify identities with a document and a selfie</h1>
      <p style={{ margin: "16px 0 0", fontSize: "16.5px", lineHeight: 1.6, color: text.body, fontWeight: 300, maxWidth: "760px" }}>
        Verify projects run three checks on a single request — document authenticity, face match, and selfie quality — and return one decision: verified, review, or rejected.
      </p>
      <Lead>Current API base URL: <InlineCode>{API_BASE_URL}</InlineCode></Lead>

      <Callout>
        Verify API keys must be used from server code only, with an API key attached to a <InlineCode>verify</InlineCode> project. Each plan includes a monthly allotment of verifications; paid plans bill $0.40 per verification beyond it, and the free plan is capped at its allotment.
      </Callout>

      <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginTop: "26px" }}>
        <div style={{ padding: "18px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid " + surface.borderFaint }}><strong style={{ color: "#fff", fontSize: "14.5px" }}>Document</strong><div style={{ marginTop: "7px", color: text.muted, fontSize: "13.5px", lineHeight: 1.6 }}>Reads the ID with OCR, extracts fields, and checks it is a real, unexpired document.</div></div>
        <div style={{ padding: "18px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid " + surface.borderFaint }}><strong style={{ color: "#fff", fontSize: "14.5px" }}>Face match</strong><div style={{ marginTop: "7px", color: text.muted, fontSize: "13.5px", lineHeight: 1.6 }}>Compares the selfie against the document portrait and returns a 0-100 similarity.</div></div>
        <div style={{ padding: "18px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid " + surface.borderFaint }}><strong style={{ color: "#fff", fontSize: "14.5px" }}>Selfie quality</strong><div style={{ marginTop: "7px", color: text.muted, fontSize: "13.5px", lineHeight: 1.6 }}>Anti-spoof signals: a single, clear, well-lit face with eyes open and no sunglasses.</div></div>
      </div>

      <SectionHeading id="sdk">SDK usage</SectionHeading>
      <Lead>Install <InlineCode>@visoracloud/client</InlineCode> and call <InlineCode>verifyImage()</InlineCode> with a document and a selfie. The SDK sends multipart data to <InlineCode>POST /verify</InlineCode>.</Lead>
      <TextCodeCard title="Install" code="npm install @visoracloud/client" />
      <TextCodeCard title="Verify a document and selfie" code={sdkUploadCode} />
      <Lead>If both images were already uploaded through Visora scoped upload paths, call <InlineCode>verifyImageKey()</InlineCode>. Both keys must belong to the same project as the API key.</Lead>
      <TextCodeCard title="Verify existing image keys" code={sdkImageKeyCode} />

      <SectionHeading id="rest">REST API</SectionHeading>
      <Lead><InlineCode>POST /verify</InlineCode> accepts either a multipart upload with <InlineCode>document</InlineCode> and <InlineCode>selfie</InlineCode> files, or JSON with two existing scoped image keys.</Lead>
      <TextCodeCard title="Multipart" code={curlMultipartCode} status="200 OK" />
      <TextCodeCard title="Existing image keys" code={curlImageKeyCode} status="200 OK" />

      <SectionHeading id="decisions">Decisions</SectionHeading>
      <Lead>Every verification resolves to one of three decisions. The two face-match cutoffs are configured per project (see settings) and the score in between is sent to review.</Lead>
      <SimpleTable headers={["Decision", "When"]} rows={decisionRows} />
      <Callout>
        Use <InlineCode>verified</InlineCode> to let users through automatically, <InlineCode>review</InlineCode> to route to a human queue, and <InlineCode>rejected</InlineCode> to block. <InlineCode>reasons</InlineCode> explains every non-verified outcome.
      </Callout>

      <SectionHeading id="settings">Project settings</SectionHeading>
      <Lead>Thresholds are configured per verify project in the dashboard, so production requests stay simple — you only send the two images.</Lead>
      <SimpleTable headers={["Setting", "Type", "Behavior"]} rows={settingsRows} />
      <TextCodeCard title="Exported SDK type" code={typesCode} />

      <SectionHeading id="response">Response model</SectionHeading>
      <Lead>The response includes the decision and a 0-100 confidence, the extracted document fields, the face-match similarity, the selfie quality checks, and the scoped image keys.</Lead>
      <TextCodeCard title="200 OK" code={responseCode} status="application/json" />

      <SectionHeading id="webhooks">Webhooks</SectionHeading>
      <Lead>Subscribe a <InlineCode>verify</InlineCode> project endpoint to the <InlineCode>verification.completed</InlineCode> event in the dashboard. Every successful <InlineCode>POST /verify</InlineCode> emits one. Deliveries are asynchronous, HMAC-signed, and retried, so they never block the verification response. Payloads are privacy-preserving and never include raw document field values.</Lead>
      <TextCodeCard title="verification.completed event" code={webhookEventCode} status="POST to your endpoint" />
      <Lead>Each delivery carries <InlineCode>visora-timestamp</InlineCode> and <InlineCode>visora-signature</InlineCode> headers. The SDK verifies the signature and narrows <InlineCode>event.data</InlineCode> by event type.</Lead>
      <TextCodeCard title="Next.js webhook route" code={webhookHandlerCode} />

      <SectionHeading id="errors">Errors and constraints</SectionHeading>
      <SimpleTable headers={["Status", "Meaning"]} rows={errorRows} />
      <Lead>Supported upload types are JPEG and PNG. Each image must be 8 MB or smaller. Verifications count against the same account-level monthly usage system as moderation and redaction.</Lead>

      <DocFooterNav prev={{ label: "Redaction docs", href: "/docs/redaction" }} next={{ label: "Dashboard", href: "/dashboard" }} />
    </main>
  );
}
