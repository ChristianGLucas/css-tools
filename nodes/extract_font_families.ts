import { Stylesheet, FontFamilyList } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as csstree from 'css-tree';
import { parseTolerant, errorMessage } from './lib';

/** Splits a font-family Value's children into comma-separated groups and
 * renders each group as one family name: a single quoted String unwraps to
 * its bare value; one or more Identifiers join with a space (e.g.
 * "Helvetica Neue" written unquoted as two Identifier tokens). */
function familyNamesFromValue(value: csstree.CssNode): string[] {
  if (value.type !== 'Value') return [];
  const groups: csstree.CssNode[][] = [[]];
  (value as csstree.Value).children.forEach((child) => {
    if (child.type === 'Operator' && (child as csstree.Operator).value === ',') {
      groups.push([]);
    } else if (child.type !== 'WhiteSpace') {
      groups[groups.length - 1].push(child);
    }
  });
  const names: string[] = [];
  for (const group of groups) {
    if (group.length === 0) continue;
    if (group.length === 1 && group[0].type === 'String') {
      names.push((group[0] as csstree.StringNode).value);
    } else {
      const parts = group
        .filter((n) => n.type === 'Identifier')
        .map((n) => (n as csstree.Identifier).name);
      if (parts.length > 0) {
        names.push(parts.join(' '));
      } else {
        // Not a plain identifier/string family (e.g. a stray token) — fall
        // back to its raw source text rather than dropping it silently.
        names.push(group.map((n) => csstree.generate(n)).join(' '));
      }
    }
  }
  return names;
}

/**
 * List every distinct font-family name found in font-family declaration
 * values (each comma-separated entry, quotes stripped and multi-word
 * unquoted names like "Helvetica Neue" rejoined), in first-seen order
 * across the stylesheet. Generic keywords (sans-serif, monospace, inherit,
 * etc.) are included as written — not distinguished from named families.
 * Deliberately does NOT parse the `font` shorthand: its family segment's
 * position depends on the preceding style/weight/size/line-height tokens,
 * and a heuristic gets it right most of the time but not reliably — see
 * the `font-family` longhand for a stylesheet using the shorthand instead,
 * or ParseValue on the raw `font` value.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractFontFamilies(ax: AxiomContext, input: Stylesheet): FontFamilyList {
  const out = new FontFamilyList();
  try {
    const { ast } = parseTolerant(input.getCss());
    const seen = new Set<string>();
    const families: string[] = [];
    csstree.walk(ast, {
      visit: 'Declaration',
      enter(node) {
        if (node.property.toLowerCase() !== 'font-family') return;
        if (node.value.type !== 'Value') return;
        for (const name of familyNamesFromValue(node.value)) {
          if (!seen.has(name)) {
            seen.add(name);
            families.push(name);
          }
        }
      },
    });
    out.setFamiliesList(families);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting font families'));
    return out;
  }
}
