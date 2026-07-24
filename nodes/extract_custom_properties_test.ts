import { Stylesheet } from '../gen/messages_pb';
import { extractCustomProperties } from './extract_custom_properties';
import { ctx } from './testkit';

describe('ExtractCustomProperties', () => {
  it('merges declarations and var() references into one entry per name, keeping the LAST declared value', () => {
    const input = new Stylesheet();
    input.setCss(
      ':root { --gap: 8px; --gap: 10px; --unused: red; } .a { margin: var(--gap, 4px); padding: var(--gap); color: var(--missing); }'
    );
    const result = extractCustomProperties(ctx, input);
    expect(result.getError()).toBe('');
    const byName = Object.fromEntries(
      result.getPropertiesList().map((p) => [
        p.getName(),
        {
          declared: p.getDeclared(),
          referenced: p.getReferenced(),
          lastDeclaredValue: p.getLastDeclaredValue(),
          declarationCount: p.getDeclarationCount(),
          referenceCount: p.getReferenceCount(),
        },
      ])
    );
    expect(byName['--gap']).toEqual({
      declared: true,
      referenced: true,
      lastDeclaredValue: '10px', // the SECOND declaration, not the first
      declarationCount: 2,
      referenceCount: 2,
    });
    expect(byName['--unused']).toEqual({
      declared: true,
      referenced: false,
      lastDeclaredValue: 'red',
      declarationCount: 1,
      referenceCount: 0,
    });
    expect(byName['--missing']).toEqual({
      declared: false,
      referenced: true,
      lastDeclaredValue: '',
      declarationCount: 0,
      referenceCount: 1,
    });
  });

  it('returns an empty list for a stylesheet with no custom properties', () => {
    const input = new Stylesheet();
    input.setCss('.a { color: red; }');
    const result = extractCustomProperties(ctx, input);
    expect(result.getPropertiesList()).toEqual([]);
  });

  it('handles a large (multi-MB) input without crashing', () => {
    const input = new Stylesheet();
    input.setCss('.a{color:red}'.repeat(500_000));
    const result = extractCustomProperties(ctx, input);
    expect(result.getError()).toBe('');
  });
});
