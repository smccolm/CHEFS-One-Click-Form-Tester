# Tok Report: Round 004

Date: 2026-07-23
Evaluator: Codex evidence audit of user-executed workplace regression

## Output tested

- Path: `output/chefs-one-click-form-tester/`
- Output identifier, version, build, or commit: Version `0.2.3`, build `2026.07.22.8`
- Repository association mode: `NONE`
- Repository revision, if applicable: Not applicable.
- Uncommitted changes included: `NOT APPLICABLE`

## Evaluation definition

- Criteria version or repository revision: `evals/criteria.md` version 3
- Method: Complete inspection of eight troubleshooting ZIP bundles supplied in `feedback/`
- Evidence inspected per run: manifest, run summary, event stream, checkpoints, initial snapshot, last-known snapshot, final snapshot, validation records, attachment records, and custom-format rules

## Overall verdict

`PASS`

## Correction to round 003

Round 003 incorrectly stated that detailed troubleshooting bundles were not supplied. Eight complete bundles were present in `feedback/` before round 003 was written.

This report preserves round 003 as an immutable historical record and supersedes its evidence limitation.

## Regression evidence

| Run | Form | Result | Passes | Fields filled | Rows added | Attachments | Submit attempts | Confirmation |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| `9ABC01` | CGG - Human and Social Services (TEST) | SUBMITTED | 6 | 75 | 0 | 9 | 1 | `8532B090` |
| `A3A0C6` | CGG - DPAC - UAT | SUBMITTED | 4 | 32 | 0 | 3 | 1 | `02BC94B3` |
| `F4E5CF` | Template - Simple Functional Chefs Form (TEST) | SUBMITTED | 6 | 52 | 1 | 7 | 1 | `467E1474` |
| `A6FE80` | Template - Custom Fields | SUBMITTED | 4 | 44 | 1 | 1 | 1 | `F007F8AF` |
| `00BA6F` | Template - Core Fields | SUBMITTED | 4 | 46 | 0 | 0 | 1 | `ECF6C018` |
| `EE084A` | REDIP - Economic Capacity (UAT) | SUBMITTED | 41 | 108 | 1 | 5 | 1 | `94A72728` |
| `3C9FD6` | 2026 Community Event Support Fund | SUBMITTED | 15 | 37 | 0 | 2 | 1 | `A605F975` |
| `700CC7` | A&C Rebate calculations | SUBMITTED | 3 | 18 | 0 | 0 | 1 | `DA506172` |

## Aggregate results

- Runs submitted: 8 of 8
- Total execution time: 386.7 seconds
- Fill passes completed: 83
- Components discovered: 1,324
- Fields filled: 412
- Visible empty fields remaining: 0
- Fields failed: 0
- Fields unsupported: 0
- Grid rows added: 3
- Attachments completed: 27
- Attachments pending: 0
- Submission attempts: 8, exactly one per form
- Validation records: 0
- Confirmation IDs captured: 8 unique values

## Recovery and configuration observations

- Sixteen Choices.js fields reported `VALUE_DID_NOT_PERSIST` on attempt one.
- Every affected field succeeded with the same `choices-select` strategy on attempt two.
- No affected field remained empty, failed, unsupported, or blocked.
- Run `700CC7` loaded one portable custom-format rule.
- The rule matched `s01_VehicleRegistrationNumber`, was accepted, and had zero rejections.

## Required changes

1. None for the application.

## Process correction

1. Inspect all new contents of `feedback/` before recording or reporting any Tok result.
2. Do not infer missing evidence from a concise user summary.

## Limitations and exclusions

- This audit did not replay the browser interactions.
- Conclusions are based on the complete exported telemetry bundles and the user-observed PASS results.

