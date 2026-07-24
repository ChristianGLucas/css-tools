// Shared bounds, parsing helpers, and small spec-defined glue for the
// css-tools nodes. Not a node and not a test file, so it is neither
// registered nor collected by jest.
//
// The algorithmically hard part — CSS tokenizing, parsing, AST walking, and
// re-serialization — is entirely owned by css-tree; nothing here
// re-implements any of it. What lives here is: (a) input-size and
// nesting-depth bounds enforced BEFORE csstree ever sees the input, (b) a
// css-tree AST <-> JSON bridge, (c) a small indenting pretty-printer built
// on top of csstree's own AST + generate(), and (d) the CSS Selectors spec's
// specificity arithmetic and the CSS Color Module's named-keyword list —
// both of which are simple, spec-defined lookups/arithmetic over the
// structure css-tree already gives us, not parsing logic in their own right.

import * as csstree from 'css-tree';

/**
 * Ceiling on bracket/paren/brace nesting depth, checked with a cheap linear
 * scan BEFORE csstree ever parses the input. csstree's parser and its
 * AST-walking utilities (toPlainObject, walk, generate) are recursive; a
 * hostile input can be small in bytes yet nest deeply (e.g. "rgb(" repeated
 * tens of thousands of times), which measurably degrades from milliseconds
 * to tens of seconds well within the byte cap alone (verified empirically:
 * ~250 KB / 50,000 levels ~1s, scaling worse than linearly). 512 is at least
 * 25x any nesting a real stylesheet exhibits (deepest realistic case is a
 * handful of nested @media/@supports/selector-function levels) while still
 * finishing in low single-digit milliseconds.
 */
export const MAX_NESTING_DEPTH = 512;

export class BoundsError extends Error {}

/** Rejects input whose bracket/paren/brace nesting exceeds MAX_NESTING_DEPTH,
 * via a single linear scan over raw characters (deliberately not
 * string/comment-aware — treating a bracket inside a string as real nesting
 * is a conservative over-count, never an under-count, so it never lets a
 * genuinely-deep structure through). */
export function checkNestingDepth(value: string, field: string): void {
  let depth = 0;
  let maxDepth = 0;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    // ( = 40, [ = 91, { = 123 ; ) = 41, ] = 93, } = 125
    if (c === 40 || c === 91 || c === 123) {
      depth++;
      if (depth > maxDepth) maxDepth = depth;
    } else if (c === 41 || c === 93 || c === 125) {
      if (depth > 0) depth--;
    }
  }
  if (maxDepth > MAX_NESTING_DEPTH) {
    throw new BoundsError(`${field} nesting depth exceeds ${MAX_NESTING_DEPTH}`);
  }
}

/** Turns a caught value into a stable error message. */
export function errorMessage(e: unknown, context: string): string {
  if (e instanceof Error) {
    return `${context}: ${e.message}`;
  }
  return `${context}: ${String(e)}`;
}

export interface SyntaxErrorInfo {
  message: string;
  line: number;
  column: number;
}

export interface TolerantParseResult {
  ast: csstree.CssNode;
  errors: SyntaxErrorInfo[];
}

/** Parses CSS text tolerantly (best-effort, browser-like error recovery),
 * collecting every syntax error with its 1-based source location instead of
 * throwing. Applies the nesting-depth bound first. */
export function parseTolerant(css: string, field = 'css'): TolerantParseResult {
  checkNestingDepth(css, field);
  const errors: SyntaxErrorInfo[] = [];
  const ast = csstree.parse(css, {
    positions: true,
    // Parse custom-property (--x) values as a proper tokenized Value tree
    // instead of css-tree's default opaque Raw text. Without this, every
    // node that walks into declaration values for structure (ExtractColors'
    // Hash/Function/Identifier walk, ExtractCustomProperties' var()
    // detection inside a custom property's OWN value, ParseValue-style
    // introspection) would silently see nothing for a --custom-property
    // declaration, and generate() on the Raw form reproduces the leading
    // whitespace after the colon verbatim (e.g. " 8px" instead of "8px").
    parseCustomProperty: true,
    onParseError(error) {
      // css-tree's runtime error objects carry `line`/`column` (1-based)
      // even though @types/css-tree's SyntaxParseError (extends the bare
      // SyntaxError type) does not declare them.
      const e = error as csstree.SyntaxParseError & { line?: number; column?: number };
      errors.push({
        message: e.rawMessage || e.message,
        line: e.line ?? 0,
        column: e.column ?? 0,
      });
    },
  });
  return { ast, errors };
}

