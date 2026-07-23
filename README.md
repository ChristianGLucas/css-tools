# css-tools

Composable Axiom nodes for deterministic CSS stylesheet parsing, inspection, transformation, and
minification, wrapping [css-tree](https://github.com/csstree/csstree) (MIT) — a fast, spec-compliant
CSS parser/serializer/AST-walker/lexer. Its only transitive dependencies are
[mdn-data](https://github.com/mdn/data) (CC0-1.0) and
[source-map-js](https://github.com/7rulnik/source-map-js) (BSD-3-Clause).

Built for the [Axiom](https://axiomide.com) marketplace, published under the `christiangeorgelucas` handle.

## Use it from your agent or app

Every node in this package is a **live, auto-scaling API endpoint** on the
[Axiom](https://axiomide.com) marketplace — call it from an AI agent or your own
code, with nothing to self-host.

**📦 See it on the marketplace:**
https://dev.axiomide.com/marketplace/christiangeorgelucas/css-tools@0.1.0

**Hook it up to an AI agent (MCP).** Add Axiom's hosted MCP server to any MCP
client and every node becomes a typed tool your agent can call — search the
catalog, inspect a schema, and invoke it directly.

```bash
# Claude Code
claude mcp add --transport http axiom https://api.axiomide.com/mcp \
  --header "Authorization: Bearer $AXIOM_API_KEY"
```

Claude Desktop, Cursor, or any config-based client:

```json
{
  "mcpServers": {
    "axiom": {
      "type": "http",
      "url": "https://api.axiomide.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_AXIOM_API_KEY" }
    }
  }
}
```

**Call it from the CLI.**

```bash
axiom invoke christiangeorgelucas/css-tools/ParseStylesheet --input '{ ... }'
```

**Call it over HTTP.**

```bash
curl -X POST https://api.axiomide.com/invocations/v1/nodes/christiangeorgelucas/css-tools/0.1.0/ParseStylesheet \
  -H "Authorization: Bearer $AXIOM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ ... }'
```

> Input/output schema for each node is on the marketplace page above, or via
> `axiom inspect node christiangeorgelucas/css-tools/ParseStylesheet`.

### Get started free

Install the CLI:

```bash
# macOS / Linux — Homebrew
brew install axiomide/tap/axiom

# macOS / Linux — install script
curl -fsSL https://raw.githubusercontent.com/AxiomIDE/axiom-releases/main/install.sh | sh
```

**Windows:** download the `windows/amd64` `.zip` from the
[releases page](https://github.com/AxiomIDE/axiom-releases/releases), unzip it,
and put `axiom.exe` on your `PATH`.

Then `axiom version` to verify, `axiom login` (GitHub or Google) to authenticate,
and create an API key under **Console → API Keys**. Docs and sign-up at
**[axiomide.com](https://axiomide.com)**.

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
