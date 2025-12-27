import db from '../db/client.js';

export interface Session {
    github_issue_uid: string; // "owner/repo/issue_id"
    opencode_session_id: string; // "sess_..."
    local_path: string;
    last_state: string;
    created_at?: string;
    updated_at?: string;
}

export class SessionManager {
    get(githubIssueUid: string): Session | undefined {
        return db.prepare('SELECT * FROM sessions WHERE github_issue_uid = ?').get(githubIssueUid) as Session | undefined;
    }

    create(session: Session) {
        const stmt = db.prepare(`
      INSERT INTO sessions (github_issue_uid, opencode_session_id, local_path, last_state)
      VALUES (@github_issue_uid, @opencode_session_id, @local_path, @last_state)
    `);
        stmt.run(session);
    }

    updateState(githubIssueUid: string, newState: string) {
        const stmt = db.prepare('UPDATE sessions SET last_state = ?, updated_at = CURRENT_TIMESTAMP WHERE github_issue_uid = ?');
        stmt.run(newState, githubIssueUid);
    }

    listActive() {
        return db.prepare('SELECT * FROM sessions WHERE last_state != "completed"').all();
    }
}
