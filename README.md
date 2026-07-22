# 🧪 CHEFS One-Click Form Tester

[![Chrome](https://img.shields.io/badge/Browser-Google%20Chrome-4285F4?logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)
[![Manifest](https://img.shields.io/badge/Extension-Manifest%20V3-5F6368)]()
[![Version](https://img.shields.io/badge/Version-v0.2.1-2E8540)]()
[![Status](https://img.shields.io/badge/Status-Proven%20Baseline-success)]()

A Chrome extension that automatically fills, validates, repairs, and submits complex **Common Hosted Forms Service (CHEFS)** forms.

It is built for repetitive QA and UAT work across forms with conditional fields, custom components, horizontal tabs, attachments, data grids, field masks, and unusual validation rules.

![CHEFS One-Click Form Tester](./Images/One%20Click%20-%20Cover%20Image.jpg)

---

## 🤖 Project Summary

- **Browser:** Google Chrome
- **Extension platform:** Manifest V3
- **Primary environments:** CHEFS TEST and UAT
- **Current release:** v0.2.1
- **Current build:** 2026.07.22.6
- **Primary action:** Fill and Submit
- **Default data-grid target:** Two total rows
- **Diagnostics:** Persistent, exportable run bundles
- **Custom formats:** User-managed CHEFS mask rules with JSON import/export
- **Development cycle:** Tik for building, Tok for testing and correction

---

## 🚀 What It Does

The normal workflow is intentionally simple:

```text
Open a CHEFS TEST or UAT form
Open the extension
Press Fill and Submit
```

The extension then attempts to:

1. Scan the rendered CHEFS form.
2. Discover reachable user-facing fields.
3. Fill standard and advanced Form.io components.
4. Follow conditional visibility changes.
5. Traverse panels, tabs, and wizard-style layouts.
6. Add and fill two total rows in data grids.
7. Upload validated synthetic attachments.
8. Repair validation failures where possible.
9. Find the real Submit control.
10. Submit the form.
11. Detect the CHEFS success page.
12. Capture the confirmation ID.
13. Preserve a troubleshooting bundle for the run.

The goal is not to write a polished applicant narrative. The goal is to place valid synthetic values into every reachable field and exercise the form as completely as possible.

---

## ✨ Main Capabilities

### Fill Until Full

The engine repeatedly scans, fills, waits for Form.io redraws, and scans again.

```text
Scan
  ↓
Fill reachable fields
  ↓
Wait for conditional changes
  ↓
Rescan
  ↓
Repeat until stable
```

Optional reachable fields are included. The extension does not stop after filling only required fields.

### Conditional Forms

The extension responds to fields and sections that appear after:

- selecting an option
- checking a box
- adding a grid row
- completing a lookup
- moving between tabs
- receiving validation feedback

### Horizontal Tabs

The extension can work through forms where:

- the Submit button is not on the final tab
- the final tab contains resources or external links only
- validation errors occur on inactive tabs
- the form must return to an earlier tab before submission

### Data Grids

The default target is:

```text
Two total rows
```

The extension counts existing rows, adds only the missing rows, fills each row, and avoids treating **Add Another** as the form Submit button.

### Attachments

The bundled synthetic attachment library includes small validated files such as:

- PDF
- DOCX
- XLSX
- CSV
- JSON
- TXT
- PNG
- JPG

The extension waits for CHEFS to render the uploaded file row before continuing.

### Validation Repair

When submission exposes an error, the extension can:

- associate the error with the affected component
- return to the tab containing the field
- reset failed retry state
- generate a corrected value
- resubmit the form

### Confirmation Capture

A successful run detects the CHEFS success page and records the eight-character confirmation ID.

Example:

```text
43AE4B82
```

---

## 🧩 Supported Component Families

The engine currently attempts support for:

- text fields
- text areas
- email fields
- phone fields
- numbers
- currency
- percentages
- dates and date/time controls
- Simple Day controls
- radio groups
- checkbox groups
- select boxes
- Choices.js selects
- object-valued selects
- file uploads
- data grids
- edit grids
- repeating containers
- nested layouts
- panels
- tabs
- calculated and validation-driven form behaviour

Unknown user-facing components are recorded in diagnostics rather than silently ignored.

---

## 🎭 Custom Field Formats

Some CHEFS forms require a specialized identifier format, such as:

- IRMA number
- vehicle registration number
- VIN
- authorization number
- program-area reference number

The extension first attempts to detect the mask already defined by CHEFS. Users can also define their own label-based format rules.

Open:

```text
Extension > Settings > Custom field formats
```

| Label keyword or phrase | CHEFS input mask |
|---|---|
| Vehicle Registration Number | `99999999` |
| IRMA Number | `aaa-999999` |
| Vehicle VIN | `*****************` |

### CHEFS Mask Tokens

```text
9 = numeric
a = alphabetic
* = alphanumeric
```

Other characters are treated literally.

Examples:

```text
aaa-999999        → ABC-123456
(999) 999-9999    → (250) 555-0142
***************** → ABC123DEFGHJKLMNP
```

### Rule Matching

Rules use normalized label matching. The extension ignores differences in capitalization, HTML formatting, repeated spaces, required markers, and trailing punctuation.

A rule for:

```text
IRMA Number
```

can match:

```text
IRMA Number
IRMA Number:
Please provide your IRMA Number
```

---

## 📦 Import and Export Rules

Custom format rules can be shared as JSON.

Use:

```text
Settings > Export Rules
Settings > Import Rules
```

The importer supports:

```text
Merge With Existing Rules
Replace Existing Rules
```

Example:

```json
{
  "schemaVersion": 1,
  "extensionVersion": "0.2.1",
  "rules": [
    {
      "id": "irma-number",
      "enabled": true,
      "labelMatch": "IRMA Number",
      "matchMode": "contains",
      "caseSensitive": false,
      "mask": "aaa-999999",
      "notes": "Program-area identifier"
    }
  ]
}
```

Imported rules take effect after selecting **Save Settings**.

---

## 📋 Installation

### 1. Extract the ZIP

Extract the release ZIP to a permanent folder.

Do not run the extension directly from inside the ZIP.

### 2. Open Chrome Extensions

Enter:

```text
chrome://extensions
```

### 3. Enable Developer Mode

Turn on:

```text
Developer mode
```

### 4. Load the Extension

Select:

```text
Load unpacked
```

Choose the extracted folder:

```text
chefs-one-click-form-tester-v0.2.1
```

### 5. Pin the Extension

Pin **CHEFS One-Click Form Tester** to the Chrome toolbar.

### 6. Run a Form

Open a CHEFS TEST or UAT form and select:

```text
Fill and Submit
```

---

## 🧾 Diagnostics and Troubleshooting

Instrumentation is built into the extension.

The run log is persisted incrementally, so a half-filled or stalled form still produces useful evidence.

Use:

```text
Export Last Run
```

The troubleshooting ZIP may include:

```text
manifest.json
run-summary.txt
events.jsonl
checkpoints.jsonl
initial-components.json
last-known-components.json
final-components.json
validation-errors.json
attachments.json
custom-format-rules.json
failure.json
failure-screenshot.png
```

### What the Bundle Records

- extension version and build
- run ID
- form title and URL
- current pass
- fields discovered
- fields filled
- fields remaining
- failed and unsupported fields
- last successful action
- current action
- tab activation history
- grid-row additions
- upload activity
- validation errors
- submit attempts
- success detection
- confirmation ID
- active custom rules
- rule-set hash
- mask source and generation strategy

### Rule Instrumentation

Events can include:

```text
CUSTOM_RULE_SET_LOADED
CUSTOM_RULE_MATCHED
CUSTOM_RULE_VALUE_ACCEPTED
CUSTOM_RULE_VALUE_REJECTED
MASK_METADATA_DETECTED
MASK_RUNTIME_DETECTED
MASK_VALUE_GENERATED
MASK_VALUE_PERSISTED
MASK_VALUE_REJECTED
MASK_SYNTAX_UNSUPPORTED
```

This makes it possible to determine whether a failure came from the CHEFS mask, a user-defined rule, a conflict between both, unsupported syntax, or a value that failed to persist.

---

## 🔐 Safety Behaviour

The extension is intended for synthetic QA and UAT submissions.

```text
CHEFS TEST  → Allowed
CHEFS UAT   → Allowed
CHEFS PROD  → Blocked unless explicitly configured
```

The extension also avoids:

- Save as Draft
- Previous
- Next when looking for Submit
- Print
- Reset
- Delete
- Cancel
- Add Another grid controls
- lookup and search controls during submission
- duplicate submission from the same completed run

Do not use the extension for real applicant data or production submissions unless the environment and test plan explicitly permit it.

---

## 🧠 Design Principles

### Schema Before Guessing

The engine prefers:

1. user-defined format rules
2. live Form.io component metadata
3. runtime mask configuration
4. rendered component classes
5. HTML validation attributes
6. label and property-name inference
7. validation feedback

### Rendered Form as Source of Truth

A field is eligible when it is rendered, visible, enabled, user-facing, and empty or eligible for retry.

### No Program-Area Hardcoding

Corrections should improve component adapters, mask handling, tab state, validation recovery, grid behaviour, and submission classification.

They should not become a growing list of client-specific property names.

### Evidence-Driven Versions

```text
Tik = build or correction
Tok = testing, evidence, and learning
```

---

## 🧱 Repository Layout

```text
CHEFS-One-Click-Form-Tester/
├── Images/
│   └── One Click - Cover Image.jpg
├── CHEFS-One-Click-Form-Tester-v0.2.1-build-2026.07.22.6.zip
├── chefs-custom-format-rules-v1-<timestamp>.json
├── LICENSE
└── README.md
```

---

## 🔁 Versioning

The extension uses semantic versions with a separate build identifier.

```text
Version: v0.2.1
Build: 2026.07.22.6
```

- **Patch:** corrective behaviour within the existing product
- **Minor:** meaningful engine or settings capability
- **Major:** incompatible architecture or workflow change

The popup, release ZIP, run bundle, and README should identify the same release.

---

## 🧭 Current Baseline

```text
Version: v0.2.1
Build: 2026.07.22.6
Browser: Google Chrome
Extension model: Manifest V3
Default grid rows: 2
Rule format: JSON schema version 1
```

Current product identity:

```text
CHEFS One-Click Form Tester
```

Core purpose:

```text
Press one button, fill every reachable CHEFS field, repair what can be repaired, and submit.
```
