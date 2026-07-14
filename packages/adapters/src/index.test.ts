import { describe, it, expect } from 'vitest';

describe('adapters - public API smoke test', () => {
    it('re-exports core and CLI adapters', async () => {
        const mod = await import('./index.js');
        expect(mod.useGit).toBeDefined();
        expect(mod.useConf).toBeDefined();
        expect(mod.useGitHub).toBeDefined();
        expect(mod.useKeychain).toBeDefined();
        expect(mod.useClipboard).toBeDefined();
        expect(mod.useOpen).toBeDefined();
        expect(mod.useExeca).toBeDefined();
    });

    it('re-exports validation and UI styling adapters', async () => {
        const mod = await import('./index.js');
        expect(mod.zodValidator).toBeDefined();
        expect(mod.chalkToTermUI).toBeDefined();
    });

    it('re-exports system and data integration adapters', async () => {
        const mod = await import('./index.js');
        expect(mod.useAI).toBeDefined();
        expect(mod.LocalVectorStore).toBeDefined();
        expect(mod.indexDirectory).toBeDefined();
        expect(mod.chunkText).toBeDefined();
        expect(mod.useDotenv).toBeDefined();
        expect(mod.useLocalStorage).toBeDefined();
    });
});
