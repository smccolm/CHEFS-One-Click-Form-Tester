'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..', '..');
const extensionRoot = path.join(projectRoot, 'output', 'chefs-one-click-form-tester');
const contentSource = fs.readFileSync(path.join(extensionRoot, 'content-script.js'), 'utf8');
const popupSource = fs.readFileSync(path.join(extensionRoot, 'popup.js'), 'utf8');
const serviceWorkerSource = fs.readFileSync(path.join(extensionRoot, 'service-worker.js'), 'utf8');

function sliceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

const pendingMethod = sliceBetween(contentSource, '    fileUploadPending(wrapper) {', '\n    inspectEmpty(wrapper, type) {');
const inspectSource = sliceBetween(contentSource, '    inspectEmpty(wrapper, type) {', '\n    isInvalid(wrapper) {');
const domUploadSource = sliceBetween(contentSource, '    async uploadFileByDomDrop(descriptor, file) {', '\n    async fillFile(descriptor) {');
const fillFileSource = sliceBetween(contentSource, '    async fillFile(descriptor) {', '\n    gridRows(wrapper, type) {');
const bridgeSource = sliceBetween(contentSource, '    bridgeCommand(command, payload, timeoutMs, allowUnready) {', '\n    async waitForForm() {');
const fillDescriptorSource = sliceBetween(contentSource, '    async fillDescriptor(descriptor) {', '\n    chooseStrategy(descriptor) {');
const stopSource = sliceBetween(contentSource, '    stop() {', '\n  }\n\n  const controller');
const finishStoppedSource = sliceBetween(contentSource, '    async finishStopped() {', '\n    stop() {');
const popupStopSource = sliceBetween(popupSource, 'async function stopRun() {', '\nasync function exportRun() {');
const backgroundStopSource = sliceBetween(serviceWorkerSource, 'async function stopRunInTab(tabId) {', '\nasync function startRunInTab(tabId) {');

const Harness = Function(
  'cleanText',
  'isVisible',
  `return class Harness {\n${pendingMethod}\n};`
)(
  (value) => String(value || '').replace(/\s+/g, ' ').trim(),
  (element) => element.visible !== false
);

const harness = new Harness();
const pendingIndicator = {
  visible: true,
  getAttribute() { return null; }
};
const pendingWrapper = {
  textContent: 'chefs-attachment.pdf Starting upload',
  querySelectorAll() { return [pendingIndicator]; }
};
const completeWrapper = {
  textContent: 'chefs-attachment.pdf 1.57 kB',
  querySelectorAll() { return []; }
};

assert.equal(harness.fileUploadPending(pendingWrapper), true,
  'A rendered filename with Starting upload must remain pending.');
assert.equal(harness.fileUploadPending(completeWrapper), false,
  'A stored file row without a progress indicator must be complete.');
assert.match(inspectSource, /uploadedFileRows\(wrapper\)\.length === 0 \|\| this\.fileUploadPending\(wrapper\)/,
  'File emptiness must include pending upload state.');

assert.match(contentSource, /uploadTimeoutMs:\s*20000/,
  'The upload wait must be bounded well below the previous 90-second stall.');
assert.match(domUploadSource, /Date\.now\(\) - pending\.startedAt < CONFIG\.uploadTimeoutMs/,
  'Repeated passes must share one cumulative upload deadline.');
assert.match(domUploadSource, /if \(this\.stopRequested\)[\s\S]*throw stoppedError\(\)/,
  'The DOM upload polling loop must be cooperatively cancellable.');
assert.match(domUploadSource, /const uploadPending = this\.fileUploadPending\(wrapper\)[\s\S]*if \(!uploadPending/,
  'A filename row must not complete the upload while progress remains visible.');

assert.ok(
  fillFileSource.indexOf('uploadFileByDomDrop(descriptor, file)') < fillFileSource.indexOf("bridgeCommand('UPLOAD_FILE'"),
  'The rendered drop path must run before the potentially blocking Form.io API path.'
);
assert.match(fillFileSource, /if \(!\/still pending\/i\.test/,
  'A timed-out pending DOM upload must not be redispatched through the API fallback.');
assert.match(fillFileSource, /UPLOAD_PENDING_TIMEOUT/,
  'A bounded pending upload must produce explicit diagnostic evidence.');

assert.match(bridgeSource, /this\.stopRequested[\s\S]*Promise\.reject\(stoppedError\(\)\)/,
  'New bridge operations must reject after cancellation.');
assert.match(fillDescriptorSource, /CHEFS_TESTER_STOPPED[\s\S]*throw error/,
  'Field handling must propagate cancellation instead of converting it to a fill failure.');
assert.match(stopSource, /this\.bridgeRequests\.values\(\)[\s\S]*pending\.reject\(error\)/,
  'Stop Run must reject every in-flight page-bridge wait.');
assert.match(stopSource, /this\.finishStopped\(\)/,
  'Stop Run must begin terminal finalization immediately.');
assert.match(finishStoppedSource, /this\.stopFinalizing \|\| !this\.running/,
  'Stopped finalization must be idempotent.');
assert.match(popupStopSource, /response\.ok[\s\S]*refreshStatus\(\)/,
  'The popup must require acknowledgement and refresh until the run leaves active state.');
assert.match(popupStopSource, /STOP_RUN_IN_TAB/,
  'The popup must route Stop Run through the background recovery path.');
assert.match(backgroundStopSource, /chrome\.tabs\.sendMessage[\s\S]*1500[\s\S]*status = 'stopped'/,
  'The background must request cooperative stop, then finalize an unresponsive or orphaned controller after a bounded wait.');
assert.match(backgroundStopSource, /finalizeRun\(runId, now\)/,
  'Background stop fallback must run the normal terminal post-processing path.');

console.log('PASS UPLOAD-01 STOP-01: pending file rows remain incomplete, upload waits are cumulative/bounded, and Stop Run interrupts bridge waits and finalizes promptly.');
