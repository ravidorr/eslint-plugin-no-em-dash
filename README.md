# eslint-plugin-no-em-dash

[![npm version](https://img.shields.io/npm/v/eslint-plugin-no-em-dash.svg)](https://www.npmjs.com/package/eslint-plugin-no-em-dash)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-no-em-dash.svg)](https://www.npmjs.com/package/eslint-plugin-no-em-dash)
[![CI](https://github.com/ravidorr/eslint-plugin-no-em-dash/actions/workflows/ci.yml/badge.svg)](https://github.com/ravidorr/eslint-plugin-no-em-dash/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ravidorr/eslint-plugin-no-em-dash/branch/main/graph/badge.svg)](https://codecov.io/gh/ravidorr/eslint-plugin-no-em-dash)
[![npm bundle size](https://img.shields.io/bundlephobia/min/eslint-plugin-no-em-dash)](https://bundlephobia.com/package/eslint-plugin-no-em-dash)
[![node](https://img.shields.io/node/v/eslint-plugin-no-em-dash.svg)](https://www.npmjs.com/package/eslint-plugin-no-em-dash)
[![ESLint](https://img.shields.io/badge/ESLint->=8.0.0-4B32C3?logo=eslint)](https://eslint.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/ravidorr/eslint-plugin-no-em-dash/pulls)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/ravidorr/eslint-plugin-no-em-dash/graphs/commit-activity)

ESLint rule to disallow em dash characters in code.

## Requirements

- Node.js >= 18.18.0
- ESLint >= 8.0.0

## Installation

```bash
npm install eslint-plugin-no-em-dash --save-dev
```

## Usage

### ESLint 9.x (Flat Config) - Recommended

In your `eslint.config.js`:

```js
import noEmDash from "eslint-plugin-no-em-dash";

export default [
  // Use the recommended flat config
  noEmDash.configs["flat/recommended"],

  // Or configure manually
  {
    plugins: {
      "no-em-dash": noEmDash
    },
    rules: {
      "no-em-dash/no-em-dash": "error"
    }
  }
];
```

### ESLint 8.x (Legacy Config)

In your `.eslintrc.js` or `.eslintrc.json`:

```json
{
  "plugins": ["no-em-dash"],
  "rules": {
    "no-em-dash/no-em-dash": "error"
  }
}
```

Or use the recommended config:

```json
{
  "extends": ["plugin:no-em-dash/recommended"]
}
```

## Rules

### no-em-dash

Disallows em dash characters (U+2014) in string literals and template literals.

#### Why?

- Em dashes are often inserted by auto-correct in editors and word processors
- They can cause issues when code is shared across different environments
- Regular hyphens are easier to type and more universally supported
- Prevents copy-paste issues from external documents

Examples of **incorrect** code:

```js
const message = "Hello - world";  // em dash
const template = `Status - OK`;   // em dash
```

Examples of **correct** code:

```js
const message = "Hello - world";  // regular hyphen
const template = `Status - OK`;   // regular hyphen
```

## License

MIT
