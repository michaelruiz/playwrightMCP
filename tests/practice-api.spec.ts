import { expect, test } from './fixtures/practice.fixture.js';
import type { PracticeState, PracticeSummary } from '../config/practice-data.js';

interface HealthResponse {
  status: string;
  app: string;
}

interface PracticeStateResponse extends PracticeState {
  summary: PracticeSummary;
}

interface TasksResponse {
  tasks: string[];
  taskCount: number;
}

function parseJsonResponse<TPayload>(raw: string): TPayload {
  return JSON.parse(raw) as TPayload;
}

test.describe('Signal Lab practice API', { tag: ['@api', '@regression'] }, () => {
  test(
    'health and state endpoints return the expected seed data',
    { tag: '@smoke' },
    async ({ practiceRequest, reportStep }) => {
      await reportStep('Check the API health endpoint', async () => {
        const response = await practiceRequest.get('/api/health');
        expect(response.ok()).toBeTruthy();

        const payload = parseJsonResponse<HealthResponse>(await response.text());
        expect(payload).toMatchObject({
          status: 'ok',
          app: 'playwright-mcp-lab',
        });
      });

      await reportStep('Fetch the full practice state', async () => {
        const response = await practiceRequest.get('/api/practice-state');
        expect(response.ok()).toBeTruthy();

        const payload = parseJsonResponse<PracticeStateResponse>(await response.text());
        expect(payload.summary).toMatchObject({
          visibleCards: 3,
          taskCount: 2,
          mode: 'Calm',
        });
        expect(payload.cards).toHaveLength(3);
        expect(payload.tasks).toEqual(['Draft weekly summary', 'Confirm release notes']);
      });
    },
  );

  test('an API-created task appears in the browser after navigation', async ({
    practiceRequest,
    practicePage,
    reportStep,
  }) => {
    await reportStep('Seed a new task through the API', async () => {
      const response = await practiceRequest.post('/api/tasks', {
        data: { name: 'Review accessibility findings' },
      });
      expect(response.status()).toBe(201);

      const payload = parseJsonResponse<TasksResponse>(await response.text());
      expect(payload.taskCount).toBe(3);
      expect(payload.tasks).toContain('Review accessibility findings');
    });

    await reportStep('Confirm the browser renders the seeded task', async () => {
      await practicePage.goto();
      await expect(practicePage.taskCount).toHaveText('3');
      await expect(practicePage.taskItem('Review accessibility findings')).toHaveText(
        'Review accessibility findings',
      );
    });
  });
});
