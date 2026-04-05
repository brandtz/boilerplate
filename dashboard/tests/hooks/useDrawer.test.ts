import { renderHook, act } from '@testing-library/react';
import { useDrawer } from '@/hooks/useDrawer';

// Helper: create a fake drawer DOM structure and attach to drawerRef
function setupDrawerDOM(drawerRef: React.RefObject<HTMLDivElement | null>) {
  const drawer = document.createElement('div');
  const btn1 = document.createElement('button');
  btn1.textContent = 'Close';
  const btn2 = document.createElement('button');
  btn2.textContent = 'Copy';
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = 'Link';
  drawer.appendChild(btn1);
  drawer.appendChild(btn2);
  drawer.appendChild(link);
  document.body.appendChild(drawer);

  // Assign drawer to ref
  Object.defineProperty(drawerRef, 'current', {
    value: drawer,
    writable: true,
  });

  return { drawer, btn1, btn2, link };
}

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

  it('focuses first focusable element when drawer opens', () => {
    const { result } = renderHook(() => useDrawer());

    const { btn1, drawer } = setupDrawerDOM(result.current.drawerRef);

    act(() => result.current.open('test'));

    expect(document.activeElement).toBe(btn1);

    document.body.removeChild(drawer);
  });

  it('traps Tab at the last element — wraps to first', () => {
    const { result } = renderHook(() => useDrawer());

    const { drawer, btn1, link } = setupDrawerDOM(result.current.drawerRef);

    act(() => result.current.open('test'));

    // Focus the last element
    link.focus();
    expect(document.activeElement).toBe(link);

    // Simulate Tab on last element
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    });

    expect(document.activeElement).toBe(btn1);

    document.body.removeChild(drawer);
  });

  it('traps Shift+Tab at the first element — wraps to last', () => {
    const { result } = renderHook(() => useDrawer());

    const { drawer, btn1, link } = setupDrawerDOM(result.current.drawerRef);

    act(() => result.current.open('test'));

    // Focus the first element
    btn1.focus();
    expect(document.activeElement).toBe(btn1);

    // Simulate Shift+Tab on first element
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    });

    expect(document.activeElement).toBe(link);

    document.body.removeChild(drawer);
  });

  it('does not trap Tab when focus is on a middle element', () => {
    const { result } = renderHook(() => useDrawer());

    const { drawer, btn2 } = setupDrawerDOM(result.current.drawerRef);

    act(() => result.current.open('test'));

    // Focus a middle element
    btn2.focus();
    expect(document.activeElement).toBe(btn2);

    // Simulate Tab — should NOT be prevented (not first or last)
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    act(() => {
      document.dispatchEvent(event);
    });

    expect(preventDefaultSpy).not.toHaveBeenCalled();

    document.body.removeChild(drawer);
  });

  it('ignores non-Tab keys in tab handler', () => {
    const { result } = renderHook(() => useDrawer());

    const { drawer, btn1 } = setupDrawerDOM(result.current.drawerRef);

    act(() => result.current.open('test'));

    btn1.focus();

    // Simulate Enter key — should not affect focus
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
    });

    expect(document.activeElement).toBe(btn1);

    document.body.removeChild(drawer);
  });

  it('restores focus to trigger element on close', () => {
    jest.useFakeTimers();
    const trigger = document.createElement('button');
    trigger.textContent = 'Trigger';
    document.body.appendChild(trigger);
    trigger.focus();

    const { result } = renderHook(() => useDrawer());

    act(() => result.current.open('test'));
    act(() => result.current.close());

    act(() => {
      jest.runAllTimers();
    });

    expect(document.activeElement).toBe(trigger);

    document.body.removeChild(trigger);
    jest.useRealTimers();
  });
});
