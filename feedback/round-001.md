# Tok Report: Round 001

Date: 2026-07-22
Evaluator: Codex static and executable regression

## Output tested

- Path: `output/chefs-one-click-form-tester-v0.2.2/`
- Output identifier, version, build, or commit: Version `0.2.2`, build `2026.07.22.7`
- Repository association mode: `NONE`
- Repository revision, if applicable: Not applicable.
- Uncommitted changes included: `NOT APPLICABLE`

## Evaluation definition

- Criteria version or repository revision: `evals/criteria.md` version 2
- Test command: `node .\evals\tests\generated-email-regression.test.js`
- Additional checks: JavaScript syntax, JSON parsing, manifest identity, package size verification, and SHA-256 verification
- CHEFS environment and form: No live CHEFS form was used.

## Overall verdict

`PASS`

## Results

| Criterion | Result | Evidence |
| --- | --- | --- |
| DATA-02 | PASS | The regression executed the shipped `emailValue` method for alternative contact, president, contact 1, and project lead contexts. All four outputs were distinct, used `chefs.invalid`, and contained none of `test`, `fake`, or `example`. |
| DELV-01 | PASS | All JavaScript parsed, all JSON parsed, manifest identity matched version `0.2.2` build `2026.07.22.7`, and package integrity metadata verified. |

## Required changes

1. None for this Tik.

## Advisory improvements

1. Confirm an `@chefs.invalid` value is accepted by representative CHEFS TEST email fields during the next workplace Tok.

## Limitations and exclusions

- No live CHEFS form was submitted.
- Fill-loop, grid, attachment, validation-repair, and submission behaviours were unchanged and were not rerun.
- PID, domain policy, retention, and repeat-run state were outside this Tik.

