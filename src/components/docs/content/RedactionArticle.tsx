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
  ["faceBlur", "boolean", "Blur or black-box detected faces."],
  ["textBlur", "boolean", "Enable OCR-based text redaction."],
  ["licensePlateBlur", "boolean", "Redact license plate-like text detected in the image."],
  ["redactionStyle", "blur | black_box", "Choose visual treatment for redacted regions."],
  ["textCategories", "sexual | profanity | credentials | id_document", "Optional text categories to redact when textBlur is enabled."],
  ["customWords", "string[]", "Exact words or phrases your project wants to redact."],
  ["ignoredWords", "string[]", "Words that should not be redacted, useful for ID labels like name or address."],
  ["minConfidence", "number", "Minimum detection confidence from 0 to 100. Default is 80."],
];

const errorRows = [
  ["400", "Missing image, invalid JSON, unsupported image type, empty file, or file larger than 8 MB."],
  ["401", "Missing or invalid x-api-key."],
  ["403", "Free plan, non-redaction project API key, revoked key, or imageKey outside the project scope."],
  ["429", "Monthly usage limit exceeded."],
  ["500", "Unexpected image download, image processing, storage, or detection failure."],
];

const sdkUploadCode = `import { readFile } from "node:fs/promises";
import { Visora } from "@visoracloud/client";

const visora = new Visora({
  apiKey: process.env.VISORA_REDACTION_API_KEY!,
});

const image = await readFile("./profile.jpg");

const result = await visora.redactImage({
  file: image,
  filename: "profile.jpg",
  contentType: "image/jpeg",
});

console.log(result.redactionId);
console.log(result.redactedImageUrl);`;

const sdkImageKeyCode = `const result = await visora.redactImageKey({
  imageKey: "accounts/acc_123/projects/proj_123/uploads/image.jpg",
});`;

const nextRouteCode = `import { Visora } from "@visoracloud/client";

const visora = new Visora({ apiKey: process.env.VISORA_REDACTION_API_KEY! });

export async function POST(request: Request) {
  const form = await request.formData();
  const image = form.get("image") as File | null;

  if (!image) {
    return Response.json({ error: "Missing image" }, { status: 400 });
  }

  const result = await visora.redactImage({
    file: Buffer.from(await image.arrayBuffer()),
    filename: image.name,
    contentType: image.type || "image/jpeg",
  });

  return Response.json({
    redactionId: result.redactionId,
    redactedImageUrl: result.redactedImageUrl,
    counts: {
      faces: result.facesBlurred,
      text: result.textBlurred,
      licensePlates: result.licensePlatesBlurred,
    },
  });
}`;

const curlMultipartCode = `curl -X POST "$VISORA_API_URL/redact" \\
  -H "x-api-key: $VISORA_REDACTION_API_KEY" \\
  -F "image=@./profile.jpg;type=image/jpeg"`;

const curlImageKeyCode = `curl -X POST "$VISORA_API_URL/redact" \\
  -H "content-type: application/json" \\
  -H "x-api-key: $VISORA_REDACTION_API_KEY" \\
  -d '{"imageKey":"accounts/acc_123/projects/proj_123/uploads/image.jpg"}'`;

const responseCode = `{
  "redactionId": "red_01KVMZ6K4RBZ1PAMWJH7EK4XQW",
  "imageKey": "accounts/acc_123/projects/proj_123/uploads/profile.jpg",
  "redactedImageKey": "accounts/acc_123/projects/proj_123/redacted/01KVMZ6K.jpg",
  "redactedImageUrl": "https://...",
  "facesBlurred": 1,
  "textBlurred": 2,
  "licensePlatesBlurred": 1,
  "faces": [
    {
      "confidence": 99.7,
      "boundingBox": { "left": 0.34, "top": 0.18, "width": 0.16, "height": 0.22 }
    }
  ],
  "regions": [
    {
      "type": "license_plate",
      "text": "GR-3004D",
      "confidence": 93.1,
      "boundingBox": { "left": 0.41, "top": 0.78, "width": 0.14, "height": 0.05 }
    }
  ]
}`;

const typesCode = `type RedactionStyle = "blur" | "black_box";
type RedactionTextCategory = "sexual" | "profanity" | "credentials" | "id_document";

interface RedactionSettings {
  faceBlur: boolean;
  textBlur: boolean;
  licensePlateBlur: boolean;
  redactionStyle: RedactionStyle;
  textCategories: RedactionTextCategory[];
  customWords: string[];
  ignoredWords: string[];
  minConfidence: number;
}`;

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

