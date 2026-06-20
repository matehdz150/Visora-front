/**
 * Visora docs — tokenized code samples.
 *
 * Samples intentionally document the shipped Node SDK and REST API only. Other
 * language SDKs can be added once they exist.
 */
import { JSON_SYNTAX as J, SYNTAX as S } from "./theme";

export type Lang = "node" | "next" | "curl" | "logs";
export type Pkg = "npm" | "pnpm" | "yarn";

export type Token = [text: string, color: string];
export interface CodeLine {
  /** Optional left padding in px (used by the JSON response sample). */
  indent?: number;
  tokens: Token[];
}

const line = (tokens: Token[], indent?: number): CodeLine => ({ tokens, indent });

export const LANG_TABS: { id: Lang; label: string }[] = [
  { id: "node", label: "Node SDK" },
  { id: "next", label: "Next.js route" },
  { id: "curl", label: "REST" },
  { id: "logs", label: "Logs" },
];

export const PKG_TABS: { id: Pkg; label: string }[] = [
  { id: "npm", label: "npm" },
  { id: "pnpm", label: "pnpm" },
  { id: "yarn", label: "yarn" },
];

export const INSTALL_COMMANDS: Record<Pkg, string> = {
  npm: "npm install @visoracloud/client",
  pnpm: "pnpm add @visoracloud/client",
  yarn: "yarn add @visoracloud/client",
};

export const CODE_SAMPLES: Record<Lang, CodeLine[]> = {
  node: [
    line([["import", S.kw], [" { readFile } ", S.txt], ["from", S.kw], [" ", S.txt], ['"node:fs/promises"', S.str], [";", S.punct]]),
    line([["import", S.kw], [" { Visora } ", S.txt], ["from", S.kw], [" ", S.txt], ['"@visoracloud/client"', S.str], [";", S.punct]]),
    line([["", S.txt]]),
    line([["const", S.kw], [" visora ", S.txt], ["=", S.punct], [" ", S.txt], ["new", S.kw], [" ", S.txt], ["Visora", S.fn], ["({", S.punct]]),
    line([["  apiKey", S.txt], [": ", S.punct], ["process", S.txt], [".", S.punct], ["env", S.txt], [".", S.punct], ["VISORA_API_KEY", S.txt], ["!", S.punct], [",", S.punct]]),
    line([["});", S.punct]]),
    line([["", S.txt]]),
    line([["const", S.kw], [" file ", S.txt], ["=", S.punct], [" ", S.txt], ["await", S.kw], [" ", S.txt], ["readFile", S.fn], ["(", S.punct], ['"./image.jpg"', S.str], [");", S.punct]]),
    line([["const", S.kw], [" result ", S.txt], ["=", S.punct], [" ", S.txt], ["await", S.kw], [" visora.", S.txt], ["moderateImage", S.fn], ["({", S.punct]]),
    line([["  file", S.txt], [": file,", S.punct]]),
    line([["  filename", S.txt], [": ", S.punct], ['"image.jpg"', S.str], [",", S.punct]]),
    line([["  contentType", S.txt], [": ", S.punct], ['"image/jpeg"', S.str], [",", S.punct]]),
    line([["});", S.punct]]),
    line([["", S.txt]]),
    line([["if", S.kw], [" (result.action ", S.txt], ["===", S.punct], [" ", S.txt], ['"reject"', S.str], [") {", S.punct]]),
    line([["  throw", S.kw], [" ", S.txt], ["new", S.kw], [" ", S.txt], ["Error", S.fn], ["(result.explanation?.message ", S.punct], ["??", S.kw], [" ", S.txt], ['"Image rejected"', S.str], [");", S.punct]]),
    line([["}", S.punct]]),
    line([["", S.txt]]),
    line([["console", S.txt], [".", S.punct], ["log", S.fn], ["(", S.punct], ["result", S.txt], [".", S.punct], ["action", S.txt], [", ", S.punct], ["result", S.txt], [".", S.punct], ["riskScore", S.txt], [", ", S.punct], ["result", S.txt], [".", S.punct], ["explanation", S.txt], ["?.", S.punct], ["message", S.txt], [");", S.punct]]),
  ],
  next: [
    line([["import", S.kw], [" { Visora } ", S.txt], ["from", S.kw], [" ", S.txt], ['"@visoracloud/client"', S.str], [";", S.punct]]),
    line([["", S.txt]]),
    line([["const", S.kw], [" visora ", S.txt], ["=", S.punct], [" ", S.txt], ["new", S.kw], [" ", S.txt], ["Visora", S.fn], ["({ apiKey: process.env.VISORA_API_KEY! });", S.punct]]),
    line([["", S.txt]]),
    line([["export", S.kw], [" ", S.txt], ["async", S.kw], [" ", S.txt], ["function", S.kw], [" ", S.txt], ["POST", S.fn], ["(request: Request) {", S.punct]]),
    line([["  const", S.kw], [" form ", S.txt], ["=", S.punct], [" ", S.txt], ["await", S.kw], [" request.", S.txt], ["formData", S.fn], ["();", S.punct]]),
    line([["  const", S.kw], [" image ", S.txt], ["=", S.punct], [" form.", S.txt], ["get", S.fn], ["(", S.punct], ['"image"', S.str], [") ", S.punct], ["as", S.kw], [" File ", S.txt], ["|", S.punct], [" ", S.txt], ["null", S.kw], [";", S.punct]]),
    line([["  if", S.kw], [" (!image) ", S.txt], ["return", S.kw], [" Response.", S.txt], ["json", S.fn], ["({ error: ", S.punct], ['"Missing image"', S.str], [" }, { status: 400 });", S.punct]]),
    line([["", S.txt]]),
    line([["  const", S.kw], [" buffer ", S.txt], ["=", S.punct], [" Buffer.", S.txt], ["from", S.fn], ["(", S.punct], ["await", S.kw], [" image.", S.txt], ["arrayBuffer", S.fn], ["());", S.punct]]),
    line([["  const", S.kw], [" result ", S.txt], ["=", S.punct], [" ", S.txt], ["await", S.kw], [" visora.", S.txt], ["moderateImage", S.fn], ["({", S.punct]]),
    line([["    file", S.txt], [": buffer, filename: image.name, contentType: image.type,", S.punct]]),
    line([["  });", S.punct]]),
    line([["", S.txt]]),
    line([["  return", S.kw], [" Response.", S.txt], ["json", S.fn], ["({ action: result.action, explanation: result.explanation });", S.punct]]),
    line([["}", S.punct]]),
  ],
  curl: [
    line([["curl", S.fn], [" -X POST ", S.txt], ['"$VISORA_API_URL/moderate"', S.str], [" \\", S.txt]]),
    line([["  -H ", S.txt], ['"x-api-key: $VISORA_API_KEY"', S.str], [" \\", S.txt]]),
    line([["  -F ", S.txt], ['"image=@./image.jpg;type=image/jpeg"', S.str]]),
  ],
  logs: [
    line([["const", S.kw], [" { logs } ", S.txt], ["=", S.punct], [" ", S.txt], ["await", S.kw], [" visora.", S.txt], ["listModerationLogs", S.fn], ["();", S.punct]]),
    line([["", S.txt]]),
    line([["for", S.kw], [" (", S.punct], ["const", S.kw], [" log ", S.txt], ["of", S.kw], [" logs) {", S.punct]]),
    line([["  console", S.txt], [".", S.punct], ["log", S.fn], ["(", S.punct], ["log", S.txt], [".", S.punct], ["moderationId", S.txt], [", ", S.punct], ["log", S.txt], [".", S.punct], ["action", S.txt], [", ", S.punct], ["log", S.txt], [".", S.punct], ["explanation", S.txt], ["?.", S.punct], ["message", S.txt], [");", S.punct]]),
    line([["}", S.punct]]),
  ],
};

