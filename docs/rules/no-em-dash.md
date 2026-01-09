# no-em-dash

Disallow em dash characters in string literals and template literals.

## Rule Details

This rule reports an error when em dash characters (U+2014) are found in string literals or template literals.

## Why Use This Rule?

- **Consistency**: Em dashes are often inserted by auto-correct in editors and word processors
- **Portability**: They can cause issues in environments expecting ASCII
- **Maintainability**: Regular hyphens are easier to type and more universally supported
- **Copy-paste issues**: Em dashes from external sources can introduce subtle bugs

## Examples

### Incorrect

```js
// Em dash inserted by auto-correct
const message = "Hello - world";

// Em dash in template literal
const greeting = `Welcome - friend`;
```

### Correct

```js
// Use regular hyphen
const message = "Hello - world";

// Or use double hyphen for emphasis
const message = "Hello -- world";
```

## What is an Em Dash?

- **Character**: - (long dash)
- **Unicode**: U+2014
- **Common sources**:
  - macOS: Option + Shift + Hyphen
  - Auto-correct in word processors
  - Copy-paste from websites or documents

**Not to confuse with:**
- Hyphen: `-` (U+002D) - the regular dash on your keyboard
- En dash: `-` (U+2013) - slightly shorter than em dash

## Options

This rule has no configuration options.

## When Not To Use It

You might want to disable this rule if:

- Your project specifically requires em dashes for typography
- You're working on content that needs typographically correct punctuation

To disable for a specific line:

```js
// eslint-disable-next-line no-em-dash/no-em-dash
const quote = "To be - or not to be";
```

## Related Rules

- [no-irregular-whitespace](https://eslint.org/docs/rules/no-irregular-whitespace) - Disallow irregular whitespace characters
