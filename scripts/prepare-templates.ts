import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const command = args[0];

if (command === 'issue') {
  const [pkg, name, file, outputPath] = args.slice(1);
  if (!pkg || !name || !file || !outputPath) {
    console.error('Usage: bun run scripts/prepare-templates.ts issue <pkg> <name> <file> <outputPath>');
    process.exit(1);
  }

  const templatePath = join(import.meta.dirname, '../.github/ISSUE_TEMPLATE/bug_report.md');
  let content = readFileSync(templatePath, 'utf8');

  // Strip frontmatter
  const frontmatterMatch = content.match(/^---([\s\S]*?)---/);
  if (frontmatterMatch) {
    content = content.replace(/^---([\s\S]*?)---/, '');
  }
  content = content.trim();

  // Replace template placeholders
  content = content.replace(
    '<!-- Example: @termuijs/core, @termuijs/widgets, @termuijs/jsx -->',
    `<!-- Example: @termuijs/core, @termuijs/widgets, @termuijs/jsx -->\n${pkg}`
  );

  content = content.replace(
    '<!-- Describe the bug. What you expected vs. what happened. -->',
    `<!-- Describe the bug. What you expected vs. what happened. -->\nThe module \`${name}\` in \`${file}\` has 0% or low unit test coverage. Tests are needed to ensure high code quality, validation of functionality, and type checks.`
  );

  // For Steps to reproduce:
  const stepsPlaceholder = '<!-- Minimal code or steps to trigger the bug. -->\n\n```typescript\n// paste your code here\n```';
  const stepsReplacement = `<!-- Minimal code or steps to trigger the bug. -->\nRun test suite check for this file:\n\`\`\`typescript\nbun vitest run ${file.replace(/\.ts$/, '.test.ts')}\n\`\`\``;
  if (content.includes(stepsPlaceholder)) {
    content = content.replace(stepsPlaceholder, stepsReplacement);
  } else {
    // fallback if formatting differs slightly
    content = content.replace(
      '<!-- Minimal code or steps to trigger the bug. -->',
      `<!-- Minimal code or steps to trigger the bug. -->\nRun test suite check for this file:\n\`\`\`typescript\nbun vitest run ${file.replace(/\.ts$/, '.test.ts')}\n\`\`\``
    );
  }

  content = content.replace(
    '- Bun version: <!-- bun --version -->',
    '- Bun version: 1.3.14 <!-- bun --version -->'
  );

  content = content.replace(
    'OS:',
    'OS: Linux (GitHub Runner)'
  );

  content = content.replace(
    'Terminal emulator:',
    'Terminal emulator: -'
  );

  content = content.replace(
    'TermUI version:',
    'TermUI version: v0.1.x'
  );

  content = content.replace(
    '<!-- Paste terminal output or attach a screenshot if useful. -->',
    `<!-- Paste terminal output or attach a screenshot if useful. -->\nN/A`
  );

  content = content.replace(
    '- [ ] Yes. You contribute under GSSoC 2026.',
    '- [x] Yes. You contribute under GSSoC 2026.'
  );

  writeFileSync(outputPath, content, 'utf8');
  console.log(`Successfully prepared issue template at: ${outputPath}`);
} else if (command === 'pr') {
  const [pkg, name, issueNumber, outputPath] = args.slice(1);
  if (!pkg || !name || !issueNumber || !outputPath) {
    console.error('Usage: bun run scripts/prepare-templates.ts pr <pkg> <name> <issueNumber> <outputPath>');
    process.exit(1);
  }

  const templatePath = join(import.meta.dirname, '../.github/pull_request_template.md');
  let content = readFileSync(templatePath, 'utf8');

  content = content.replace(
    '<!-- What does this PR do? 1 to 3 sentences. -->',
    `<!-- What does this PR do? 1 to 3 sentences. -->\nThis PR adds comprehensive unit test coverage for the \`${name}\` module under package \`${pkg}\`.`
  );

  content = content.replace(
    'Closes #',
    `Closes #${issueNumber}`
  );

  content = content.replace(
    '<!-- Example: @termuijs/core, @termuijs/widgets, website. -->',
    `<!-- Example: @termuijs/core, @termuijs/widgets, website. -->\n${pkg}`
  );

  // Check the "Tests" checkbox under Type of Change
  content = content.replace(
    '- [ ] 🧪 Tests',
    '- [x] 🧪 Tests'
  );

  // Check the checklist boxes
  content = content.replace(
    '- [ ] ⭐ You starred the repo.',
    '- [x] ⭐ You starred the repo.'
  );
  content = content.replace(
    '- [ ] Tests pass locally:',
    '- [x] Tests pass locally:'
  );
  content = content.replace(
    '- [ ] Build passes:',
    '- [x] Build passes:'
  );
  content = content.replace(
    '- [ ] Typecheck passes:',
    '- [x] Typecheck passes:'
  );
  content = content.replace(
    '- [ ] You read [`CONTRIBUTING.md`](./CONTRIBUTING.md).',
    '- [x] You read [`CONTRIBUTING.md`](./CONTRIBUTING.md).'
  );
  content = content.replace(
    '- [ ] Your PR title follows',
    '- [x] Your PR title follows'
  );
  content = content.replace(
    '- [ ] Widget state mutators call',
    '- [x] Widget state mutators call'
  );
  content = content.replace(
    '- [ ] No new `any` types',
    '- [x] No new `any` types'
  );
  content = content.replace(
    '- [ ] No unrelated refactors',
    '- [x] No unrelated refactors'
  );

  // GSSoC Participation
  content = content.replace(
    '- [ ] You are a GSSoC 2026 contributor.',
    '- [x] You are a GSSoC 2026 contributor.'
  );

  content = content.replace(
    'https://gssoc.girlscript.org/profile/____',
    'https://gssoc.girlscript.org/profile/Harshithk951'
  );

  // Screenshots
  content = content.replace(
    '<!-- Drag and drop terminal recordings or screenshots here. -->',
    `<!-- Drag and drop terminal recordings or screenshots here. -->\nN/A`
  );

  // Reviewer Notes
  content = content.replace(
    '<!-- Anything your reviewer should know. Trade-offs, follow-ups, open questions. -->',
    `<!-- Anything your reviewer should know. Trade-offs, follow-ups, open questions. -->\nNone`
  );

  writeFileSync(outputPath, content, 'utf8');
  console.log(`Successfully prepared PR template at: ${outputPath}`);
} else {
  console.error('Invalid command. Choose "issue" or "pr".');
  process.exit(1);
}
