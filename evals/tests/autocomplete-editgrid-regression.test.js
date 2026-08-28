'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..', '..');
const contentScriptPath = path.join(projectRoot, 'output', 'chefs-one-click-form-tester', 'content-script.js');
const source = fs.readFileSync(contentScriptPath, 'utf8');
const bridgeSource = fs.readFileSync(path.join(projectRoot, 'output', 'chefs-one-click-form-tester', 'page-bridge.js'), 'utf8');

function sliceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

const inspectSource = sliceBetween('    inspectEmpty(wrapper, type) {', '\n    isInvalid(wrapper) {');
const strategySource = sliceBetween('    chooseStrategy(descriptor) {', '\n    async performFill(descriptor, strategy, attempt) {');
const remoteSource = sliceBetween('    async fillRemoteAutocomplete(descriptor) {', '\n    async fillMapLocation(descriptor) {');
const mapSource = sliceBetween('    async fillMapLocation(descriptor) {', '\n    async fillNativeSelect(descriptor) {');
const querySource = sliceBetween('    remoteAutocompleteQuery(descriptor) {', '\n    async typeAutocompleteQuery(input, query, descriptor, characterByCharacter) {');
const typeQuerySource = sliceBetween('    async typeAutocompleteQuery(input, query, descriptor, characterByCharacter) {', '\n    autocompleteOptions(wrapper, choicesOnly) {');
const choiceFillSource = sliceBetween('    async fillChoices(descriptor, searchRemote) {', '\n    async fillRemoteAutocomplete(descriptor) {');
const choicePersistenceSource = sliceBetween('    async waitForChoiceValue(descriptor, timeoutMs, stableMs) {', '\n    dispatchPointerSequence(element) {');
const nativeSelectSource = sliceBetween('    async fillNativeSelect(descriptor) {', '\n    async fillDayComponent(descriptor) {');
const fillLoopSource = sliceBetween('    async fillUntilStable() {', '\n    async fillDescriptor(descriptor) {');
const gridSource = sliceBetween('    async handleGrid(descriptor) {', '\n    async handleLookupActions() {');
const submitSource = sliceBetween('    isSubmitButtonCandidate(button) {', '\n    submitButtonCandidates() {');

assert.ok(
  inspectSource.indexOf("type.includes('orgbook')") < inspectSource.indexOf("const select = wrapper.querySelector('select')"),
  'OrgBook/Choices semantic selection must be checked before its placeholder-backed native select.'
);
assert.match(source, /choiceValuePresent\(wrapper\)[\s\S]*selectedOptions[\s\S]*start\\s\+typing/,
  'OrgBook Start typing placeholder text must never count as a selected value.'
);
assert.match(inspectSource, /type\.includes\('simplebcaddress'\)[\s\S]*addressValuePresent/,
  'Simple BC Address must use semantic address persistence instead of generic input text.'
);
assert.match(inspectSource, /type\.includes\('map'\)[\s\S]*mapValuePresent/,
  'Map controls must require a selected feature or marker.'
);

