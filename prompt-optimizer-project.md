# Vibecoder Prompt Optimizer

> Turn a rough, vague idea into a clear, complete prompt that gets the right code on the first try.

**Status:** Concept / pre-MVP
**Audience:** Vibecoders (people who build software mostly by prompting AI tools)

---

## 1. Problem

Vibecoders rarely fail because their prompts are too long. They fail because their prompts are **incomplete**. Common gaps:

- No tech stack or versions specified, so the model picks something random
- No constraints (libraries to avoid, single file, must be mobile-friendly)
- Vague success criteria ("make it look good")
- Too much requested at once, resulting in messy, half-working output
- No code or error context when debugging
- No definition of "done", so the model over-builds or stops early

Generic "improve my prompt" tools mostly reword text. They do not find what is missing.

## 2. Vision

A tool that **interrogates first, rewrites second**. It detects what a prompt is missing, asks only the few questions that matter, fills in sensible defaults for the rest, and outputs a structured prompt tuned for the tool the user is coding with.

## 3. Goals and Non-Goals

**Goals**
- Improve first-attempt success rate of vibecoding prompts
- Teach users to write better prompts over time (show what changed and why)
- Keep the interaction fast: at most 2-4 questions
- Produce lean prompts without filler

**Non-Goals (for now)**
- A new file format or custom prompt language
- Running or hosting the generated code
- Replacing the user's coding tool
- Aggressive token compression (a side benefit, not the core)

## 4. Target Users

| User | Need |
|---|---|
| Beginner vibecoder | Does not know what details to include |
| Intermediate vibecoder | Wastes iterations on missing context |
| Non-technical founder | Wants a working prototype without technical vocabulary |

## 5. Core Pipeline

1. **Intake:** user pastes a rough prompt, plus optional context (stack, files, error message)
2. **Classify task:** new project, add feature, fix bug, refactor, UI design, and so on
3. **Gap detection:** compare the prompt to the checklist for that task type
4. **Clarify:** ask 2-4 questions, ideally as tappable options; apply defaults for everything else and show them so the user can override
5. **Generate:** produce a structured prompt (see section 6); split large requests into ordered steps
6. **Target tuning:** adapt format for Cursor, Claude Code, Lovable, Bolt, v0, ChatGPT, etc.
7. **Explain:** show a diff of what was added and why

## 6. Output Prompt Structure

```
GOAL:            one-sentence outcome
CONTEXT:         what exists already, who it is for
STACK:           language, framework, versions, libraries
REQUIREMENTS:    numbered, testable items
CONSTRAINTS:     what to avoid, limits, style rules
STEPS:           ordered build plan (for large tasks)
OUTPUT FORMAT:   files expected, how to present changes
ACCEPTANCE:      how we know it is done
```

Plain Markdown or YAML is used so any LLM understands it without extra explanation tokens.

## 7. Task-Type Checklists (examples)

**New app**
- Purpose and main user flow
- Stack and hosting target
- Core features vs. nice-to-haves
- Design feel (minimal, playful, dashboard-style)
- Data storage needs

**Add feature**
- Existing stack and relevant files
- Exact behavior and edge cases
- What must not break

**Fix bug**
- Exact error message or symptom
- Steps to reproduce
- Expected vs. actual behavior
- Relevant code snippet and environment

**UI design**
- Screens and components needed
- Style references, colors, responsiveness
- Accessibility expectations

## 8. Features

**MVP**
- Rough prompt in, clarifying questions, optimized prompt out
- Task classification and gap detection
- Copy button
- Before/after diff with short explanations

**Later**
- Project memory (store stack and conventions once, reuse everywhere)
- Tool-specific output presets
- Prompt history and versioning
- Evaluation loop (compare original vs. optimized prompt results)
- Browser extension or IDE plugin
- Optional token-length trimming

## 9. Architecture (MVP)

```
Web UI  ->  API  ->  LLM call 1: classify + detect gaps + generate questions
                 ->  LLM call 2: generate final structured prompt + diff
```

- Two LLM calls, no accounts, no database at first
- Templates and checklists stored as versioned config files
- Log anonymized before/after pairs (with consent) to improve templates

## 10. Success Metrics

- **First-attempt success rate:** does the generated code work on the first try? (compare original vs. optimized prompt on a fixed test set)
- **Iterations to completion:** fewer back-and-forth rounds
- **Questions answered:** completion rate of the clarify step
- **Prompt length:** optimized prompt is not bloated relative to the quality gain
- **Retention:** users who return to optimize a second prompt

## 11. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Too many questions frustrate users | Cap at 2-4, provide defaults, allow "skip" |
| Prompts become bloated | Length discipline; test that optimized beats original |
| Crowded market of prompt improvers | Differentiate with task-specific gap detection and tool-specific output |
| Optimization gains vary by task | Evaluate per task type, do not assume universal improvement |
| Compression hurts quality | Treat compression as optional; measure quality alongside tokens |

## 12. Roadmap

1. **Week 1-2:** Collect 50-100 real vibecoding prompts; write checklists per task type
2. **Week 3-4:** Build MVP web app (intake, questions, output, diff)
3. **Week 5-6:** Test with real users; measure first-attempt success against original prompts
4. **Later:** Project memory, tool presets, evaluation loop, plugins

## 13. Related Work

- **LLMLingua** (Microsoft, EMNLP 2023): prompt compression that removes unimportant tokens using a small model. https://www.microsoft.com/en-us/research/blog/llmlingua-innovating-llm-efficiency-with-prompt-compression/
- **TOON (Token-Oriented Object Notation):** compact, token-efficient format for structured data in prompts. https://www.infoq.com/news/2025/11/toon-reduce-llm-cost-tokens
- **The Prompt Report:** systematic survey of prompting and prompt optimization techniques. https://arxiv.org/pdf/2406.06608
- **DSPy:** framework for algorithmically optimizing prompts and weights; results vary by task. https://arxiv.org/html/2507.03620v1
- Also worth reviewing (not verified here): prompt caching from major API providers, Microsoft `.prompty`, Google Dotprompt

## 14. Open Questions

- Which coding tools do target users rely on most? (decides output presets)
- Web app, browser extension, or IDE plugin first?
- Free tier limits and pricing?
- How to measure "correct code" automatically for the evaluation loop?
- Which LLM powers the optimizer, and how to control its cost per prompt?

## 15. Next Steps

- [ ] Confirm target tools and user segment
- [ ] Collect sample prompts and label common gaps
- [ ] Draft checklists for the top 4 task types
- [ ] Prototype the question-and-generate flow
- [ ] Define the test set for measuring improvement
