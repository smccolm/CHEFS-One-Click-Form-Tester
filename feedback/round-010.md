# Tok Report: Round 010

Date: 2026-07-23
Evaluator: User-executed managed-Chrome regression with Codex evidence audit

## Output tested

- Path: `output/chefs-one-click-form-tester/`
- Output identifier, version, build, or commit: Version `0.4.0`, build `2026.07.23.14`
- Repository association mode: `NONE`
- Repository revision, if applicable: Not applicable.
- Uncommitted changes included: `NOT APPLICABLE`

## Evaluation definition

- Criteria version: `evals/criteria.md` version 9
- Method: User observation of dashboard automatic opening disabled and enabled, plus complete inspection of 16 new v0.4.0 troubleshooting ZIP bundles in `feedback/`
- Regression baseline: `feedback/round-004.md`

## Overall verdict

`PASS — DASHBOARD OPT-IN AND TWO-SUITE REGRESSION`

This is a scoped PASS for the behavior and evidence actually observed. Dashboard viewport fit, detailed chart interaction and the v0.4.0 popup layout were not supplied visually and remain unobserved rather than failed.

## User observation

1. With automatic dashboard opening disabled, the regression run completed without automatically opening the dashboard: PASS.
2. With automatic dashboard opening enabled, the next regression run automatically opened the dashboard: PASS.

## Evidence inventory

- New v0.4.0 ZIP bundles: 16
- Complete eight-form suites represented: 2
- Required diagnostic entries present: 160 of 160
- ZIP bundles with parseable manifest, JSON and JSONL evidence: 16 of 16
- Submitted runs: 16 of 16
- Unique confirmation IDs: 16
- Fields filled: 824
- Attachments completed: 54
- Grid rows added: 6
- Submitted runs with visible empty fields remaining: 0
- Submitted runs with failed or unsupported fields: 0
- Overlapping persisted run intervals: 0

## Suite results

| Index | Form | Dashboard disabled run | Dashboard enabled run | Results |
| --- | --- | --- | --- | --- |
| `001` | CGG - Human and Social Services (TEST) | `379EEB`, 101.6 s, 75 fields | `55B491`, 100.3 s, 75 fields | SUBMITTED / SUBMITTED |
| `002` | CGG - DPAC - UAT | `696451`, 29.1 s, 32 fields | `21B9AD`, 28.7 s, 32 fields | SUBMITTED / SUBMITTED |
| `003` | Template - Simple Functional Chefs Form (TEST) | `07F52D`, 43.9 s, 52 fields | `84F3D3`, 43.8 s, 52 fields | SUBMITTED / SUBMITTED |
| `004` | Template - Custom Fields | `A449EF`, 26.5 s, 44 fields | `4C8827`, 25.0 s, 44 fields | SUBMITTED / SUBMITTED |
| `005` | Template - Core Fields | `0AC51F`, 93.5 s, 46 fields | `916E32`, 93.2 s, 46 fields | SUBMITTED / SUBMITTED |
| `006` | REDIP - Economic Capacity (UAT) | `8E68EC`, 285.6 s, 108 fields | `185B99`, 284.9 s, 108 fields | SUBMITTED / SUBMITTED |
| `007` | 2026 Community Event Support Fund | `0FC4E7`, 60.5 s, 37 fields | `46E3C2`, 61.0 s, 37 fields | SUBMITTED / SUBMITTED |
| `008` | A&C Rebate calculations | `8A9B74`, 8.1 s, 18 fields | `52D1E8`, 8.2 s, 18 fields | SUBMITTED / SUBMITTED |

## Corrective-build findings

- The round-009 empty-shell defect is corrected in both suites.
- Index `001` reached the intended titled CGG form, filled 75 fields and submitted twice.
- Neither index `001` run became an empty, short-lived Unknown-form bundle.
- REDIP retained the sequential queue slot for approximately 285 seconds in both suites.
- No subsequent run started before its predecessor ended.
- Inter-run gaps were positive in both suites, ranging from 0.852 to 1.802 seconds.
- A dashboard preference change did not alter form outcomes, field totals, attachment totals or strict sequencing.

## Criteria assessment

| Criterion | Result | Evidence |
| --- | --- | --- |
| BATCH-03 | PASS | Both eight-form suites were strictly sequential with no persisted interval overlap. |
| BATCH-05 | PASS | Index `001` waited for the real titled form and submitted in both suites instead of accepting an empty Form.io shell. |
| BATCH-06 | PASS | REDIP retained its slot for about 285 seconds twice; indexes `007` and `008` remained sequential. |
| EXPORT-02 | PASS | Sixteen finalized automatic ZIP exports were supplied. |
| DASH-01 | PASS (observed scope) | Disabled produced no automatic dashboard; enabled produced automatic dashboard opening. Automated lifecycle regression separately covers singleton/final-batch timing, duplicate suppression and existing-tab reuse. |
| DASH-02 | PASS (automated) | The v0.4.0 PID-canary/schema regression passed before release; no new rendered dashboard inspection was supplied. |
| DASH-03 | NOT OBSERVED | No 1440×900 dashboard screenshot or explicit no-scroll/layout observation was supplied. |
| DASH-04 | NOT OBSERVED | No chart-menu interaction result was supplied. |
| DASH-05 | PASS (automated) | Retention defaults, bounds, expiry and clear behavior passed the release regression; this Tok kept no comparable-history evidence. |
| UX-02 | NOT OBSERVED | No v0.4.0 popup screenshot was supplied. |

## Remaining visual confirmation

No corrective change is required by the supplied evidence. For complete visual sign-off:

1. Confirm the dashboard fits at a 1440×900 viewport without document scrolling.
2. Confirm Simple, Analyst, Statistical and Experimental menus are usable and unavailable advanced charts state why.
3. Supply or directly confirm the v0.4.0 popup layout, including full-width Results Dashboard, Settings and Stop Batch actions.

## Limitations and exclusions

- Automatic dashboard opening was recorded from the user's direct managed-Chrome observation; it is not encoded in the troubleshooting ZIPs.
- The bundles establish form execution, submission, export and sequencing behavior, but do not capture the rendered dashboard or popup.
- No new dashboard-history population test was included in these two suites.
