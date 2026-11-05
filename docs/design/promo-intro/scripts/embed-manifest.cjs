#!/usr/bin/env node
// Copies the facts the composition needs out of assets/capture/manifest.json into index.html,
// so every heading, y coordinate and panel row on screen traces back to the capture.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "assets/capture/manifest.json"), "utf8"));
const htmlPath = path.join(root, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

const data = {
  pageHeight: manifest.pageHeight,
  pageWidth: manifest.pageWidth,
  headings: manifest.headings.map(({ level, text, y }) => ({ level, text, y })),
  jump: { text: manifest.jump.text, y: manifest.jump.y, panelRow: manifest.jump.panelRow },
  panel: { x: manifest.panel.x, y: manifest.panel.y, width: manifest.panel.width, height: manifest.panel.height },
  search: manifest.search,
};

const slices = manifest.slices
  .map(
    (s) =>
      `          <img class="slice" src="assets/capture/${s.file}" alt="" style="top: ${s.y}px; height: ${s.height}px;" />`,
  )
  .join("\n");

html = html.replace(
  /(<script id="manifest-data" type="application\/json">)[\s\S]*?(<\/script>)/,
  (_, open, close) => `${open}${JSON.stringify(data)}${close}`,
);
html = html.replace(
  /(<!-- road-slices:start -->)[\s\S]*?(<!-- road-slices:end -->)/,
  (_, open, close) => `${open}\n${slices}\n          ${close}`,
);
html = html.replace(/(id="road"[^>]*style="height: )\d+(px;")/, `$1${manifest.pageHeight}$2`);

fs.writeFileSync(htmlPath, html);
console.log(`embedded ${data.headings.length} headings, ${manifest.slices.length} slices, pageHeight ${manifest.pageHeight}`);
