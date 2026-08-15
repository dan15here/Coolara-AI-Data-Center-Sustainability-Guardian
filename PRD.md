# Coolara — Product Requirements Document

## Product summary

Coolara is a sustainability decision-support prototype for data-centre
operators. It helps teams understand operational signals across energy, water,
cooling, and thermal performance before they consider a response.

## Problem

Data-centre teams must balance reliability, energy efficiency, and water use.
Telemetry alone does not clearly explain which deviation deserves attention or
whether a proposed operational response is safe.

## Target user

Operations leads and facility engineers responsible for data-centre cooling,
energy, water, and reliability decisions.

## MVP objective

Demonstrate a clear flow:

**Monitor → Detect → Explain → Simulate → Optimize**

## MVP features

1. **Operations dashboard**
   - Show energy, cooling, water, temperature, PUE, and WUE indicators.
   - Clearly label all demo telemetry as synthetic.
2. **Anomaly detection and explanation**
   - Detect deviations through deterministic rules.
   - Send structured findings to an LLM for qualitative explanation only.
3. **What-if simulator**
   - Allow an operator to change selected assumptions.
   - Show deterministic estimated impact.
   - Reject any scenario that violates the configured thermal/reliability gate.

## Product principles

- The numerical source of truth is deterministic application logic.
- AI explains structured findings; it must not invent measurements or savings.
- The product is decision support, not autonomous infrastructure control.
- Synthetic/demo data must be labelled clearly.

## Non-goals for the MVP

- Direct control of physical equipment.
- Real-time production IoT integration.
- Model training or fine-tuning.
- Multi-site enterprise administration.

## Success criteria

- A judge can follow the complete demo path in under five minutes.
- One anomaly can be explained using structured input.
- One safe and one unsafe simulation scenario can be demonstrated.
- All key assumptions and limitations are disclosed honestly.
