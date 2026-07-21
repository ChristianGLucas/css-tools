import { Stylesheet, DeclarationList, DeclarationEntry } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseTolerant, collectRules, declarationsFromBlock, errorMessage } from './lib';

/**
 * List every property/value declaration across all style rules (source
 * text order), each with its property, value (source text), the
 * !important flag, and its owning rule's 0-based index. Declarations
 * inside at-rule blocks (e.g. @font-face) are NOT included here — see
 * ExtractAtRules' AtRuleEntry.declarations instead.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractDeclarations(ax: AxiomContext, input: Stylesheet): DeclarationList {
  const out = new DeclarationList();
  try {
    const { ast } = parseTolerant(input.getCss());
    const entries: DeclarationEntry[] = [];
    for (const rule of collectRules(ast)) {
      for (const decl of declarationsFromBlock(rule.block)) {
        const e = new DeclarationEntry();
        e.setProperty(decl.property);
        e.setValue(decl.value);
        e.setImportant(decl.important);
        e.setRuleIndex(rule.index);
        entries.push(e);
      }
    }
    out.setDeclarationsList(entries);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting declarations'));
    return out;
  }
}
