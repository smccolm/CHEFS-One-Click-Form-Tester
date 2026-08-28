# Evaluation Tests

Place executable tests, fixtures, rubrics, checklists, or evaluation scripts here.

Each test must identify the criterion IDs it verifies. When practical, provide one documented command that runs the complete required evaluation suite.

Tok coverage should include:

- unit tests for generation and masking
- component fixtures
- conditional and tabbed form fixtures
- data-grid fixtures
- domain allowlist and denylist tests
- diagnostic schema checks
- prohibited PID scans
- authorized non-production end-to-end submission

Current automated regression commands:

```text
node .\evals\tests\generated-email-regression.test.js
node .\evals\tests\export-workflow-regression.test.js
node .\evals\tests\export-folder-picker-regression.test.js
node .\evals\tests\batch-orchestration-regression.test.js
node .\evals\tests\dashboard-regression.test.js
node .\evals\tests\field-constraint-regression.test.js
node .\evals\tests\autocomplete-editgrid-regression.test.js
node .\evals\tests\upload-stop-regression.test.js
```

`export-workflow-regression.test.js` verifies `EXPORT-01`, `EXPORT-02`, and `EXPORT-03`.
`export-folder-picker-regression.test.js` verifies `EXPORT-04`.
`batch-orchestration-regression.test.js` verifies `BATCH-01` through `BATCH-06`, `UX-02`, and `DASH-01`.
`dashboard-regression.test.js` verifies `DASH-02` through `DASH-05`.
`field-constraint-regression.test.js` verifies `FIELD-02` against the rendered constraints observed in run `AC1EC1`.
`autocomplete-editgrid-regression.test.js` verifies `FIELD-03` and `GRID-02` against the optional preconfigured components and Edit Grid submit collision observed in run `BE27D7`.
`upload-stop-regression.test.js` verifies `UPLOAD-01` and `STOP-01` against the pending `simplefile` upload and unresponsive Stop Run observed in run `01FEF0`.

Do not store completed test results here. Store Tok reports and evidence in `feedback/`.
