import { ValueInput } from '../gen/messages_pb';
import { parseValue } from './parse_value';
import { ctx } from './testkit';

describe('ParseValue', () => {
  it('tokenizes a mixed value into typed top-level components, functions kept intact', () => {
    const input = new ValueInput();
    input.setValue('10px solid rgba(255,0,0,.5) var(--x, blue) "quoted"');
    const result = parseValue(ctx, input);
    expect(result.getError()).toBe('');
    const tokens = result.getTokensList().map((t) => [t.getType(), t.getText()]);
    expect(tokens).toEqual([
      ['Dimension', '10px'],
      ['Identifier', 'solid'],
      ['Function', 'rgba(255,0,0,.5)'],
      ['Function', 'var(--x, blue)'],
      ['String', '"quoted"'],
    ]);
  });

  it('tokenizes a comma-separated list, keeping commas as Operator tokens', () => {
    const input = new ValueInput();
    input.setValue('Arial, sans-serif');
    const result = parseValue(ctx, input);
    const types = result.getTokensList().map((t) => t.getType());
    expect(types).toEqual(['Identifier', 'Operator', 'Identifier']);
  });

  it('tokenizes a hex color and a percentage', () => {
    const input = new ValueInput();
    input.setValue('#ff0000 50%');
    const result = parseValue(ctx, input);
    const tokens = result.getTokensList().map((t) => [t.getType(), t.getText()]);
    expect(tokens).toEqual([
      ['Hash', '#ff0000'],
      ['Percentage', '50%'],
    ]);
  });

  it('rejects oversized input as a structured error', () => {
    const input = new ValueInput();
    input.setValue('1px '.repeat(10_000));
    const result = parseValue(ctx, input);
    expect(result.getError()).toContain('exceeds');
  });

  it('is deterministic across repeated calls', () => {
    const input = new ValueInput();
    input.setValue('bold 14px/1.5 sans-serif');
    const a = parseValue(ctx, input);
    const b = parseValue(ctx, input);
    expect(a.toObject()).toEqual(b.toObject());
  });
});
