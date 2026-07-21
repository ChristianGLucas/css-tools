import { Stylesheet } from '../gen/messages_pb';
import { extractUrls } from './extract_urls';
import { ctx } from './testkit';

describe('ExtractUrls', () => {
  it('finds urls in declarations (with rule_index) and at-rule preludes (rule_index -1)', () => {
    const input = new Stylesheet();
    input.setCss('.a { background: url("bg.png"); } @font-face { src: url(x.woff2); } @import url("y.css");');
    const result = extractUrls(ctx, input);
    expect(result.getError()).toBe('');
    const urls = result.getUrlsList().map((u) => ({
      url: u.getUrl(),
      context: u.getContext(),
      ruleIndex: u.getRuleIndex(),
    }));
    expect(urls).toEqual([
      { url: 'bg.png', context: 'background', ruleIndex: 0 },
      { url: 'x.woff2', context: 'src', ruleIndex: -1 },
      { url: 'y.css', context: 'import', ruleIndex: -1 },
    ]);
  });

  it('returns an empty list when there are no url() references', () => {
    const input = new Stylesheet();
    input.setCss('.a { color: red; }');
    const result = extractUrls(ctx, input);
    expect(result.getUrlsList()).toEqual([]);
  });

  it('rejects oversized input as a structured error', () => {
    const input = new Stylesheet();
    input.setCss('.a{color:red}'.repeat(500_000));
    const result = extractUrls(ctx, input);
    expect(result.getError()).toContain('exceeds');
  });
});