/** Parses a selector or comma-separated selector list (context: 'selectorList'). */
export function parseSelectorList(selector: string): csstree.CssNode {
  checkNestingDepth(selector, 'selector');
  return csstree.parse(selector, { context: 'selectorList' });
}

/** Parses a single declaration value (context: 'value'). */
export function parseValueAst(value: string): csstree.CssNode {
  checkNestingDepth(value, 'value');
  return csstree.parse(value, { context: 'value' });
}

/** Converts a css-tree AST to its JSON plain-object form. */
export function astToJson(ast: csstree.CssNode): string {
  return JSON.stringify(csstree.toPlainObject(ast));
}

/** Parses ast_json (as produced by astToJson) back into a css-tree AST.
 * Throws (caller wraps in try/catch) on malformed JSON or an AST shape
 * css-tree's fromPlainObject rejects. */
export function jsonToAst(astJson: string, field = 'ast_json'): csstree.CssNode {
  let plain: unknown;
  try {
    plain = JSON.parse(astJson);
  } catch (e) {
    throw new BoundsError(`${field} is not valid JSON: ${errorMessage(e, 'parse')}`);
  }
  checkNestingDepth(astJson, field);
  // fromPlainObject expects a plain object tree; a non-object input (e.g. a
  // bare JSON string/number/array) is not a valid AST.
  if (plain === null || typeof plain !== 'object') {
    throw new BoundsError(`${field} is not a css-tree AST object`);
  }
  return csstree.fromPlainObject(plain as csstree.CssNodePlain);
}

export interface CollectedRule {
  index: number;
  prelude: csstree.CssNode;
  block: csstree.Block;
}

/** Walks the AST in document order and returns every style Rule (top-level,
 * nested inside an at-rule block such as @media, or a CSS-nesting child rule,
 * AND @keyframes' own from/to/N% "rules") with a stable 0-based index — the
 * join key ExtractSelectors/ExtractDeclarations/ExtractColors/ExtractUrls
 * use as rule_index and ListRules exposes as RuleEntry.index. */
export function collectRules(ast: csstree.CssNode): CollectedRule[] {
  const rules: CollectedRule[] = [];
  let index = 0;
  csstree.walk(ast, {
    visit: 'Rule',
    enter(node) {
      rules.push({ index: index++, prelude: node.prelude, block: node.block });
    },
  });
  return rules;
}

/** Maps every style Rule AST node to the same 0-based index collectRules
 * would assign it (same traversal, same order) — used by nodes that walk
 * the WHOLE ast for a node type nested inside declaration values (colors,
 * urls) and need to recover which enclosing rule (if any) it came from via
 * WalkContext.rule. A Declaration outside any style rule (e.g. inside
 * @font-face's plain declaration block) maps to no entry here; look it up
 * with `?? -1`. */
export function buildRuleIndexMap(ast: csstree.CssNode): Map<csstree.CssNode, number> {
  const map = new Map<csstree.CssNode, number>();
  let index = 0;
  csstree.walk(ast, {
    visit: 'Rule',
    enter(node) {
      map.set(node, index++);
    },
  });
  return map;
}

export interface DeclInfo {
  property: string;
  value: string;
  important: boolean;
}

/** Extracts the direct Declaration children of a block (Rule block or
 * plain-declaration-block at-rule like @font-face/@page) as plain info. */
export function declarationsFromBlock(block: csstree.Block | null): DeclInfo[] {
  if (!block) return [];
  const out: DeclInfo[] = [];
  block.children.forEach((child) => {
    if (child.type === 'Declaration') {
      const d = child as csstree.Declaration;
      out.push({
        property: d.property,
        value: csstree.generate(d.value),
        important: d.important === true,
      });
    }
  });
  return out;
}

/** Formats a Rule/SelectorList prelude as comma-space-joined selector text
 * (css-tree's own generate() joins selectors with a bare "," for compact
 * output; this is the human-readable form used by ListRules/PrettifyStylesheet). */
