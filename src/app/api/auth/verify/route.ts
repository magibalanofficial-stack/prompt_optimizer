import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await verifyAuthToken(req);

  if (errorResponse) {
    return errorResponse;
  }

  return NextResponse.json({
    status: 'authenticated',
    user,
  });
}
