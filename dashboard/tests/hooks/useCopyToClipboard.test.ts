import { renderHook, act } from '@testing-library/react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
});

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockWriteText.mockClear();
    mockWriteText.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initially has copied = false', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.copied).toBe(false);
  });

  it('sets copied to true after successful copy', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.copied).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith('hello');
  });

  it('resets copied to false after 2 seconds', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('text');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('handles clipboard API failure gracefully', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('Permission denied'));

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('fail text');
    });

    // copied stays false on failure
    expect(result.current.copied).toBe(false);
  });

  it('resets timer on rapid successive copies', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('first');
    });
    expect(result.current.copied).toBe(true);

    // Advance 1 second (half the timeout)
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(true);

    // Copy again — timer should restart
    await act(async () => {
      await result.current.copy('second');
    });
    expect(result.current.copied).toBe(true);

    // Advance 1.5s — old timer would have expired but new timer hasn't
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(result.current.copied).toBe(true);

    // Advance remaining 0.5s — new timer completes
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current.copied).toBe(false);
  });
});
