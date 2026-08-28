# Feedback Round 012

Date: 2026-08-28

## Scope

- New evidence: ten version `0.4.1` run bundles, from `39E237` through `BE27D7`
- Antagonistic form: TEST Import, run `BE27D7`
- Supplemental evidence: attached `test_import_schema.json`, treated only as a form definition
- Corrected output: Version `0.4.2`, build `2026.08.28.16`
- Criteria version: `evals/criteria.md` version 11
- Method: Recursive feedback inventory, complete new-bundle inspection, screenshot/schema/source diagnosis, targeted regression and full automated regression suite

## Overall verdict

`CONDITIONAL — AUTOMATED CORRECTION PASS; WORKPLACE REPLAY REQUIRED`

Nine of the ten new version `0.4.1` runs submitted successfully. Run `39E237` also confirms that the prior `AC1EC1` currency/date correction works on the authorized UAT form. The final antagonistic run, `BE27D7`, stalled on TEST Import after one submission attempt.

`BE27D7` uploaded its optional file but left Simple BC Address unresolved. OrgBook was incorrectly treated as filled because placeholder-backed choice state appeared nonempty, and map query text was counted without proving a selected feature. The run added an Edit Grid row but left its editor open. Submit discovery then accepted that row's HTML `type="submit"` Save control and clicked it instead of the actual `data[submit]` Form.io component, producing neither confirmation nor actionable validation feedback.

## Corrective output

- OrgBook placeholder state remains empty until a returned remote result is selected.
- Simple BC Address searches the configured provider and selects a returned address.
- Map controls require a selected feature or marker; query text alone does not count.
- Optional `simplefile` components retain the existing synthetic CHEFS upload path.
- Open Edit Grid rows are committed after their reachable nested fields are processed.
- An Edit Grid remains eligible for later row additions while its current editor is open.
- Row Save, Cancel, Remove, Delete, Edit and close actions are excluded from form-submit discovery.
- Generic HTML `type="submit"` is no longer sufficient submit identity; the Form.io submit wrapper or `data[submit]` name is required.

## Verification

| Criterion | Result | Evidence |
| --- | --- | --- |
| FIELD-02 | PASS (workplace) | Version 0.4.1 run `39E237` submitted BC Inclusive Communities Grant with zero remaining/failed fields. |
| FIELD-03 | PASS (automated) | `autocomplete-editgrid-regression.test.js` verifies remote query/result selection, placeholder rejection, semantic address/map state and map marker fallback. |
| GRID-02 | PASS (automated) | The same regression verifies post-fill Edit Grid commits, pending-editor row handling and exclusion of row actions from submit discovery. |
| Existing regression baseline | PASS | All seven project regression files passed; all 16 shipped/evaluation JavaScript files passed syntax validation; all five packaged JSON files parsed. |
| SUBMIT-01 on TEST Import | NOT YET OBSERVED | Version 0.4.2 has not yet been replayed against the authorized TEST form. |

## Next action

Reload version 0.4.2 from the permanent unpacked folder and rerun TEST Import. Confirm that OrgBook and Simple BC Address contain selected results, Search Location contains a feature or marker, the optional file remains uploaded, two Edit Grid rows are committed, and the actual form Submit produces a confirmation. Supply the finalized export for the live verdict.
