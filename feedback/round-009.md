# Tok Report: Round 009

Date: 2026-07-23
Evaluator: User-executed managed-Chrome batch regression with Codex evidence audit

## Output tested

- Path: `output/chefs-one-click-form-tester/`
- Output identifier, version, build, or commit: Version `0.3.1`, build `2026.07.23.13`
- Repository association mode: `NONE`
- Repository revision, if applicable: Not applicable.
- Uncommitted changes included: `NOT APPLICABLE`

## Evaluation definition

- Criteria version: `evals/criteria.md` version 8
- Method: Complete inspection of eight new v0.3.1 troubleshooting ZIP bundles supplied in `feedback/`
- Regression baseline: `feedback/round-004.md`

## Overall verdict

`REVISE`

## Results

| Index | Run | Form | Result | Duration | Confirmation |
| --- | --- | --- | --- | ---: | --- |
| `001` | `9A404E` | Unknown / intended CGG - Human and Social Services | BLOCKED | 1.6 s | — |
| `002` | `D8A618` | CGG - DPAC - UAT | SUBMITTED | 30.3 s | `2FAC970F` |
| `003` | `1D121F` | Template - Simple Functional Chefs Form (TEST) | SUBMITTED | 44.3 s | `3F67BE61` |
| `004` | `B29E89` | Template - Custom Fields | SUBMITTED | 25.4 s | `7CE523B0` |
| `005` | `86071B` | Template - Core Fields | SUBMITTED | 93.2 s | `44B00E0F` |
| `006` | `5872C9` | REDIP - Economic Capacity (UAT) | SUBMITTED | 280.6 s | `5FD636D4` |
| `007` | `C9D46A` | 2026 Community Event Support Fund | SUBMITTED | 59.5 s | `E45C7C08` |
| `008` | `A0FD7E` | A&C Rebate calculations | SUBMITTED | 9.1 s | `B1392EE3` |

## Aggregate results

- Expected bundles present: 8 of 8
- Bundles parsed without JSON or JSONL errors: 8 of 8
- Required diagnostic entries present: 8 of 8
- Runs submitted: 7 of 8
- Unique confirmation IDs: 7
- Total execution time: 544.0 seconds
- Fields filled: 337
- Grid rows added: 3
- Attachments completed: 18
- Visible empty fields remaining in submitted runs: 0

## Corrective-build findings

- Strict sequential ownership is fixed.
- REDIP ran for 280.6 seconds, exceeding the former 90-second launcher cutoff by more than three minutes.
- Index `007` began 1.185 seconds after REDIP ended; it did not overlap REDIP.
- No pair of persisted run intervals overlaps.
- REDIP completed 41 passes, 108 fields, one added row, five attachments and submission successfully.
- The responsive-controller watchdog path did not falsely finalize REDIP.
- Index `001` passed the new preflight too early because the outer `.formio-form` shell existed before the actual Form.io instance and form contents were ready.
- Run `9A404E` recorded an empty title, `formioInstanceFound: false`, one protected DOM form container, zero fillable fields and no submit control.
- Index `001` blocked after 1.6 seconds rather than waiting for the real form to finish mounting.
- Failure screenshot capture for index `001` reported that `<all_urls>` or `activeTab` permission was required; no screenshot was captured.

## Criteria assessment

| Criterion | Result | Evidence |
| --- | --- | --- |
| BATCH-01 | PASS | Eight expected form URLs produced eight indexed run bundles. |
| BATCH-02 | PASS | All intended marked tabs entered the configured test-origin suite. |
| BATCH-03 | PASS | No run intervals overlap; automatic exports produced eight bundles. |
| BATCH-04 | PASS | A failure in index `001` did not wedge later work. |
| BATCH-05 | FAIL | The readiness probe accepted an empty Form.io shell before initialization and content mount. |
| BATCH-06 | PASS | REDIP retained the active slot for 280.6 seconds and submitted before index `007` began. |
| UX-02 | NOT OBSERVED | No v0.3.1 popup screenshot was supplied for full-width Settings confirmation. |
| EXPORT-02 | PASS | Eight automatic ZIP exports are present, including the blocked run. |
| EXPORT-03 | PASS | The blocked bundle contains final evidence, failure details and a terminal checkpoint. |

## Required changes

1. Strengthen batch readiness so the outer form shell alone is insufficient.
2. Require evidence that Form.io has initialized and that meaningful form content or a legitimate submit control is mounted before creating the run.
3. Keep the readiness wait bounded and observable.
4. Replay the eight-form suite and confirm index `001` reaches the intended titled form and submits.
5. Supply a popup screenshot or direct observation confirming Settings spans the full width.

## Advisory observation

- Review failure screenshot permission behavior for batch-opened tabs; host permission permits injection, but the current visible-tab capture path still reported insufficient permission for index `001`.

## Limitations and exclusions

- This audit used persisted diagnostics and did not replay browser interactions.
- The popup layout was not visible in the supplied round-009 evidence.
