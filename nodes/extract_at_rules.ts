import { Stylesheet, AtRuleList, AtRuleEntry, DeclarationEntry } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as csstree from 'css-tree';
import { parseTolerant, declarationsFromBlock, errorMessage } from './lib';

/**
 * List every at-rule (@media, @import, @font-face, @keyframes, @supports,
 * @charset, @namespace, @page, and any other) with its name, prelude
 * source text, and body — either re-serialized nested CSS (body_css, for
 * @media/@supports/@keyframes) or a flat declaration list (declarations,
 * for @font-face/@page), whichever applies.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractAtRules(ax: AxiomContext, input: Stylesheet): AtRuleList {
  const out = new AtRuleList();
  try {
    const { ast } = parseTolerant(input.getCss());
    const entries: AtRuleEntry[] = [];
    let index = 0;
    csstree.walk(ast, {
      visit: 'Atrule',
      enter(node) {
        const e = new AtRuleEntry();
        e.setIndex(index++);
        e.setName(node.name);
        e.setPrelude(node.prelude ? csstree.generate(node.prelude) : '');

        if (node.block) {
          const blockChildren: csstree.CssNode[] = [];
          node.block.children.forEach((c) => blockChildren.push(c));
          const hasDeclarations = blockChildren.some((c) => c.type === 'Declaration');
          if (hasDeclarations) {
            e.setDeclarationsList(
              declarationsFromBlock(node.block).map((d) => {
                const de = new DeclarationEntry();
                de.setProperty(d.property);
                de.setValue(d.value);
                de.setImportant(d.important);
                de.setRuleIndex(-1);
                return de;
              })
            );
          } else {
            e.setBodyCss(blockChildren.map((c) => csstree.generate(c)).join(''));
          }
        }

        entries.push(e);
      },
    });
    out.setAtRulesList(entries);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting at-rules'));
    return out;
  }
}
