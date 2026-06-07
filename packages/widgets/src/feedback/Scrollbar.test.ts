// ─────────────────────────────────────────────────────
// @termuijs/widgets — Tests for Scrollbar widget
// ─────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { Screen } from '@termuijs/core';
import { Scrollbar } from './Scrollbar.js';

describe('Scrollbar Widget — Initialization', () => {
    it('should initialize with provided options and default style', () => {
        const bar = new Scrollbar({}, {
            contentLength: 100,
            viewportLength: 10,
            position: 5,
            orientation: 'verticalLeft',
            showArrows: false,
        });

        expect(bar).toBeDefined();
        expect(bar.isDirty).toBe(true); // Starts dirty
    });

    it('should fall back to defaults for missing optional options', () => {
        const bar = new Scrollbar({}, {
            contentLength: 50,
            viewportLength: 10,
        });

        expect(bar).toBeDefined();
    });
});

describe('Scrollbar Widget — State Mutations & Dirty Marking', () => {
    it('should mark dirty when setPosition is called', () => {
        const bar = new Scrollbar({}, { contentLength: 50, viewportLength: 10 });
        bar.clearDirty();
        expect(bar.isDirty).toBe(false);

        bar.setPosition(15);
        expect(bar.isDirty).toBe(true);
    });

    it('should mark dirty when setContentLength is called', () => {
        const bar = new Scrollbar({}, { contentLength: 50, viewportLength: 10 });
        bar.clearDirty();
        expect(bar.isDirty).toBe(false);

        bar.setContentLength(100);
        expect(bar.isDirty).toBe(true);
    });

    it('should mark dirty when setViewportLength is called', () => {
        const bar = new Scrollbar({}, { contentLength: 50, viewportLength: 10 });
        bar.clearDirty();
        expect(bar.isDirty).toBe(false);

        bar.setViewportLength(20);
        expect(bar.isDirty).toBe(true);
    });
});

