// Mock chokidar (ESM module that can't be imported in Jest CJS mode)
jest.mock('chokidar', () => ({
  watch: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
    close: jest.fn().mockResolvedValue(undefined),
  }),
}));

import { createDebouncedHandler } from '@/lib/fileWatcher';

describe('createDebouncedHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls callback after 500ms for a single file change', () => {
    const callback = jest.fn();
    const { handler } = createDebouncedHandler(callback);

    handler('/path/to/file.md');
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('debounces two rapid changes with single callback after 500ms', () => {
    const callback = jest.fn();
    const { handler } = createDebouncedHandler(callback);

    handler('/path/file1.md');
    jest.advanceTimersByTime(200);
    handler('/path/file2.md');

    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('escalates to 3000ms debounce for batch changes (>3 files)', () => {
    const callback = jest.fn();
    const { handler } = createDebouncedHandler(callback);

    // Fire 5 rapid changes
    for (let i = 0; i < 5; i++) {
      handler(`/path/file${i}.md`);
    }

    // 500ms should NOT trigger (batch mode)
    jest.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();

    // 3000ms should trigger
    jest.advanceTimersByTime(2500);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback if no changes', () => {
    const callback = jest.fn();
    createDebouncedHandler(callback);

    jest.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('resets after callback fires', () => {
    const callback = jest.fn();
    const { handler } = createDebouncedHandler(callback);

    handler('/path/file.md');
    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);

    // Second batch
    handler('/path/file2.md');
    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('cancel stops pending callback', () => {
    const callback = jest.fn();
    const { handler, cancel } = createDebouncedHandler(callback);

    handler('/path/file.md');
    cancel();
    jest.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('batch with 10 rapid changes triggers single callback', () => {
    const callback = jest.fn();
    const { handler } = createDebouncedHandler(callback);

    for (let i = 0; i < 10; i++) {
      handler(`/path/file${i}.md`);
      jest.advanceTimersByTime(50);
    }

    // Still waiting for 3000ms from last event
    jest.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
