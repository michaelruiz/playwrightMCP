import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';

import {
  buildPracticeSummary,
  createPracticeSeedState,
  type PracticeState,
} from '../config/practice-data.js';

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);
const rootDir = process.cwd();
const defaultPracticeSessionId = 'default';
const practiceStates = new Map<string, PracticeState>();

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function resolveRequestPath(pathname: string): string | null {
  let normalizedPathname = decodeURIComponent(pathname);

  if (normalizedPathname === '/') {
    normalizedPathname = '/practice/';
  }

  if (normalizedPathname.endsWith('/')) {
    normalizedPathname += 'index.html';
  }

  const filePath = path.resolve(rootDir, `.${normalizedPathname}`);
  const relativePath = path.relative(rootDir, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

function sendTextResponse(
  response: ServerResponse<IncomingMessage>,
  statusCode: number,
  body: string,
): void {
  response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(body);
}

function sendJsonResponse(
  response: ServerResponse<IncomingMessage>,
  statusCode: number,
  payload: unknown,
): void {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(statusCode, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(body);
}

function getHeaderValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getPracticeSessionId(request: IncomingMessage): string {
  const rawSessionId = getHeaderValue(request.headers['x-practice-session'])?.trim();

  if (!rawSessionId) {
    return defaultPracticeSessionId;
  }

  return rawSessionId.replace(/[^a-z0-9-_]/gi, '').slice(0, 80) || defaultPracticeSessionId;
}

function getPracticeState(sessionId: string): PracticeState {
  const existingState = practiceStates.get(sessionId);
  if (existingState) {
    return existingState;
  }

  const nextState = createPracticeSeedState();
  practiceStates.set(sessionId, nextState);
  return nextState;
}

function snapshotPracticeState(practiceState: PracticeState): PracticeState {
  return {
    plans: [...practiceState.plans],
    cards: practiceState.cards.map((card) => ({ ...card })),
    tasks: [...practiceState.tasks],
    preferences: { ...practiceState.preferences },
    releaseNotes: {
      ...practiceState.releaseNotes,
      bullets: [...practiceState.releaseNotes.bullets],
    },
    signInStatus: practiceState.signInStatus,
  };
}

function sendPracticeState(
  response: ServerResponse<IncomingMessage>,
  practiceState: PracticeState,
): void {
  const state = snapshotPracticeState(practiceState);
  sendJsonResponse(response, 200, {
    ...state,
    summary: buildPracticeSummary(state),
  });
}

function resetPracticeState(sessionId: string): PracticeState {
  const nextState = createPracticeSeedState();
  practiceStates.set(sessionId, nextState);
  return nextState;
}

function normalizeRequestChunk(chunk: unknown): string {
  if (typeof chunk === 'string') {
    return chunk;
  }

  if (chunk instanceof Buffer) {
    return chunk.toString('utf8');
  }

  if (chunk instanceof Uint8Array) {
    return Buffer.from(chunk).toString('utf8');
  }

  throw new Error('Unexpected request body chunk type.');
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  let body = '';

  for await (const chunk of request) {
    body += normalizeRequestChunk(chunk);
  }

  if (!body) {
    return {};
  }

  return JSON.parse(body) as unknown;
}

function isTaskPayload(value: unknown): value is { name: string } {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return typeof (value as { name?: unknown }).name === 'string';
}

async function handleApiRequest(
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
  pathname: string,
): Promise<void> {
  const method = request.method || 'GET';
  const sessionId = getPracticeSessionId(request);
  const practiceState = getPracticeState(sessionId);

  if (pathname === '/api/health') {
    if (method !== 'GET') {
      sendTextResponse(response, 405, 'Method Not Allowed');
      return;
    }

    sendJsonResponse(response, 200, {
      status: 'ok',
      app: 'playwright-mcp-lab',
    });
    return;
  }

  if (pathname === '/api/practice-state') {
    if (method !== 'GET') {
      sendTextResponse(response, 405, 'Method Not Allowed');
      return;
    }

    sendPracticeState(response, practiceState);
    return;
  }

  if (pathname === '/api/cards') {
    if (method !== 'GET') {
      sendTextResponse(response, 405, 'Method Not Allowed');
      return;
    }

    sendJsonResponse(response, 200, {
      cards: practiceState.cards.map((card) => ({ ...card })),
      total: practiceState.cards.length,
    });
    return;
  }

  if (pathname === '/api/tasks') {
    if (method === 'GET') {
      sendJsonResponse(response, 200, {
        tasks: [...practiceState.tasks],
        taskCount: practiceState.tasks.length,
      });
      return;
    }

    if (method === 'POST') {
      let body: unknown;

      try {
        body = await readJsonBody(request);
      } catch {
        sendJsonResponse(response, 400, {
          error: 'Expected valid JSON in the request body.',
        });
        return;
      }

      if (!isTaskPayload(body)) {
        sendJsonResponse(response, 400, {
          error: "Expected a JSON body with a string 'name' field.",
        });
        return;
      }

      const name = body.name.trim();
      if (!name) {
        sendJsonResponse(response, 400, {
          error: 'Task name must not be empty.',
        });
        return;
      }

      practiceState.tasks.push(name);
      sendJsonResponse(response, 201, {
        task: name,
        tasks: [...practiceState.tasks],
        taskCount: practiceState.tasks.length,
      });
      return;
    }

    sendTextResponse(response, 405, 'Method Not Allowed');
    return;
  }

  if (pathname === '/api/release-notes') {
    if (method !== 'GET') {
      sendTextResponse(response, 405, 'Method Not Allowed');
      return;
    }

    sendJsonResponse(response, 200, {
      ...practiceState.releaseNotes,
      bullets: [...practiceState.releaseNotes.bullets],
    });
    return;
  }

  if (pathname === '/api/test/reset') {
    if (method !== 'POST') {
      sendTextResponse(response, 405, 'Method Not Allowed');
      return;
    }

    sendPracticeState(response, resetPracticeState(sessionId));
    return;
  }

  sendTextResponse(response, 404, 'File not found');
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
): Promise<void> {
  const method = request.method || 'GET';
  const requestUrl = new URL(request.url || '/', `http://${host}:${port}`);

  if (requestUrl.pathname.startsWith('/api/')) {
    await handleApiRequest(request, response, requestUrl.pathname);
    return;
  }

  if (!['GET', 'HEAD'].includes(method)) {
    sendTextResponse(response, 405, 'Method Not Allowed');
    return;
  }

  if (request.url === '/favicon.ico') {
    response.writeHead(204);
    response.end();
    return;
  }

  const filePath = resolveRequestPath(requestUrl.pathname);
  if (!filePath || !existsSync(filePath)) {
    sendTextResponse(response, 404, 'File not found');
    return;
  }

  const stats = statSync(filePath);
  if (!stats.isFile()) {
    sendTextResponse(response, 404, 'File not found');
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = contentTypes[extension] || 'application/octet-stream';

  response.writeHead(200, {
    'Content-Length': stats.size,
    'Content-Type': contentType,
  });

  if (method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}

const server = createServer((request, response) => {
  void handleRequest(request, response);
});

server.listen(port, host, () => {
  console.log(`Practice server running at http://${host}:${port}/practice/`);
});
