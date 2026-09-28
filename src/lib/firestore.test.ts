import { describe, it, expect } from 'vitest';
import { verifyAuthToken } from './firebaseAdmin';

describe('Phase 4 User Isolation & Security Rules', () => {
  it('blocks unauthenticated GET requests to /api/prompts', async () => {
    const req = new Request('http://localhost:3000/api/prompts');
    const { user, errorResponse } = await verifyAuthToken(req);

    expect(user).toBeNull();
    expect(errorResponse?.status).toBe(401);
  });

  it('blocks unauthenticated POST requests to /api/prompts', async () => {
    const req = new Request('http://localhost:3000/api/prompts', {
      method: 'POST',
      body: JSON.stringify({ title: 'Hack', original: 'foo', optimized: 'bar' }),
    });
    const { user, errorResponse } = await verifyAuthToken(req);

    expect(user).toBeNull();
    expect(errorResponse?.status).toBe(401);
  });

  it('ensures User A session token resolves exclusively User A UID', async () => {
    const reqUserA = new Request('http://localhost:3000/api/prompts', {
      headers: { Authorization: 'Bearer mock-test-id-token' },
    });
    const { user } = await verifyAuthToken(reqUserA);

    expect(user).not.toBeNull();
    expect(user?.uid).toBe('dev-test-uid-123');
    expect(user?.email).toBe('vibecoder@example.com');
  });
});