describe('Scrollbar Widget — Rendering', () => {
    it('should not render anything if contentLength <= viewportLength', () => {
        const bar = new Scrollbar({}, {
            contentLength: 10,
            viewportLength: 10,
            orientation: 'verticalRight',
        });
        bar.updateRect({ x: 0, y: 0, width: 10, height: 10 });
        const screen = new Screen(10, 10);
        bar.render(screen);

        const allChars = screen.back.flat().map(c => c.char).join('');
        expect(allChars.trim()).toBe('');
    });

    it('should not render anything if width or height <= 0', () => {
        const bar = new Scrollbar({}, {
            contentLength: 20,
            viewportLength: 10,
            orientation: 'verticalRight',
        });
        bar.updateRect({ x: 0, y: 0, width: 0, height: 10 });
        const screen = new Screen(10, 10);
        bar.render(screen);

        const allChars = screen.back.flat().map(c => c.char).join('');
        expect(allChars.trim()).toBe('');
    });

    it('should render verticalRight layout with arrows correctly', () => {
        // Vertical layout: y goes from 0 to 9, scrollbar is on the rightmost column (width - 1 = 9)
        const bar = new Scrollbar({}, {
            contentLength: 20,
            viewportLength: 10,
            position: 0,
            orientation: 'verticalRight',
            showArrows: true,
        });

        bar.updateRect({ x: 0, y: 0, width: 10, height: 10 });
        const screen = new Screen(10, 10);
        bar.render(screen);

        // Row 0, col 9 should be top arrow '↑'
        expect(screen.back[0][9].char).toBe('↑');
        // Row 9, col 9 should be bottom arrow '↓'
        expect(screen.back[9][9].char).toBe('↓');

        // Check track and thumb characters at col 9
        // total length = 10. trackLength = 8 (rows 1 to 8).
        // thumbSize = Math.max(1, Math.floor((8 * 10) / 20)) = 4.
        // position = 0 => thumbOffset = 0.
        // So rows 1 to 4 should be thumb '█'
        expect(screen.back[1][9].char).toBe('█');
        expect(screen.back[2][9].char).toBe('█');
        expect(screen.back[3][9].char).toBe('█');
        expect(screen.back[4][9].char).toBe('█');

        // rows 5 to 8 should be track '│'
        expect(screen.back[5][9].char).toBe('│');
        expect(screen.back[6][9].char).toBe('│');
        expect(screen.back[7][9].char).toBe('│');
        expect(screen.back[8][9].char).toBe('│');

        // Other columns should be empty
        expect(screen.back[0][0].char).toBe(' ');
    });

    it('should render verticalLeft layout without arrows correctly', () => {
        // Vertical layout: scrollbar is on leftmost column (x = 0)
        const bar = new Scrollbar({}, {
            contentLength: 20,
            viewportLength: 10,
            position: 5, // scrolls the thumb down
            orientation: 'verticalLeft',
            showArrows: false,
        });

        bar.updateRect({ x: 0, y: 0, width: 10, height: 10 });
        const screen = new Screen(10, 10);
        bar.render(screen);

        // Arrows should be hidden, so track/thumb runs the full height of 10 rows
        // thumbSize = Math.max(1, Math.floor((10 * 10) / 20)) = 5.
        // maxScroll = 20 - 10 = 10.
        // position = 5 => thumbOffset = Math.floor((5 * (10 - 5)) / 10) = 2.
        // So thumb is from row 2 to 6 (length 5).
        // track: rows 0-1, and 7-9.
        expect(screen.back[0][0].char).toBe('│');
        expect(screen.back[1][0].char).toBe('│');

        expect(screen.back[2][0].char).toBe('█');
        expect(screen.back[3][0].char).toBe('█');
        expect(screen.back[4][0].char).toBe('█');
        expect(screen.back[5][0].char).toBe('█');
        expect(screen.back[6][0].char).toBe('█');

        expect(screen.back[7][0].char).toBe('│');
        expect(screen.back[8][0].char).toBe('│');
        expect(screen.back[9][0].char).toBe('│');

        // Col 9 should be empty
        expect(screen.back[0][9].char).toBe(' ');
    });

    it('should render horizontalBottom layout correctly', () => {
        // Horizontal layout: y is bottom row (height - 1 = 9)
        const bar = new Scrollbar({}, {
            contentLength: 30,
            viewportLength: 10,
            position: 10,
            orientation: 'horizontalBottom',
            showArrows: true,
        });

        bar.updateRect({ x: 0, y: 0, width: 12, height: 10 });
        const screen = new Screen(12, 10);
        bar.render(screen);

        // Col 0, row 9: '←'
        expect(screen.back[9][0].char).toBe('←');
        // Col 11, row 9: '→'
        expect(screen.back[9][11].char).toBe('→');

        // track length = 10 (cols 1 to 10)
        // thumbSize = Math.max(1, Math.floor((10 * 10) / 30)) = 3.
        // maxScroll = 30 - 10 = 20.
        // position = 10 => thumbOffset = Math.floor((10 * (10 - 3)) / 20) = 3.
        // Thumb at cols 4, 5, 6.
        // Track at cols 1, 2, 3 and 7, 8, 9, 10.
        expect(screen.back[9][1].char).toBe('─');
        expect(screen.back[9][2].char).toBe('─');
        expect(screen.back[9][3].char).toBe('─');

        expect(screen.back[9][4].char).toBe('█');
        expect(screen.back[9][5].char).toBe('█');
        expect(screen.back[9][6].char).toBe('█');

        expect(screen.back[9][7].char).toBe('─');
        expect(screen.back[9][8].char).toBe('─');
        expect(screen.back[9][9].char).toBe('─');
        expect(screen.back[9][10].char).toBe('─');
    });

    it('should render horizontalTop layout correctly', () => {
        // Horizontal layout: y is top row (y = 0)
        const bar = new Scrollbar({}, {
            contentLength: 20,
            viewportLength: 10,
            position: 0,
            orientation: 'horizontalTop',
            showArrows: false,
        });

        bar.updateRect({ x: 0, y: 0, width: 10, height: 10 });
        const screen = new Screen(10, 10);
        bar.render(screen);

        // Since showArrows is false, track/thumb runs full width of 10.
        // thumbSize = 5. position = 0 => thumbOffset = 0.
        // Thumb at cols 0 to 4.
        // Track at cols 5 to 9.
        expect(screen.back[0][0].char).toBe('█');
        expect(screen.back[0][4].char).toBe('█');
        expect(screen.back[0][5].char).toBe('─');
        expect(screen.back[0][9].char).toBe('─');

        // Bottom row should be empty
        expect(screen.back[9][0].char).toBe(' ');
    });
});