export function formatPrelude(prelude: csstree.CssNode | null): string {
  if (!prelude) return '';
  if (prelude.type === 'SelectorList') {
    const parts: string[] = [];
    prelude.children.forEach((s) => parts.push(csstree.generate(s)));
    return parts.join(', ');
  }
  return csstree.generate(prelude);
}

/** Indenting pretty-printer built on css-tree's AST + generate(). Handles
 * StyleSheet / Rule / Atrule / Block generically by node.type so it also
 * reformats CSS-nesting (a Rule block containing nested Rules). Anything
 * else (bare declarations passed at the top level, etc.) falls back to a
 * single-line csstree.generate(). */
export function prettyPrint(ast: csstree.CssNode, indentSize: number): string {
  return prettyNode(ast, 0, indentSize);
}

function ind(depth: number, indentSize: number): string {
  return ' '.repeat(depth * indentSize);
}

function prettyNode(node: csstree.CssNode, depth: number, indentSize: number): string {
  if (node.type === 'StyleSheet') {
    const parts: string[] = [];
    (node as csstree.StyleSheet).children.forEach((c) => parts.push(prettyNode(c, depth, indentSize)));
    return parts.join('\n\n');
  }
  if (node.type === 'Rule') {
    const rule = node as csstree.Rule;
    const prelude = formatPrelude(rule.prelude);
    const body = prettyBlock(rule.block, depth + 1, indentSize);
    const open = prelude ? `${ind(depth, indentSize)}${prelude} {` : `${ind(depth, indentSize)}{`;
    return body.length > 0 ? `${open}\n${body}\n${ind(depth, indentSize)}}` : `${open}\n${ind(depth, indentSize)}}`;
  }
  if (node.type === 'Atrule') {
    const atrule = node as csstree.Atrule;
    const preludeText = atrule.prelude ? ` ${csstree.generate(atrule.prelude)}` : '';
    if (atrule.block) {
      const body = prettyBlock(atrule.block, depth + 1, indentSize);
      const open = `${ind(depth, indentSize)}@${atrule.name}${preludeText} {`;
      return body.length > 0 ? `${open}\n${body}\n${ind(depth, indentSize)}}` : `${open}\n${ind(depth, indentSize)}}`;
    }
    return `${ind(depth, indentSize)}@${atrule.name}${preludeText};`;
  }
  return `${ind(depth, indentSize)}${csstree.generate(node)}`;
}

