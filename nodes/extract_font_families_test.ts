import { Stylesheet } from '../gen/messages_pb';
import { extractFontFamilies } from './extract_font_families';
import { ctx } from './testkit';

describe('ExtractFontFamilies', () => {
  it('splits comma-separated families, strips quotes, rejoins unquoted multi-word names, dedupes', () => {
    const input = new Stylesheet();
    input.setCss(
      '.a { font-family: "Helvetica Neue", Arial, sans-serif; } .b { font-family: Georgia, serif; } .c { font-family: Arial; }'
    );
    const result = extractFontFamilies(ctx, input);
    expect(result.getError()).toBe('');
    // "Arial" appears twice across rules but only once in the output
    // (dedup), in first-seen order.
    expect(result.getFamiliesList()).toEqual(['Helvetica Neue', 'Arial', 'sans-serif', 'Georgia', 'serif']);
  });

  it('does not parse the font shorthand', () => {
    const input = new Stylesheet();
    input.setCss('.a { font: bold 14px/1.5 Georgia, serif; }');
    const result = extractFontFamilies(ctx, input);
    expect(result.getFamiliesList()).toEqual([]);
  });

  it('returns an empty list when there is no font-family declaration', () => {
    const input = new Stylesheet();
    input.setCss('.a { color: red; }');
    const result = extractFontFamilies(ctx, input);
    expect(result.getFamiliesList()).toEqual([]);
  });

  it('rejects oversized input as a structured error', () => {
    const input = new Stylesheet();
    input.setCss('.a{color:red}'.repeat(500_000));
    const result = extractFontFamilies(ctx, input);
    expect(result.getError()).toContain('exceeds');
  });
});
