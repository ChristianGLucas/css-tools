# css-tools

Composable Axiom nodes for deterministic CSS stylesheet parsing, inspection, transformation, and
minification, wrapping [css-tree](https://github.com/csstree/csstree) (MIT) — a fast, spec-compliant
CSS parser/serializer/AST-walker/lexer. Its only transitive dependencies are
[mdn-data](https://github.com/mdn/data) (CC0-1.0) and
[source-map-js](https://github.com/7rulnik/source-map-js) (BSD-3-Clause).

Built for the [Axiom](https://axiomide.com) marketplace, published under the `christiangeorgelucas` handle.

## What's here

Every node is a pure, stateless, deterministic function: CSS text (or a JSON AST, or a single
selector/value fragment) in, a structured result out. Parsing is tolerant and best-effort — like a
browser's — so malformed CSS never crashes a node; it comes back with reported errors instead.

**Whole stylesheet, text <-> text/AST:**
- `ParseStylesheet` — CSS text -> a structured JSON AST (css-tree's own plain-object form), plus any
  syntax errors with source location.
- `SerializeStylesheet` — a JSON AST back to CSS text.
- `MinifyStylesheet` — strip comments and non-significant whitespace.
- `PrettifyStylesheet` — reformat with consistent indentation.
- `ValidateStylesheet` — check every declaration's value and every at-rule's prelude against the CSS
  spec's formal grammar, reporting syntax errors (with location) and grammar mismatches separately.

**Whole stylesheet, structured extraction:**
- `ExtractSelectors` / `ExtractDeclarations` / `ListRules` — the three views of a stylesheet's rules,
  cross-referenced by a shared rule index.
- `ExtractAtRules` — every `@media`/`@import`/`@font-face`/`@keyframes`/... with its prelude and body.
- `ExtractColors` — every hex/function/named-keyword color, with its declaration context.
- `ExtractCustomProperties` — every CSS variable, merging its declaration(s) and `var()` reference(s).
- `ExtractFontFamilies` — every `font-family` name, quotes stripped.
- `ExtractUrls` — every `url(...)` reference, wherever it appears.

**Single fragment:**
- `ParseSelector` — a selector (or comma-separated list) into its simple-selectors/combinators, with
  computed CSS specificity (`a, b, c`) per the CSS Selectors spec, including `:is()`/`:not()`/`:has()`/
  `:where()`'s special specificity rules.
- `ParseValue` — a single declaration value into its top-level tokens (dimensions, functions, strings,
  colors, ...).

## Design

The canonical envelope is `Stylesheet` (`css` in, `css`/`error` out) — `MinifyStylesheet` and
`PrettifyStylesheet` consume and produce it directly, so they compose with each other and with
`SerializeStylesheet`'s output; every inspection node also accepts it as input. Rule-scoped extraction
results (`SelectorEntry`, `DeclarationEntry`, `ColorEntry`, `UrlEntry`) all carry a `rule_index` that
joins against `ListRules`' `RuleEntry.index` — the same stylesheet parsed by two different nodes yields
consistent, cross-referenceable indices.

Nodes are bounded against oversized input (5 MiB) and against pathologically deep nesting (a cheap
bracket/paren/brace depth scan runs before css-tree ever sees the text — deep-but-small-in-bytes input
like `"rgb("` repeated tens of thousands of times measurably degrades parse time well within the byte
cap alone). `ValidateStylesheet` skips custom properties and any value referencing `var()`/`env()` —
their value is only known at compute time, so there is nothing to statically check; flagging them would
falsely invalidate some of the most common patterns in modern CSS.

## License

MIT. See `LICENSE`. Wraps css-tree (MIT), mdn-data (CC0-1.0), and source-map-js (BSD-3-Clause).
