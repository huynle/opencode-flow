import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

export class GitManager {
    private baseDir: string;

    constructor(baseDir: string = '/root/gh') {
        this.baseDir = baseDir;
    }

    private getRepoPath(owner: string, repo: string, issueId: string): string {
        return path.join(this.baseDir, 'repos', owner, repo, issueId);
    }

    async ensureRepo(owner: string, repo: string, issueId: string, cloneUrl: string): Promise<string> {
        const repoPath = this.getRepoPath(owner, repo, issueId);

        if (fs.existsSync(repoPath)) {
            console.log(`Repo already exists at ${repoPath}. Pulling latest...`);
            // Optional: Pull latest changes? For now, assume it's okay or reset??
            // Might strictly want to clone fresh for a new issue context vs resuming a session.
            // For now, let's just return path if it exists.
            return repoPath;
        }

        console.log(`Cloning ${cloneUrl} to ${repoPath}...`);
        await fs.ensureDir(path.dirname(repoPath));
        await execAsync(`git clone ${cloneUrl} ${repoPath}`);

        return repoPath;
    }

    async createBranch(cwd: string, branchName: string) {
        await execAsync(`git checkout -b ${branchName}`, { cwd });
    }

    async commit(cwd: string, message: string) {
        await execAsync(`git add .`, { cwd });
        await execAsync(`git commit -m "${message}"`, { cwd });
    }

    async push(cwd: string, branchName: string) {
        await execAsync(`git push origin ${branchName}`, { cwd });
    }
}
