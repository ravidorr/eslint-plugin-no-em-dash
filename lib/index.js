/**
 * @fileoverview ESLint plugin to disallow em dash characters in code
 * @author Raanan Avidor
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import noEmDash from "./rules/no-em-dash.js";

// Get __dirname equivalent in ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

// Read name and version from package.json to keep in sync (per ESLint docs recommendation)
const pkg = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf8")
);

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
    namespace: "no-em-dash"
  },
  rules: {
    "no-em-dash": noEmDash
  },
  configs: {}
};

// Add recommended config for legacy eslintrc format
plugin.configs.recommended = {
  plugins: ["no-em-dash"],
  rules: {
    "no-em-dash/no-em-dash": "error"
  }
};

// Add flat config for ESLint 9.x (flat/recommended naming per ESLint docs)
plugin.configs["flat/recommended"] = {
  plugins: {
    "no-em-dash": plugin
  },
  rules: {
    "no-em-dash/no-em-dash": "error"
  }
};

// Aliases for convenience
plugin.configs.flat = plugin.configs["flat/recommended"];
plugin.configs["recommended-flat"] = plugin.configs["flat/recommended"];

export default plugin;
