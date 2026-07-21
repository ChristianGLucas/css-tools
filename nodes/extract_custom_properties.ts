import { Stylesheet, CustomPropertyList, CustomPropertyEntry } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as csstree from 'css-tree';
import { parseTolerant, errorMessage } from './lib';

interface Entry {
  declared: boolean;
  referenced: boolean;
  lastDeclaredValue: string;
  declarationCount: number;
  referenceCount: number;
}

/**
 * List every custom property (CSS variable) name declared (--name: value)
 * and/or referenced (var(--name, ...)) anywhere in the stylesheet, merged
 * into one entry per name with declared/referenced flags, counts, and the
 * last declaration's value (source order — what the cascade uses to break
 * equal-specificity ties).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractCustomProperties(ax: AxiomContext, input: Stylesheet): CustomPropertyList {
  const out = new CustomPropertyList();
  try {
    const { ast } = parseTolerant(input.getCss());
    const byName = new Map<string, Entry>();

    function get(name: string): Entry {
      let e = byName.get(name);
      if (!e) {
        e = { declared: false, referenced: false, lastDeclaredValue: '', declarationCount: 0, referenceCount: 0 };
        byName.set(name, e);
      }
      return e;
    }

    csstree.walk(ast, {
      visit: 'Declaration',
      enter(node) {
        if (!node.property.startsWith('--')) return;
        const e = get(node.property);
        e.declared = true;
        e.declarationCount += 1;
        e.lastDeclaredValue = csstree.generate(node.value);
      },
    });

    csstree.walk(ast, {
      visit: 'Function',
      enter(node) {
        if (node.name.toLowerCase() !== 'var') return;
        const first = node.children.first;
        if (first && first.type === 'Identifier' && first.name.startsWith('--')) {
          const e = get(first.name);
          e.referenced = true;
          e.referenceCount += 1;
        }
      },
    });

    const entries: CustomPropertyEntry[] = [];
    byName.forEach((info, name) => {
      const e = new CustomPropertyEntry();
      e.setName(name);
      e.setDeclared(info.declared);
      e.setReferenced(info.referenced);
      e.setLastDeclaredValue(info.lastDeclaredValue);
      e.setDeclarationCount(info.declarationCount);
      e.setReferenceCount(info.referenceCount);
      entries.push(e);
    });
    out.setPropertiesList(entries);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting custom properties'));
    return out;
  }
}
