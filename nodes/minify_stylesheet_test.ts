import { Stylesheet } from '../gen/messages_pb';
import { minifyStylesheet } from './minify_stylesheet';
import { ctx } from './testkit';

describe('MinifyStylesheet', () => {
  it('drops comments and non-significant whitespace', () => {
    const input = new Stylesheet();
    input.setCss(`
      /* a comment */
      .foo   ,   .bar {
        color:   red;   /* inline */
        margin: 0px  10px;
      }
    `);
    const result = minifyStylesheet(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getCss()).toBe('.foo,.bar{color:red;margin:0px 10px}');
  });

  it('preserves semantics for @media and nested rules', () => {
    const input = new Stylesheet();
    input.setCss('@media (min-width: 100px) {\n  .a { color: blue; }\n}');
    const result = minifyStylesheet(ctx, input);
    expect(result.getCss()).toBe('@media (min-width:100px){.a{color:blue}}');
  });

  it('is idempotent: minifying already-minified CSS returns the same text', () => {
    const input = new Stylesheet();
    input.setCss('.a{color:red}');
    const once = minifyStylesheet(ctx, input);
    const twiceInput = new Stylesheet();
    twiceInput.setCss(once.getCss());
    const twice = minifyStylesheet(ctx, twiceInput);
    expect(twice.getCss()).toBe(once.getCss());
  });

  it('handles a large (multi-MB) input without crashing', () => {
    const input = new Stylesheet();
    input.setCss('.a{color:red}'.repeat(500_000));
    const result = minifyStylesheet(ctx, input);
    expect(result.getError()).toBe('');
  });

  it('is deterministic across repeated calls', () => {
    const input = new Stylesheet();
    input.setCss('.a, .b { color: red; }');
    const a = minifyStylesheet(ctx, input);
    const b = minifyStylesheet(ctx, input);
    expect(a.getCss()).toBe(b.getCss());
  });
});
