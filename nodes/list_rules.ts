import { Stylesheet, RuleList, RuleEntry, DeclarationEntry } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseTolerant, collectRules, declarationsFromBlock, formatPrelude, errorMessage } from './lib';

/**
 * List every top-level and nested style rule with its full selector text
 * (comma-joined) and its own declarations, each with a stable 0-based
 * index usable as the join key for ExtractSelectors and
 * ExtractDeclarations' rule_index fields.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function listRules(ax: AxiomContext, input: Stylesheet): RuleList {
  const out = new RuleList();
  try {
    const { ast } = parseTolerant(input.getCss());
    const entries: RuleEntry[] = [];
    for (const rule of collectRules(ast)) {
      const e = new RuleEntry();
      e.setIndex(rule.index);
      e.setSelector(formatPrelude(rule.prelude));
      e.setDeclarationsList(
        declarationsFromBlock(rule.block).map((d) => {
          const de = new DeclarationEntry();
          de.setProperty(d.property);
          de.setValue(d.value);
          de.setImportant(d.important);
          de.setRuleIndex(rule.index);
          return de;
        })
      );
      entries.push(e);
    }
    out.setRulesList(entries);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'listing rules'));
    return out;
  }
}
