import { AstInput } from '../gen/messages_pb';
import { serializeStylesheet } from './serialize_stylesheet';
import { parseStylesheet } from './parse_stylesheet';
import { Stylesheet } from '../gen/messages_pb';
import { ctx, stripLoc } from './testkit';

describe('SerializeStylesheet', () => {
  it('serializes a hand-built AST (independent of ParseStylesheet) back to CSS', () => {
    // Hand-built AST, NOT produced by ParseStylesheet — an independent input
    // shape, so this proves SerializeStylesheet itself works, not merely
    // that Parse+Serialize agree with each other.
    const ast = {
      type: 'StyleSheet',
      children: [
        {
          type: 'Rule',
          prelude: {
            type: 'SelectorList',
            children: [{ type: 'Selector', children: [{ type: 'ClassSelector', name: 'x' }] }],
          },
          block: {
            type: 'Block',
            children: [
              {
                type: 'Declaration',
                important: false,
                property: 'color',
                value: { type: 'Value', children: [{ type: 'Identifier', name: 'blue' }] },
              },
            ],
          },
        },
      ],
    };
    const input = new AstInput();
    input.setAstJson(JSON.stringify(ast));
    const result = serializeStylesheet(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getCss()).toBe('.x{color:blue}');
  });

  it('round-trips through ParseStylesheet: Serialize(Parse(css)) re-parses to an equivalent AST', () => {
    const original = '.a, .b:hover { color: red; margin: 1px 2px 3px; } @media (min-width: 10px) { .c { color: blue } }';
    const parseIn = new Stylesheet();
    parseIn.setCss(original);
    const parsed = parseStylesheet(ctx, parseIn);

    const serializeIn = new AstInput();
    serializeIn.setAstJson(parsed.getAstJson());
    const serialized = serializeStylesheet(ctx, serializeIn);
    expect(serialized.getError()).toBe('');

    // Re-parsing the serialized CSS should reproduce the identical AST
    // (modulo source positions, which legitimately differ since the
    // minified text is shorter) — proves the round trip is lossless at the
    // AST level even though the exact whitespace differs.
    const reparseIn = new Stylesheet();
    reparseIn.setCss(serialized.getCss());
    const reparsed = parseStylesheet(ctx, reparseIn);
    expect(stripLoc(JSON.parse(reparsed.getAstJson()))).toEqual(stripLoc(JSON.parse(parsed.getAstJson())));
  });

  it('returns a structured error for malformed JSON rather than throwing', () => {
    const input = new AstInput();
    input.setAstJson('{not valid json');
    const result = serializeStylesheet(ctx, input);
    expect(result.getError()).not.toBe('');
    expect(result.getCss()).toBe('');
  });

  it('returns a structured error for JSON that is not an AST object (e.g. a bare array)', () => {
    const input = new AstInput();
    input.setAstJson('[1,2,3]');
    const result = serializeStylesheet(ctx, input);
    expect(result.getError()).not.toBe('');
  });

  it('handles a large (multi-MB) ast_json without crashing', () => {
    const input = new AstInput();
    input.setAstJson(JSON.stringify({ type: 'StyleSheet', children: [], padding: 'x'.repeat(6_000_000) }));
    const result = serializeStylesheet(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getCss()).toBe('');
  });
});
