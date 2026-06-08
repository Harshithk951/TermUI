// ─────────────────────────────────────────────────────
// @termuijs/jsx — Tests for useFocusTrap hook
// ─────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createFiber, setCurrentFiber, clearCurrentFiber, setRequestRender } from '../hooks.js';
import { FocusContext } from '../focus-context.js';
import { useFocusTrap } from './useFocusTrap.js';

describe('useFocusTrap', () => {
    let fiber = createFiber();
    let mockContextValue: {
        focused: string | null;
        focus: ReturnType<typeof vi.fn>;
        blur: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        fiber = createFiber();
        setRequestRender(() => {});
        setCurrentFiber(fiber);

        mockContextValue = {
            focused: null,
            focus: vi.fn((id: string) => {
                mockContextValue.focused = id;
            }),
            blur: vi.fn(() => {
                mockContextValue.focused = null;
            }),
        };

        // Inject FocusContext mock directly into the fiber context map
        fiber.contextValues.set(FocusContext._id, mockContextValue);
    });

    afterEach(() => {
        clearCurrentFiber();
        vi.restoreAllMocks();
    });

    it('cycles forward through IDs on Tab key', () => {
        const ids = ['first', 'second', 'third'];
        useFocusTrap(ids);

        // Start with 'first' focused
        mockContextValue.focused = 'first';

        // Press tab -> expect focus to move to 'second'
        expect(fiber.onInput).toBeDefined();
        fiber.onInput?.({ key: 'tab', shift: false } as any);
        expect(mockContextValue.focus).toHaveBeenCalledWith('second');

        // Update focused state and press tab again -> expect 'third'
        mockContextValue.focused = 'second';
        fiber.onInput?.({ key: 'tab', shift: false } as any);
        expect(mockContextValue.focus).toHaveBeenLastCalledWith('third');
    });

    it('cycles backward through IDs on Shift+Tab key', () => {
        const ids = ['first', 'second', 'third'];
        useFocusTrap(ids);

        // Start with 'second' focused
        mockContextValue.focused = 'second';

        // Press Shift+Tab -> expect focus to move to 'first'
        fiber.onInput?.({ key: 'tab', shift: true } as any);
        expect(mockContextValue.focus).toHaveBeenCalledWith('first');
    });

    it('wraps forward from last to first on Tab', () => {
        const ids = ['first', 'second', 'third'];
        useFocusTrap(ids);

        mockContextValue.focused = 'third';

        // Press Tab on last element -> expect first element 'first'
        fiber.onInput?.({ key: 'tab', shift: false } as any);
        expect(mockContextValue.focus).toHaveBeenCalledWith('first');
    });

    it('wraps backward from first to last on Shift+Tab', () => {
        const ids = ['first', 'second', 'third'];
        useFocusTrap(ids);

        mockContextValue.focused = 'first';

        // Press Shift+Tab on first element -> expect last element 'third'
        fiber.onInput?.({ key: 'tab', shift: true } as any);
        expect(mockContextValue.focus).toHaveBeenCalledWith('third');
    });

    it('moves focus to the first element if none of the IDs is currently focused', () => {
        const ids = ['first', 'second', 'third'];
        useFocusTrap(ids);

        // No element is focused
        mockContextValue.focused = null;

        fiber.onInput?.({ key: 'tab', shift: false } as any);
        expect(mockContextValue.focus).toHaveBeenCalledWith('first');
    });

    it('moves focus to the last element if none of the IDs is currently focused and Shift+Tab is pressed', () => {
        const ids = ['first', 'second', 'third'];
        useFocusTrap(ids);

        mockContextValue.focused = null;

        fiber.onInput?.({ key: 'tab', shift: true } as any);
        expect(mockContextValue.focus).toHaveBeenCalledWith('third');
    });

    it('does nothing if the IDs list is empty', () => {
        useFocusTrap([]);

        mockContextValue.focused = null;

        fiber.onInput?.({ key: 'tab', shift: false } as any);
        expect(mockContextValue.focus).not.toHaveBeenCalled();
    });

    it('ignores other keys', () => {
        const ids = ['first', 'second', 'third'];
        useFocusTrap(ids);

        mockContextValue.focused = 'first';

        fiber.onInput?.({ key: 'up', shift: false } as any);
        fiber.onInput?.({ key: 'enter', shift: false } as any);
        expect(mockContextValue.focus).not.toHaveBeenCalled();
    });
});
