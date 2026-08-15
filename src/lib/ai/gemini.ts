import 'server-only';
import { TtlCache } from './cache';
import { buildExplanationPrompt, buildOptimizationPrompt } from './prompt';
import { METRIC_LABELS } from '@/lib/format/finding';
import type {
  ExplainFindingRequest,
  ExplainFindingResponse,
  OptimizeSimulationRequest,
  OptimizeSimulationResponse,
} from './types';
import type { Finding, FindingSeverity } from '@/types';

const DEFAULT_MODEL = 'gemini-3.6-flash';
const MAX_OUTPUT_TOKENS = 600;

const explanationCache = new TtlCache<ExplainFindingResponse>();

// finding.id and detectedAt are regenerated on every synthetic telemetry read, even for what
// reads as "the same" anomaly, so they'd defeat caching entirely — key on the finding's
// substance instead (rounded to the precision the UI actually displays).
function explanationCacheKey(finding: Finding): string {
  return [
    finding.metric,
    finding.severity,
    finding.actual.toFixed(2),
    finding.expected.toFixed(2),
    finding.deviationPercent.toFixed(1),
  ].join('|');
}

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
    cached: false,
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
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.4,
      },
    }),
  });

  if (!response.ok) {
    // Gemini's response body identifies actionable causes such as an invalid
    // model ID or an unavailable model/API combination. Keep it server-side:
    // it is logged for diagnosis but never returned to the browser.
    const detail = (await response.text()).replace(/\s+/g, ' ').trim().slice(0, 1_000);
    throw new Error(`Gemini API request failed with status ${response.status}: ${detail || 'no error detail returned'}`);
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text || !text.trim()) {
    throw new Error('Gemini API returned an empty response');
  }

  return text.trim();
}

async function computeExplanation(req: ExplainFindingRequest): Promise<ExplainFindingResponse> {
  if (!isGeminiConfigured()) {
    return buildFallbackExplanation(req);
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  try {
    const prompt = buildExplanationPrompt(req);
    const explanation = await callGemini(prompt, model);
    return { explanation, source: 'gemini', model, cached: false };
  } catch (error) {
    console.warn('Gemini explanation failed, falling back to rule-based message.', error);
    return buildFallbackExplanation(req);
  }
}

export async function explainFinding(req: ExplainFindingRequest): Promise<ExplainFindingResponse> {
  const cacheKey = explanationCacheKey(req.finding);
  const cached = explanationCache.get(cacheKey);
  if (cached) return { ...cached, cached: true };

  const result = await computeExplanation(req);
  explanationCache.set(cacheKey, result);
  return result;
}

const REGISTER_BY_SEVERITY: Record<FindingSeverity | 'none', string> = {
  none: 'here is a neutral read on this scenario',
  low: 'this is worth noting',
  medium: 'this is worth a closer look',
  high: 'this is worth prompt attention',
  critical: 'this warrants prompt review',
};

function buildFallbackOptimization(req: OptimizeSimulationRequest): OptimizeSimulationResponse {
  const { result, finding } = req;
  const register = REGISTER_BY_SEVERITY[finding?.severity ?? 'none'];

  const outcomeText = result.safe
    ? 'the scenario stayed within the deterministic safety thresholds'
    : 'the deterministic safety gate rejected this scenario';
  const costDirection = result.estimatedCostDeltaIdr >= 0 ? 'a higher' : 'a lower';

  const summary = `**Based on the deterministic result, ${register}: ${outcomeText}, with ${costDirection} estimated cost than the current baseline.**`;

  const directions = result.safe
    ? [
        'One direction worth considering is holding these assumptions and watching whether the energy, water, and cost deltas stay acceptable over time.',
        'Another is nudging one assumption at a time in a follow-up simulation to see how sensitive the outcome is to that input.',
      ]
    : [
        `One direction worth considering is easing the assumption(s) noted in the safety gate's reason ("${result.reason}") back toward the current baseline.`,
        'Another is re-running the simulation with a smaller change to isolate which input drove the rejection.',
      ];

  const findingNote = finding
    ? `\n\n_This scenario was opened from a ${finding.severity} ${METRIC_LABELS[finding.metric].toLowerCase()} finding — the framing above reflects that severity, not a determination by this tool._`
    : '';

  return {
    narrative: `${summary}\n\n${directions.map((d) => `- ${d}`).join('\n')}${findingNote}\n\n_Rule-based summary — enable the Gemini integration for a richer perspective. No new numeric values were introduced._`,
    source: 'fallback',
  };
}

export async function optimizeSimulation(req: OptimizeSimulationRequest): Promise<OptimizeSimulationResponse> {
  if (!isGeminiConfigured()) {
    return buildFallbackOptimization(req);
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  try {
    const prompt = buildOptimizationPrompt(req);
    const narrative = await callGemini(prompt, model);
    return { narrative, source: 'gemini', model };
  } catch (error) {
    console.warn('Gemini optimization narrative failed, falling back to rule-based message.', error);
    return buildFallbackOptimization(req);
  }
}
