import { NextRequest, NextResponse } from 'next/server';
import { askJson } from '@/lib/llm';
import { scoreOf, tierOf, PromptScores } from '@/lib/tiers';
import { generateDynamicStructuredPrompt } from '@/lib/dynamicGenerator';

export interface GenerateRequestBody {
  prompt: string;
  tool: string;
  taskType?: string;
  answers?: Record<string, string>;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequestBody = await req.json();
    const { prompt, tool, answers = {} } = body;

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

    const selectedTool = tool || 'cursor';

    // Format Q&A pairs for the LLM
    const answersFormatted = Object.keys(answers).length > 0
      ? Object.entries(answers)
          .map(([qKey, val]) => `${qKey} => ${val || '(not answered: choose sensible default)'}`)
          .join('\n')
      : 'No questions answered by user. Choose sensible defaults for missing info and list them as assumptions.';

    const llmPrompt = `Rubric: Score 0-10 on: goal, context, stack, requirements, constraints, acceptance, scope.

Write an improved, structured prompt for target tool "${selectedTool}" from the rough prompt and answers provided below.
Use standard markdown sections: GOAL, CONTEXT, STACK, REQUIREMENTS (numbered), CONSTRAINTS, STEPS (only if large), OUTPUT FORMAT, ACCEPTANCE. Keep it lean and concise, with no conversational filler.
Then grade YOUR improved prompt honestly with the rubric.

Rough prompt:
"""${prompt.replace(/"/g, '\\"')}"""

Answers provided:
${answersFormatted}

Return ONLY JSON with this exact structure:
{
  "optimized": "GOAL: ...\\nCONTEXT: ...",
  "changes": [
    { "add": "What was added or modified", "why": "One sentence reason why it improves prompt clarity" }
  ],
  "assumptions": [
    "Assumed default choice when answer was missing"
  ],
  "scores": {
    "goal": 9,
    "context": 9,
    "stack": 9,
    "requirements": 9,
    "constraints": 8,
    "acceptance": 9,
    "scope": 9
  }
}`;

    let llmResult: any;

    try {
      llmResult = await askJson<any>(llmPrompt);
    } catch (err: any) {
      // Dynamic fallback generator matching the user's exact input prompt topic
      const dynamic = generateDynamicStructuredPrompt(prompt, selectedTool, answers);
      llmResult = {
        optimized: dynamic.optimizedPrompt,
        changes: dynamic.changes,
        assumptions: dynamic.assumptions,
        scores: dynamic.optimizedScores,
      };
    }

    const optimizedScores: PromptScores = {
      goal: Number(llmResult?.scores?.goal ?? 9),
      context: Number(llmResult?.scores?.context ?? 8),
      stack: Number(llmResult?.scores?.stack ?? 9),
      requirements: Number(llmResult?.scores?.requirements ?? 9),
      constraints: Number(llmResult?.scores?.constraints ?? 8),
      acceptance: Number(llmResult?.scores?.acceptance ?? 9),
      scope: Number(llmResult?.scores?.scope ?? 9),
    };

    const afterScore = scoreOf(optimizedScores);
    const afterTier = tierOf(afterScore).label;

    return NextResponse.json({
      optimizedPrompt: llmResult?.optimized || '',
      changes: Array.isArray(llmResult?.changes) ? llmResult.changes : [],
      assumptions: Array.isArray(llmResult?.assumptions) ? llmResult.assumptions : [],
      optimizedScores,
      afterScore,
      afterTier,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: error?.message || 'An error occurred during prompt generation.' } },
      { status: 500 }
    );
  }
}
