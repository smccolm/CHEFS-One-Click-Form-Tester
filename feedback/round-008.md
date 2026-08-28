# Tok Report: Round 008

Date: 2026-07-23
Evaluator: User-executed managed-Chrome batch regression with Codex evidence audit

## Output tested

- Path: `output/chefs-one-click-form-tester/`
- Output identifier, version, build, or commit: Version `0.3.0`, build `2026.07.23.12`
- Repository association mode: `NONE`
- Repository revision, if applicable: Not applicable.
- Uncommitted changes included: `NOT APPLICABLE`

## Evaluation definition

- Criteria version: `evals/criteria.md` version 7
- Method: Managed-Chrome launch of the eight-form batch suite plus complete inspection of eight new troubleshooting ZIP bundles in `feedback/`
- Additional evidence: User screenshots of the opened regression tabs and popup during batch item `001`

## Overall verdict

`REVISE`

## Results

| Index | Run | Form | Result | Evidence |
| --- | --- | --- | --- | --- |
| `001` | `AA86F7` | Common Hosted Forms Service / intended CGG - Human and Social Services | STALLED | Run attached before the Form.io form mounted, remained at `Finding CHEFS form`, and watchdog-finalized after 92 seconds with zero discovered components. |
| `002` | `E97D72` | CGG - DPAC - UAT | SUBMITTED | 32 fields, 3 attachments and submission confirmation captured. |
| `003` | `C09996` | Template - Simple Functional Chefs Form (TEST) | SUBMITTED | 52 fields, 7 attachments and submission confirmation captured. |
| `004` | `DD8CD1` | Template - Custom Fields | SUBMITTED | 44 fields, 1 attachment and submission confirmation captured. |
| `005` | `FFBBB5` | Template - Core Fields | SUBMITTED | 46 fields and submission confirmation captured. |
| `006` | `6065C1` | REDIP - Economic Capacity (UAT) | STALLED | Still filling `_Community3Location` when watchdog-finalized; 54 fields and 3 attachments completed, 4 visible fields remained. |
| `007` | `5FE429` | 2026 Community Event Support Fund | SUBMITTED | 37 fields, 2 attachments and submission confirmation captured. |
| `008` | `402750` | A&C Rebate calculations | SUBMITTED | 18 fields and submission confirmation captured. |

## Evidence findings

- All eight expected v0.3.0 ZIP bundles are present and parse successfully.
- Every required JSON, JSONL, snapshot, validation, attachment and rule-set entry is present.
- Six runs submitted and two stalled.
- Run `AA86F7` started at `19:30:48.521Z`, before the intended Form.io form existed, and ended stalled at `19:32:20.959Z`.
- REDIP run `6065C1` started at `19:35:51.173Z` and remained active until `19:40:51.214Z`.
- Index `007` started at `19:37:21.612Z`, approximately 90 seconds after REDIP began and more than three minutes before REDIP finalized.
- That overlap proves the batch launcher incorrectly applied its startup timeout to an established long-running run and released the sequential queue slot.
- The REDIP telemetry continued recording fill success after index `007` began, confirming concurrent batch execution.
- The popup screenshot showed item `001` as active with seven queued, but exposed only the generic run state `Initializing / Finding CHEFS form`.
- The popup Settings action occupied only the left half of its row while the right half remained blank.

## Criteria assessment

| Criterion | Result | Evidence |
| --- | --- | --- |
| BATCH-01 | PASS | Eight marked tabs opened from the project batch file. |
| BATCH-02 | PASS | The configured token/origin/permission path admitted the intended suite. |
| BATCH-03 | FAIL | REDIP overlapped indexes `007` and `008`; the queue was not sequential for an established run. |
| BATCH-04 | PARTIAL | Counts and Stop Batch were visible, but startup state did not explain the pre-form wait. |
| EXPORT-02 | PASS | Eight automatic troubleshooting ZIP downloads were supplied, including both stalled outcomes. |
| EXPORT-03 | PASS | Both stalled bundles contain terminal failure details, final evidence and checkpoints. |
| UX-01 | FAIL | A 92-second unexplained initialization period appeared as inactivity before the suite advanced. |

## Required changes

1. Collect the initial marked-tab burst before starting index `001`, so later tab creation cannot steal focus from the first run.
2. Confirm that the actual Form.io form is mounted before creating a batch run record.
3. Apply the launcher timeout only before a run is established; never release an active run because its legitimate execution exceeds 90 seconds.
4. Add a watchdog liveness probe so a responsive controller in a long field operation is not falsely finalized as stalled.
5. Make popup batch preparation and form-readiness waiting explicit.
6. Make the Settings button span the full secondary-action width.
7. Replay the eight-form suite, with particular attention to index `001` startup and REDIP sequential ownership.

## Limitations and exclusions

- The screenshots establish visible state but not the precise instant the batch file was launched; timing conclusions use persisted UTC run evidence.
- Automatic-export manifests report `pending` because each ZIP is generated before its own download-success mutation; the presence of all eight files verifies the corresponding download requests completed.
