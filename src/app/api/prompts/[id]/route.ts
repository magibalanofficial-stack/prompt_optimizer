import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebaseAdmin';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await verifyAuthToken(req);

  if (errorResponse) {
    return errorResponse;
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: { code: 'INVALID_ID', message: 'Prompt ID is required.' } },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'deleted',
    id,
    userId: user!.uid,
  });
}
