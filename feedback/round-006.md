# Tok Report: Round 006

Date: 2026-07-23
Evaluator: User-executed managed Chrome tests plus Codex evidence audit

## Output tested

- Path: `output/chefs-one-click-form-tester/`
- Output identifier, version, build, or commit: Version `0.2.5`, build `2026.07.23.10`
- Repository association mode: `NONE`
- Repository revision, if applicable: Not applicable.
- Uncommitted changes included: `NOT APPLICABLE`

## Evaluation definition

- Criteria version: `evals/criteria.md` version 5
- User test case 1: Export Folder blank; Automatically export after each run enabled
- User test case 2: Export Folder populated; Automatically export after each run enabled
- Evidence bundle: `chefs-one-click-tester-v0.2.5-build-2026.07.23.10-run-72EE76-20260723-180523.zip`

## Overall verdict

`PARTIAL PASS`

## User-observed results

| Case | Export Folder | Automatic export | Submission | Download |
| --- | --- | --- | --- | --- |
| 1 | Blank | Enabled | PASS | PASS |
| 2 | Populated | Enabled | PASS | PASS |

The absence of the blank-folder case from `feedback/` is consistent with that case downloading to the browser's normal Downloads folder. The populated-folder case reached `feedback/` through the tester-selected routing.

## Supplied bundle audit

- Version: `0.2.5`
- Build: `2026.07.23.10`
- Run ID: `72EE76`
- Form: `28147 - Location Simple and Detailed (UAT)`
- Result: `SUBMITTED`
- Events: 113
- Checkpoints: 38
- Final components: 43
- Visible empty fields remaining: 0
- Fields failed: 0
- Fields unsupported: 0
- Submission attempts: 1
- Confirmation ID: `B055DA1A`
- `CONFIRMATION_DETECTED`: present
- `SUBMIT_SUCCEEDED`: present
- Terminal checkpoint: `Submission success detected`
- Finalized timestamp: present

The bundle records automatic export as `pending`, which is expected because the ZIP is generated before the browser download call can complete and update stored state.

## Criterion observations

- `EXPORT-01`: PASS for blank and populated automatic-download path behaviour observed by the user.
- `EXPORT-02`: PASS for finalized successful submission; representative browser failure outcome remains untested.
- `EXPORT-03`: PASS for finalized successful-submission evidence in the supplied ZIP; representative browser failure ZIP remains untested.

## Required changes

- None based on the two executed success cases.

## Remaining verification

1. Exercise one representative failed, blocked, stalled, safety-stop or stopped run with automatic export enabled.
2. Confirm exactly one ZIP is downloaded and contains the terminal failure or stop evidence.

## Proposed enhancement

The user proposed adding a **Select** button beside **Export Folder**. This is a new design decision rather than a defect in the tested v0.2.5 behaviour.
