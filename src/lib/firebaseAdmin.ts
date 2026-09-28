import * as adminModule from 'firebase-admin';

// Support both ESM and CJS imports cleanly
const admin = (adminModule as any).default || adminModule;

const getAdminApps = () => {
  try {
    return admin.apps || [];
  } catch {
    return [];
  }
};

if (!getAdminApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Fallback initialize for local development/emulator mode
    admin.initializeApp({
      projectId: projectId || 'vibecode-prompt-opt',
    });
  }
}

export const adminAuth = admin.auth ? admin.auth() : null;

export interface DecodedAuthUser {
  uid: string;
  email?: string;
  phone?: string;
}

export async function verifyAuthToken(req: Request): Promise<{ user: DecodedAuthUser | null; errorResponse: Response | null }> {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      errorResponse: Response.json(
        { error: { code: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header. Expected Bearer <token>' } },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    return {
      user: null,
      errorResponse: Response.json(
        { error: { code: 'UNAUTHORIZED', message: 'Bearer token is empty' } },
        { status: 401 }
      ),
    };
  }

  // Development & test mock token bypass
  if (
    (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') &&
    token === 'mock-test-id-token'
  ) {
    return {
      user: {
        uid: 'dev-test-uid-123',
        email: 'vibecoder@example.com',
        phone: '+15550192834',
      },
      errorResponse: null,
    };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        phone: decodedToken.phone_number,
      },
      errorResponse: null,
    };
  } catch (err: any) {
    return {
      user: null,
      errorResponse: Response.json(
        { error: { code: 'UNAUTHORIZED', message: err?.message || 'Invalid or expired Firebase ID token' } },
        { status: 401 }
      ),
    };
  }
}
