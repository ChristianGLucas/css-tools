import { PrettifyRequest, Stylesheet } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseTolerant, prettyPrint, errorMessage } from './lib';

/**
 * Reformat a stylesheet with consistent indentation, one declaration per
 * line, and a blank line between top-level rules — parses then
 * re-serializes with the package's own indenting printer built on
 * css-tree's AST walker. `indent` sets spaces per level (default 2).
 * Malformed CSS still prettifies whatever parsed (best-effort); only a hard
 * failure sets error.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function prettifyStylesheet(ax: AxiomContext, input: PrettifyRequest): Stylesheet {
  const out = new Stylesheet();
  try {
    const { ast } = parseTolerant(input.getCss());
    const indentSize = input.getIndent() > 0 ? input.getIndent() : 2;
    out.setCss(prettyPrint(ast, indentSize));
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'prettifying stylesheet'));
    return out;
  }
}
