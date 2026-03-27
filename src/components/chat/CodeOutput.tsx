import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Check, Code2, Copy, Download, Eye, ExternalLink, Monitor, Smartphone } from "lucide-react";
import type { GeneratedCode } from "@/types/chat";
import { buildProjectFiles, buildStandaloneHtml, looksLikeCss } from "@/lib/code-output";
import { cn } from "@/lib/utils";
import { createZipBlob } from "@/lib/zip";

const TABS = ["HTML", "CSS", "JavaScript", "Python"] as const;
const TAB_KEY_MAP: Record<string, keyof GeneratedCode> = {
  HTML: "html",
  CSS: "tailwind",
  JavaScript: "javascript",
  Python: "python",
};
const EMPTY_CODE: GeneratedCode = {
  html: "",
  tailwind: "",
  javascript: "",
  python: "",
};
const tokenColors = {
  comment: "text-slate-500",
  string: "text-amber-400",
  keyword: "text-sky-400",
  number: "text-fuchsia-400",
  tag: "text-cyan-400",
  attr: "text-emerald-400",
  punctuation: "text-slate-300",
  plain: "text-slate-100",
} as const;

interface CodeOutputProps {
  visible: boolean;
  generatedCode: GeneratedCode | null;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const isMarkupTab = (tab: string, code = "") =>
  tab === "HTML" || (tab === "CSS" && !looksLikeCss(code));

const formatMarkup = (code: string) => {
  const normalized = code.replace(/>\s+</g, "><").trim();
  const tokens = normalized.split(/(?=<)|(?<=>)/g).filter(Boolean);
  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  let indent = 0;

  return tokens
    .map((token) => {
      const trimmed = token.trim();
      if (!trimmed) return null;

      const isClosingTag = /^<\//.test(trimmed);
      const isComment = /^<!--/.test(trimmed);
      const isDoctype = /^<!DOCTYPE/i.test(trimmed);
      const isSelfClosing = trimmed.endsWith("/>");
      const tagMatch = trimmed.match(/^<\s*([a-zA-Z0-9-]+)/);
      const closingTagMatch = trimmed.match(/^<\s*\/\s*([a-zA-Z0-9-]+)/);
      const tagName = (tagMatch?.[1] || closingTagMatch?.[1])?.toLowerCase();

      if (isClosingTag) indent = Math.max(0, indent - 1);

      if (isComment || isDoctype) {
        return `${"  ".repeat(indent)}${trimmed}`;
      }

      if (!trimmed.startsWith("<")) {
        return `${"  ".repeat(indent)}${trimmed}`;
      }

      const isOpeningTag = /^<[^/!][^>]*>$/.test(trimmed) && !trimmed.endsWith("/>") && !(tagName && voidTags.has(tagName));
      const indentPrefix = "  ".repeat(indent);

      const line = (() => {
        if (!tagName) {
          return `${indentPrefix}${trimmed}`;
        }

        if (isClosingTag) {
          return `${indentPrefix}</${tagName}>`;
        }

        const inner = trimmed.slice(1, trimmed.length - (isSelfClosing ? 2 : 1)).trim();
        const [, ...segments] = inner.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

        if (segments.length === 0) {
          return `${indentPrefix}<${tagName}${isSelfClosing ? " />" : ">"} `;
        }

        const attrs = segments.map((segment) => `${indentPrefix}  ${segment}`);
        return [`${indentPrefix}<${tagName}`, ...attrs, `${indentPrefix}${isSelfClosing ? "/>" : ">"}`].join("\n");
      })();

      if (tagName === "script" || tagName === "style") {
        return `${indentPrefix}${trimmed}`;
      }

      if (!isOpeningTag) {
        const compactTag = (() => {
          const inner = trimmed.slice(1, trimmed.length - (isSelfClosing ? 2 : 1)).trim();
          const parts = inner.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
          if (parts.length <= 3) {
            return `${indentPrefix}<${parts.join(" ")}${isSelfClosing ? " />" : ">"}`;
          }
          return line.replace(/\s+$/, "");
        })();
        return compactTag;
      }

      if (isOpeningTag) indent += 1;
      return line.replace(/\s+$/, "");
    })
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const formatScriptLike = (code: string) =>
  code
    .replace(/;\s*/g, ";\n")
    .replace(/\{\s*/g, "{\n")
    .replace(/\}\s*/g, "}\n")
    .replace(/,\s*/g, ", ")
    .replace(/\n{2,}/g, "\n")
    .trim();

const formatCss = (code: string) =>
  code
    .replace(/\{\s*/g, "{\n  ")
    .replace(/;\s*/g, ";\n  ")
    .replace(/\}\s*/g, "\n}\n")
    .replace(/\n\s*\n+/g, "\n")
    .replace(/\n  \}/g, "\n}")
    .trim();

const formatPython = (code: string) =>
  code
    .replace(/:\s*/g, ":\n    ")
    .replace(/\n{2,}/g, "\n")
    .trim();

const highlightCode = (code: string, tab: string) => {
  const language =
    tab === "Python"
      ? "python"
      : tab === "JavaScript"
        ? "javascript"
        : looksLikeCss(code)
          ? "css"
          : "markup";

  return code.split("\n").map((line, lineIndex, lines) => {
    const tokens: Array<{ text: string; type: keyof typeof tokenColors }> = [];

    if (language === "markup") {
      const regex = /(<!--[\s\S]*?-->)|(<\/?[\w-]+)|(\s+[\w:-]+)(=)("[^"]*"|'[^']*')|(\/?>)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          tokens.push({ text: line.slice(lastIndex, match.index), type: "plain" });
        }
        if (match[1]) tokens.push({ text: match[1], type: "comment" });
        else if (match[2]) tokens.push({ text: match[2], type: "tag" });
        else if (match[3]) {
          tokens.push({ text: match[3], type: "attr" });
          tokens.push({ text: match[4], type: "punctuation" });
          tokens.push({ text: match[5], type: "string" });
        } else if (match[6]) {
          tokens.push({ text: match[6], type: "punctuation" });
        }
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < line.length) {
        tokens.push({ text: line.slice(lastIndex), type: "plain" });
      }
    } else {
      const regex = /(\/\/.*$|#.*$)|("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`)|\b(import|from|export|default|return|const|let|var|function|async|await|if|else|for|while|class|new|try|catch|throw|def|True|False|None|in|and|or|not)\b|\b(\d+(?:\.\d+)?)\b|([()[\]{}.,:;=<>+\-*/]+)/gm;
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          tokens.push({ text: line.slice(lastIndex, match.index), type: "plain" });
        }
        if (match[1]) tokens.push({ text: match[1], type: "comment" });
        else if (match[2]) tokens.push({ text: match[2], type: "string" });
        else if (match[3]) tokens.push({ text: match[3], type: "keyword" });
        else if (match[4]) tokens.push({ text: match[4], type: "number" });
        else if (match[5]) tokens.push({ text: match[5], type: "punctuation" });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < line.length) {
        tokens.push({ text: line.slice(lastIndex), type: "plain" });
      }
    }

