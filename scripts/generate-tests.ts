import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;

if (!GEMINI_KEY && !NVIDIA_KEY) {
    console.error('Error: Neither GEMINI_API_KEY nor NVIDIA_API_KEY environment variable is set.');
    process.exit(1);
}

const args = process.argv.slice(2);
const isFixMode = args.includes('--fix');
const targetFile = args[0];

if (!targetFile) {
    console.error('Usage: bun run scripts/generate-tests.ts <target_file> [--fix <error_trace>]');
    process.exit(1);
}

const targetExt = extname(targetFile);
const targetDir = dirname(targetFile);
const targetName = basename(targetFile, targetExt);
const testFile = join(targetDir, `${targetName}.test${targetExt}`);

const sourceCode = readFileSync(targetFile, 'utf8');

const systemPrompt = `You are a Senior TypeScript developer. Write a comprehensive unit test suite using Vitest for the given source file.
Follow these rules strictly:
1. Framework: Vitest (import describe, it, expect, vi, beforeEach, afterEach).
2. TypeScript strict mode: No 'any'. No '@ts-ignore'. No type assertions without an inline comment explaining why.
3. Named exports only. Never 'export default'.
4. Use the 'node:' prefix for Node built-ins (e.g., import { readFileSync } from 'node:fs').
5. Every state-mutating method on a widget must call markDirty().
6. Tests must be real. Do not use placeholder tests or expect(true).toBe(true). Assert observable behavior or rendered output.
7. Return ONLY the TypeScript code of the test file. Do NOT wrap it in markdown block tags (like \`\`\`typescript) or any introductory text.`;

async function callGemini(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
            generationConfig: {
                responseMimeType: 'text/plain',
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText} (${response.status})`);
    }

    const data: any = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Strip markdown code fences if model returned them
    if (text.startsWith('```')) {
        text = text.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
    }

    return text.trim();
}

async function callNvidia(prompt: string): Promise<string> {
    const model = process.env.NVIDIA_MODEL || 'nvidia/nemotron-4-340b-instruct';
    const url = 'https://integrate.api.nvidia.com/v1/chat/completions';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NVIDIA_KEY}`,
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.2,
            top_p: 0.7,
            max_tokens: 4096,
        }),
    });

    if (!response.ok) {
        throw new Error(`NVIDIA API error: ${response.statusText} (${response.status})`);
    }

    const data: any = await response.json();
    let text = data.choices?.[0]?.message?.content ?? '';

    // Strip markdown code fences if model returned them
    if (text.startsWith('```')) {
        text = text.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
    }

    return text.trim();
}

async function callAI(prompt: string): Promise<string> {
    if (NVIDIA_KEY) {
        console.log('Routing request to NVIDIA API...');
        return callNvidia(prompt);
    } else {
        console.log('Routing request to Google Gemini API...');
        return callGemini(prompt);
    }
}

async function main() {
    if (isFixMode) {
        const errorTraceIndex = args.indexOf('--fix') + 1;
        const errorTrace = args.slice(errorTraceIndex).join(' ');

        if (!existsSync(testFile)) {
            console.error(`Error: Test file to fix does not exist: ${testFile}`);
            process.exit(1);
        }

        const currentTestCode = readFileSync(testFile, 'utf8');
        console.log(`Fixing test file: ${testFile} using error trace...`);

        const prompt = `${systemPrompt}

Source Code to test:
\`\`\`typescript
${sourceCode}
\`\`\`

Current Test Code that failed:
\`\`\`typescript
${currentTestCode}
\`\`\`

Error/Failure Trace:
\`\`\`
${errorTrace}
\`\`\`

Please update the test code to resolve the errors shown in the trace. Maintain coverage and keep changes minimal. Return ONLY the updated TypeScript code.`;

        const fixedCode = await callAI(prompt);
        writeFileSync(testFile, fixedCode, 'utf8');
        console.log(`Successfully updated and saved fixes to ${testFile}`);
    } else {
        console.log(`Generating new tests for target file: ${targetFile}...`);

        const prompt = `${systemPrompt}

Source Code to write unit tests for:
\`\`\`typescript
${sourceCode}
\`\`\`

Please write a robust, complete set of unit tests covering all functions, branches, and edge cases in the source code. Return ONLY the TypeScript code for the test file.`;

        const testCode = await callAI(prompt);
        writeFileSync(testFile, testCode, 'utf8');
        console.log(`Successfully generated and saved tests to ${testFile}`);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
