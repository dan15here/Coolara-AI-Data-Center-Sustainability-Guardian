import type { ExplainFindingRequest, OptimizeSimulationRequest } from './types';
import type { FindingMetric, FindingSeverity } from '@/types';

const METRIC_LABELS: Record<FindingMetric, string> = {
  coolingPower: 'Cooling power (MW)',
  waterUsage: 'Water usage (liters)',
  serverTemperature: 'Server temperature (C)',
};

const GUARDRAIL_PREAMBLE = `You are assisting a data-centre operator by explaining an anomaly finding that was already detected by deterministic application logic.

Rules you must follow:
- Use only the numeric values provided below. Do not introduce new measurements, temperatures, costs, PUE/WUE figures, or savings estimates.
- Do not claim any action is safe or approved. Safety is determined separately by a deterministic safety gate, not by you.
- Explain qualitatively why this finding matters and what an operator should investigate or consider next.
- Respond in Markdown as an operator brief of about 140-200 words: a bold one-line summary, then exactly 4 bullet points of 1-2 sentences each. Cover the operational significance, how the deterministic factors may connect, what contextual evidence is useful to inspect, and how to frame the next review. No headings or code blocks. Format every bullet as a line starting with "- " (a hyphen followed by a space) — do not use "*" or "•".`;

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

const OPTIMIZATION_GUARDRAIL_PREAMBLE = `You are assisting a data-centre operator by adding qualitative context to a what-if simulation that was already evaluated by a deterministic safety gate and cost model.

Rules you must follow:
- Use only the numeric values provided below. Do not introduce new measurements, temperatures, costs, PUE/WUE figures, or savings estimates.
- Never propose a specific new numeric setpoint, workload percentage, or ambient assumption for the operator to apply. Only the deterministic simulator may produce numbers the app can apply.
- Do not use imperative language ("must", "should", "need to", "recommend", or similar). Write in a hedged, informational register (e.g. "worth noting", "may be worth considering", "one direction to consider").
- Present at most two directions or options an operator might weigh next. Never present a single directive.
- Match tone to the severity register given below: "none" is neutral/informational, "low" gently notes, "medium" invites a closer look, "high" invites prompt attention, "critical" warrants prompt review — never an order.
- Do not claim any action is safe, approved, or optimal beyond what the deterministic "safe" field already states.
- Respond in Markdown as a review brief of about 150-220 words: a bold one-line summary, then exactly 4 bullet points of 1-2 sentences each. Cover the deterministic outcome, the trade-off context, and up to two alternative directions an operator might weigh next. No headings, no code blocks, and do not use the word "Recommendation". Format every bullet as a line starting with "- " (a hyphen followed by a space) — do not use "*" or "•".`;

export function buildOptimizationPrompt(req: OptimizeSimulationRequest): string {
  const { input, result, finding } = req;
  const severity: FindingSeverity | 'none' = finding?.severity ?? 'none';

  const scenarioLines = [
    `Safety outcome: ${result.safe ? 'within deterministic safety thresholds' : 'rejected by deterministic safety gate'}`,
    `Deterministic reason: ${result.reason}`,
    `Predicted server temperature: ${result.predictedServerTempC.toFixed(1)} C`,
    `Energy delta: ${result.estimatedEnergyDeltaMwh.toFixed(2)} MWh`,
    `Water delta: ${result.estimatedWaterDeltaLiters.toFixed(0)} L`,
    `Cost delta: ${result.estimatedCostDeltaIdr.toFixed(0)} IDR`,
    `Projected PUE: ${result.pue.toFixed(2)}`,
    `Projected WUE: ${result.wue.toFixed(2)}`,
  ].join('\n');

  const inputLines = [
    `Cooling setpoint assumption: ${input.coolingSetpointC} C`,
    `Workload assumption: ${input.workloadPercent}%`,
    `Ambient temperature assumption: ${input.ambientTempC} C`,
  ].join('\n');

  const originatingLines = finding
    ? [
        `Originating finding metric: ${METRIC_LABELS[finding.metric]}`,
        `Originating finding severity: ${finding.severity}`,
        `Originating finding detected at: ${finding.detectedAt}`,
      ].join('\n')
    : 'No originating finding — this simulation was run standalone.';

  return `${OPTIMIZATION_GUARDRAIL_PREAMBLE}

Severity register to use: ${severity}

Simulation input assumptions:
${inputLines}

Deterministic simulation result:
${scenarioLines}

Originating context:
${originatingLines}`;
}
