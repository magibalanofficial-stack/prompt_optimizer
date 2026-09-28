import { NextRequest, NextResponse } from 'next/server';
import { askJson } from '@/lib/llm';
import { scoreOf, tierOf, PromptScores } from '@/lib/tiers';
import { generateDynamicAnalysis } from '@/lib/dynamicGenerator';

export interface AnalyzeRequestBody {
  prompt: string;
  tool: string;
}

const ALLOWED_TOOLS = ['cursor', 'claude_code', 'lovable', 'bolt', 'v0', 'chatgpt'];

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequestBody = await req.json();
    const { prompt, tool } = body;

    // 1. Input Validation
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Prompt text is required.' } },
        { status: 400 }
      );
    }

    if (prompt.length > 4000) {
      return NextResponse.json(
        { error: { code: 'PROMPT_TOO_LONG', message: 'Prompt exceeds maximum length of 4,000 characters.' } },
        { status: 400 }
      );
    }

    const selectedTool = tool && ALLOWED_TOOLS.includes(tool.toLowerCase()) ? tool.toLowerCase() : 'cursor';

    // 2. Secret detection check
    const secretPattern = /(sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{30,})/i;
    if (secretPattern.test(prompt)) {
      return NextResponse.json(
        { error: { code: 'SECRET_DETECTED', message: 'Sensitive API key or credential detected in prompt. Please remove keys before submitting.' } },
        { status: 400 }
      );
    }

    // 3. System Prompt for LLM
    const llmPrompt = `Score a coding prompt 0-10 on each of: goal (clear outcome), context (background, users, existing code), stack (language/framework/versions), requirements (specific, testable), constraints (limits, what to avoid), acceptance (definition of done), scope (small enough to build correctly in one go). Be strict: a one-line vague prompt scores 0-3 on most.

Target tool: ${selectedTool}
Prompt:
"""${prompt.replace(/"/g, '\\"')}"""

Return ONLY JSON with this exact structure:
{
  "taskType": "new_app|add_feature|fix_bug|refactor|ui_design",
  "original": {
    "goal": 0,
    "context": 0,
    "stack": 0,
    "requirements": 0,
    "constraints": 0,
    "acceptance": 0,
    "scope": 0
  },
  "questions": [
    {
      "id": "q1",
      "question": "Question text...",
      "options": ["Option 1", "Option 2", "Option 3"]
    }
  ]
}

Ask 2-4 questions about the most important missing info only, 2-4 short options each.`;

    let llmResult: any;

    try {
      llmResult = await askJson<any>(llmPrompt);
    } catch (err: any) {
      // Dynamic fallback generator matching the user's exact input prompt topic
      const dynamic = generateDynamicAnalysis(prompt, selectedTool);
      llmResult = {
        taskType: dynamic.taskType,
        original: dynamic.originalScores,
        questions: dynamic.questions,
      };
    }

    const originalScores: PromptScores = {
      goal: Number(llmResult?.original?.goal ?? 2),
      context: Number(llmResult?.original?.context ?? 1),
      stack: Number(llmResult?.original?.stack ?? 0),
      requirements: Number(llmResult?.original?.requirements ?? 3),
      constraints: Number(llmResult?.original?.constraints ?? 1),
      acceptance: Number(llmResult?.original?.acceptance ?? 1),
      scope: Number(llmResult?.original?.scope ?? 5),
    };

    const beforeScore = scoreOf(originalScores);
    const beforeTier = tierOf(beforeScore).label;

    return NextResponse.json({
      taskType: llmResult?.taskType || 'new_app',
      originalScores,
      beforeScore,
      beforeTier,
      questions: Array.isArray(llmResult?.questions) && llmResult.questions.length > 0
        ? llmResult.questions.slice(0, 4)
        : [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: error?.message || 'An error occurred during prompt analysis.' } },
      { status: 500 }
    );
  }
}
