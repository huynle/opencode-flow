import { GitManager } from './git.js';
import { SessionManager } from './sessions.js';
import { OpenCodeClient } from '../agents/opencode.js';
import { GitHubClient } from '../agents/github.js';

export class OrchestratorEngine {
    private git: GitManager;
    private sessions: SessionManager;
    private opencode: OpenCodeClient;
    private github: GitHubClient;

    constructor() {
        this.git = new GitManager();
        this.sessions = new SessionManager();
        this.opencode = new OpenCodeClient();
        this.github = new GitHubClient();
    }

    async handleIssueTrigger(owner: string, repo: string, issueNumber: string, instruction: string) {
        const issueUid = `${owner}/${repo}/${issueNumber}`;
        console.log(`[Orchestrator] Handling trigger for ${issueUid}`);

        // 1. Check if session exists
        let session = this.sessions.get(issueUid);

        // 2. Clone/Ensure Repo
        // Construct a GitHub URL (public/private handling would need auth tokens in real life)
        const cloneUrl = `https://github.com/${owner}/${repo}.git`;
        const repoPath = await this.git.ensureRepo(owner, repo, issueNumber, cloneUrl);

        if (!session) {
            // 3. Start new OpenCode Session if none exists
            const sessionId = await this.opencode.startSession(repoPath, issueNumber, instruction);

            session = {
                github_issue_uid: issueUid,
                opencode_session_id: sessionId,
                local_path: repoPath,
                last_state: 'working'
            };
            this.sessions.create(session);
        } else {
            console.log(`[Orchestrator] Resuming existing session ${session.opencode_session_id}`);
        }

        // 4. Run Agent Loop (Async/Background)
        this.runAgentLoop(session, instruction);

        return session;
    }

    private async runAgentLoop(session: any, instruction: string) {
        // This would likely be a more complex state machine
        try {
            this.sessions.updateState(session.github_issue_uid, 'agent_running');
            await this.opencode.runAgent(session.opencode_session_id, session.local_path, instruction);
            this.sessions.updateState(session.github_issue_uid, 'awaiting_feedback');

            // Notify? Post proof of work?
            console.log(`[Orchestrator] Agent finished pass. State: awaiting_feedback`);

            const summary = `
## Opencode Agent Update
I have completed a pass on this issue.

### Status
- **State**: Awaiting Feedback
- **Tests**: (Mock) 3 Passed, 0 Failed
- **Changes**: (Mock) Modified 2 files

[View Walkthrough](http://localhost/walkthrough/${session.opencode_session_id})

Reply with \`/opencode push\` to open a PR.
      `;

            const [owner, repo, issueNumber] = session.github_issue_uid.split('/');
            await this.github.postComment(owner, repo, issueNumber, summary);

        } catch (err) {
            console.error(`[Orchestrator] Agent failed:`, err);
            this.sessions.updateState(session.github_issue_uid, 'error');
        }
    }
}
