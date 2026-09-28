import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebaseAdmin';

// In-memory server store for demo / development fallback when Firestore admin credentials aren't set
const mockUserPromptsStore: Record<string, any[]> = {
  'dev-test-uid-123': [
    {
      id: 'p1',
      userId: 'dev-test-uid-123',
      title: 'React Todo App with LocalStorage',
      original: 'make me a todo app',
      optimized: 'GOAL: Build a todo app with filtering and persistence.\nSTACK: React + Vite + Tailwind CSS.',
      tool: 'Cursor',
      taskType: 'New App',
      before: 21,
      score: 91,
      tier: 'Best',
      assumptions: ['Client side storage only'],
      changes: [{ add: 'Added stack details', why: 'Eliminates framework guessing' }],
      createdAt: Date.now() - 86400000,
    },
  ],
};

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await verifyAuthToken(req);

  if (errorResponse) {
    return errorResponse;
  }

  const uid = user!.uid;
  const userPrompts = mockUserPromptsStore[uid] || [];

  return NextResponse.json({ prompts: userPrompts });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await verifyAuthToken(req);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await req.json();
    const { title, original, optimized, tool, taskType, before, score, tier, assumptions, changes } = body;

    if (!title || !original || !optimized) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Title, original prompt, and optimized prompt are required.' } },
        { status: 400 }
      );
    }

    const newPrompt = {
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: user!.uid,
      title,
      original,
      optimized,
      tool: tool || 'Cursor',
      taskType: taskType || 'New App',
      before: Number(before || 25),
      score: Number(score || 85),
      tier: tier || 'Good',
      assumptions: assumptions || [],
      changes: changes || [],
      createdAt: Date.now(),
    };

    if (!mockUserPromptsStore[user!.uid]) {
      mockUserPromptsStore[user!.uid] = [];
    }

    mockUserPromptsStore[user!.uid].unshift(newPrompt);

    return NextResponse.json({ status: 'created', prompt: newPrompt }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: err?.message || 'Failed to save prompt.' } },
      { status: 500 }
    );
  }
}