assert.ok(
  strategySource.indexOf("return 'remote-autocomplete'") < strategySource.indexOf("return 'choices-select'"),
  'Remote components must route before the generic Choices strategy.'
);
assert.match(strategySource, /type\.includes\('map'\)[\s\S]*return 'map-location'/,
  'Map controls must use the dedicated map strategy.'
);
assert.match(remoteSource, /typeAutocompleteQuery/,
  'The remote autocomplete strategy must type a query.'
);
assert.match(remoteSource, /waitForAutocompleteOptions/,
  'The remote autocomplete strategy must wait for returned options.'
);
assert.match(remoteSource, /dispatchPointerSequence\(chosen\.element\)/,
  'The remote autocomplete strategy must select a returned item.'
);
assert.ok(
  remoteSource.indexOf("bridgeCommand('SELECT_ORGBOOK_RESULT'") < remoteSource.indexOf("wrapper.querySelector('.choices')"),
  'OrgBook must use the live Form.io component before attempting synthetic Choices interaction.'
);
assert.match(remoteSource, /query: 'wonderful'[\s\S]*preferredValue: 'WONDERFUL FLOORING'[\s\S]*selectionMethod: 'formio-select-lifecycle'/,
  'The primary OrgBook path must search through Form.io and select the evidenced returned value.'
);
assert.match(remoteSource, /formioRootCount[\s\S]*formioComponentCount[\s\S]*wrapperMatched/,
  'OrgBook run evidence must include bounded Form.io lookup counts and rendered-wrapper match state.'
);
assert.match(querySource, /type\.includes\('orgbook'\)[\s\S]*return 'WONDERFUL FLOORING'/,
  'OrgBook must enter the exact user-evidenced returned value.'
);
assert.doesNotMatch(querySource, /Province of British Columbia/,
  'The previous unproven OrgBook query must not remain active.'
);
assert.match(typeQuerySource, /for \(const character of query\)/,
  'Remote autocomplete queries must be entered character by character like a human user.'
);
assert.match(typeQuerySource, /keydown[\s\S]*beforeinput[\s\S]*input[\s\S]*keyup/,
  'Character-by-character entry must emit the keyboard and input event sequence used by Choices.'
);
assert.match(choiceFillSource, /if \(searchRemote\) \{[\s\S]*control\.click\(\)[\s\S]*typeAutocompleteQuery\(search, query, descriptor, true\)/,
  'OrgBook must open normally and type its query character by character.'
);
assert.match(choiceFillSource, /if \(!chosen\) \{[\s\S]*if \(searchRemote\) \{[\s\S]*return \{ success: false,[\s\S]*Returned OrgBook results could not be selected or persisted/,
  'OrgBook must fail when returned results cannot persist instead of accepting its placeholder.'
);
assert.ok(
  choiceFillSource.indexOf('Returned OrgBook results could not be selected or persisted.') < choiceFillSource.indexOf('return this.fillNativeSelect(descriptor);'),
  'The remote no-result path must return before the generic native-select fallback.'
);
assert.match(choiceFillSource, /selectFirstAutocompleteByKeyboard\(search, descriptor, true\)[\s\S]*enter-exact-returned-value/,
  'OrgBook must press Enter directly after typing the exact returned value.'
);
assert.match(choiceFillSource, /bridgeCommand\('SELECT_ORGBOOK_RESULT'[\s\S]*restricted-orgbook-formio-fallback/,
  'OrgBook must retain a restricted page-context fallback when neither result DOM nor keyboard selection persists.'
);
assert.match(choiceFillSource, /preferredValue: 'WONDERFUL FLOORING'/,
  'The restricted fallback must request the same exact returned value entered into Choices.'
);
assert.match(bridgeSource, /endpoint\.protocol !== 'https:'[\s\S]*endpoint\.hostname !== 'orgbook\.gov\.bc\.ca'[\s\S]*endpoint\.pathname !== '\/api\/v3\/search\/autocomplete'/,
  'The page-context Form.io path must validate the configured HTTPS OrgBook endpoint.'
);
assert.match(bridgeSource, /component\.triggerUpdate\(query, true\)[\s\S]*component\.itemsLoaded[\s\S]*component\.selectOptions[\s\S]*option\.value\.trim\(\) === preferredValue[\s\S]*component\.setValue\(preferredValue/,
  'OrgBook must use Form.io triggerUpdate/itemsLoaded/selectOptions before applying the exact returned value.'
);
assert.match(bridgeSource, /component\.triggerChange\(\{ modified: true \}\)/,
  'The Form.io OrgBook selection must trigger normal change processing.'
);
assert.match(bridgeSource, /discoverFormInstances\(wrapperId\)[\s\S]*forms\.forEach\(\(form, formIndex\)/,
  'Component lookup must inspect every discovered Form.io root instead of only the first cached instance.'
);
assert.match(bridgeSource, /targetWrapper[\s\S]*ownsWrapper[\s\S]*matches\.sort/,
  'Component lookup must prefer the Form.io component that owns the exact rendered wrapper.'
);
assert.match(choiceFillSource, /typeAutocompleteQuery\(search, retryQuery, descriptor, true\)/,
  'An OrgBook retry must preserve the human-equivalent character-by-character interaction.'
);
assert.match(choiceFillSource, /chosen\.element\.click\(\)[\s\S]*waitForChoiceValue\(descriptor, 3000, 1200\)/,
  'OrgBook result selection must use a normal click and a sustained persistence check.'
);
assert.match(choiceFillSource, /REMOTE_AUTOCOMPLETE_SELECTION_FAILED/,
  'A transient OrgBook selection must be diagnosed as failed.'
);
assert.match(choiceFillSource, /success: Boolean\(persisted\)/,
  'Choices completion must depend on sustained persisted state, not an immediate transient reading.'
);
assert.match(choicePersistenceSource, /presentSince[\s\S]*Date\.now\(\) - presentSince >= stableMs/,
  'The persistence helper must require continuous selected state for the configured window.'
);
assert.match(nativeSelectSource, /optionScore\([\s\S]*> -1000/,
  'Native selects must exclude placeholder-like options even when their value is non-empty.'
);

assert.match(mapSource, /mapValuePresent/,
  'Map completion must be checked semantically.'
);
assert.match(mapSource, /leaflet-draw-draw-marker|leaflet-pm-icon-marker/,
  'The map strategy must retain a marker-placement fallback.'
);
assert.match(mapSource, /MAP_LOCATION_SELECTION_FAILED/,
  'A typed query without a map feature must be reported as a failure.'
);

assert.match(fillLoopSource, /handleLookupActions\(\)[\s\S]*commitOpenEditGridRows\(\)/,
  'Open Edit Grid rows must be committed after nested fields and lookup actions are processed.'
);
assert.match(gridSource, /GRID_ROW_EDITOR_PENDING/,
  'An open Edit Grid editor must keep the grid eligible for another fill pass.'
);
assert.match(gridSource, /EDITGRID_ROW_SAVE_ATTEMPT[\s\S]*EDITGRID_ROW_COMMITTED/,
  'Edit Grid row commits must be attempted and recorded.'
);
assert.match(submitSource, /insideEditGrid/,
  'Submit discovery must explicitly reject controls inside Edit Grid rows.'
);
assert.match(submitSource, /\^\(save\|save row\|update row\|cancel\|remove\|delete\|edit\|×\)\$/,
  'Row Save/Cancel/Remove/Edit controls must be excluded from form submission.'
);
assert.doesNotMatch(submitSource, /button\.type[\s\S]*===\s*['"]submit['"]/,
  'A generic HTML type=submit is not sufficient evidence of the real Form.io submit component.'
);
assert.match(submitSource, /formio-component-submit/,
  'The real Form.io submit wrapper remains an explicit submit landmark.'
);
assert.match(submitSource, /data\\\[submit\\\]/,
  'The real CHEFS data[submit] control remains an explicit submit landmark.'
);

async function executeBridgeCommand(windowObject, postedMessages, command, payload, requestId) {
  const listener = windowObject.__messageListener;
  assert.equal(typeof listener, 'function', 'The page bridge must install its message listener.');
  listener({
    source: windowObject,
    data: {
      channel: 'CHEFS_TESTER_BRIDGE_REQUEST',
      requestId,
      command,
      payload
    }
  });
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    const response = postedMessages.find((message) =>
      message && message.channel === 'CHEFS_TESTER_BRIDGE_RESPONSE' && message.requestId === requestId
    );
    if (response) {
      return response;
    }
  }
  throw new Error(`Bridge command ${command} did not respond.`);
}

async function verifyMultipleFormRootLookup() {
  const postedMessages = [];
  const wrongComponent = {
    component: { key: 'unrelated', type: 'textfield' },
    key: 'unrelated',
    element: null
  };
  const wrongForm = {
    everyComponent(callback) { callback(wrongComponent); },
    getComponent() { return null; },
    checkValidity() { return true; },
    data: {}
  };
  const wrapper = {
    id: 'orgbook-live-wrapper',
    isConnected: true,
    parentElement: null,
    closest() { return this; },
    contains(value) { return value === this; }
  };
  const orgbookComponent = {
    component: {
      key: 'orgbook',
      type: 'orgbook',
      data: { url: 'https://orgbook.gov.bc.ca/api/v3/search/autocomplete' }
    },
    key: 'orgbook',
    path: 'orgbook',
    element: wrapper,
    dataValue: '',
    selectOptions: [],
    triggerUpdate(query, forceUpdate) {
      assert.equal(query, 'wonderful');
      assert.equal(forceUpdate, true);
      this.selectOptions = [{ value: 'WONDERFUL FLOORING', label: 'WONDERFUL FLOORING' }];
      this.itemsLoaded = Promise.resolve();
    },
    setValue(value) {
      this.dataValue = value;
      return true;
    },
    triggerChange() {},
    hasValue() { return this.dataValue === 'WONDERFUL FLOORING'; }
  };
  const correctForm = {
    everyComponent(callback) { callback(orgbookComponent); },
    getComponent(key) { return key === 'orgbook' ? orgbookComponent : null; },
    checkValidity() { return true; },
    checkData() { return true; },
    data: {}
  };
  orgbookComponent.root = correctForm;
  wrapper.__vueParentComponent = { component: orgbookComponent };

  const wrongFormElement = {
    parentElement: null,
    __vueParentComponent: { formio: wrongForm }
  };
  const documentObject = {
    getElementById(id) { return id === wrapper.id ? wrapper : null; },
    querySelector(selector) { return selector === '#app' ? null : wrongFormElement; },
    querySelectorAll(selector) {
      return selector === '[ref="webform"], .formio-form' ? [wrongFormElement] : [];
    },
    body: { parentElement: null },
    documentElement: { parentElement: null }
  };
  const windowObject = {
    location: { href: 'https://chefs-test.apps.silver.devops.gov.bc.ca/app/form/submit' },
    postMessage(message) { postedMessages.push(message); },
    addEventListener(type, listener) {
      if (type === 'message') {
        this.__messageListener = listener;
      }
    }
  };
  const context = {
    window: windowObject,
    document: documentObject,
    URL,
    Promise,
    setTimeout,
    clearTimeout,
    File: class File {},
    Uint8Array,
    atob() { return ''; },
    console
  };
  vm.runInNewContext(bridgeSource, context, { filename: 'page-bridge.js' });

  const ping = await executeBridgeCommand(windowObject, postedMessages, 'PING', {}, 'ping');
  assert.equal(ping.ok, true, 'The wrong first Form.io root should still satisfy the initial bridge ping.');

  const response = await executeBridgeCommand(windowObject, postedMessages, 'SELECT_ORGBOOK_RESULT', {
    key: 'orgbook',
    wrapperId: wrapper.id,
    query: 'wonderful',
    preferredValue: 'WONDERFUL FLOORING'
  }, 'orgbook');
  assert.equal(response.ok, true, response.error || 'OrgBook bridge selection failed.');
  assert.equal(response.result.applied, true, 'The exact returned OrgBook value must be applied.');
  assert.equal(orgbookComponent.dataValue, 'WONDERFUL FLOORING');
  assert.ok(response.result.lookup.formRootCount >= 2, 'The bridge must report inspecting multiple Form.io roots.');
  assert.equal(response.result.lookup.wrapperMatched, true, 'The bridge must bind the selected instance to the rendered wrapper.');
}

verifyMultipleFormRootLookup()
  .then(() => {
    console.log('PASS FIELD-03 GRID-02: optional remote/map components require semantic selections, multiple Form.io roots resolve by rendered wrapper, Edit Grid rows are committed, and row actions cannot masquerade as form submission.');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
