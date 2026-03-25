import type { GeneratedCode } from "@/types/chat";

const HEAD_CLOSE_TAG = /<\/head>/i;
const BODY_CLOSE_TAG = /<\/body>/i;
const HTML_TAG = /<html[\s>]/i;
const UNSPLASH_SOURCE_URL = /https:\/\/source\.unsplash\.com\/(\d+)x(\d+)\/\?[^"' )]+/gi;

export interface DownloadFile {
  name: string;
  content: string;
  type: string;
}

export const looksLikeCss = (code: string) =>
  /[{][^}]*[:;][^}]*[}]|^@media|^@import|^[.#a-zA-Z][\w\s,:>~#[\].()-]*\s*\{/m.test(code);

const injectIntoDocument = (document: string, headContent: string, scripts: string) => {
  let output = document;

  if (headContent) {
    output = HEAD_CLOSE_TAG.test(output) ? output.replace(HEAD_CLOSE_TAG, `${headContent}</head>`) : `${headContent}${output}`;
  }

  if (scripts) {
    const scriptTag = `<script>${scripts}<\/script>`;
    output = BODY_CLOSE_TAG.test(output) ? output.replace(BODY_CLOSE_TAG, `${scriptTag}</body>`) : `${output}${scriptTag}`;
  }

  return output;
};

const normalizeImageSources = (markup: string) =>
  markup.replace(UNSPLASH_SOURCE_URL, (_match, width, height) => `https://picsum.photos/${width}/${height}`);

const ensureDoctype = (document: string) =>
  /^<!DOCTYPE/i.test(document.trim()) ? document : `<!DOCTYPE html>\n${document}`;

const injectHeadElement = (document: string, content: string) => {
  if (!content) return document;
  return HEAD_CLOSE_TAG.test(document) ? document.replace(HEAD_CLOSE_TAG, `${content}</head>`) : content + document;
};

const injectBodyElement = (document: string, content: string) => {
  if (!content) return document;
  return BODY_CLOSE_TAG.test(document) ? document.replace(BODY_CLOSE_TAG, `${content}</body>`) : `${document}${content}`;
};

export const buildProjectFiles = (generatedCode: GeneratedCode): DownloadFile[] => {
  const markup = normalizeImageSources(generatedCode.html || "");
  const styles = looksLikeCss(generatedCode.tailwind) ? generatedCode.tailwind.trim() : "";
  const scripts = (generatedCode.javascript || "").trim();
  const python = (generatedCode.python || "").trim();

  const styleLink = styles ? '\n<link rel="stylesheet" href="./styles.css">' : "";
  const scriptLink = scripts ? '\n<script src="./script.js"></script>' : "";

  const indexHtml = HTML_TAG.test(markup)
    ? injectBodyElement(
        injectHeadElement(ensureDoctype(markup), styleLink),
        scriptLink,
      )
    : `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">${styleLink}
</head>
<body>
${markup}${scriptLink}
</body>
</html>
`;

  const files: DownloadFile[] = [{ name: "index.html", content: indexHtml, type: "text/html;charset=utf-8" }];

  if (styles) {
    files.push({ name: "styles.css", content: styles, type: "text/css;charset=utf-8" });
  }

  if (scripts) {
    files.push({ name: "script.js", content: scripts, type: "text/javascript;charset=utf-8" });
  }

  if (python) {
    files.push({ name: "main.py", content: python, type: "text/x-python;charset=utf-8" });
  }

  return files;
};

export const buildStandaloneHtml = (generatedCode: GeneratedCode) => {
  const markup = normalizeImageSources(generatedCode.html || "");
  const styles = looksLikeCss(generatedCode.tailwind) ? generatedCode.tailwind : "";
  const scripts = generatedCode.javascript || "";

  if (HTML_TAG.test(markup)) {
    return injectIntoDocument(
      markup,
      `<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
  font-family: system-ui, -apple-system, sans-serif;
}

${styles}
</style>`,
      `${scripts}
window.onload = () => {
  const height = document.body.scrollHeight;
  window.parent.postMessage({ height }, "*");
};`,
    );
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
  font-family: system-ui, -apple-system, sans-serif;
}

${styles}
</style>
</head>

<body>
${markup}

<script>
${scripts}

window.onload = () => {
  const height = document.body.scrollHeight;
  window.parent.postMessage({ height }, "*");
};
</script>

</body>
</html>
`;
};
