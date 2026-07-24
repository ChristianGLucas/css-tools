import { SelectorInput } from '../gen/messages_pb';
import { parseSelector } from './parse_selector';
import { ctx, SPEC_SPECIFICITY_EXAMPLES } from './testkit';

describe('ParseSelector', () => {
  // INDEPENDENT ORACLE: the CSS Selectors Level 4 spec's own worked
  // specificity examples (testkit.SPEC_SPECIFICITY_EXAMPLES, hand-transcribed
  // from the spec text, not derived from this package's implementation).
  it('computes specificity matching the spec\'s own worked examples', () => {
    for (const { selector, a, b, c } of SPEC_SPECIFICITY_EXAMPLES) {
      const input = new SelectorInput();
      input.setSelector(selector);
      const result = parseSelector(ctx, input);
      expect(result.getError()).toBe('');
      const spec = result.getSelectorsList()[0]?.getSpecificity();
      expect(spec ? [spec.getA(), spec.getB(), spec.getC()] : null).toEqual([a, b, c]);
    }
  });

  it('breaks a compound selector into its typed components in source order', () => {
    const input = new SelectorInput();
    input.setSelector('div.foo#bar[data-x="1"]:hover::before');
    const result = parseSelector(ctx, input);
    const components = result.getSelectorsList()[0].getComponentsList().map((c) => [c.getKind(), c.getText()]);
    expect(components).toEqual([
      ['type', 'div'],
      ['class', '.foo'],
      ['id', '#bar'],
      ['attribute', '[data-x="1"]'],
      ['pseudo-class', ':hover'],
      ['pseudo-element', '::before'],
    ]);
  });

  it('parses a comma-separated selector list into one entry per selector, each with a combinator', () => {
    const input = new SelectorInput();
    input.setSelector('.a > .b, #c');
    const result = parseSelector(ctx, input);
    const selectors = result.getSelectorsList();
    expect(selectors.length).toBe(2);
    expect(selectors[0].getComponentsList().map((c) => c.getKind())).toEqual(['class', 'combinator', 'class']);
    expect(selectors[1].getComponentsList().map((c) => c.getKind())).toEqual(['id']);
  });

  it(':where() always contributes zero specificity', () => {
    const input = new SelectorInput();
    input.setSelector(':where(#a, .b)');
    const result = parseSelector(ctx, input);
    const spec = result.getSelectorsList()[0].getSpecificity()!;
    expect([spec.getA(), spec.getB(), spec.getC()]).toEqual([0, 0, 0]);
  });

  it('handles a large selector input without crashing', () => {
    const input = new SelectorInput();
    input.setSelector('.a'.repeat(30_000));
    const result = parseSelector(ctx, input);
    expect(result.getError()).toBe('');
  });

  it('is deterministic across repeated calls', () => {
    const input = new SelectorInput();
    input.setSelector('.a:hover, #b > .c');
    const a = parseSelector(ctx, input);
    const b = parseSelector(ctx, input);
    expect(a.toObject()).toEqual(b.toObject());
  });
});
