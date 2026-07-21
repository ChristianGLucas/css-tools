import { Stylesheet, SelectorList, SelectorEntry } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as csstree from 'css-tree';
import { parseTolerant, collectRules, errorMessage } from './lib';

/**
 * List every selector in the stylesheet (each comma-separated selector in a
 * rule's prelude counted individually), with its own source text and the
 * 0-based index of its owning rule — join rule_index against ListRules'
 * RuleEntry.index to recover that rule's declarations.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractSelectors(ax: AxiomContext, input: Stylesheet): SelectorList {
  const out = new SelectorList();
  try {
    const { ast } = parseTolerant(input.getCss());
    const entries: SelectorEntry[] = [];
    for (const rule of collectRules(ast)) {
      if (rule.prelude.type === 'SelectorList') {
        (rule.prelude as csstree.SelectorList).children.forEach((selector) => {
          const e = new SelectorEntry();
          e.setSelector(csstree.generate(selector));
          e.setRuleIndex(rule.index);
          entries.push(e);
        });
      } else {
        // A Raw (unparseable) prelude still gets one entry with its raw text.
        const e = new SelectorEntry();
        e.setSelector(csstree.generate(rule.prelude));
        e.setRuleIndex(rule.index);
        entries.push(e);
      }
    }
    out.setSelectorsList(entries);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting selectors'));
    return out;
  }
}
