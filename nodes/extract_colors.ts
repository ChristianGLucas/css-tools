import { Stylesheet, ColorList, ColorEntry } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as csstree from 'css-tree';
import {
  parseTolerant,
  buildRuleIndexMap,
  errorMessage,
  CSS_NAMED_COLORS,
  CSS_SPECIAL_COLOR_KEYWORDS,
  CSS_COLOR_FUNCTIONS,
} from './lib';

/**
 * List every color value used in a declaration: hex (#fff, #ff0000),
 * function (rgb/rgba/hsl/hsla/hwb/lab/lch/oklab/oklch/color/color-mix),
 * and named-keyword colors (the 148 CSS Color Module keywords, plus
 * "transparent" and "currentcolor") — each with its own source text, which
 * declaration property it was found in, and its owning rule's index (-1
 * when the declaration is not inside a top-level style rule, e.g.
 * @font-face). Lexical, not resolved: a var()-referenced color is reported
 * at its var()-using declaration only if that declaration's own text also
 * happens to contain a literal color.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractColors(ax: AxiomContext, input: Stylesheet): ColorList {
  const out = new ColorList();
  try {
    const { ast } = parseTolerant(input.getCss());
    const ruleIndex = buildRuleIndexMap(ast);
    const entries: ColorEntry[] = [];

    function push(value: string, format: string, property: string, rule: csstree.Rule | null) {
      const e = new ColorEntry();
      e.setValue(value);
      e.setFormat(format);
      e.setProperty(property);
      e.setRuleIndex(rule ? ruleIndex.get(rule) ?? -1 : -1);
      entries.push(e);
    }

    csstree.walk(ast, {
      visit: 'Hash',
      enter(node) {
        if (!this.declaration) return;
        push(`#${node.value}`, 'hex', this.declaration.property, this.rule);
      },
    });

    csstree.walk(ast, {
      visit: 'Function',
      enter(node) {
        if (!this.declaration) return;
        if (!CSS_COLOR_FUNCTIONS.has(node.name.toLowerCase())) return;
        push(csstree.generate(node), 'function', this.declaration.property, this.rule);
      },
    });

    csstree.walk(ast, {
      visit: 'Identifier',
      enter(node) {
        if (!this.declaration) return;
        const lower = node.name.toLowerCase();
        if (CSS_NAMED_COLORS.has(lower) || CSS_SPECIAL_COLOR_KEYWORDS.has(lower)) {
          push(node.name, 'keyword', this.declaration.property, this.rule);
        }
      },
    });

    out.setColorsList(entries);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting colors'));
    return out;
  }
}
