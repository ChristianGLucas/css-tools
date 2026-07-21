import { Stylesheet } from '../gen/messages_pb';
import { extractColors } from './extract_colors';
import { ctx } from './testkit';
import { CSS_NAMED_COLORS } from './lib';
import { SPEC_NAMED_COLOR_HEX } from './testkit';

describe('ExtractColors', () => {
  it('classifies hex, function, and keyword color formats with their declaration property', () => {
    const input = new Stylesheet();
    input.setCss(
      '.a { color: #ff0000; background: rgba(0, 0, 0, .5); border-color: red; } .b { color: currentcolor; }'
    );
    const result = extractColors(ctx, input);
    expect(result.getError()).toBe('');
    const colors = result.getColorsList().map((c) => ({
      value: c.getValue(),
      format: c.getFormat(),
      property: c.getProperty(),
      ruleIndex: c.getRuleIndex(),
    }));
    expect(colors).toEqual([
      { value: '#ff0000', format: 'hex', property: 'color', ruleIndex: 0 },
      { value: 'rgba(0,0,0,.5)', format: 'function', property: 'background', ruleIndex: 0 },
      { value: 'red', format: 'keyword', property: 'border-color', ruleIndex: 0 },
      { value: 'currentcolor', format: 'keyword', property: 'color', ruleIndex: 1 },
    ]);
  });

  it('does not extract colors from selectors, only from declaration values', () => {
    const input = new Stylesheet();
    input.setCss('[data-color="red"] { margin: 1px; }');
    const result = extractColors(ctx, input);
    expect(result.getColorsList()).toEqual([]);
  });

  // INDEPENDENT ORACLE: the CSS Color Module spec's own hex table
  // (testkit.SPEC_NAMED_COLOR_HEX, transcribed by hand from the spec, not
  // derived from this package) — every keyword it lists must be one this
  // node recognizes, proving the named-color set is not ad hoc.
  it('recognizes every keyword from the spec\'s own named-color table', () => {
    for (const { keyword } of SPEC_NAMED_COLOR_HEX) {
      expect(CSS_NAMED_COLORS.has(keyword)).toBe(true);
    }
  });

  it('rejects oversized input as a structured error', () => {
    const input = new Stylesheet();
    input.setCss('.a{color:red}'.repeat(500_000));
    const result = extractColors(ctx, input);
    expect(result.getError()).toContain('exceeds');
  });
});
