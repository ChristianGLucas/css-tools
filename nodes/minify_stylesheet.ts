import { Stylesheet } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as csstree from 'css-tree';
import { parseTolerant, errorMessage } from './lib';

/**
 * Minify a stylesheet: parse then re-serialize, which drops every comment
 * and all non-significant whitespace (css-tree's AST does not retain
 * original formatting, so re-serializing it is already the minified form —
 * no separate minifier pass is needed). Safe and lossless for
 * values/selectors; does not rename or merge selectors. Malformed CSS still
 * minifies whatever parsed (best-effort); only a hard failure (oversized
 * input) sets error.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function minifyStylesheet(ax: AxiomContext, input: Stylesheet): Stylesheet {
  const out = new Stylesheet();
  try {
    const { ast } = parseTolerant(input.getCss());
    out.setCss(csstree.generate(ast));
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'minifying stylesheet'));
    return out;
  }
}
