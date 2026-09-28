/**
 * LLM Provider Wrapper
 * All model interactions go through this single helper module.
 * Keeps API keys secret on the server.
 */

export interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
}

export function getLLMConfig(): LLMConfig {
  return {
    provider: process.env.LLM_PROVIDER || 'gemini',
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || 'gemini-2.5-flash',
  };
}

/**
 * Helper to clean Markdown code fences from model outputs (e.g., ```json ... ```)
 */
export function cleanJsonFence(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  return cleaned;
}

/**
 * Core LLM caller function: asks for JSON response, cleans fences, parses, and retries once on error.
 */
export async function askJson<T>(promptText: string): Promise<T> {
  const config = getLLMConfig();

  // If no API key is provided in development, return a mock response signal to trigger fallback
  if (!config.apiKey || config.apiKey === 'mock-llm-key') {
    throw new Error('MISSING_LLM_API_KEY');
  }

  const callProvider = async (): Promise<string> => {
    if (config.provider === 'gemini') {
      // Direct call to Google Gemini API
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty text returned from Gemini API');
      }
      return text;
    } else {
      // OpenAI compatible fallback
      const endpoint = 'https://api.openai.com/v1/chat/completions';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || '';
    }
  };

  // Attempt 1
  try {
    const rawOutput = await callProvider();
    const jsonStr = cleanJsonFence(rawOutput);
    return JSON.parse(jsonStr) as T;
  } catch (firstErr) {
    // Retry once
    try {
      const retryPrompt = promptText + '\n\nIMPORTANT: Respond ONLY with valid, raw JSON. Do not include extra commentary.';
      const rawOutputRetry = await callProvider();
      const jsonStrRetry = cleanJsonFence(rawOutputRetry);
      return JSON.parse(jsonStrRetry) as T;
    } catch (secondErr: any) {
      throw new Error(`LLM JSON Parsing failed after retry: ${secondErr?.message || secondErr}`);
    }
  }
}
