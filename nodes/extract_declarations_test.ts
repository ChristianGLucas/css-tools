import { Stylesheet } from '../gen/messages_pb';
import { extractDeclarations } from './extract_declarations';
import { ctx } from './testkit';

describe('ExtractDeclarations', () => {
  it('lists property/value/important/rule_index for every declaration in source order', () => {
    const input = new Stylesheet();
    input.setCss(
      '.a, .b:hover { color: red; margin: 1px !important; } @media (min-width: 10px) { .c { color: blue; } }'
    );
    const result = extractDeclarations(ctx, input);
    expect(result.getError()).toBe('');
    const list = result.getDeclarationsList().map((d) => ({
      property: d.getProperty(),
      value: d.getValue(),
      important: d.getImportant(),
      ruleIndex: d.getRuleIndex(),
    }));
    expect(list).toEqual([
      { property: 'color', value: 'red', important: false, ruleIndex: 0 },
      { property: 'margin', value: '1px', important: true, ruleIndex: 0 },
      { property: 'color', value: 'blue', important: false, ruleIndex: 1 },
    ]);
  });

  it('does not include declarations from a plain-declaration at-rule block (@font-face)', () => {
    const input = new Stylesheet();
    input.setCss('@font-face { font-family: "X"; src: url(x.woff2); } .a { color: red; }');
    const result = extractDeclarations(ctx, input);
    const properties = result.getDeclarationsList().map((d) => d.getProperty());
    expect(properties).toEqual(['color']);
  });

  it('handles a large (multi-MB) input without crashing', () => {
    const input = new Stylesheet();
    input.setCss('.a{color:red}'.repeat(500_000));
    const result = extractDeclarations(ctx, input);
    expect(result.getError()).toBe('');
  });
});
