import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class OpenCodeClient {
    /**
     * Spawns a new OpenCode session in the given directory.
     * In a real scenario, this might call the Opencode SDK or start `opencode serve`.
     */
    async startSession(cwd: string, issueId: string, instruction: string): Promise<string> {
        console.log(`[OpenCode] Starting session for Issue #${issueId} in ${cwd}`);
        console.log(`[OpenCode] Prompt: ${instruction}`);

        // wrapper for 'opencode serve' or similar
        // For this prototype, we'll simulate a session ID.
        const sessionId = `sess_${Date.now()}_${issueId}`;

        // In a real implementation:
        // await execAsync(`opencode session create --dir ${cwd}`, ...);

        return sessionId;
    }

    async runAgent(sessionId: string, cwd: string, goal: string) {
        console.log(`[OpenCode] Agent running for session ${sessionId}...`);
        // Simulate agent work
        // await execAsync(`opencode agent run --session ${sessionId} --prompt "${goal}"`);
    }
}
