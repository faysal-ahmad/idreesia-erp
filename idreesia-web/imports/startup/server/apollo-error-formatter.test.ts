import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const newrelic = vi.hoisted(() => ({
  isIgnoredErrorCode: vi.fn(),
  noticeError: vi.fn(),
}));
vi.mock('./newrelic', () => newrelic);

const { apolloErrorFormatter } = await import('./apollo-error-formatter');

beforeEach(() => {
  vi.clearAllMocks();
  newrelic.isIgnoredErrorCode.mockReturnValue(false);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apolloErrorFormatter', () => {
  it('returns the formatted error unchanged', () => {
    const formatted = { message: 'boom', extensions: { code: 'INTERNAL_SERVER_ERROR' } };
    expect(apolloErrorFormatter(formatted, {})).toBe(formatted);
  });

  it('reports the original error with the dotted path', () => {
    const original = new Error('db down');
    apolloErrorFormatter(
      { message: 'boom', path: ['people', 0, 'name'], extensions: { code: 'X' } },
      { originalError: original }
    );
    expect(newrelic.noticeError).toHaveBeenCalledWith(original, {
      source: 'graphql',
      path: 'people.0.name',
    });
  });

  it('reports the wrapper error when there is no original one', () => {
    const wrapper = { originalError: undefined };
    apolloErrorFormatter({ message: 'boom' }, wrapper);
    expect(newrelic.noticeError).toHaveBeenCalledWith(wrapper, {
      source: 'graphql',
      path: '',
    });
  });

  it('does not report ignored (expected) error codes', () => {
    newrelic.isIgnoredErrorCode.mockReturnValue(true);
    apolloErrorFormatter(
      { message: 'no', extensions: { code: 'FORBIDDEN' } },
      { originalError: new Error('x') }
    );
    expect(newrelic.isIgnoredErrorCode).toHaveBeenCalledWith('FORBIDDEN');
    expect(newrelic.noticeError).not.toHaveBeenCalled();
  });

  it('still logs ignored errors to the console', () => {
    newrelic.isIgnoredErrorCode.mockReturnValue(true);
    const original = new Error('x');
    apolloErrorFormatter({ message: 'no' }, { originalError: original });
    // eslint-disable-next-line no-console
    expect(console.log).toHaveBeenCalledWith(original);
  });
});
