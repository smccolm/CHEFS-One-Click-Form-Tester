# Tok Report: Round 007

Date: 2026-07-23
Evaluator: User-executed managed Chrome tests plus Codex evidence audit

## Output tested

- Path: `output/chefs-one-click-form-tester/`
- Output identifier, version, build, or commit: Version `0.2.6`, build `2026.07.23.11`
- Repository association mode: `NONE`
- Repository revision, if applicable: Not applicable.
- Uncommitted changes included: `NOT APPLICABLE`

## Evaluation definition

- Criteria version: `evals/criteria.md` version 6
- User test case 1: successful submission with a selected download location
- User test case 2: successful submission with Export Folder blank
- User test case 3: blocked submission on a form without a submit control
- Supplied evidence:
  - `chefs-one-click-tester-v0.2.6-build-2026.07.23.11-run-469F7E-20260723-183241.zip`
  - `chefs-one-click-tester-v0.2.6-build-2026.07.23.11-run-F81C57-20260723-183348.zip`

## Overall verdict

`PASS`

## User-observed results

| Case | Outcome | Automatic download |
| --- | --- | --- |
| Selected download location | Submitted | PASS |
| Blank Export Folder | Submitted | PASS |
| Form without submit control | Blocked | PASS |

The blank-folder success bundle is absent from `feedback/`, which is consistent with direct routing to the browser's normal Downloads folder.

## Supplied bundle audit

### Run `469F7E`

- Result: `SUBMITTED`
- Form: `28147 - Location Simple and Detailed (UAT)`
- Events: 113
- Checkpoints: 38
- Final components: 43
- Confirmation detected: yes
- Submit succeeded: yes
- Finalized timestamp: present
- Terminal checkpoint: `Submission success detected`

### Run `F81C57`

- Result: `BLOCKED`
- Form: `[CTB] - Minimal Unity Applicant ID Look-up`
- Events: 38
- Checkpoints: 8
- Final components: 22
- Confirmation detected: no
- Submit succeeded: no
- Failure: `A visible Form.io submit button could not be found.`
- Failure record: present
- Failure screenshot: present
- Finalized timestamp: present
- Terminal checkpoint reason: `Submit button unavailable`

Both automatic bundles record export state as `pending`, which is expected because each ZIP is generated before the browser download call completes and updates stored state.

## Criterion observations

- `EXPORT-01`: PASS for selected and blank folder behaviour.
- `EXPORT-02`: PASS for finalized submitted and blocked outcomes.
- `EXPORT-03`: PASS for finalized success and failure evidence, including the blocked-run screenshot.
- `EXPORT-04`: PASS for the user-observed valid Select path and automated valid/rejected/cancelled selection coverage.

## Required changes

- None.

## Limitation

- Arbitrary-location rejection and picker cancellation are covered by the project regression but were not separately replayed in the user-reported browser Tok.

## Next enhancement

Freeze v0.2.6 as the baseline. Treat batch regression launching and extension-side orchestration as a separate versioned cut.
