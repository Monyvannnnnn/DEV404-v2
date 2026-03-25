import { useEffect, useRef } from "react";

interface PreviewPanelProps {
  html: string;
  css: string;
  js: string;
}

export function PreviewPanel({ html, css, js }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; }
    ${css}
  </style>
</head>
<body>
${html}
${js ? `<script>${js}<\/script>` : ""}
</body>
</html>`);
    doc.close();
  }, [html, css, js]);

  return (
    <div className="h-full rounded-md overflow-hidden border border-border">
      <iframe
        ref={iframeRef}
        title="Preview"
        className="w-full h-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
