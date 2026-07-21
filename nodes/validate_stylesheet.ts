import { Stylesheet, ValidateResult, CssSyntaxError } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as csstree from 'css-tree';
import { parseTolerant, errorMessage } from './lib';

/** True if a value tree contains a var()/env() reference anywhere (including
 * nested inside e.g. calc()). Their substituted value is only known at
 * compute time, so css-tree's lexer cannot — and by design refuses to —
 * check them against a property's grammar; matching a var()-containing
 * declaration throws "Matching for a tree with var() is not supported"
 * instead of returning a pass/fail, and env() is simply absent from the
 * bundled grammar and reads as a false "Mismatch". Skipping both is the
 * difference between "we can't know" and a wrong "invalid" on completely
 * ordinary modern CSS (var() is one of the most common patterns there is). */
function referencesRuntimeValue(value: csstree.CssNode): boolean {
  let found = false;
  csstree.walk(value, {
    visit: 'Function',
    enter(fn) {
      const name = fn.name.toLowerCase();
      if (name === 'var' || name === 'env') found = true;
    },
  });
  return found;
}

/**
 * Validate a stylesheet against the CSS spec: `valid` is true only when
 * there are zero syntax_errors (tokenizer/parser-level, each with a
 * 1-based line/column) AND zero structural_errors (css-tree's lexer
 * checking every declaration's value against its property's formal CSS
 * grammar, and every at-rule prelude against its at-rule's grammar — e.g.
 * "color: 10px" or "@media derp derp" are both flagged (a single unknown
 * media-feature-like word alone, e.g. "@media derp", is syntactically valid
 * per spec — it simply never matches — so it does NOT get flagged).
 * Declarations using custom properties (--x) or containing var()/env() are
 * skipped — their value is only known at compute time, so there is nothing
 * to statically check. KNOWN LIMITATION: grammar checking is only as
 * current as css-tree's bundled grammar data (2.3.1) — newer at-rules it
 * does not yet recognize (@container, @scope) come back valid:false with a
 * "Unknown at-rule" structural_error EVEN WHEN the CSS is perfectly valid;
 * this is a false positive on the at-rule itself, not a missed detection of
 * real errors inside it. error is set only for a hard
 * failure (oversized input), never for the syntax/structural problems this
 * node exists to report.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function validateStylesheet(ax: AxiomContext, input: Stylesheet): ValidateResult {
  const out = new ValidateResult();
  try {
    const { ast, errors } = parseTolerant(input.getCss());
    const syntaxErrors = errors.map((e) => {
      const se = new CssSyntaxError();
      se.setMessage(e.message);
      se.setLine(e.line);
      se.setColumn(e.column);
      return se;
    });

    const structuralErrors: string[] = [];

    csstree.walk(ast, {
      visit: 'Declaration',
      enter(node) {
        // Custom properties (--x) are untyped by design; the lexer has no
        // grammar for them, so skip rather than report a false failure.
        if (node.property.startsWith('--')) return;
        // var()/env() values are only resolvable at compute time — see
        // referencesRuntimeValue's doc comment.
        if (referencesRuntimeValue(node.value)) return;
        const result = csstree.lexer.matchDeclaration(node);
        if (result.error) {
          structuralErrors.push(
            `declaration "${node.property}: ${csstree.generate(node.value)}" — ${result.error.message.split('\n')[0]}`
          );
        }
      },
    });

    csstree.walk(ast, {
      visit: 'Atrule',
      enter(node) {
        if (!node.prelude) return;
        const result = csstree.lexer.matchAtrulePrelude(node.name, node.prelude);
        if (result.error) {
          structuralErrors.push(
            `@${node.name} prelude "${csstree.generate(node.prelude)}" — ${result.error.message.split('\n')[0]}`
          );
        }
      },
    });

    out.setSyntaxErrorsList(syntaxErrors);
    out.setStructuralErrorsList(structuralErrors);
    out.setValid(syntaxErrors.length === 0 && structuralErrors.length === 0);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'validating stylesheet'));
    return out;
  }
}