/** ".env" snippet shown in the Authenticate step. */
export const ENV_SAMPLE: CodeLine[] = [
  line([["VISORA_API_KEY", J.key], ["=", J.punct], ["sk_test_...", J.str]]),
  line([["VISORA_API_URL", J.key], ["=", J.punct], ["https://6p0ws7vu2f.execute-api.us-east-1.amazonaws.com/dev", J.str]]),
];

/** JSON returned by `POST /moderate`. */
export const RESPONSE_SAMPLE: CodeLine[] = [
  line([["{", J.punct]]),
  line([['"moderationId"', J.key], [": ", J.punct], ['"mod_01KV9F2X3Q"', J.str], [",", J.punct]], 20),
  line([['"safe"', J.key], [": ", J.punct], ["false", J.bool], [",", J.punct]], 20),
  line([['"action"', J.key], [": ", J.punct], ['"reject"', J.str], [",", J.punct]], 20),
  line([['"riskScore"', J.key], [": ", J.punct], ["92", J.num], [",", J.punct]], 20),
  line([['"category"', J.key], [": ", J.punct], ['"weapons"', J.str], [",", J.punct]], 20),
  line([['"explanation"', J.key], [": {", J.punct]], 20),
  line([['"message"', J.key], [": ", J.punct], ['"Rejected because weapons matched reject action."', J.str], [",", J.punct]], 40),
  line([['"reason"', J.key], [": ", J.punct], ['"category_action"', J.str], [", ", J.punct], ['"matchedCategory"', J.key], [": ", J.punct], ['"weapons"', J.str]], 40),
  line([["},", J.punct]], 20),
  line([['"labels"', J.key], [": [", J.punct]], 20),
  line([["{ ", J.punct], ['"name"', J.key], [": ", J.punct], ['"Weapon"', J.str], [", ", J.punct], ['"confidence"', J.key], [": ", J.punct], ["93.14", J.num], [", ", J.punct], ['"category"', J.key], [": ", J.punct], ['"weapons"', J.str], [" }", J.punct]], 40),
  line([["],", J.punct]], 20),
  line([['"brandSafety"', J.key], [": { ", J.punct], ['"safe"', J.key], [": ", J.punct], ["false", J.bool], [", ", J.punct], ['"score"', J.key], [": ", J.punct], ["92", J.num], [", ", J.punct], ['"level"', J.key], [": ", J.punct], ['"unsafe"', J.str], [", ", J.punct], ['"reasons"', J.key], [": [", J.punct], ['"weapons"', J.str], ["] },", J.punct]], 20),
  line([['"compliance"', J.key], [": { ", J.punct], ['"pack"', J.key], [": ", J.punct], ['"marketplace"', J.str], [", ", J.punct], ['"passed"', J.key], [": ", J.punct], ["false", J.bool], [", ", J.punct], ['"violations"', J.key], [": [", J.punct], ['"weapons"', J.str], ["] }", J.punct]], 20),
  line([["}", J.punct]]),
];

/** Flatten tokenized lines back to copyable plain text. */
export function codeToText(lines: CodeLine[]): string {
  return lines.map((l) => l.tokens.map((t) => t[0]).join("")).join("\n");
}
