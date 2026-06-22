import type { CodeLine, Token } from "../code-samples";
import { JSON_SYNTAX as J, SYNTAX as S } from "../theme";

const TS_KEYWORDS = new Set([
  "import",
  "from",
  "const",
  "let",
  "var",
  "await",
  "async",
  "function",
  "export",
  "return",
  "if",
  "else",
  "switch",
  "case",
  "break",
  "throw",
  "new",
  "try",
  "catch",
  "instanceof",
  "type",
  "interface",
  "extends",
  "as",
  "null",
  "true",
  "false",
]);

const SHELL_COMMANDS = new Set(["curl", "npm", "pnpm", "yarn"]);
const HTTP_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

function isJsonLike(code: string) {
  const trimmed = code.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function isShellLike(line: string) {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("curl ") ||
    trimmed.startsWith("npm ") ||
    trimmed.startsWith("pnpm ") ||
    trimmed.startsWith("yarn ") ||
    trimmed.startsWith("-H ") ||
    trimmed.startsWith("-F ") ||
    trimmed.startsWith("-d ") ||
    trimmed.startsWith("VISORA_") ||
    trimmed.startsWith("Content-Type:") ||
    trimmed.startsWith("User-Agent:") ||
    trimmed.startsWith("visora-")
  );
}

function splitLeadingWhitespace(line: string) {
  const leading = line.match(/^\s*/)?.[0] ?? "";
  return { leading, body: line.slice(leading.length) };
}

function tokenizeJsonLine(line: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /"(?:\\.|[^"\\])*"|-?\b\d+(?:\.\d+)?\b|\btrue\b|\bfalse\b|\bnull\b|[{}[\]:,]|\s+|[^{}[\]:,\s"]+/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line))) {
    const value = match[0];
    const after = line.slice(pattern.lastIndex).trimStart();

    if (/^\s+$/.test(value)) tokens.push([value, J.txt]);
    else if (value.startsWith('"')) tokens.push([value, after.startsWith(":") ? J.key : J.str]);
    else if (/^-?\d/.test(value)) tokens.push([value, J.num]);
    else if (value === "true" || value === "false") tokens.push([value, J.bool]);
    else if (value === "null") tokens.push([value, J.txt]);
    else if (/^[{}[\]:,]$/.test(value)) tokens.push([value, J.punct]);
    else tokens.push([value, J.txt]);
  }

  return tokens;
}

function tokenizeShellLine(line: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\$[A-Z0-9_]+|--?[A-Za-z0-9-]+|\b[A-Z]{2,6}\b|\b[A-Za-z][A-Za-z0-9_-]*\b|[=:\\/@.{}#?&%-]+|\s+|./g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line))) {
    const value = match[0];

    if (/^\s+$/.test(value)) tokens.push([value, S.txt]);
    else if (value.startsWith('"') || value.startsWith("'")) tokens.push([value, S.str]);
    else if (value.startsWith("$")) tokens.push([value, S.num]);
    else if (value.startsWith("-")) tokens.push([value, S.kw]);
    else if (SHELL_COMMANDS.has(value)) tokens.push([value, S.fn]);
    else if (HTTP_METHODS.has(value)) tokens.push([value, S.kw]);
    else if (value.startsWith("VISORA_") || value.startsWith("visora-")) tokens.push([value, J.key]);
    else if (/^[=:\\/@.{}#?&%-]+$/.test(value)) tokens.push([value, S.punct]);
    else tokens.push([value, S.txt]);
  }

  return tokens;
}

function tokenizeTypeScriptLine(line: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b[A-Za-z_$][\w$]*(?=\s*\()|\b[A-Za-z_$][\w$]*\b|-?\b\d+(?:\.\d+)?\b|[{}()[\].,:;=<>!|&?+\-*/]+|\s+|./g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line))) {
    const value = match[0];

    if (/^\s+$/.test(value)) tokens.push([value, S.txt]);
    else if (value.startsWith("//")) tokens.push([value, S.com]);
    else if (value.startsWith('"') || value.startsWith("'") || value.startsWith("`")) tokens.push([value, S.str]);
    else if (/^-?\d/.test(value)) tokens.push([value, S.num]);
    else if (TS_KEYWORDS.has(value)) tokens.push([value, S.kw]);
    else if (/^[A-Za-z_$][\w$]*$/.test(value) && line.slice(pattern.lastIndex).trimStart().startsWith("(")) tokens.push([value, S.fn]);
    else if (/^[{}()[\].,:;=<>!|&?+\-*/]+$/.test(value)) tokens.push([value, S.punct]);
    else tokens.push([value, S.txt]);
  }

  return tokens;
}

export function highlightCode(code: string): CodeLine[] {
  const trimmed = code.trim();
  const json = isJsonLike(trimmed);

  return trimmed.split("\n").map((line) => {
    if (!line.trim()) return { tokens: [["", S.txt]] };

    const { leading, body } = splitLeadingWhitespace(line);
    const tokens = json
      ? tokenizeJsonLine(body)
      : isShellLike(body)
        ? tokenizeShellLine(body)
        : tokenizeTypeScriptLine(body);

    return {
      tokens: leading ? [[leading, S.txt] as Token, ...tokens] : tokens,
    };
  });
}