export const REDACTION_NAV_GROUPS = [
  {
    title: "Redaction",
    items: [
      { label: "Overview", href: "#overview" },
      { label: "SDK usage", href: "#sdk" },
      { label: "REST API", href: "#rest" },
      { label: "Project settings", href: "#settings" },
      { label: "Response model", href: "#response" },
      { label: "Errors", href: "#errors" },
    ],
  },
  {
    title: "More Docs",
    items: [
      { label: "Moderation API", href: "/docs" },
      { label: "Webhooks", href: "/docs#webhooks" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
];

export const REDACTION_TOC_ITEMS = [
  { label: "Overview", href: "#overview" },
  { label: "SDK", href: "#sdk" },
  { label: "REST", href: "#rest" },
  { label: "Settings", href: "#settings" },
  { label: "Response", href: "#response" },
  { label: "Errors", href: "#errors" },
];

export function RedactionArticle({ articleRef }: { articleRef?: React.Ref<HTMLElement> }) {
  return (
    <main ref={articleRef} className="docs-article" style={{ padding: "44px 56px 120px", minWidth: 0 }}>
      <div id="overview" style={{ scrollMarginTop: "80px", fontFamily: MONO, fontSize: "12px", letterSpacing: "0.06em", color: "#8fa0d8", marginBottom: "14px" }}>VISORA REDACTION DOCS</div>
      <h1 style={{ margin: 0, fontSize: "38px", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08 }}>Integrate image redaction into your app</h1>
      <p style={{ margin: "16px 0 0", fontSize: "16.5px", lineHeight: 1.6, color: text.body, fontWeight: 300, maxWidth: "760px" }}>
        Redaction projects process images and return a new redacted image. Use this for face blur, OCR text blur, custom word redaction, ID-document sensitive fields, and license plates.
      </p>
      <Lead>Current API base URL: <InlineCode>{API_BASE_URL}</InlineCode></Lead>

      <Callout>
        Redaction API keys must be used from server code only. Redaction is available on paid plans and requires an API key attached to a <InlineCode>redaction</InlineCode> project.
      </Callout>

      <div className="r-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginTop: "26px" }}>
        <div style={{ padding: "18px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid " + surface.borderFaint }}><strong style={{ color: "#fff", fontSize: "14.5px" }}>Faces</strong><div style={{ marginTop: "7px", color: text.muted, fontSize: "13.5px", lineHeight: 1.6 }}>Detect and redact faces in user photos, profiles, screenshots, and media uploads.</div></div>
        <div style={{ padding: "18px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid " + surface.borderFaint }}><strong style={{ color: "#fff", fontSize: "14.5px" }}>Text</strong><div style={{ marginTop: "7px", color: text.muted, fontSize: "13.5px", lineHeight: 1.6 }}>Redact selected text categories, custom words, and sensitive ID-document values.</div></div>
        <div style={{ padding: "18px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid " + surface.borderFaint }}><strong style={{ color: "#fff", fontSize: "14.5px" }}>License plates</strong><div style={{ marginTop: "7px", color: text.muted, fontSize: "13.5px", lineHeight: 1.6 }}>Detect plate-like OCR values and redact them before image delivery.</div></div>
      </div>

      <SectionHeading id="sdk">SDK usage</SectionHeading>
      <Lead>Install <InlineCode>@visoracloud/client</InlineCode> and call <InlineCode>redactImage()</InlineCode> when your backend receives an upload. The SDK sends multipart data to <InlineCode>POST /redact</InlineCode>.</Lead>
      <TextCodeCard title="Install" code="npm install @visoracloud/client" />
      <TextCodeCard title="Upload and redact" code={sdkUploadCode} />
      <Lead>If you already uploaded an object through Visora scoped upload paths, call <InlineCode>redactImageKey()</InlineCode>. The key must belong to the same project as the API key.</Lead>
      <TextCodeCard title="Redact an existing image key" code={sdkImageKeyCode} />
      <TextCodeCard title="Next.js server route" code={nextRouteCode} />

      <SectionHeading id="rest">REST API</SectionHeading>
      <Lead><InlineCode>POST /redact</InlineCode> accepts either multipart file upload or JSON with an existing scoped image key.</Lead>
      <TextCodeCard title="Multipart" code={curlMultipartCode} status="200 OK" />
      <TextCodeCard title="Existing imageKey" code={curlImageKeyCode} status="200 OK" />

      <SectionHeading id="settings">Project settings</SectionHeading>
      <Lead>Settings are configured per redaction project in the dashboard. They are not sent on every API request, which keeps production requests simple and consistent.</Lead>
      <SimpleTable headers={["Setting", "Type", "Behavior"]} rows={settingsRows} />
      <TextCodeCard title="Exported SDK types" code={typesCode} />

      <SectionHeading id="response">Response model</SectionHeading>
      <Lead>The response includes the original object key, the redacted object key, a temporary 5 minute <InlineCode>redactedImageUrl</InlineCode>, aggregate counts, and normalized bounding boxes for the redacted regions.</Lead>
      <TextCodeCard title="200 OK" code={responseCode} status="application/json" />

      <SectionHeading id="errors">Errors and constraints</SectionHeading>
      <SimpleTable headers={["Status", "Meaning"]} rows={errorRows} />
      <Lead>Supported upload types are JPEG and PNG. Multipart images must be 8 MB or smaller. Usage is counted against the same account-level monthly usage system as moderation.</Lead>

      <DocFooterNav prev={{ label: "Moderation docs", href: "/docs" }} next={{ label: "Dashboard", href: "/dashboard" }} />
    </main>
  );
}
