# Feedback Round 014

Date: 2026-08-28

## Scope

- New evidence bundles:
  - `chefs-one-click-tester-v0.4.2-build-2026.08.28.16-run-01FEF0-20260828-200230.zip`
  - `chefs-one-click-tester-v0.4.3-build-2026.08.28.17-run-F55F2F-20260828-202107.zip`
- Supplemental evidence: two user screenshots showing blank automated OrgBook state and a manual `wonderful` query returning selectable results
- Form: TEST Import / its Common Hosted Forms design view
- Corrected output: Version `0.4.4`, build `2026.08.28.18`
- Criteria version: `evals/criteria.md` version 13
- Method: Complete bundle inventory/inspection, screenshot/source diagnosis, strengthened targeted regression and full automated regression suite

## Overall verdict

`CONDITIONAL — AUTOMATED CORRECTION PASS; WORKPLACE REPLAY REQUIRED`

Version 0.4.2 run `01FEF0` finalized as stopped after the previously diagnosed upload delay. Version 0.4.3 run `F55F2F` then submitted TEST Import successfully in 43 seconds with confirmation `F9F05553`, one completed attachment, selected Simple BC Address, selected map location, committed Edit Grid work, no validation errors and the real form submit path.

OrgBook remained blank. `F55F2F` queried it three times and logged `FILL_SUCCEEDED` on every attempt, but each later component scan still recorded the OrgBook descriptor as `empty: true`. Because the field was optional, the valid form still submitted. The prior query was not demonstrated to return a stable selectable value, and the immediate post-click check could accept transient Choices state that disappeared before the next scan.

The user's manual `wonderful` query visibly returned results including WONDERFUL WOOD, WONDERFUL WOOLENWORKS and WONDERFUL WEDDINGS.

## Corrective output

- OrgBook now uses the demonstrated `wonderful` query.
- Returned Choices results receive a normal single click rather than a synthetic five-event pointer sequence.
- A fresh ArrowDown/Enter retry remains available if clicking does not persist.
- Success requires continuously selected state for 1.2 seconds within a bounded three-second check.
- Native-select fallback runs only after sustained click/keyboard selection fails.
- Remote selection success/failure records the result count and persistence window without recording the selected business name.
- A transient value returns failure and remains eligible for a later pass; it cannot increment filled state.

## Verification

| Criterion | Result | Evidence |
| --- | --- | --- |
| FIELD-03 except OrgBook replay | PASS (workplace) | `F55F2F` retained Simple BC Address, one completed file and a selected map marker through successful submission. |
| GRID-02 / SUBMIT-01 | PASS (workplace) | `F55F2F` committed the Edit Grid, selected the real submit component and captured confirmation `F9F05553`. |
| FIELD-03 OrgBook correction | PASS (automated) | `autocomplete-editgrid-regression.test.js` requires the demonstrated query, normal result click, keyboard retry, continuous persistence state and failure on transient selection. |
| Existing regression baseline | PASS | All eight project regression files passed; all 17 shipped/evaluation JavaScript files passed syntax validation; all five packaged JSON files parsed. |
| FIELD-03 OrgBook workplace behaviour | NOT YET OBSERVED | Version 0.4.4 has not yet been replayed against the live OrgBook control. |

## Next action

Reload version 0.4.4 and rerun TEST Import. Confirm Registered Business Name displays a returned OrgBook selection after the dropdown closes and remains populated until submission. Supply the finalized export for the live verdict.
