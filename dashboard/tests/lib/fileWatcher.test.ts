// Mock chokidar (ESM module that can't be imported in Jest CJS mode)
jest.mock('chokidar', () => ({
  watch: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
    close: jest.fn().mockResolvedValue(undefined),
  }),
}));

import { createDebouncedHandler, createFileWatcher } from '@/lib/fileWatcher';
import chokidar from 'chokidar';

const mockWatch = chokidar.watch as jest.Mock;

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

describe('createFileWatcher', () => {
  let mockWatcher: {
    on: jest.Mock;
    close: jest.Mock;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockWatcher = {
      on: jest.fn().mockReturnThis(),
      close: jest.fn().mockResolvedValue(undefined),
    };
    mockWatch.mockReturnValue(mockWatcher);
    mockWatch.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('start() creates watcher with correct paths and hooks events', () => {
    const onChange = jest.fn();
    const fw = createFileWatcher({
      repoPath: '/repo',
      onFileChange: onChange,
      enabled: true,
    });

    fw.start();

    expect(mockWatch).toHaveBeenCalledTimes(1);
    const watchedPaths = mockWatch.mock.calls[0][0] as string[];
    expect(watchedPaths).toContain('/repo/prompts/active');
    expect(watchedPaths).toContain('/repo/agents/handoffs');

    // Should register add, change, unlink events
    const eventNames = mockWatcher.on.mock.calls.map(
      (c: [string, unknown]) => c[0],
    );
    expect(eventNames).toContain('add');
    expect(eventNames).toContain('change');
    expect(eventNames).toContain('unlink');
  });

  it('start() does nothing when enabled is false', () => {
    const fw = createFileWatcher({
      repoPath: '/repo',
      onFileChange: jest.fn(),
      enabled: false,
    });

    fw.start();

    expect(mockWatch).not.toHaveBeenCalled();
  });

  it('start() does nothing if already watching', () => {
    const fw = createFileWatcher({
      repoPath: '/repo',
      onFileChange: jest.fn(),
      enabled: true,
    });

    fw.start();
    fw.start(); // second call

    expect(mockWatch).toHaveBeenCalledTimes(1);
  });

  it('stop() closes watcher and nullifies it', () => {
    const fw = createFileWatcher({
      repoPath: '/repo',
      onFileChange: jest.fn(),
      enabled: true,
    });

    fw.start();
    fw.stop();

    expect(mockWatcher.close).toHaveBeenCalledTimes(1);

    // Can start again after stop
    fw.start();
    expect(mockWatch).toHaveBeenCalledTimes(2);
  });

  it('stop() is safe to call when no watcher exists', () => {
    const fw = createFileWatcher({
      repoPath: '/repo',
      onFileChange: jest.fn(),
      enabled: true,
    });

    // stop without start — should not throw
    expect(() => fw.stop()).not.toThrow();
  });

  it('file events trigger debounced callback', () => {
    const onChange = jest.fn();
    const fw = createFileWatcher({
      repoPath: '/repo',
      onFileChange: onChange,
      enabled: true,
    });

    fw.start();

    // Grab the handler registered for 'change' event
    const changeCall = mockWatcher.on.mock.calls.find(
      (c: [string, unknown]) => c[0] === 'change',
    );
    const changeHandler = changeCall[1] as (path: string) => void;

    changeHandler('/repo/prompts/active/test.md');

    jest.advanceTimersByTime(500);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
