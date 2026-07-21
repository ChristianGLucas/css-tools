import { AstInput, Stylesheet } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as csstree from 'css-tree';
import { jsonToAst, errorMessage } from './lib';

/**
 * Serialize a css-tree plain-object AST (as produced by ParseStylesheet's
 * ast_json, unmodified or edited) back into CSS source text. A malformed or
 * unrecognized AST shape returns a structured error rather than throwing.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function serializeStylesheet(ax: AxiomContext, input: AstInput): Stylesheet {
  const out = new Stylesheet();
  try {
    const ast = jsonToAst(input.getAstJson());
    out.setCss(csstree.generate(ast));
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'serializing stylesheet'));
    return out;
  }
}
