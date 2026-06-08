// ─────────────────────────────────────────────────────
// @termuijs/jsx — Tests for useKeyboardNavigation hook
// ─────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createFiber, setCurrentFiber, clearCurrentFiber, setRequestRender } from '../hooks.js';
import { useKeyboardNavigation } from './useKeyboardNavigation.js';

describe('useKeyboardNavigation', () => {
    let fiber = createFiber();

    beforeEach(() => {
        fiber = createFiber();
        setRequestRender(() => {});
    });

    afterEach(() => {
        clearCurrentFiber();
        vi.restoreAllMocks();
    });

    const renderHook = (opts: Parameters<typeof useKeyboardNavigation>[0]) => {
        setCurrentFiber(fiber);
        const res = useKeyboardNavigation(opts);
        clearCurrentFiber();
        return res;
    };

    it('initializes with selectedIndex 0', () => {
        const result = renderHook({ itemCount: 5 });
        expect(result.selectedIndex).toBe(0);
    });

    it('moves selection down and up with arrow keys', () => {
        let result = renderHook({ itemCount: 5 });

        // Simulate press down -> expect 1
        fiber.onInput?.({ key: 'down' } as any);
        result = renderHook({ itemCount: 5 });
        expect(result.selectedIndex).toBe(1);

        // Simulate press down again -> expect 2
        fiber.onInput?.({ key: 'down' } as any);
        result = renderHook({ itemCount: 5 });
        expect(result.selectedIndex).toBe(2);

        // Simulate press up -> expect 1
        fiber.onInput?.({ key: 'up' } as any);
        result = renderHook({ itemCount: 5 });
        expect(result.selectedIndex).toBe(1);
    });

    it('jumps to first and last items with Home/End keys', () => {
        let result = renderHook({ itemCount: 10 });

        // End key -> expect 9
        fiber.onInput?.({ key: 'end' } as any);
        result = renderHook({ itemCount: 10 });
        expect(result.selectedIndex).toBe(9);

        // Home key -> expect 0
        fiber.onInput?.({ key: 'home' } as any);
        result = renderHook({ itemCount: 10 });
        expect(result.selectedIndex).toBe(0);
    });

    it('jumps by pageSize with PageUp/PageDown keys', () => {
        let result = renderHook({ itemCount: 25, pageSize: 5 });

        // PageDown -> expect 5
        fiber.onInput?.({ key: 'pagedown' } as any);
        result = renderHook({ itemCount: 25, pageSize: 5 });
        expect(result.selectedIndex).toBe(5);

        // PageDown again -> expect 10
        fiber.onInput?.({ key: 'pagedown' } as any);
        result = renderHook({ itemCount: 25, pageSize: 5 });
        expect(result.selectedIndex).toBe(10);

        // PageUp -> expect 5
        fiber.onInput?.({ key: 'pageup' } as any);
        result = renderHook({ itemCount: 25, pageSize: 5 });
        expect(result.selectedIndex).toBe(5);
    });

    it('wraps around boundaries when loop is true', () => {
        let result = renderHook({ itemCount: 3, loop: true });

        // Up on index 0 wraps to 2
        fiber.onInput?.({ key: 'up' } as any);
        result = renderHook({ itemCount: 3, loop: true });
        expect(result.selectedIndex).toBe(2);

        // Down on index 2 wraps to 0
        fiber.onInput?.({ key: 'down' } as any);
        result = renderHook({ itemCount: 3, loop: true });
        expect(result.selectedIndex).toBe(0);
    });

    it('clamps to boundaries when loop is false', () => {
        let result = renderHook({ itemCount: 3, loop: false });

        // Up on index 0 clamps to 0
        fiber.onInput?.({ key: 'up' } as any);
        result = renderHook({ itemCount: 3, loop: false });
        expect(result.selectedIndex).toBe(0);

        // Advance to last index
        fiber.onInput?.({ key: 'end' } as any);
        result = renderHook({ itemCount: 3, loop: false });
        expect(result.selectedIndex).toBe(2);

        // Down on index 2 clamps to 2
        fiber.onInput?.({ key: 'down' } as any);
        result = renderHook({ itemCount: 3, loop: false });
        expect(result.selectedIndex).toBe(2);
    });

    it('triggers onSelect callback on Enter key press', () => {
        const onSelect = vi.fn();
        let result = renderHook({ itemCount: 5, onSelect });

        // Advance index to 3
        fiber.onInput?.({ key: 'down' } as any);
        fiber.onInput?.({ key: 'down' } as any);
        fiber.onInput?.({ key: 'down' } as any);
        result = renderHook({ itemCount: 5, onSelect });

        // Press enter -> expect onSelect to be called with 3
        fiber.onInput?.({ key: 'enter' } as any);
        expect(onSelect).toHaveBeenCalledWith(3);
    });

    it('does nothing on key events when itemCount is 0', () => {
        let result = renderHook({ itemCount: 0 });

        fiber.onInput?.({ key: 'down' } as any);
        result = renderHook({ itemCount: 0 });
        expect(result.selectedIndex).toBe(0);

        fiber.onInput?.({ key: 'end' } as any);
        result = renderHook({ itemCount: 0 });
        expect(result.selectedIndex).toBe(0);
    });
});
