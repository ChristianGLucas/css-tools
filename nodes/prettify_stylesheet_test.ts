import { PrettifyRequest } from '../gen/messages_pb';
import { prettifyStylesheet } from './prettify_stylesheet';
import { parseStylesheet } from './parse_stylesheet';
import { Stylesheet } from '../gen/messages_pb';
import { ctx, stripLoc } from './testkit';

describe('PrettifyStylesheet', () => {
  it('reformats a compact stylesheet with indentation, one declaration per line', () => {
    const input = new PrettifyRequest();
    input.setCss('.foo,.bar{color:red;margin:0 10px}');
    const result = prettifyStylesheet(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getCss()).toBe('.foo, .bar {\n  color: red;\n  margin: 0 10px;\n}');
  });

  it('handles @media, @keyframes, and CSS nesting, indenting nested blocks further', () => {
    const input = new PrettifyRequest();
    input.setCss(
      '@keyframes spin { from { opacity: 0; } to { opacity: 1; } } .a { color: red; &:hover { color: blue; } }'
    );
    const result = prettifyStylesheet(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getCss()).toBe(
      '@keyframes spin {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n.a {\n  color: red;\n  &:hover {\n    color: blue;\n  }\n}'
    );
  });

  it('respects a custom indent width', () => {
    const input = new PrettifyRequest();
    input.setCss('.a{color:red}');
    input.setIndent(4);
    const result = prettifyStylesheet(ctx, input);
    expect(result.getCss()).toBe('.a {\n    color: red;\n}');
  });

  it('defaults to 2-space indent when indent is omitted/zero', () => {
    const input = new PrettifyRequest();
    input.setCss('.a{color:red}');
    const result = prettifyStylesheet(ctx, input);
    expect(result.getCss()).toBe('.a {\n  color: red;\n}');
  });

  it('round-trips through ParseStylesheet: prettifying does not change the parsed AST', () => {
    const original = '.a,.b{color:red;margin:1px}';
    const input = new PrettifyRequest();
    input.setCss(original);
    const pretty = prettifyStylesheet(ctx, input);

    const origParse = new Stylesheet();
    origParse.setCss(original);
    const prettyParse = new Stylesheet();
    prettyParse.setCss(pretty.getCss());
    expect(stripLoc(JSON.parse(parseStylesheet(ctx, prettyParse).getAstJson()))).toEqual(
      stripLoc(JSON.parse(parseStylesheet(ctx, origParse).getAstJson()))
    );
  });

  it('handles a large (multi-MB) input without crashing', () => {
    const input = new PrettifyRequest();
    input.setCss('.a{color:red}'.repeat(500_000));
    const result = prettifyStylesheet(ctx, input);
    expect(result.getError()).toBe('');
  });
});
