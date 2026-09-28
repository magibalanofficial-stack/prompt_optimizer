import { describe, it, expect } from 'vitest';
import { verifyAuthToken } from './firebaseAdmin';

describe('verifyAuthToken Server Guard', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const req = new Request('http://localhost:3000/api/auth/verify');
    const { user, errorResponse } = await verifyAuthToken(req);

    expect(user).toBeNull();
    expect(errorResponse).not.toBeNull();
    expect(errorResponse?.status).toBe(401);

    const json = await errorResponse?.json();
    expect(json.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when Authorization header does not start with Bearer', async () => {
    const req = new Request('http://localhost:3000/api/auth/verify', {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    const { user, errorResponse } = await verifyAuthToken(req);

    expect(user).toBeNull();
    expect(errorResponse?.status).toBe(401);
  });

  it('authenticates valid dev test token in development mode', async () => {
    const req = new Request('http://localhost:3000/api/auth/verify', {
      headers: { Authorization: 'Bearer mock-test-id-token' },
    });
    const { user, errorResponse } = await verifyAuthToken(req);

    expect(errorResponse).toBeNull();
    expect(user).not.toBeNull();
    expect(user?.uid).toBe('dev-test-uid-123');
    expect(user?.email).toBe('vibecoder@example.com');
  });
});
