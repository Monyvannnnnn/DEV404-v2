import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeTabsProps {
  html: string;
  css: string;
  js: string;
}

type Tab = "html" | "css" | "js";

const tabLabels: Record<Tab, string> = { html: "HTML", css: "CSS", js: "JavaScript" };
const tabLangs: Record<Tab, string> = { html: "html", css: "css", js: "javascript" };

export function CodeTabs({ html, css, js }: CodeTabsProps) {
  const [active, setActive] = useState<Tab>("html");
  const [copied, setCopied] = useState(false);

  const code: Record<Tab, string> = { html, css, js };
  const tabs = (Object.keys(tabLabels) as Tab[]).filter((t) => code[t].trim());

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code[active]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = active === "js" ? "js" : active;
    const blob = new Blob([code[active]], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `component.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev404 Generated Component</title>
  <style>${css}</style>
</head>
<body>
${html}
${js ? `<script>${js}</script>` : ""}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "component.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-1">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-4 py-2.5 text-sm font-mono font-medium transition-colors relative ${
                active === tab
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tabLabels[tab]}
              {active === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 pr-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadAll}
            className="px-2.5 py-1 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border"
            title="Download as HTML file"
          >
            .html
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-code-bg">
        <SyntaxHighlighter
          language={tabLangs[active]}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.8125rem",
            lineHeight: "1.6",
          }}
          showLineNumbers
          lineNumberStyle={{ color: "hsl(220, 14%, 25%)", minWidth: "2.5em" }}
        >
          {code[active]}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
