// Copies MapLibre's web worker to /public (bundlers don't serve it). Runs on npm install.
const fs = require("fs");
const path = require("path");

const source = require.resolve("maplibre-gl/dist/maplibre-gl-worker.mjs");
const target = path.join(__dirname, "..", "public", "maplibre-gl-worker.mjs");

fs.copyFileSync(source, target);
