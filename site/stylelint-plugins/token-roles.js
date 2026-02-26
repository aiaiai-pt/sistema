import stylelint from "stylelint";

const { createPlugin, utils } = stylelint;

const ruleName = "aiaiai/token-roles";

const messages = utils.ruleMessages(ruleName, {
  expected: (property, tokenType) =>
    `Expected "${property}" to use a ${tokenType} token or component token`,
  rawToken: (property) =>
    `Unexpected raw token (--raw-*) in "${property}". Use a semantic or component token instead`,
  borderShorthand: (property) =>
    `Border shorthand "${property}" contains a raw width value. Use a --border-width token`,
});

const meta = {
  url: "https://design.aiaiai.pt/foundations/tokens",
};

// Values that are always allowed
const EXEMPT_VALUES = new Set([
  "0",
  "auto",
  "inherit",
  "initial",
  "unset",
  "none",
  "transparent",
  "currentcolor",
  "100%",
  "50%",
]);

// Properties exempt from all checks
const EXEMPT_PROPERTIES = new Set([
  "top",
  "right",
  "bottom",
  "left",
  "width",
  "height",
  "min-height",
  "min-width",
  "max-height",
  "max-width",
  "inset",
  "z-index",
  "opacity",
  "flex",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "order",
  "grid-template-columns",
  "grid-template-rows",
  "grid-column",
  "grid-row",
  "aspect-ratio",
  "transform",
  "translate",
  "rotate",
  "scale",
  "transition",
  "animation",
  "animation-name",
  "animation-duration",
  "animation-delay",
  "animation-timing-function",
  "animation-iteration-count",
  "animation-direction",
  "animation-fill-mode",
  "animation-play-state",
  "content",
  "cursor",
  "pointer-events",
  "user-select",
  "visibility",
  "display",
  "position",
  "overflow",
  "overflow-x",
  "overflow-y",
  "float",
  "clear",
  "vertical-align",
  "text-align",
  "text-decoration",
  "text-transform",
  "text-overflow",
  "white-space",
  "word-break",
  "word-wrap",
  "overflow-wrap",
  "list-style",
  "list-style-type",
  "list-style-position",
  "table-layout",
  "border-collapse",
  "border-spacing",
  "box-sizing",
  "outline",
  "outline-offset",
  "outline-style",
  "outline-width",
  "outline-color",
  "appearance",
  "resize",
  "clip-path",
  "mask",
  "filter",
  "backdrop-filter",
  "mix-blend-mode",
  "isolation",
  "object-fit",
  "object-position",
  "scroll-behavior",
  "scroll-snap-type",
  "scroll-snap-align",
  "will-change",
  "contain",
  "container-type",
  "container-name",
  "accent-color",
  "caret-color",
]);

// SVG presentation attributes
const SVG_PROPERTIES = new Set([
  "stroke-width",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "fill-opacity",
  "fill-rule",
  "clip-rule",
  "dominant-baseline",
  "text-anchor",
]);

// Token role mappings: property -> { tokenPattern, componentPatterns, label }
const COLOR_PROPERTIES = new Set([
  "color",
  "background-color",
  "border-color",
  "fill",
  "stroke",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "box-shadow",
  "text-decoration-color",
  "column-rule-color",
]);

const SPACING_PROPERTIES = new Set([
  "gap",
  "padding",
  "margin",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "row-gap",
  "column-gap",
  "padding-inline",
  "padding-block",
  "margin-inline",
  "margin-block",
  "padding-inline-start",
  "padding-inline-end",
  "padding-block-start",
  "padding-block-end",
  "margin-inline-start",
  "margin-inline-end",
  "margin-block-start",
  "margin-block-end",
]);

const FONT_SIZE_PROPERTIES = new Set(["font-size"]);

const RADIUS_PROPERTIES = new Set([
  "border-radius",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
]);

const BORDER_WIDTH_PROPERTIES = new Set([
  "border-width",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
]);

const BORDER_SHORTHAND_PROPERTIES = new Set([
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-inline",
  "border-block",
  "border-inline-start",
  "border-inline-end",
  "border-block-start",
  "border-block-end",
]);

function getTokenRequirement(prop) {
  const p = prop.toLowerCase();

  if (COLOR_PROPERTIES.has(p)) {
    return {
      semanticPattern: /--color-/,
      componentPatterns: [
        /--\w+-color/,
        /--\w+-bg/,
        /--\w+-fill/,
        /--\w+-stroke/,
      ],
      label: "--color-* semantic",
    };
  }

  if (SPACING_PROPERTIES.has(p)) {
    return {
      semanticPattern: /--space-/,
      componentPatterns: [
        /--\w+-spacing/,
        /--\w+-gap/,
        /--\w+-padding/,
        /--\w+-margin/,
      ],
      label: "--space-* semantic",
    };
  }

  if (FONT_SIZE_PROPERTIES.has(p)) {
    return {
      semanticPattern: /--type-.*-size/,
      componentPatterns: [/--\w+-font-size/, /--\w+-size/],
      label: "--type-*-size semantic",
    };
  }

  if (RADIUS_PROPERTIES.has(p)) {
    return {
      semanticPattern: /--radius-/,
      componentPatterns: [/--\w+-radius/],
      label: "--radius-* semantic",
    };
  }

  if (BORDER_WIDTH_PROPERTIES.has(p)) {
    return {
      semanticPattern: /--border-width/,
      componentPatterns: [/--\w+-border-width/, /--\w+-stroke-width/],
      label: "--border-width* semantic",
    };
  }

  return null;
}

