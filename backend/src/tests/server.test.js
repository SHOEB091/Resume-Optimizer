const request = require('supertest');
const app = require('../index');  // Adjust path if needed

describe('Server', () => {
  test('Health endpoint', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});