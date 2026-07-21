import { Stylesheet, ParseResult, CssSyntaxError } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseTolerant, astToJson, errorMessage } from './lib';

/**
 * Parse a CSS stylesheet into a structured JSON AST (css-tree's own
 * plain-object form: {type, children:[...]} recursively) — feed ast_json
 * straight into SerializeStylesheet to round-trip, with or without editing
 * it. Parsing is tolerant and best-effort like a browser's: malformed CSS
 * still yields an AST plus syntax_errors (each with a 1-based line/column),
 * never a hard failure. error is set only for a genuine failure (oversized
 * input, internal fault).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function parseStylesheet(ax: AxiomContext, input: Stylesheet): ParseResult {
  const out = new ParseResult();
  try {
    const { ast, errors } = parseTolerant(input.getCss());
    out.setAstJson(astToJson(ast));
    out.setSyntaxErrorsList(
      errors.map((e) => {
        const se = new CssSyntaxError();
        se.setMessage(e.message);
        se.setLine(e.line);
        se.setColumn(e.column);
        return se;
      })
    );
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'parsing stylesheet'));
    return out;
  }
}
