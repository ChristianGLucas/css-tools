// Shared test context and independent oracles for css-tools node unit
// tests. Not a node and not a test file (no describe/it), so it is neither
// registered as a node nor collected by jest.
import {
  AxiomContext,
  AxiomLogger,
  AxiomSecrets,
  AxiomReflection,
  AxiomMutation,
} from '../gen/axiomContext';

const reflection: AxiomReflection = {
  flow: {
    nodes: [],
    edges: [],
    loopEdges: [],
    position: { currentInstance: 0, depth: 0, loopIterations: {}, subflowStackGraphIds: [] },
    graphId: '',
  },
};

const mutation: AxiomMutation = {
  flow: {
    addNode: (_p: string, _v: string) => 0,
    addEdge: (_s: number, _d: number) => {},
  },
};

/** Recursively strips `loc` (source position) fields from a css-tree
 * plain-object AST, for comparing two ASTs parsed from DIFFERENT source
 * text (e.g. original vs. re-serialized/minified/prettified) where the
 * semantic structure should match but line/column/offset legitimately
 * differ because the text itself is shorter/differently formatted. */
export function stripLoc(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(stripLoc);
  }
  if (node !== null && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === 'loc') continue;
      out[key] = stripLoc(value);
    }
    return out;
  }
  return node;
}

export const ctx: AxiomContext = {
  log: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} } satisfies AxiomLogger,
  secrets: { get: (_n: string): [string, boolean] => ['', false] } satisfies AxiomSecrets,
  executionId: 'test-execution-id',
  flowId: 'test-flow-id',
  tenantId: 'test-tenant-id',
  reflection,
  mutation,
};

/**
 * INDEPENDENT ORACLE #1 — the CSS Selectors Level 4 spec's OWN worked
 * specificity examples (https://www.w3.org/TR/selectors-4/#specificity-rules,
 * "Example 8"), transcribed by hand from the spec text, not computed by
 * calling this package's own ParseSelector. Each entry is (selector,
 * a, b, c) as the spec states it.
 */
export const SPEC_SPECIFICITY_EXAMPLES: Array<{
  selector: string;
  a: number;
  b: number;
  c: number;
}> = [
  // "*" - universal selector: specificity = (0,0,0)
  { selector: '*', a: 0, b: 0, c: 0 },
  // "LI" - type selector: specificity = (0,0,1)
  { selector: 'li', a: 0, b: 0, c: 1 },
  // "UL LI" - type selectors: specificity = (0,0,2)
  { selector: 'ul li', a: 0, b: 0, c: 2 },
  // "UL OL+LI" - type selectors: specificity = (0,0,3)
  { selector: 'ul ol+li', a: 0, b: 0, c: 3 },
  // "H1 + *[REL=up]" - a type selector and an attribute selector: (0,1,1)
  { selector: 'h1 + *[rel=up]', a: 0, b: 1, c: 1 },
  // "UL OL LI.red" - 3 type selectors and a class selector: (0,1,3)
  { selector: 'ul ol li.red', a: 0, b: 1, c: 3 },
  // "LI.red.level" - a class selector repeated twice: (0,2,1)
  { selector: 'li.red.level', a: 0, b: 2, c: 1 },
  // "#x34y" - an id selector: (1,0,0)
  { selector: '#x34y', a: 1, b: 0, c: 0 },
  // "#s12:not(FOO)" - an id selector and a negation pseudo-class (which
  // counts as a type selector for its argument): (1,0,1)
  { selector: '#s12:not(foo)', a: 1, b: 0, c: 1 },
  // ".foo :is(.bar, #baz)" - :is() takes the specificity of its most
  // specific argument, per spec: (1,1,0)
  { selector: '.foo :is(.bar, #baz)', a: 1, b: 1, c: 0 },
];

/**
 * INDEPENDENT ORACLE #2 — the CSS Color Module Level 4 spec's published hex
 * <-> named-color equivalences (https://www.w3.org/TR/css-color-4/#named-colors,
 * the table mapping each keyword to its RGB hex value), transcribed by hand
 * for a handful of well-known keywords — not derived by running this
 * package's own extraction logic.
 */
export const SPEC_NAMED_COLOR_HEX: Array<{ keyword: string; hex: string }> = [
  { keyword: 'black', hex: '#000000' },
  { keyword: 'white', hex: '#ffffff' },
  { keyword: 'red', hex: '#ff0000' },
  { keyword: 'lime', hex: '#00ff00' },
  { keyword: 'blue', hex: '#0000ff' },
  { keyword: 'rebeccapurple', hex: '#663399' },
];
