import { Stylesheet } from '../gen/messages_pb';
import { extractAtRules } from './extract_at_rules';
import { ctx } from './testkit';

describe('ExtractAtRules', () => {
  it('lists @import (statement-only), @media (body_css), and @font-face (declarations)', () => {
    const input = new Stylesheet();
    input.setCss(
      '@import url("foo.css"); @media (min-width: 10px) { .a { color: red; } } @font-face { font-family: "X"; src: url(x.woff2); }'
    );
    const result = extractAtRules(ctx, input);
    expect(result.getError()).toBe('');
    const rules = result.getAtRulesList();
    expect(rules.length).toBe(3);

    expect(rules[0].getName()).toBe('import');
    expect(rules[0].getPrelude()).toBe('url(foo.css)');
    expect(rules[0].getBodyCss()).toBe('');
    expect(rules[0].getDeclarationsList()).toEqual([]);

    expect(rules[1].getName()).toBe('media');
    expect(rules[1].getPrelude()).toBe('(min-width:10px)');
    expect(rules[1].getBodyCss()).toBe('.a{color:red}');

    expect(rules[2].getName()).toBe('font-face');
    expect(rules[2].getPrelude()).toBe('');
    expect(rules[2].getBodyCss()).toBe('');
    const declProps = rules[2].getDeclarationsList().map((d) => d.getProperty());
    expect(declProps).toEqual(['font-family', 'src']);
    expect(rules[2].getDeclarationsList()[0].getRuleIndex()).toBe(-1);
  });

  it('returns an empty list for a stylesheet with no at-rules', () => {
    const input = new Stylesheet();
    input.setCss('.a { color: red; }');
    const result = extractAtRules(ctx, input);
    expect(result.getAtRulesList()).toEqual([]);
  });

  it('handles a large (multi-MB) input without crashing', () => {
    const input = new Stylesheet();
    input.setCss('.a{color:red}'.repeat(500_000));
    const result = extractAtRules(ctx, input);
    expect(result.getError()).toBe('');
  });
});
