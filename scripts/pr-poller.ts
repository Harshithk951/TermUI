import { execSync } from 'node:child_process';

interface PRInfo {
    number: number;
    title: string;
    headRefName: string;
}

interface CommentInfo {
    id: number;
    body: string;
    author: string;
    path?: string;
    line?: number;
    htmlUrl: string;
}

function runCmd(cmd: string): string {
    try {
        return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    } catch {
        return '';
    }
}

export function getOpenPRs(): PRInfo[] {
    const output = runCmd('gh pr list --author "@me" --repo Karanjot786/TermUI --json number,title,headRefName');
    if (!output) return [];
    try {
        return JSON.parse(output);
    } catch {
        return [];
    }
}

export function getPRComments(prNumber: number): CommentInfo[] {
    const comments: CommentInfo[] = [];

    // 1. Fetch review (line) comments
    const reviewCommentsRaw = runCmd(`gh api repos/Karanjot786/TermUI/pulls/${prNumber}/comments`);
    if (reviewCommentsRaw) {
        try {
            const list = JSON.parse(reviewCommentsRaw);
            for (const c of list) {
                comments.push({
                    id: c.id,
                    body: c.body,
                    author: c.user?.login ?? 'unknown',
                    path: c.path,
                    line: c.line ?? c.original_line,
                    htmlUrl: c.html_url,
                });
            }
        } catch {}
    }

    // 2. Fetch conversation comments
    const issueCommentsRaw = runCmd(`gh api repos/Karanjot786/TermUI/issues/${prNumber}/comments`);
    if (issueCommentsRaw) {
        try {
            const list = JSON.parse(issueCommentsRaw);
            for (const c of list) {
                comments.push({
                    id: c.id,
                    body: c.body,
                    author: c.user?.login ?? 'unknown',
                    htmlUrl: c.html_url,
                });
            }
        } catch {}
    }

    return comments;
}

export function replyToReviewComment(prNumber: number, commentId: number, body: string): boolean {
    const res = runCmd(`gh api -X POST repos/Karanjot786/TermUI/pulls/${prNumber}/comments/${commentId}/replies -f body="${body.replace(/"/g, '\\"')}"`);
    return !!res;
}

export function replyToIssueComment(prNumber: number, body: string): boolean {
    const res = runCmd(`gh api -X POST repos/Karanjot786/TermUI/issues/${prNumber}/comments -f body="${body.replace(/"/g, '\\"')}"`);
    return !!res;
}

// CLI Mode
if (import.meta.main) {
    const prs = getOpenPRs();
    console.log(`Found ${prs.length} open pull requests:`);
    for (const pr of prs) {
        console.log(`\n#${pr.number}: ${pr.title} (Branch: ${pr.headRefName})`);
        const comments = getPRComments(pr.number);
        if (comments.length === 0) {
            console.log('  No comments found.');
        } else {
            console.log(`  Comments (${comments.length}):`);
            for (const c of comments) {
                const location = c.path ? ` at ${c.path}:${c.line}` : '';
                console.log(`  - [Comment ${c.id}] by ${c.author}${location}:`);
                console.log(`    ${c.body.split('\n')[0]}...`);
            }
        }
    }
}