    return (
      <Fragment key={lineIndex}>
        {tokens.map((token, tokenIndex) => (
          <span
            key={`${lineIndex}-${tokenIndex}`}
            className={tokenColors[token.type]}
            dangerouslySetInnerHTML={{ __html: escapeHtml(token.text).replace(/ /g, "&nbsp;") }}
          />
        ))}
        {lineIndex < lines.length - 1 ? "\n" : null}
      </Fragment>
    );
  });
};

const CodeOutput = ({ visible, generatedCode }: CodeOutputProps) => {
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [activeTab, setActiveTab] = useState<string>("HTML");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"code" | "preview">("preview");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [typedCode, setTypedCode] = useState<GeneratedCode>(EMPTY_CODE);

  const normalizeCode = (code: string, tab: string) => {
    if (!code) return "";
    const normalized = code.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\t/g, "  ");
    if (isMarkupTab(tab, normalized)) return formatMarkup(normalized);
    if (tab === "CSS" && looksLikeCss(normalized)) return formatCss(normalized);
    if (tab === "JavaScript") return formatScriptLike(normalized);
    if (tab === "Python") return formatPython(normalized);
    return normalized;
  };

  const availableTabs = useMemo(
    () =>
      TABS.filter((tab) => {
        if (!generatedCode) return false;
        if (tab === "JavaScript") return true;
        return normalizeCode(generatedCode[TAB_KEY_MAP[tab]] || "", tab).trim().length > 0;
      }),
    [generatedCode],
  );

  const resolvedActiveTab = availableTabs.includes(activeTab) ? activeTab : availableTabs[0] ?? "HTML";
  const getCode = (tab: string) => normalizeCode(typedCode[TAB_KEY_MAP[tab]] || "", tab);
  const currentCode = getCode(resolvedActiveTab);
  const lineCount = Math.max(1, currentCode.split("\n").length);

  useEffect(() => {
    if (!generatedCode) {
      setTypedCode(EMPTY_CODE);
      return;
    }
    setTypedCode(generatedCode);
  }, [generatedCode]);

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [activeTab, availableTabs]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (typeof event.data?.height !== "number") return;
      if (!previewIframeRef.current) return;
      previewIframeRef.current.style.height = `${event.data.height}px`;
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!visible || !generatedCode) return null;

  const previewDocument = buildStandaloneHtml(generatedCode);
  const isMobileFrame = deviceMode === "mobile";
  const previewFrameClass = cn(
    "mx-auto h-full w-full overflow-hidden rounded-lg bg-white transition-[max-width,box-shadow,border-color] duration-300 ease-out",
    isMobileFrame
      ? "border border-primary/25 shadow-2xl"
      : "min-w-0 border border-primary/25 shadow-[0_24px_80px_rgba(15,23,42,0.12)]",
  );
  const previewFrameStyle = {
    maxWidth: isMobileFrame ? "min(375px, 100%)" : "100%",
    height: isMobileFrame ? "667px" : "100%",
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getCode(resolvedActiveTab));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const blob = createZipBlob(buildProjectFiles(generatedCode));
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "generated-website.zip";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleVisit = () => {
    const blob = new Blob([buildStandaloneHtml(generatedCode)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <div className="w-full max-w-full overflow-hidden rounded-xl border border-primary/25 bg-background/25 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300">
      <div className="flex flex-col gap-3 border-b border-primary/25 px-3 py-3 sm:px-4 sm:py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Workspace</div>
            <div className="mt-0.5 text-xs font-semibold text-foreground">Interactive Preview</div>
          </div>
          
          <div className="hidden items-center gap-1 rounded-lg bg-white/5 p-1 lg:flex">
            <button
              onClick={() => setDeviceMode("desktop")}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                deviceMode === "desktop" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              title="Desktop View"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setDeviceMode("mobile")}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                deviceMode === "mobile" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              title="Mobile View"
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-nowrap items-center justify-between gap-2 sm:flex-wrap sm:justify-end">
          <div className="flex min-w-0 items-center gap-1 rounded-lg bg-white/5 p-1 sm:gap-1.5">
            <button
              onClick={() => setViewMode("preview")}
              className={cn(
                "inline-flex h-8 w-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-0 text-[11px] font-bold transition-all sm:h-8 sm:w-auto sm:gap-2 sm:px-3",
                viewMode === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye size={12} />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={cn(
                "inline-flex h-8 w-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-0 text-[11px] font-bold transition-all sm:h-8 sm:w-auto sm:gap-2 sm:px-3",
                viewMode === "code" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Code2 size={12} />
              <span className="hidden sm:inline">Code</span>
            </button>
          </div>

          <div className="flex shrink-0 flex-nowrap items-center gap-1">
            <button
              onClick={handleVisit}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:text-foreground sm:h-9 sm:w-9"
              title="Visit Website"
            >
              <ExternalLink size={14} />
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:text-foreground sm:h-9 sm:w-9"
              title="Copy Code"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:text-foreground sm:h-9 sm:w-9"
              title="Download ZIP"
            >
              <Download size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-[clamp(320px,82vw,460px)] w-full overflow-hidden sm:h-[clamp(360px,58vw,720px)]">
        {viewMode === "preview" ? (
          <div className="h-full w-full overflow-auto p-3 sm:p-4">
            <div
              className={cn(
                "mx-auto w-full overflow-auto rounded-lg bg-white transition-all duration-300",
                isMobileFrame
                  ? "border border-primary/25 shadow-2xl"
                  : "border border-primary/25 shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
              )}
              style={previewFrameStyle}
            >
              <iframe
                ref={previewIframeRef}
                title="Preview"
                srcDoc={previewDocument}
                className="w-full rounded-lg border-0"
                sandbox="allow-scripts allow-same-origin"
                style={{
                  height: "100%",
                  minHeight: "600px",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="h-full w-full overflow-y-auto overflow-x-hidden p-2 sm:p-4">
            <div
              className={cn(
                "mx-auto flex min-h-full w-full min-w-0 flex-col overflow-hidden rounded-lg bg-[#0d1117] transition-[box-shadow,border-color] duration-300 ease-out",
                isMobileFrame
                  ? "max-w-full border border-primary/25 shadow-[0_24px_80px_rgba(2,6,23,0.35)]"
                  : previewFrameClass,
                "!bg-[#0d1117]"
              )}
              style={isMobileFrame ? undefined : previewFrameStyle}
            >
              <div className="flex items-center justify-between bg-white/[0.03] px-3 py-2.5 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  {resolvedActiveTab}
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto px-3 py-3 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-2.5 text-center text-[11px] font-bold transition-all sm:min-w-[112px] sm:px-4 sm:text-[12px] min-w-[70px]",
                      resolvedActiveTab === tab ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/60"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex flex-1">
                <div className="w-10 shrink-0 select-none bg-black/20 px-1.5 py-2 text-right text-[10px] leading-5 text-white/25 sm:w-14 sm:px-3 sm:py-6 sm:text-[12px] sm:leading-8">
                  {Array.from({ length: lineCount }, (_, index) => (
                    <div key={index}>{index + 1}</div>
                  ))}
                </div>
                <pre className="min-w-0 flex-1 overflow-visible whitespace-pre-wrap break-words p-3 text-[11px] leading-5 text-white/90 sm:p-6 sm:text-[15px] sm:leading-8">
                  <code>{highlightCode(currentCode, resolvedActiveTab)}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeOutput;
