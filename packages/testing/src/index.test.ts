import { describe, it, expect } from 'vitest';

describe('testing - public API smoke test', () => {
    it('re-exports render helpers', async () => {
        const mod = await import('./index.js');
        expect(typeof mod.render).toBe('function');
        expect(typeof mod.createFixture).toBe('function');
    });

    it('re-exports virtual clock helper', async () => {
        const mod = await import('./index.js');
        expect(typeof mod.createVirtualClock).toBe('function');
    });

    it('re-exports frame serialization helpers', async () => {
        const mod = await import('./index.js');
        expect(typeof mod.frameSerializer).toBe('object');
        expect(typeof mod.formatFrame).toBe('function');
    });

    it('re-exports query helpers', async () => {
        const mod = await import('./index.js');
        expect(typeof mod.getByRole).toBe('function');
        expect(typeof mod.getByLabel).toBe('function');
        expect(typeof mod.queryByText).toBe('function');
    });

    it('re-exports screen recorder', async () => {
        const mod = await import('./index.js');
        expect(typeof mod.ScreenRecorder).toBe('function');
    });
});
