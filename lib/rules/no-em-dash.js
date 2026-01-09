/**
 * @fileoverview Rule to disallow em dash characters in string literals and template literals
 * @author Raanan Avidor
 */

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow em dash characters in string literals and template literals",
      recommended: false,
      url: "https://github.com/ravidorr/eslint-plugin-no-em-dash/blob/main/docs/rules/no-em-dash.md"
    },
    messages: {
      noEmDash: "Em dash character is not allowed in strings. Use a regular hyphen (-) instead."
    },
    schema: []
  },

  create(context) {
    const regex = /\u2014/g; // Em dash character

    /**
     * Check a string value for em dash characters and report any found
     * @param {import('eslint').Rule.Node} node - The AST node
     * @param {string} value - The string value to check
     */
    function checkForEmDash(node, value) {
      // Reset regex lastIndex before each use
      regex.lastIndex = 0;

      while (regex.exec(value) !== null) {
        context.report({
          node,
          messageId: "noEmDash"
        });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === "string") {
          checkForEmDash(node, node.value);
        }
      },

      TemplateElement(node) {
        checkForEmDash(node, node.value.raw);
      }
    };
  }
};

export default rule;
