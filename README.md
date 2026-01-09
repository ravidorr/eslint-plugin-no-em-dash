# eslint-plugin-no-em-dash

[![npm version](https://img.shields.io/npm/v/eslint-plugin-no-em-dash.svg)](https://www.npmjs.com/package/eslint-plugin-no-em-dash)
[![CI](https://github.com/ravidorr/eslint-plugin-no-em-dash/actions/workflows/ci.yml/badge.svg)](https://github.com/ravidorr/eslint-plugin-no-em-dash/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
