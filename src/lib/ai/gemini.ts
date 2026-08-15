import 'server-only';
import { buildExplanationPrompt } from './prompt';
import type { ExplainFindingRequest, ExplainFindingResponse } from './types';

const DEFAULT_MODEL = 'gemini-3.6-flash';

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function buildFallbackExplanation(req: ExplainFindingRequest): ExplainFindingResponse {
  const { finding } = req;
  const direction = finding.actual > finding.expected ? 'above' : 'below';
  const summary = `**${finding.metric} is ${finding.severity}: ${finding.deviationPercent.toFixed(1)}% ${direction} the expected value.**`;
  const factors = finding.likelyFactors.map((f) => `- ${f}`).join('\n');

  return {
    explanation: `${summary}\n\nPossible contributing factors:\n${factors}\n\n_Rule-based summary — enable the Gemini integration for a richer explanation._`,
    source: 'fallback',
  };
}

export async function callGemini(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text || !text.trim()) {
    throw new Error('Gemini API returned an empty response');
  }

  return text.trim();
}

export async function explainFinding(req: ExplainFindingRequest): Promise<ExplainFindingResponse> {
  if (!isGeminiConfigured()) {
    return buildFallbackExplanation(req);
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  try {
    const prompt = buildExplanationPrompt(req);
    const explanation = await callGemini(prompt, model);
    return { explanation, source: 'gemini', model };
  } catch (error) {
    console.warn('Gemini explanation failed, falling back to rule-based message.', error);
    return buildFallbackExplanation(req);
  }
}