function isInsideKeyframes(node) {
  let parent = node.parent;
  while (parent) {
    if (
      parent.type === "atrule" &&
      parent.name?.toLowerCase() === "keyframes"
    ) {
      return true;
    }
    parent = parent.parent;
  }
  return false;
}

function isInsideMediaQuery(node) {
  let parent = node.parent;
  while (parent) {
    if (parent.type === "atrule" && parent.name?.toLowerCase() === "media") {
      return true;
    }
    parent = parent.parent;
  }
  return false;
}

function containsVar(value) {
  return /var\s*\(/.test(value);
}

function isExemptValue(value) {
  const normalized = value.trim().toLowerCase();
  return EXEMPT_VALUES.has(normalized);
}

function hasMatchingToken(value, requirement) {
  if (requirement.semanticPattern.test(value)) return true;
  return requirement.componentPatterns.some((pattern) => pattern.test(value));
}

function hasRawToken(value) {
  return /--raw-/.test(value);
}

/**
 * Check border shorthand values like "3px solid var(--color-accent)".
 * The width portion (first segment) must use a token.
 */
function checkBorderShorthand(value) {
  const parts = value.trim().split(/\s+/);
  if (parts.length === 0) return { valid: true };

  const widthPart = parts[0];

  // If entire value is exempt
  if (isExemptValue(value)) return { valid: true };

  // If the width part is a var() with a border-width token, it's fine
  if (/var\s*\(/.test(widthPart) && /--border-width/.test(widthPart))
    return { valid: true };
  // Also allow component tokens for width
  if (/var\s*\(/.test(widthPart) && /--\w+-width/.test(widthPart))
    return { valid: true };

  // If width part is 0 or none, fine
  if (widthPart === "0" || widthPart === "none") return { valid: true };

  // If the width part is a raw value (like 3px, 1px), it's a violation
  if (/^\d/.test(widthPart)) return { valid: false, widthPart };

  // If it's a var() but not a border-width token, still pass (could be a component token)
  if (/var\s*\(/.test(widthPart)) return { valid: true };

  return { valid: true };
}

const ruleFunction = (primaryOption, secondaryOptions) => {
  const allowRawTokens = secondaryOptions?.allowRawTokens ?? true;

  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual: primaryOption },
      {
        actual: secondaryOptions,
        possible: { allowRawTokens: [true, false] },
        optional: true,
      },
    );

    if (!validOptions) return;

    root.walkDecls((decl) => {
      const prop = decl.prop;
      const value = decl.value;

      // Skip custom property definitions
      if (prop.startsWith("--")) return;

      // Skip exempt properties
      if (EXEMPT_PROPERTIES.has(prop.toLowerCase())) return;

      // Skip SVG properties
      if (SVG_PROPERTIES.has(prop.toLowerCase())) return;

      // Skip inside @keyframes
      if (isInsideKeyframes(decl)) return;

      // Skip exempt values
      if (isExemptValue(value)) return;

      // Check for raw tokens (--raw-*) when not allowed
      if (!allowRawTokens && containsVar(value) && hasRawToken(value)) {
        utils.report({
          message: messages.rawToken(prop),
          node: decl,
          result,
          ruleName,
        });
        return;
      }

      // Handle border shorthands specially
      if (BORDER_SHORTHAND_PROPERTIES.has(prop.toLowerCase())) {
        const check = checkBorderShorthand(value);
        if (!check.valid) {
          utils.report({
            message: messages.borderShorthand(prop),
            node: decl,
            result,
            ruleName,
          });
        }
        return;
      }

      // Get token requirement for this property
      const requirement = getTokenRequirement(prop);
      if (!requirement) return;

      // If it contains a var() with a custom property, accept it.
      // Any non-raw custom property is valid (semantic or component token).
      // The semantic tier check (--color-* vs --space-*) is intentionally
      // not enforced because component tokens have arbitrary names
      // (e.g., --input-text for color, --button-md-padding-x for spacing).
      if (containsVar(value)) {
        return;
      }

      // No var() at all — raw value used directly
      // Multi-value properties (like margin: 0 auto) — check each part
      const parts = value.trim().split(/\s+/);
      const allExempt = parts.every((part) => isExemptValue(part));
      if (allExempt) return;

      utils.report({
        message: messages.expected(prop, requirement.label),
        node: decl,
        result,
        ruleName,
      });
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
