# Feedback Round 016

Date: 2026-08-28

## Scope

- New evidence bundle: `chefs-one-click-tester-v0.4.5-build-2026.08.28.19-run-010397-20260828-204304.zip`
- Supplemental evidence: user screenshot and captured OrgBook requests plus the ten-result JSON response for `q=wonderful`
- Form: TEST Import
- Corrected output: Version `0.4.6`, build `2026.08.28.20`
- Criteria version: `evals/criteria.md` version 15
- Method: Complete bundle inventory/inspection, event/network/source correlation, strengthened targeted regression and full automated regression suite

## Overall verdict

`CONDITIONAL — AUTOMATED CORRECTION PASS; WORKPLACE REPLAY REQUIRED`

Version 0.4.5 run `010397` submitted TEST Import in 48 seconds with confirmation `F49916BB`, eight passes, 27 filled fields, one completed attachment, selected Simple BC Address and map location, committed repeating-grid work, and no validation errors. OrgBook was the only rejected field.

The run emitted three nine-character OrgBook query events followed by three seven-second result waits that reported zero selectable DOM nodes. The supplied browser network evidence independently proves that the `wonderfu` and `wonderful` requests reached `orgbook.gov.bc.ca` and that the full query returned ten valid results, beginning with WONDERFUL WOOD. Therefore the remaining defect is not input or service response; it is the content script's inability to enumerate the custom Choices result DOM.

## Corrective output

- After the result wait, the runner attempts ArrowDown/Enter selection even if result nodes are opaque to its DOM scope.
- Keyboard selection must pass the existing continuous selected-state check.
- If it does not persist, a page-context command locates the matching Form.io OrgBook instance.
- That fallback accepts only the component-configured HTTPS `orgbook.gov.bc.ca/api/v3/search/autocomplete` endpoint, reapplies the component's latest/inactive/revoked filters, fetches the query, and selects the first returned string value through `component.setValue`.
- Diagnostics contain result count and method but never the returned business name.
- Failure still cannot fall through to the hidden placeholder select.

## Verification

| Criterion | Result | Evidence |
| --- | --- | --- |
| FIELD-03 service response | PASS (workplace) | Captured `q=wonderful` response contains ten valid results while run `010397` records the matching nine-character query. |
| FIELD-03 opaque-DOM diagnosis | PASS | All three `010397` attempts report result count zero after seven seconds despite the captured successful response. |
| FIELD-03 keyboard fallback | PASS (automated) | Targeted regression requires ArrowDown/Enter selection before final failure when DOM result enumeration is empty. |
| FIELD-03 restricted Form.io fallback | PASS (automated) | Targeted regression requires exact HTTPS OrgBook host/path restriction, returned-result extraction and application through the matching component. |
| Existing workplace behaviours | PASS (workplace) | `010397` retained address, upload, map, repeating-grid and real-submit behaviour through confirmation `F49916BB`. |
| FIELD-03 OrgBook workplace behaviour | NOT YET OBSERVED | Version 0.4.6 has not yet been replayed against the live OrgBook control. |

## Next action

Reload version 0.4.6, refresh TEST Import and start a fresh run. Confirm Registered Business Name retains a returned business after the dropdown closes and through submission. Export the finalized bundle; the successful event will identify either `keyboard-after-opaque-results` or `restricted-orgbook-formio-fallback` without exposing the selected name.
