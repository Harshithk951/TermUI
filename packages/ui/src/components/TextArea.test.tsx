/** @jsxImportSource @termuijs/jsx */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@termuijs/testing';
import { TextArea } from './TextArea.js';

describe('TextArea Component (Functional)', () => {
    it('renders with initial value', () => {
        const screen = render(<TextArea value="hello" />);
        expect(screen.getOutput()).toContain('hello');
    });

    it('handles typing and backspace correctly', () => {
        const onChange = vi.fn();
        const screen = render(<TextArea value="" onChange={onChange} />);

        screen.typeText('hi');
        expect(screen.getOutput()).toContain('hi');
        expect(onChange).toHaveBeenLastCalledWith('hi');

        screen.fireKey('backspace');
        expect(screen.getOutput()).toContain('h');
        expect(onChange).toHaveBeenLastCalledWith('h');
    });

    it('handles newline insertion and basic navigation', () => {
        const screen = render(<TextArea value="abc" />);
        // Move left, insert newline
        screen.fireKey('left');
        screen.fireKey('enter');
        
        const output = screen.getOutput();
        expect(output).toContain('ab');
        expect(output).toContain('c');
    });
});
