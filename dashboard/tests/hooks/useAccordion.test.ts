import { renderHook, act } from '@testing-library/react';
import { useAccordion } from '@/hooks/useAccordion';

describe('useAccordion', () => {
  it('starts with no items expanded by default', () => {
    const { result } = renderHook(() => useAccordion());
    expect(result.current.isExpanded('E1')).toBe(false);
  });

  it('starts with initial items expanded', () => {
    const { result } = renderHook(() => useAccordion(['E1', 'E2']));
    expect(result.current.isExpanded('E1')).toBe(true);
    expect(result.current.isExpanded('E2')).toBe(true);
    expect(result.current.isExpanded('E3')).toBe(false);
  });

  it('toggles item expanded state', () => {
    const { result } = renderHook(() => useAccordion());

    act(() => result.current.toggle('E1'));
    expect(result.current.isExpanded('E1')).toBe(true);

    act(() => result.current.toggle('E1'));
    expect(result.current.isExpanded('E1')).toBe(false);
  });

  it('allows multiple items expanded simultaneously', () => {
    const { result } = renderHook(() => useAccordion());

    act(() => result.current.toggle('E1'));
    act(() => result.current.toggle('E2'));

    expect(result.current.isExpanded('E1')).toBe(true);
    expect(result.current.isExpanded('E2')).toBe(true);
  });

  it('collapseAll closes all items', () => {
    const { result } = renderHook(() => useAccordion(['E1', 'E2']));

    act(() => result.current.collapseAll());

    expect(result.current.isExpanded('E1')).toBe(false);
    expect(result.current.isExpanded('E2')).toBe(false);
  });
});
