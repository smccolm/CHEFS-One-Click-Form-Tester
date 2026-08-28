# Tok Report: Round 002

Date: 2026-07-22
Evaluator: Codex executable regression following user review

## Output tested

- Path: `output/chefs-one-click-form-tester-v0.2.3/`
- Output identifier, version, build, or commit: Version `0.2.3`, build `2026.07.22.8`
- Repository association mode: `NONE`
- Repository revision, if applicable: Not applicable.
- Uncommitted changes included: `NOT APPLICABLE`

## Evaluation definition

- Criteria version or repository revision: `evals/criteria.md` version 3
- Test command: `node .\evals\tests\generated-email-regression.test.js`
- Additional checks: JavaScript syntax, JSON parsing, manifest identity, package size verification, and SHA-256 verification
- CHEFS environment and form: No live CHEFS form was used.

## Overall verdict

`PASS`

## Review disposition

Round 001 passed its written technical criterion but failed user review because `chefs.invalid` was an obvious fakery marker, appropriated CHEFS product identity for unrelated applicant data, and did not meet the required tone.

Round 002 replaces that value with `cedarridgecommunity.ca`, matching the existing fictional Cedar Ridge Community Association identity.

## Results

| Criterion | Result | Evidence |
| --- | --- | --- |
| DATA-02 | PASS | The regression executed the shipped `emailValue` method for alternative contact, president, contact 1, and project lead contexts. All outputs were distinct, used `cedarridgecommunity.ca`, contained none of `test`, `fake`, or `example`, and contained no CHEFS product identity. |
| DELV-01 | PASS | All JavaScript parsed, all JSON parsed, manifest identity matched version `0.2.3` build `2026.07.22.8`, and package integrity metadata verified. |

## Required changes

1. None for this correction.

## Advisory improvements

1. Confirm a `@cedarridgecommunity.ca` value is accepted by representative CHEFS TEST email fields during the next workplace Tok.

## Limitations and exclusions

- No live CHEFS form was submitted.
- Fill-loop, grid, attachment, validation-repair, and submission behaviours were unchanged and were not rerun.
- PID, domain policy, retention, and repeat-run state were outside this correction.

