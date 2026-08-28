'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..', '..');
const contentScriptPath = path.join(
  projectRoot,
  'output',
  'chefs-one-click-form-tester',
  'content-script.js'
);
const source = fs.readFileSync(contentScriptPath, 'utf8');
const methodStart = source.indexOf('    emailValue(descriptor) {');
const methodEnd = source.indexOf('\n    generateText(descriptor, attempt, control) {', methodStart);

assert.notEqual(methodStart, -1, 'The shipped emailValue method was not found.');
assert.notEqual(methodEnd, -1, 'The end of the shipped emailValue method was not found.');
assert.equal(source.includes('@example.ca'), false, 'The retired example.ca domain remains in the shipped generator.');
assert.equal(source.includes('@chefs.invalid'), false, 'The rejected CHEFS-branded domain remains in the shipped generator.');

const methodSource = source.slice(methodStart, methodEnd);
const Harness = Function(
  `"use strict"; return class Harness {
    constructor(runId) {
      this.runId = runId;
    }
${methodSource}
  };`
)();
const harness = new Harness('A1B2C3');
const cases = [
  { key: 'alternativeContactEmail', label: 'Alternative contact email' },
  { key: 'presidentEmail', label: 'President email' },
  { key: 'contact1Email', label: 'Contact 1 email' },
  { key: 'projectLeadEmail', label: 'Project lead email' }
];
const generated = cases.map((descriptor) => harness.emailValue(descriptor));

for (const value of generated) {
  assert.match(
    value,
    /^[a-z0-9-]+\.[a-f0-9]{6}@cedarridgecommunity\.ca$/,
    `Generated email has an unexpected format: ${value}`
  );
  assert.equal(
    /(test|fake|example)/i.test(value),
    false,
    `Generated email contains a prohibited marker term: ${value}`
  );
}

assert.equal(new Set(generated).size, cases.length, 'Representative field contexts did not produce distinct role addresses.');
console.log(`PASS DATA-02: ${generated.length} generated email contexts use cedarridgecommunity.ca without prohibited marker terms or product branding.`);
