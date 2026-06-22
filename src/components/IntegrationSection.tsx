"use client";

import { useState, type CSSProperties, type ComponentType } from "react";
import {
  SiNodedotjs,
  SiNextdotjs,
  SiNuxt,
  SiExpress,
  SiAstro,
  SiVercel,
  SiSupabase,
  SiPython,
  SiFastapi,
  SiGo,
} from "react-icons/si";
import { FaAws } from "react-icons/fa6";
import { Zap } from "lucide-react";

/* Visora — landing integration section. Two levels: technology (top icons)
   and the frameworks within it (pills inside the console). */

const MONO = "'JetBrains Mono', monospace";

const COLORS = {
  kw: "#aebfff",
  str: "#c7d2ff",
  com: "rgba(255,255,255,0.34)",
  d: "rgba(255,255,255,0.7)",
} as const;

const KW = new Set([
  "import", "from", "export", "const", "let", "var", "await", "async", "function",
  "return", "if", "else", "new", "for", "def", "with", "as", "in", "not", "and",
  "or", "struct", "bool", "string", "func", "package", "type", "interface",
  "public", "void", "default", "class", "try",
]);

type Tok = { t: string; c?: keyof typeof COLORS };

function tokenizeLine(line: string): Tok[] {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("//") || trimmed.startsWith("#")) return [{ t: line, c: "com" }];

  const out: Tok[] = [];
  const strRe = /(['"`])(?:\\.|(?!\1).)*\1/g;
  let last = 0;
  let m: RegExpExecArray | null;

  const pushPlain = (text: string) => {
    text.split(/(\b\w+\b)/).forEach((tok) => {
      if (!tok) return;
      out.push(KW.has(tok) ? { t: tok, c: "kw" } : { t: tok });
    });
  };

  while ((m = strRe.exec(line))) {
    if (m.index > last) pushPlain(line.slice(last, m.index));
    out.push({ t: m[0], c: "str" });
    last = m.index + m[0].length;
  }
  if (last < line.length) pushPlain(line.slice(last));
  return out;
}

type IconCmp = ComponentType<{ size?: number }>;
type Framework = { key: string; name: string; Icon: IconCmp; file: string; code: string };
type Tech = { key: string; name: string; Icon: IconCmp; frameworks: Framework[] };

const TECHS: Tech[] = [
  {
    key: "node",
    name: "Node.js",
    Icon: SiNodedotjs,
    frameworks: [
      {
        key: "node", name: "Node.js", Icon: SiNodedotjs, file: "moderate.ts",
        code: `import { readFile } from "node:fs/promises";
import { Visora } from "@visoracloud/client";

const visora = new Visora({ apiKey: process.env.VISORA_API_KEY });

const result = await visora.moderateImage({
  file: await readFile("upload.jpg"),
  filename: "upload.jpg",
  contentType: "image/jpeg",
});

if (!result.safe) {
  console.log(result.action, result.category);
}`,
      },
      {
        key: "nextjs", name: "Next.js", Icon: SiNextdotjs, file: "app/api/moderate/route.ts",
        code: `import { Visora } from "@visoracloud/client";

const visora = new Visora({ apiKey: process.env.VISORA_API_KEY });

export async function POST(req: Request) {
  const form = await req.formData();
  const image = form.get("image") as File;

  const result = await visora.moderateImage({
    file: Buffer.from(await image.arrayBuffer()),
    filename: image.name,
    contentType: image.type,
  });

  return Response.json(result);
}`,
      },
      {
        key: "nuxt", name: "Nuxt", Icon: SiNuxt, file: "server/api/moderate.post.ts",
        code: `import { Visora } from "@visoracloud/client";

const visora = new Visora({ apiKey: process.env.VISORA_API_KEY });

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);
  const image = form.find((p) => p.name === "image");

  return visora.moderateImage({
    file: image.data,
    filename: image.filename,
    contentType: image.type,
  });
});`,
      },
      {
        key: "express", name: "Express", Icon: SiExpress, file: "server.ts",
        code: `import express from "express";
import multer from "multer";
import { Visora } from "@visoracloud/client";

const visora = new Visora({ apiKey: process.env.VISORA_API_KEY });
const upload = multer();

app.post("/moderate", upload.single("image"), async (req, res) => {
  const result = await visora.moderateImage({
    file: req.file.buffer,
    filename: req.file.originalname,
    contentType: req.file.mimetype,
  });
  res.json(result);
});`,
      },
      {
        key: "astro", name: "Astro", Icon: SiAstro, file: "src/pages/api/moderate.ts",
        code: `import type { APIRoute } from "astro";
import { Visora } from "@visoracloud/client";

const visora = new Visora({ apiKey: import.meta.env.VISORA_API_KEY });

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const image = form.get("image") as File;

  const result = await visora.moderateImage({
    file: Buffer.from(await image.arrayBuffer()),
    filename: image.name,
    contentType: image.type,
  });

  return new Response(JSON.stringify(result));
};`,
      },
    ],
  },
  {
    key: "serverless",
    name: "Serverless",
    Icon: Zap,
    frameworks: [
      {
        key: "vercel", name: "Vercel", Icon: SiVercel, file: "api/moderate.ts",
        code: `import { Visora } from "@visoracloud/client";

const visora = new Visora({ apiKey: process.env.VISORA_API_KEY });

// Vercel Function
export default async function handler(req, res) {
  const result = await visora.moderateImageKey({
    imageKey: req.body.imageKey,
  });

  res.json(result);
}`,
      },
      {
        key: "supabase", name: "Supabase", Icon: SiSupabase, file: "supabase/functions/moderate/index.ts",
        code: `import { Visora } from "npm:@visoracloud/client";

const visora = new Visora({ apiKey: Deno.env.get("VISORA_API_KEY") });

// Supabase Edge Function
Deno.serve(async (req) => {
  const { imageKey } = await req.json();

  const result = await visora.moderateImageKey({ imageKey });

  return Response.json(result);
});`,
      },
      {
        key: "lambda", name: "AWS Lambda", Icon: FaAws, file: "handler.ts",
        code: `import { Visora } from "@visoracloud/client";

const visora = new Visora({ apiKey: process.env.VISORA_API_KEY });

// AWS Lambda handler
export const handler = async (event) => {
  const result = await visora.moderateImageKey({
    imageKey: event.imageKey,
  });

  return { statusCode: 200, body: JSON.stringify(result) };
};`,
      },
    ],
  },
  {
    key: "python",
    name: "Python",
    Icon: SiPython,
    frameworks: [
      {
        key: "python", name: "Python", Icon: SiPython, file: "moderate.py",
        code: `import os, requests

with open("upload.jpg", "rb") as image:
    res = requests.post(
        "https://api.visoracloud.com/moderate",
        headers={"x-api-key": os.environ["VISORA_API_KEY"]},
        files={"image": image},
    ).json()

if not res["safe"]:
    print(res["action"], res["category"])`,
      },
      {
        key: "fastapi", name: "FastAPI", Icon: SiFastapi, file: "main.py",
        code: `import os, requests
from fastapi import FastAPI, UploadFile

app = FastAPI()

@app.post("/moderate")
async def moderate(image: UploadFile):
    res = requests.post(
        "https://api.visoracloud.com/moderate",
        headers={"x-api-key": os.environ["VISORA_API_KEY"]},
        files={"image": (image.filename, await image.read())},
    )
    return res.json()`,
      },
    ],
  },
  {
    key: "go",
    name: "Go",
    Icon: SiGo,
    frameworks: [
      {
        key: "go", name: "Go", Icon: SiGo, file: "moderate.go",
        code: `req, _ := http.NewRequest("POST",
    "https://api.visoracloud.com/moderate", body)
req.Header.Set("x-api-key", os.Getenv("VISORA_API_KEY"))

res, _ := http.DefaultClient.Do(req)
defer res.Body.Close()

var out struct {
    Safe     bool
    Action   string
    Category string
}
json.NewDecoder(res.Body).Decode(&out)
if !out.Safe {
    fmt.Println(out.Action, out.Category)
}`,
      },
    ],
  },
];

const reveal: CSSProperties = { opacity: 1, transform: "none" };

export function IntegrationSection() {
  const [techKey, setTechKey] = useState<string>("node");
  const [fwKey, setFwKey] = useState<string>("node");
  const [copied, setCopied] = useState(false);

  const tech = TECHS.find((t) => t.key === techKey) ?? TECHS[0];
  const fw = tech.frameworks.find((f) => f.key === fwKey) ?? tech.frameworks[0];
  const lines = fw.code.split("\n");

  const selectTech = (t: Tech) => {
    setTechKey(t.key);
    setFwKey(t.frameworks[0].key);
    setCopied(false);
  };

  const copy = () => {
    try {
      navigator.clipboard?.writeText(fw.code);
    } catch {}
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section
      className="integration-section"
      style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 1180,
        margin: "0 auto",

        textAlign: "center",
        fontFamily: "'Sora', sans-serif",
        color: "#fff",
      }}
    >
      <div style={reveal}>
        <div style={{ position: "relative", width: 64, height: 64, margin: "0 auto 40px" }}>
          <div style={{ position: "absolute", inset: -40, background: "radial-gradient(ellipse at center, rgba(126,155,255,0.18), rgba(126,155,255,0) 68%)", pointerEvents: "none" }} />
          <span style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 7, width: 64, height: 64 }}>
            <span style={{ borderRadius: 6, background: "rgba(255,255,255,0.22)" }} />
            <span style={{ borderRadius: 6, background: "#aebfff", boxShadow: "0 0 16px 2px rgba(126,155,255,0.85)" }} />
            <span style={{ borderRadius: 6, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ borderRadius: 6, background: "rgba(255,255,255,0.22)" }} />
          </span>
        </div>

        <h2 style={{ margin: 0, fontSize: "clamp(36px,4.6vw,62px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02 }}>
          Integrate <span style={{ color: "#aebfff" }}>before lunch.</span>
        </h2>
        <p style={{ margin: "24px auto 0", maxWidth: 600, fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,0.62)", fontWeight: 300 }}>
          A clean Node SDK plus a plain REST API. Drops into Next.js, Nuxt, serverless functions, Python, Go — wherever you ship.
        </p>
      </div>

      {/* technology selector */}
      <div className="integration-tech-list dash-scroll" style={{ ...reveal, marginTop: 52, display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "center", gap: 30 }}>
        {TECHS.map((t) => {
          const on = t.key === techKey;
          const Icon = t.Icon;
          return (
            <div key={t.key} onClick={() => selectTech(t)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 13, cursor: "pointer" }}>
              <span
                style={{
                  width: 66,
                  height: 66,
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  color: on ? "#cdd8ff" : "rgba(255,255,255,0.5)",
                  background: on ? "rgba(174,191,255,0.1)" : "rgba(255,255,255,0.022)",
                  border: `1px solid ${on ? "rgba(174,191,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                  boxShadow: on ? "0 0 28px rgba(174,191,255,0.28), inset 0 1px 0 rgba(255,255,255,0.06)" : "none",
                  transition: "all .25s ease",
                }}
              >
                <Icon size={26} />
              </span>
              <span style={{ fontSize: 14, fontWeight: 400, color: on ? "#fff" : "rgba(255,255,255,0.5)", transition: "color .25s ease" }}>
                {t.name}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ ...reveal, marginTop: 40 }}>
        <div className="integration-code-card" style={{ maxWidth: 960, margin: "0 auto", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#080808", boxShadow: "0 48px 110px rgba(0,0,0,0.6)" }}>
          {/* framework pills + copy */}
          <div className="integration-code-toolbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}>
            <div className="integration-framework-list dash-scroll" style={{ display: "flex", alignItems: "center", gap: 4, overflowX: "auto", minWidth: 0 }}>
              {tech.frameworks.map((f) => {
                const on = f.key === fwKey;
                const Icon = f.Icon;
                return (
                  <button
                    key={f.key}
                    onClick={() => { setFwKey(f.key); setCopied(false); }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 12px",
                      borderRadius: 9,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      border: `1px solid ${on ? "rgba(174,191,255,0.4)" : "transparent"}`,
                      background: on ? "rgba(174,191,255,0.12)" : "transparent",
                      color: on ? "#fff" : "rgba(255,255,255,0.5)",
                      fontFamily: "inherit",
                      fontSize: 13.5,
                      fontWeight: on ? 500 : 400,
                      cursor: "pointer",
                      transition: "all .2s",
                    }}
                  >
                    <span style={{ display: "inline-flex", fontSize: 14 }}><Icon size={14} /></span>
                    {f.name}
                  </button>
                );
              })}
            </div>
            <button
              onClick={copy}
              style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 11, letterSpacing: "0.04em", color: copied ? "#aebfff" : "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 11px", borderRadius: 8, cursor: "pointer", transition: "all .2s" }}
            >
              <span style={{ width: 11, height: 11, borderRadius: 3, border: "1.5px solid currentColor", display: "inline-block" }} />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* file bar */}
          <div style={{ padding: "10px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "left" }}>
            <span style={{ fontFamily: MONO, fontSize: 12.5, color: "rgba(255,255,255,0.4)" }}>{fw.file}</span>
          </div>

          {/* code body */}
          <div
            className="integration-code-body dash-scroll"
            style={{ fontFamily: MONO, fontSize: 14.5, lineHeight: 1.9, padding: "26px 28px", textAlign: "left", minHeight: 420, overflowX: "auto", whiteSpace: "pre" }}
          >
            {lines.map((line, i) =>
              line.length === 0 ? (
                <div key={i} style={{ height: 16 }} />
              ) : (
                <div key={i}>
                  {tokenizeLine(line).map((tok, j) => (
                    <span key={j} style={{ color: tok.c ? COLORS[tok.c] : COLORS.d }}>
                      {tok.t}
                    </span>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
