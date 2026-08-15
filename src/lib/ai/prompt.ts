import type { ExplainFindingRequest } from './types';
import type { FindingMetric } from '@/types';

const METRIC_LABELS: Record<FindingMetric, string> = {
  coolingPower: 'Cooling power (Mw)',
  waterUsage: 'Water usage (liters)',
  serverTemperature: 'Server temperature (C)',
};

const GUARDRAIL_PREAMBLE = `You are assisting a data-centre operator by explaining an anomaly finding that was already detected by deterministic application logic.

Rules you must follow:
- Use only the numeric values provided below. Do not introduce new measurements, temperatures, costs, PUE/WUE figures, or savings estimates.
- Do not claim any action is safe or approved. Safety is determined separately by a deterministic safety gate, not by you.
- Explain qualitatively why this finding matters and what an operator should investigate or consider next.
- Respond in short Markdown: a bold one-line summary, then 2-4 bullet points. No headings, no code blocks.`;

export function buildExplanationPrompt(req: ExplainFindingRequest): string {
  const { finding } = req;

  const findingLines = [
    `Metric: ${METRIC_LABELS[finding.metric]}`,
    `Severity: ${finding.severity}`,
    `Actual value: ${finding.actual}`,
    `Expected value: ${finding.expected}`,
    `Deviation: ${finding.deviationPercent.toFixed(1)}%`,
    `Detected at: ${finding.detectedAt}`,
    `Likely contributing factors (deterministic candidates): ${finding.likelyFactors.join(', ')}`,
  ].join('\n');

  const contextLines = Object.entries(finding.explanationInput)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `${GUARDRAIL_PREAMBLE}

Structured finding:
${findingLines}

Additional structured context:
${contextLines}`;
}
