import Fastify from 'fastify';
import db from './db/client.js';
import { OrchestratorEngine } from './orchestrator/engine.js';

const server = Fastify({
    logger: true
});

const engine = new OrchestratorEngine();

// Middleware/Plugins could be registered here

// Basic Health Check
server.get('/health', async () => {
    return { status: 'ok' };
});

// --- Endpoints ---

// 1. Webhook Endpoint
server.post('/webhook', async (request, reply) => {
    const body = request.body as any;
    server.log.info({ msg: 'Webhook received', event: request.headers['x-github-event'] });

    // Example Webhook Logic
    // In reality, check for 'issues' event and specific actions/labels
    const event = request.headers['x-github-event'];

    if (event === 'issues' && body.action === 'opened') {
        const issue = body.issue;
        const repo = body.repository;

        // Async trigger to not block webhook response
        engine.handleIssueTrigger(repo.owner.login, repo.name, String(issue.number), issue.body || "Fix this issue")
            .catch(err => server.log.error(err));
    }

    return { received: true };
});

// 2. Manual Trigger Endpoint
server.post('/manual', async (request, reply) => {
    const { repo, issue_id, instruction } = request.body as { repo: string; issue_id: string; instruction?: string };

    if (!repo || !issue_id) {
        return reply.status(400).send({ error: 'Missing repo (owner/name) or issue_id' });
    }

    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) return reply.status(400).send({ error: 'invalid repo format (owner/name)' });

    // Kick off workflow manually
    const session = await engine.handleIssueTrigger(owner, repoName, issue_id, instruction || "Solve this issue");

    return { status: 'triggered', session };
});

// 3. Scan Endpoint
server.post('/scan', async (request, reply) => {
    // TODO: trigger scan
    return { status: 'scanning_started' };
});

// 4. Status Endpoint
server.get('/status', async (request, reply) => {
    const sessions = db.prepare('SELECT * FROM sessions').all();
    return { active_sessions: sessions };
});

// Start Server
const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
