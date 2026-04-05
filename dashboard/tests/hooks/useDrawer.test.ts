import { renderHook, act } from '@testing-library/react';
import { useDrawer } from '@/hooks/useDrawer';

describe('useDrawer', () => {
  it('starts closed with no selectedId', () => {
    const { result } = renderHook(() => useDrawer());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedId).toBeNull();
  });

  it('opens with the given id', () => {
    const { result } = renderHook(() => useDrawer());

    act(() => result.current.open('3.0.1'));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.selectedId).toBe('3.0.1');
  });

  it('closes and clears state', () => {
    const { result } = renderHook(() => useDrawer());

    act(() => result.current.open('3.0.1'));
    act(() => result.current.close());

    expect(result.current.isOpen).toBe(false);
  });

  it('closes on Escape key', () => {
    const { result } = renderHook(() => useDrawer());

    act(() => result.current.open('3.0.1'));

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('does not respond to Escape when closed', () => {
    const { result } = renderHook(() => useDrawer());

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('can navigate to a different prompt by opening again', () => {
    const { result } = renderHook(() => useDrawer());

    act(() => result.current.open('3.0.1'));
    expect(result.current.selectedId).toBe('3.0.1');

    act(() => result.current.open('4.0.1'));
    expect(result.current.selectedId).toBe('4.0.1');
    expect(result.current.isOpen).toBe(true);
  });
});
