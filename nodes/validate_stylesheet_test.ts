import { Stylesheet } from '../gen/messages_pb';
import { validateStylesheet } from './validate_stylesheet';
import { ctx } from './testkit';

describe('ValidateStylesheet', () => {
  it('reports valid:true for a clean, spec-conformant stylesheet', () => {
    const input = new Stylesheet();
    input.setCss('.a { color: red; margin: 1px 2px; }');
    const result = validateStylesheet(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getValid()).toBe(true);
    expect(result.getSyntaxErrorsList()).toEqual([]);
    expect(result.getStructuralErrorsList()).toEqual([]);
  });

  it('flags a declaration whose value does not match its property grammar', () => {
    const input = new Stylesheet();
    input.setCss('.a { color: 10px; }');
    const result = validateStylesheet(ctx, input);
    expect(result.getValid()).toBe(false);
    expect(result.getStructuralErrorsList().length).toBe(1);
    expect(result.getStructuralErrorsList()[0]).toContain('color: 10px');
  });

  it('flags an at-rule prelude that does not match its at-rule grammar', () => {
    const input = new Stylesheet();
    input.setCss('@media derp derp { .a { color: red } }');
    const result = validateStylesheet(ctx, input);
    expect(result.getValid()).toBe(false);
    expect(result.getStructuralErrorsList()[0]).toContain('@media');
  });

  it('does NOT flag a single unknown media-feature-like word alone (syntactically valid, just never matches)', () => {
    const input = new Stylesheet();
    input.setCss('@media derp { .a { color: red } }');
    const result = validateStylesheet(ctx, input);
    expect(result.getValid()).toBe(true);
  });

  it('KNOWN LIMITATION: false-positives valid:false on @container/@scope, which css-tree 2.3.1\'s bundled ' +
    'grammar does not yet recognize — this is a recorded, deliberate gap (see ValidateStylesheet\'s ' +
    'description), not silent breakage: the at-rule itself is flagged "Unknown at-rule" even though the ' +
    'CSS is perfectly valid modern syntax', () => {
    const container = new Stylesheet();
    container.setCss('@container (min-width: 400px) { .a { color: red; } }');
    const containerResult = validateStylesheet(ctx, container);
    expect(containerResult.getValid()).toBe(false);
    expect(containerResult.getStructuralErrorsList().join(' ')).toContain('Unknown at-rule');

    const scope = new Stylesheet();
    scope.setCss('@scope (.a) to (.b) { .c { color: red; } }');
    const scopeResult = validateStylesheet(ctx, scope);
    expect(scopeResult.getValid()).toBe(false);
    expect(scopeResult.getStructuralErrorsList().join(' ')).toContain('Unknown at-rule');

    // @layer, by contrast, IS recognized — not every newer at-rule is affected.
    const layer = new Stylesheet();
    layer.setCss('@layer base { .a { color: red; } }');
    expect(validateStylesheet(ctx, layer).getValid()).toBe(true);
  });

  it('reports a syntax error with 1-based line/column for malformed CSS, valid:false', () => {
    const input = new Stylesheet();
    input.setCss('.a { color: red;\n.b { x\n');
    const result = validateStylesheet(ctx, input);
    expect(result.getValid()).toBe(false);
    expect(result.getSyntaxErrorsList().length).toBeGreaterThan(0);
    expect(result.getSyntaxErrorsList()[0].getLine()).toBe(2);
  });

  it('does not flag custom properties, which are untyped by design', () => {
    const input = new Stylesheet();
    // "10px squiggly banana" would fail every real property's grammar, but
    // custom properties are skipped entirely rather than checked.
    input.setCss('.a { --weird-value: 10px squiggly banana; }');
    const result = validateStylesheet(ctx, input);
    expect(result.getValid()).toBe(true);
  });

  it('does not flag a declaration whose value uses var() — found via live-invoke, not by the unit tests alone: ' +
    'css-tree\'s lexer refuses to match ANY var()-containing value ("Matching for a tree with var() is not ' +
    'supported"), which would otherwise make ordinary CSS like "margin: var(--gap)" report invalid', () => {
    const input = new Stylesheet();
    input.setCss('.a { margin: var(--gap); width: calc(100% - var(--x)); }');
    const result = validateStylesheet(ctx, input);
    expect(result.getValid()).toBe(true);
    expect(result.getStructuralErrorsList()).toEqual([]);
  });

  it('does not flag a declaration whose value uses env()', () => {
    const input = new Stylesheet();
    input.setCss('.a { padding-top: env(safe-area-inset-top); }');
    const result = validateStylesheet(ctx, input);
    expect(result.getValid()).toBe(true);
  });

  it('does not false-positive on realistic modern CSS (grid, gradients, transforms, custom properties)', () => {
    const input = new Stylesheet();
    input.setCss(`
      .a {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem 2rem;
        background: linear-gradient(to right, red, blue);
        transform: translate(10px, 20px) rotate(45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,.1), inset 0 0 0 1px #fff;
        aspect-ratio: 16 / 9;
      }
    `);
    const result = validateStylesheet(ctx, input);
    expect(result.getValid()).toBe(true);
  });

  it('handles a large (multi-MB) input without crashing', () => {
    const input = new Stylesheet();
    input.setCss('.a{color:red}'.repeat(500_000));
    const result = validateStylesheet(ctx, input);
    expect(result.getError()).toBe('');
  });
});
