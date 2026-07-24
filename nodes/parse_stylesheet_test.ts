import { Stylesheet } from '../gen/messages_pb';
import { parseStylesheet } from './parse_stylesheet';
import { ctx } from './testkit';
import * as csstree from 'css-tree';

describe('ParseStylesheet', () => {
  it('parses a simple rule into a JSON AST matching css-tree\'s own output (independent oracle)', () => {
    const input = new Stylesheet();
    input.setCss('.a { color: red; }');
    const result = parseStylesheet(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getSyntaxErrorsList()).toEqual([]);

    const plain = JSON.parse(result.getAstJson());
    expect(plain.type).toBe('StyleSheet');
    // INDEPENDENT ORACLE: re-parse the same CSS directly with css-tree
    // ourselves (bypassing the node, but with the same parse options it
    // uses — positions + parseCustomProperty) and compare plain-object
    // ASTs — proves the node's JSON shaping matches css-tree's own output,
    // not just that it returns *something*.
    const oracleAst = csstree.toPlainObject(
      csstree.parse('.a { color: red; }', { positions: true, parseCustomProperty: true })
    );
    expect(plain).toEqual(oracleAst);
  });

  it('collects a syntax error with a 1-based line/column for malformed CSS, without failing', () => {
    const input = new Stylesheet();
    input.setCss('.a { color: red;\n.b { invalid-close\n');
    const result = parseStylesheet(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getAstJson()).not.toBe('');
    expect(result.getSyntaxErrorsList().length).toBeGreaterThan(0);
    expect(result.getSyntaxErrorsList()[0].getLine()).toBeGreaterThan(0);
  });

  it('handles a large (multi-MB) input as a valid parse or a structured error, never a crash', () => {
    const input = new Stylesheet();
    input.setCss('.a{color:red}'.repeat(500_000)); // ~6.5 MB
    const result = parseStylesheet(ctx, input);
    // The AST's JSON serialization (with source positions) grows much larger
    // than the input; at this scale it can legitimately exceed the JS
    // engine's max string length. Either a successful parse or a structured
    // error is acceptable — an unhandled crash is not.
    if (result.getError() !== '') {
      expect(result.getAstJson()).toBe('');
    } else {
      expect(result.getAstJson()).not.toBe('');
    }
  });

  it('rejects pathologically deep nesting before parsing it', () => {
    const input = new Stylesheet();
    input.setCss('.a { color: ' + 'rgb('.repeat(10_000) + '1,2,3' + ')'.repeat(10_000) + '; }');
    const result = parseStylesheet(ctx, input);
    expect(result.getError()).toContain('nesting depth');
  });

  it('is deterministic across repeated calls', () => {
    const input = new Stylesheet();
    input.setCss('.a, .b:hover { margin: 1px 2px; }');
    const a = parseStylesheet(ctx, input);
    const b = parseStylesheet(ctx, input);
    expect(a.toObject()).toEqual(b.toObject());
  });
});
