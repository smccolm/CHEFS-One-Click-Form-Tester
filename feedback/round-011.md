# Feedback Round 011

Date: 2026-08-28

## Scope

- Evidence bundle: `chefs-one-click-tester-v0.4.0-build-2026.07.23.14-run-AC1EC1-20260828-175837.zip`
- Form: BC Inclusive Communities Grant 2026-2027 (UAT)
- Corrected output: Version `0.4.1`, build `2026.08.28.15`
- Criteria version: `evals/criteria.md` version 10
- Method: Complete bundle inspection, source diagnosis, exact constraint regression and full automated regression suite

## Overall verdict

`CONDITIONAL — AUTOMATED CORRECTION PASS; WORKPLACE REPLAY REQUIRED`

Run `AC1EC1` was blocked after 22 passes and three submission attempts. The extension generated 12,500 for a currency component whose rendered guidance limited the value to 5,000. Its diagnostics recorded `max: null`, so validation repair repeated the same invalid class of value. Required project start and end dates also remained empty because the custom `simpledatetime` components could not be resolved through the Form.io bridge.

## Corrective output

- Rendered numeric ranges and unambiguous validation messages now supplement missing component min/max metadata.
- The evidenced currency range generates 2,500.
- Month-name date ranges now bound generated dates.
- The evidenced project dates generate 2027-04-01 and 2028-03-31.
- Flatpickr and rendered-control paths execute before the existing Form.io bridge fallback.
- PID-free date diagnostics record the application method and resolved bounds.

## Verification

| Criterion | Result | Evidence |
| --- | --- | --- |
| FIELD-02 | PASS (automated) | `field-constraint-regression.test.js` covers the exact AC1EC1 currency and date guidance. |
| VALID-01 | PASS (automated scope) | The validation-message maximum is recovered and the generator changes to an in-range value. |
| Regression baseline | PASS | All six project regression files passed; 15 shipped/evaluation JavaScript files passed syntax validation. |
| SUBMIT-01 | NOT YET OBSERVED | The corrected build has not yet been replayed against the authorized UAT form. |

## Next action

Reload v0.4.1, rerun the same UAT form, and supply the finalized export. A PASS for the live correction requires the amount and both dates to persist without validation errors and the form to submit with a confirmation ID.
