# Feature Landscape: Multi-Perspective LLM Reasoning

**Domain:** Multi-agent Reasoning & Professional Auditing
**Researched:** 2024-05-23
**Overall Confidence:** HIGH

## Table Stakes
Features users expect for a multi-perspective reasoning tool.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Six Thinking Hats** | Standard framework for parallel thinking; prevents muddled reasoning. | Low | Implementation via sequential or multi-agent prompting. |
| **Persona Library** | Pre-defined roles (Security Auditor, Compliance Officer) with domain expertise. | Medium | Requires specific system prompts and grounding in frameworks (NIST, OWASP). |
| **Sequential Reasoning** | Ability to chain perspectives (e.g., Facts -> Risks -> Creative Solutions). | Medium | Needs state management between turns. |
| **Human Approval** | Basic gatekeeping to approve or reject agent outputs. | Low | Essential for safety and alignment. |

## Differentiators
Features that set Tensix apart in the professional auditing space.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **"Human-as-an-Agent"** | Treats humans as a node in the agent graph for delegation. | High | Allows agents to "ask" humans for subjective data. |
| **State Manipulation** | "Fork and Edit" capability to modify agent state before resuming. | High | Critical for correcting "hallucination drift" early. |
| **Collaborative Steering** | Interactive moderator role to guide debates and break deadlocks. | High | Human acts as the "Blue Hat" process conductor. |
| **Framework Mapping** | Automated mapping of findings to regulatory controls (GDPR, SOC2). | Medium | High value for professional compliance audits. |

## Anti-Features
Features to explicitly NOT build to maintain professional focus.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Free-form Chat** | Leads to "muddled thinking" and loss of persona consistency. | Structured, perspective-driven workflows. |
| **Hidden Reasoning** | Obscures the "Chain of Thought," making audits untrustworthy. | Explicit "Inner Monologue" or "Whiteboard" states. |
| **One-Click Fixes** | Can introduce unverified changes in security-critical code. | Categorized findings with "Risk Level" and "Justification." |

## Feature Dependencies
```
Persona Engine → Perspective Switching (Six Hats) → Multi-Agent Debate → HITL Moderation → State Manipulation
```

## MVP Recommendation
Prioritize:
1. **Six Thinking Hats Core**: Sequential prompting logic (White, Black, Yellow, Green, Blue).
2. **Professional Personas**: "Security Auditor" and "Compliance Officer" templates.
3. **Checkpoint & Validation**: Simple human-in-the-loop gatekeeping for each perspective transition.

Defer: **State Manipulation (Forking)** until the core multi-agent logic is stable.

## Sources
- de Bono, E. (1985). *Six Thinking Hats*.
- OWASP Top 10 / NIST Cybersecurity Framework (Persona grounding).
- LangGraph / Multi-agent HITL patterns (Interaction models).
