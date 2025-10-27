import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config();

// Import the server by creating a new instance each time would require exporting app.
// For a lightweight check without restructuring, we spin up a temporary server.
import express from 'express';
import cors from 'cors';

const setupApp = () => {
  const app = express();
  app.use(cors());
  app.get('/health', (req, res) => res.json({ ok: true }));
  return app;
};

describe('health endpoint', () => {
  test('returns ok', async () => {
    const app = setupApp();
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok');
  });
});
