# Feedback

This folder contains immutable Tok reports and their supporting evidence.

Create one report per completed evaluation round:

```text
round-001.md
round-002.md
round-003.md
```

When a report needs screenshots, logs, recordings, diagnostic bundles, or other evidence, use a matching folder:

```text
round-001/
round-002/
```

Do not rewrite an earlier report to reflect later work. Record new results in a new round.

## Tok report template

```markdown
# Tok Report: Round 001

Date: YYYY-MM-DD
Evaluator:

## Output tested

- Path:
- Output identifier, version, build, or commit:
- Repository association mode:
- Repository revision, if applicable:
- Uncommitted changes included: YES | NO | NOT APPLICABLE

## Evaluation definition

- Criteria version or repository revision:
- Test commands, rubric, or method:
- CHEFS environment and form:

## Overall verdict

PASS | REVISE | BLOCKED

## Results

| Criterion | Result | Evidence |
| --- | --- | --- |
| LOOP-01 | PASS | |
| SAFE-01 | FAIL | |

## Required changes

1. None.

## Advisory improvements

1. None.

## Limitations and exclusions

- None.
```

