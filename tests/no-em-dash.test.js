/**
 * @fileoverview Tests for no-em-dash rule
 * @author Raanan Avidor
 */

import { RuleTester } from "eslint";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import rule from "../lib/rules/no-em-dash.js";
import plugin from "../lib/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf8")
);

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020
  }
});

ruleTester.run("no-em-dash", rule, {
  valid: [
    // Regular strings without em dashes
    {
      code: 'const message = "Hello, world!";'
    },
    {
      code: "const message = 'Hello, world!';"
    },
    {
      code: "const message = `Hello, world!`;"
    },

    // Strings with regular hyphens (should be allowed)
    {
      code: 'const text = "well-known";'
    },
    {
      code: 'const text = "self-aware";'
    },

    // Strings with en dashes (U+2013) - different from em dash
    {
      code: 'const range = "pages 1\u20135";'
    },

    // Empty strings
    {
      code: 'const empty = "";'
    },
    {
      code: "const empty = ``;"
    },

    // Template literals with expressions (no em dashes)
    {
      code: "const msg = `Hello ${name}!`;"
    },

    // Multiline strings without em dashes
    {
      code: "const text = `Line 1\nLine 2\nLine 3`;"
    },

    // Non-string literals
    {
      code: "const num = 42;"
    },
    {
      code: "const bool = true;"
    }
  ],

  invalid: [
    // Simple em dash in double quotes
    {
      code: 'const text = "hello \u2014 world";',
      errors: [{ messageId: "noEmDash" }]
    },

    // Em dash in single quotes
    {
      code: "const text = 'hello \u2014 world';",
      errors: [{ messageId: "noEmDash" }]
    },

    // Em dash in template literal
    {
      code: "const text = `hello \u2014 world`;",
      errors: [{ messageId: "noEmDash" }]
    },

    // Multiple em dashes in one string
    {
      code: 'const text = "one \u2014 two \u2014 three";',
      errors: [
        { messageId: "noEmDash" },
        { messageId: "noEmDash" }
      ]
    },

    // Em dash at start of string
    {
      code: 'const text = "\u2014 starting with em dash";',
      errors: [{ messageId: "noEmDash" }]
    },

    // Em dash at end of string
    {
      code: 'const text = "ending with em dash \u2014";',
      errors: [{ messageId: "noEmDash" }]
    },

    // Template literal with expression and em dash
    {
      code: "const msg = `Hello ${name} \u2014 welcome!`;",
      errors: [{ messageId: "noEmDash" }]
    },

    // Multiline template with em dash
    {
      code: "const text = `Line 1\n\u2014 Line 2\nLine 3`;",
      errors: [{ messageId: "noEmDash" }]
    }
  ]
});

// Additional test to verify the plugin exports
describe("Plugin exports", () => {
  test("exports meta information synced with package.json", () => {
    expect(plugin.meta.name).toBe(pkg.name);
    expect(plugin.meta.version).toBe(pkg.version);
    expect(plugin.meta.namespace).toBe("no-em-dash");
  });

  test("exports the no-em-dash rule", () => {
    expect(plugin.rules["no-em-dash"]).toBeDefined();
    expect(plugin.rules["no-em-dash"].meta).toBeDefined();
    expect(plugin.rules["no-em-dash"].create).toBeDefined();
  });

  test("exports recommended config for legacy format", () => {
    expect(plugin.configs.recommended).toBeDefined();
    expect(plugin.configs.recommended.plugins).toContain("no-em-dash");
    expect(plugin.configs.recommended.rules["no-em-dash/no-em-dash"]).toBe("error");
  });

  test("exports flat/recommended config for ESLint 9.x", () => {
    expect(plugin.configs["flat/recommended"]).toBeDefined();
    expect(plugin.configs["flat/recommended"].plugins["no-em-dash"]).toBe(plugin);
    expect(plugin.configs["flat/recommended"].rules["no-em-dash/no-em-dash"]).toBe("error");
  });

  test("exports flat as alias to flat/recommended", () => {
    expect(plugin.configs.flat).toBe(plugin.configs["flat/recommended"]);
  });

  test("exports recommended-flat as alias to flat/recommended", () => {
    expect(plugin.configs["recommended-flat"]).toBe(plugin.configs["flat/recommended"]);
  });
});
