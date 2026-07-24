import { Stylesheet } from '../gen/messages_pb';
import { listRules } from './list_rules';
import { extractSelectors } from './extract_selectors';
import { extractDeclarations } from './extract_declarations';
import { ctx } from './testkit';

describe('ListRules', () => {
  const css = '.a, .b:hover { color: red; margin: 1px !important; } @media (min-width: 10px) { .c { color: blue; } }';

  it('lists each rule with its comma-joined selector and its own declarations', () => {
    const input = new Stylesheet();
    input.setCss(css);
    const result = listRules(ctx, input);
    expect(result.getError()).toBe('');
    const rules = result.getRulesList();
    expect(rules.length).toBe(2);
    expect(rules[0].getIndex()).toBe(0);
    expect(rules[0].getSelector()).toBe('.a, .b:hover');
    expect(rules[0].getDeclarationsList().map((d) => d.getProperty())).toEqual(['color', 'margin']);
    expect(rules[1].getIndex()).toBe(1);
    expect(rules[1].getSelector()).toBe('.c');
  });

  it('its RuleEntry.index agrees with ExtractSelectors/ExtractDeclarations rule_index (the documented join key)', () => {
    const input = new Stylesheet();
    input.setCss(css);
    const rules = listRules(ctx, input).getRulesList();
    const selectors = extractSelectors(ctx, input).getSelectorsList();
    const declarations = extractDeclarations(ctx, input).getDeclarationsList();

    for (const sel of selectors) {
      const owningRule = rules.find((r) => r.getIndex() === sel.getRuleIndex());
      expect(owningRule).toBeDefined();
      expect(owningRule!.getSelector()).toContain(sel.getSelector());
    }
    for (const decl of declarations) {
      const owningRule = rules.find((r) => r.getIndex() === decl.getRuleIndex());
      expect(owningRule).toBeDefined();
      expect(owningRule!.getDeclarationsList().some((d) => d.getProperty() === decl.getProperty())).toBe(true);
    }
  });

  it('handles a large (multi-MB) input without crashing', () => {
    const input = new Stylesheet();
    input.setCss('.a{color:red}'.repeat(500_000));
    const result = listRules(ctx, input);
    expect(result.getError()).toBe('');
  });
});
