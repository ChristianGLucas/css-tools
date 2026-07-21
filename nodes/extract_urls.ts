import { Stylesheet, UrlList, UrlEntry } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as csstree from 'css-tree';
import { parseTolerant, buildRuleIndexMap, errorMessage } from './lib';

/**
 * List every url(...) reference in the stylesheet — background/list-style/
 * cursor images, @font-face src, @import targets, and any other — with the
 * URL text (quotes stripped), the declaration property or at-rule name it
 * was found in, and its owning rule's index (-1 when not inside a
 * top-level style rule, e.g. @import/@font-face).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractUrls(ax: AxiomContext, input: Stylesheet): UrlList {
  const out = new UrlList();
  try {
    const { ast } = parseTolerant(input.getCss());
    const ruleIndex = buildRuleIndexMap(ast);
    const entries: UrlEntry[] = [];

    csstree.walk(ast, {
      visit: 'Url',
      enter(node) {
        const e = new UrlEntry();
        e.setUrl(node.value);
        if (this.declaration) {
          e.setContext(this.declaration.property);
        } else if (this.atrule) {
          e.setContext(this.atrule.name);
        }
        e.setRuleIndex(this.rule ? ruleIndex.get(this.rule) ?? -1 : -1);
        entries.push(e);
      },
    });

    out.setUrlsList(entries);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting urls'));
    return out;
  }
}
