import { Stylesheet } from '../gen/messages_pb';
import { extractSelectors } from './extract_selectors';
import { ctx } from './testkit';

describe('ExtractSelectors', () => {
  it('splits comma-separated selectors and assigns each its owning rule_index', () => {
    const input = new Stylesheet();
    input.setCss(
      '.a, .b:hover { color: red; margin: 1px !important; } @media (min-width: 10px) { .c { color: blue; } }'
    );
    const result = extractSelectors(ctx, input);
    expect(result.getError()).toBe('');
    const list = result.getSelectorsList().map((s) => [s.getSelector(), s.getRuleIndex()]);
    expect(list).toEqual([
      ['.a', 0],
      ['.b:hover', 0],
      ['.c', 1],
    ]);
  });

  it('returns an empty list (no error) for a stylesheet with no rules', () => {
    const input = new Stylesheet();
    input.setCss('/* just a comment */');
    const result = extractSelectors(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getSelectorsList()).toEqual([]);
  });

  it('handles a large (multi-MB) input without crashing', () => {
    const input = new Stylesheet();
    input.setCss('.a{color:red}'.repeat(500_000));
    const result = extractSelectors(ctx, input);
    expect(result.getError()).toBe('');
  });
});