function prettyBlock(block: csstree.Block | null, depth: number, indentSize: number): string {
  if (!block) return '';
  const lines: string[] = [];
  block.children.forEach((child) => {
    if (child.type === 'Declaration') {
      const decl = child as csstree.Declaration;
      const val = csstree.generate(decl.value);
      lines.push(`${ind(depth, indentSize)}${decl.property}: ${val}${decl.important ? ' !important' : ''};`);
    } else {
      lines.push(prettyNode(child, depth, indentSize));
    }
  });
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Selector specificity (CSS Selectors spec, "Calculating a selector's
// specificity" — https://www.w3.org/TR/selectors-4/#specificity-rules).
// Simple arithmetic + a type-name lookup over the structure css-tree already
// parsed; not parsing logic.
// ---------------------------------------------------------------------------

export interface SpecificityTriple {
  a: number;
  b: number;
  c: number;
}

const ZERO_SPECIFICITY: SpecificityTriple = { a: 0, b: 0, c: 0 };

function addSpecificity(x: SpecificityTriple, y: SpecificityTriple): SpecificityTriple {
  return { a: x.a + y.a, b: x.b + y.b, c: x.c + y.c };
}

function maxSpecificity(x: SpecificityTriple, y: SpecificityTriple): SpecificityTriple {
  if (x.a !== y.a) return x.a > y.a ? x : y;
  if (x.b !== y.b) return x.b > y.b ? x : y;
  return x.c >= y.c ? x : y;
}

/** Specificity of the most specific selector inside a forgiving selector list
 * (the argument list of :is()/:not()/:has(), which css-tree parses as a
 * single SelectorList child of the PseudoClassSelector), per spec.
 * Empty/unparseable argument lists contribute zero. */
function maxArgumentSpecificity(pseudoChildren: csstree.List<csstree.CssNode>): SpecificityTriple {
  let best = ZERO_SPECIFICITY;
  pseudoChildren.forEach((child) => {
    if (child.type === 'SelectorList') {
      (child as csstree.SelectorList).children.forEach((selector) => {
        if (selector.type === 'Selector') {
          best = maxSpecificity(best, selectorSpecificity(selector));
        }
      });
    }
  });
  return best;
}

/** Computes the (a, b, c) specificity triple of a single parsed Selector node. */
export function selectorSpecificity(selector: csstree.CssNode): SpecificityTriple {
  let total = ZERO_SPECIFICITY;
  if (!('children' in selector) || !selector.children) return total;
  (selector as csstree.Selector).children.forEach((simple) => {
    switch (simple.type) {
      case 'IdSelector':
        total = addSpecificity(total, { a: 1, b: 0, c: 0 });
        break;
      case 'ClassSelector':
      case 'AttributeSelector':
        total = addSpecificity(total, { a: 0, b: 1, c: 0 });
        break;
      case 'PseudoClassSelector': {
        const name = simple.name.toLowerCase();
        if (name === 'where') {
          // :where() always contributes zero.
          break;
        }
        if ((name === 'is' || name === 'not' || name === 'has') && simple.children) {
          total = addSpecificity(total, maxArgumentSpecificity(simple.children));
          break;
        }
        total = addSpecificity(total, { a: 0, b: 1, c: 0 });
        break;
      }
      case 'PseudoElementSelector':
        total = addSpecificity(total, { a: 0, b: 0, c: 1 });
        break;
      case 'TypeSelector':
        // The universal selector "*" contributes nothing; a real tag name does.
        if (simple.name !== '*') {
          total = addSpecificity(total, { a: 0, b: 0, c: 1 });
        }
        break;
      // NestingSelector ("&") and Combinator contribute nothing directly.
      default:
        break;
    }
  });
  return total;
}

/** Classifies a simple-selector/combinator AST node into ParseSelector's
 * SelectorComponent.kind vocabulary. */
export function selectorComponentKind(node: csstree.CssNode): string {
  switch (node.type) {
    case 'TypeSelector':
      return (node as csstree.TypeSelector).name === '*' ? 'universal' : 'type';
    case 'ClassSelector':
      return 'class';
    case 'IdSelector':
      return 'id';
    case 'AttributeSelector':
      return 'attribute';
    case 'PseudoClassSelector':
      return 'pseudo-class';
    case 'PseudoElementSelector':
      return 'pseudo-element';
    case 'NestingSelector':
      return 'nesting';
    case 'Combinator':
      return 'combinator';
    case 'WhiteSpace':
      return 'combinator';
    default:
      return node.type.toLowerCase();
  }
}

// ---------------------------------------------------------------------------
// CSS Color Module Level 4 named-color keywords (the 148 keywords defined by
// https://www.w3.org/TR/css-color-4/#named-colors, i.e. CSS2's 16 basic
// keywords plus the SVG/X11-derived extended set every browser implements),
// plus the two special color keywords "transparent" and "currentcolor".
// This is a fixed, spec-defined vocabulary (facts, not algorithmic logic),
// used only to CLASSIFY an Identifier css-tree already parsed as a color.
// ---------------------------------------------------------------------------

export const CSS_NAMED_COLORS: ReadonlySet<string> = new Set([
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque',
  'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood',
  'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk',
  'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray',
  'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen',
  'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
  'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise',
  'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue',
  'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro',
  'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey',
  'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
  'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral',
  'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey',
  'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
  'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen',
  'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue',
  'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue',
  'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue',
  'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace',
  'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
  'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff',
  'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red',
  'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
  'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray',
  'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle',
  'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow',
  'yellowgreen',
]);

export const CSS_SPECIAL_COLOR_KEYWORDS: ReadonlySet<string> = new Set([
  'transparent', 'currentcolor',
]);

/** The color-function names ExtractColors recognizes. */
export const CSS_COLOR_FUNCTIONS: ReadonlySet<string> = new Set([
  'rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color',
  'color-mix',
]);
