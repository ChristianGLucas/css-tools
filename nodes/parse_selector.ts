import { SelectorInput, SelectorResult, ParsedSelector, SelectorComponent, Specificity } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as csstree from 'css-tree';
import { parseSelectorList, selectorSpecificity, selectorComponentKind, errorMessage } from './lib';

/**
 * Parse a selector (or comma-separated selector list) into its structured
 * simple-selectors/combinators and compute each one's CSS specificity as
 * an (a, b, c) triple per the CSS Selectors spec: a = ID count, b = class +
 * attribute + pseudo-class count, c = type + pseudo-element count;
 * :where() contributes 0; :is()/:not()/:has() contribute their most
 * specific argument (computed recursively).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function parseSelector(ax: AxiomContext, input: SelectorInput): SelectorResult {
  const out = new SelectorResult();
  try {
    const list = parseSelectorList(input.getSelector());
    if (list.type !== 'SelectorList') {
      out.setError('input did not parse as a selector list');
      return out;
    }
    const results: ParsedSelector[] = [];
    (list as csstree.SelectorList).children.forEach((selector) => {
      if (selector.type !== 'Selector') return;
      const ps = new ParsedSelector();
      ps.setText(csstree.generate(selector));

      const components: SelectorComponent[] = [];
      (selector as csstree.Selector).children.forEach((simple) => {
        const c = new SelectorComponent();
        c.setKind(selectorComponentKind(simple));
        c.setText(simple.type === 'Combinator' ? (simple as csstree.Combinator).name : csstree.generate(simple));
        components.push(c);
      });
      ps.setComponentsList(components);

      const spec = selectorSpecificity(selector);
      const specMsg = new Specificity();
      specMsg.setA(spec.a);
      specMsg.setB(spec.b);
      specMsg.setC(spec.c);
      ps.setSpecificity(specMsg);

      results.push(ps);
    });
    out.setSelectorsList(results);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'parsing selector'));
    return out;
  }
}
