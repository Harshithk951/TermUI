/** @jsxImportSource @termuijs/jsx */
import { describe, it, expect } from 'vitest';
import { render } from './render.js';
import { useState, useInput } from '@termuijs/jsx';

describe('test-renderer render', () => {
    it('should render a simple Text element and retrieve its content', () => {
        const t = render(<text>Hello Test</text>, { width: 40, height: 10 });
        expect(t.getOutput()).toContain('Hello Test');
        expect(t.getByText('Hello Test')).toBeTruthy();
        expect(t.queryByText('Hello Test')).toBeTruthy();
        expect(t.queryByText('Non-existent')).toBeNull();
        t.unmount();
    });

    it('should fire key events and update state reactively', () => {
        function Counter() {
            const [count, setCount] = useState(0);
            useInput((key) => {
                if (key === '+') {
                    setCount(c => c + 1);
                }
            });
            return <text>Count: {count}</text>;
        }

        const t = render(<Counter />, { width: 40, height: 10 });
        expect(t.getOutput()).toContain('Count: 0');

        t.pressKey('+');
        expect(t.getOutput()).toContain('Count: 1');

        t.unmount();
    });

    it('should support resize event simulation', () => {
        const t = render(<text>Resize Me</text>, { width: 40, height: 10 });
        expect(t.screen.cols).toBe(40);
        expect(t.screen.rows).toBe(10);

        t.fireResize(60, 15);
        expect(t.screen.cols).toBe(60);
        expect(t.screen.rows).toBe(15);
        t.unmount();
    });
});