import { ValueInput, ValueResult, ValueToken } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as csstree from 'css-tree';
import { parseValueAst, errorMessage } from './lib';

/**
 * Tokenize a single declaration value (the part after the colon) into its
 * top-level components — dimensions, identifiers, functions, strings,
 * hashes, percentages, numbers, operators, urls — each with css-tree's own
 * AST node type and its own source text. A function's arguments are not
 * flattened; re-parse a Function token's text to descend into it.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function parseValue(ax: AxiomContext, input: ValueInput): ValueResult {
  const out = new ValueResult();
  try {
    const value = parseValueAst(input.getValue());
    if (value.type !== 'Value') {
      out.setError('input did not parse as a value');
      return out;
    }
    const tokens: ValueToken[] = [];
    (value as csstree.Value).children.forEach((child) => {
      if (child.type === 'WhiteSpace') return;
      const t = new ValueToken();
      t.setType(child.type);
      t.setText(csstree.generate(child));
      tokens.push(t);
    });
    out.setTokensList(tokens);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'parsing value'));
    return out;
  }
}
