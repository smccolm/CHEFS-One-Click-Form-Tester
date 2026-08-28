'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..', '..');
const contentScriptPath = path.join(projectRoot, 'output', 'chefs-one-click-form-tester', 'content-script.js');
const source = fs.readFileSync(contentScriptPath, 'utf8');

function sliceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

const helperSource = sliceBetween('  function cleanText(value) {', '\n  function normalizeRulePhrase(value, caseSensitive) {');
const constraintsSource = sliceBetween('    constraints(descriptor, control) {', '\n    fitText(text, constraints) {');
const numberSource = sliceBetween('    generateNumber(descriptor, attempt, control) {', '\n    dateValuePlan(descriptor, attempt, control) {');
const datePlanSource = sliceBetween('    dateValuePlan(descriptor, attempt, control) {', '\n    generateDate(descriptor, attempt, control) {');
const dateSource = sliceBetween('    generateDate(descriptor, attempt, control) {', '\n    generateValue(descriptor, attempt, control) {');
const fillDateTimeSource = sliceBetween('    async fillDateTime(descriptor, attempt) {', '\n    phoneDigitCount(input) {');

const Harness = Function(
  `"use strict";
${helperSource}
return class Harness {
  runtimeMaskFromControl() { return ''; }
${constraintsSource}
${numberSource}
${datePlanSource}
${dateSource}
};`
)();

function wrapper(text) {
  return {
    textContent: text,
    querySelector() {
      return null;
    }
  };
}

function control(overrides = {}) {
  return Object.assign({
    min: '',
    max: '',
    minLength: -1,
    maxLength: -1,
    pattern: 'CA$[0-9.,]*',
    placeholder: '',
    type: 'text',
    value: '',
    hasAttribute() {
      return false;
    }
  }, overrides);
}

const harness = new Harness();
const amountDescriptor = {
  type: 'simplecurrencyadvanced',
  key: 's06_AmountApplying',
  label: 'Amount Applying',
  description: 'Enter an amount from $0 to $5,000 CAD.',
  meta: {},
  wrapper: wrapper('Amount Applying Enter an amount from $0 to $5,000 CAD.')
};
const amountConstraints = harness.constraints(amountDescriptor, control());
assert.equal(amountConstraints.min, 0, 'The rendered currency minimum was not detected.');
assert.equal(amountConstraints.max, 5000, 'The rendered currency maximum was not detected.');
assert.equal(harness.generateNumber(amountDescriptor, 1, control()), 2500, 'The generated currency value was not clamped inside the rendered range.');

const validationDescriptor = {
  ...amountDescriptor,
  description: '',
  wrapper: wrapper('Amount Applying cannot be greater than 5000.')
};
assert.equal(harness.constraints(validationDescriptor, control()).max, 5000, 'A rendered Form.io maximum validation message was not recovered.');

const startPlan = harness.dateValuePlan({
  key: 's06_ProjectStartDate',
  label: 'Project Start Date',
  description: 'Must be between April 1, 2027 and March 31, 2028.'
}, 1, control());
assert.equal(startPlan.value, '2027-04-01', 'The project start date did not use the earliest rendered in-range date.');

const endPlan = harness.dateValuePlan({
  key: 's06_ProjectEndDate',
  label: 'Project End Date',
  description: 'Must be on or after the start date and no later than March 31, 2028.'
}, 1, control());
assert.equal(endPlan.value, '2028-03-31', 'The project end date did not honor the rendered upper bound.');

assert.match(fillDateTimeSource, /_flatpickr\.setDate\(plan\.date, true\)/, 'The custom-date strategy lacks its Flatpickr fallback.');
assert.match(fillDateTimeSource, /renderedInput/, 'The custom-date strategy does not fall back to a rendered readonly control.');
assert.match(fillDateTimeSource, /fillViaBridge/, 'The existing Form.io bridge fallback was not retained.');

console.log('PASS FIELD-02: rendered currency bounds and calendar ranges constrain generated values, with Flatpickr/DOM and Form.io date fallbacks retained.');
