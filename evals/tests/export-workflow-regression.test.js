'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { TextDecoder, TextEncoder } = require('node:util');

const projectRoot = path.resolve(__dirname, '..', '..');
const extensionRoot = path.join(projectRoot, 'output', 'chefs-one-click-form-tester');
const exportPathSource = fs.readFileSync(path.join(extensionRoot, 'export-path.js'), 'utf8');
const dashboardModelSource = fs.readFileSync(path.join(extensionRoot, 'dashboard-model.js'), 'utf8');
const serviceWorkerSource = fs.readFileSync(path.join(extensionRoot, 'service-worker.js'), 'utf8');
const contentScriptSource = fs.readFileSync(path.join(extensionRoot, 'content-script.js'), 'utf8');
const optionsHtmlSource = fs.readFileSync(path.join(extensionRoot, 'options.html'), 'utf8');
const optionsSource = fs.readFileSync(path.join(extensionRoot, 'options.js'), 'utf8');

function createChromeHarness() {
  const storage = {};
  const downloads = [];
  const listeners = {};
  let downloadFailure = null;

  const chrome = {
    alarms: {
      get: async () => ({ name: 'chefsTesterWatchdog' }),
      create: async () => undefined,
      onAlarm: { addListener: (listener) => { listeners.alarm = listener; } }
    },
    downloads: {
      download: async (options) => {
        downloads.push(options);
        if (downloadFailure) {
          throw downloadFailure;
        }
        return downloads.length;
      }
    },
    runtime: {
      getURL: (relativePath) => `chrome-extension://fixture/${relativePath}`,
      onInstalled: { addListener: (listener) => { listeners.installed = listener; } },
      onStartup: { addListener: (listener) => { listeners.startup = listener; } },
      onMessage: { addListener: (listener) => { listeners.message = listener; } }
    },
    permissions: {
      contains: async () => true
    },
    scripting: {
      executeScript: async () => undefined
    },
    storage: {
      local: {
        get: async (keys) => {
          if (keys === null) {
            return Object.assign({}, storage);
          }
          const requested = Array.isArray(keys) ? keys : [keys];
          return Object.fromEntries(
            requested
              .filter((key) => Object.prototype.hasOwnProperty.call(storage, key))
              .map((key) => [key, storage[key]])
          );
        },
        set: async (values) => {
          Object.assign(storage, values);
        }
      }
    },
    tabs: {
      query: async () => [],
      create: async (options) => ({ id: 9000, ...options }),
      reload: async () => undefined,
      get: async (tabId) => ({ id: tabId, windowId: 1, url: 'https://chefs-uat.example/form' }),
      update: async (tabId, changes) => ({ id: tabId, ...changes }),
      captureVisibleTab: async () => 'data:image/png;base64,AA==',
      sendMessage: async () => ({ ok: true }),
      onCreated: { addListener: (listener) => { listeners.tabCreated = listener; } },
      onUpdated: { addListener: (listener) => { listeners.tabUpdated = listener; } },
      onRemoved: { addListener: (listener) => { listeners.tabRemoved = listener; } }
    }
  };

  const context = vm.createContext({
    atob,
    btoa,
    chrome,
    console,
    crypto: globalThis.crypto,
    Date,
    clearTimeout: () => undefined,
    setTimeout: () => 1,
    TextDecoder,
    TextEncoder,
    Uint8Array,
    URL
  });
  context.importScripts = () => undefined;
  vm.runInContext(exportPathSource, context, { filename: 'export-path.js' });
  vm.runInContext(dashboardModelSource, context, { filename: 'dashboard-model.js' });
  vm.runInContext(serviceWorkerSource, context, { filename: 'service-worker.js' });

  async function send(message, sender = {}) {
    return await new Promise((resolve) => {
      const keepAlive = listeners.message(message, sender, resolve);
      assert.equal(keepAlive, true, `Message ${message.type} did not keep its response channel alive.`);
    });
  }

  return {
    downloads,
    async runInstalled() {
      await listeners.installed();
    },
    send,
    setDownloadFailure(error) {
      downloadFailure = error;
    },
    storage
  };
}

function storedZipEntries(dataUrl) {
  const comma = dataUrl.indexOf(',');
  const bytes = Buffer.from(dataUrl.slice(comma + 1), 'base64');
  const entries = new Map();
  let offset = 0;
  while (offset + 30 <= bytes.length && bytes.readUInt32LE(offset) === 0x04034b50) {
    const compressedSize = bytes.readUInt32LE(offset + 18);
    const nameLength = bytes.readUInt16LE(offset + 26);
    const extraLength = bytes.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const name = bytes.subarray(nameStart, nameStart + nameLength).toString('utf8');
    entries.set(name, bytes.subarray(dataStart, dataStart + compressedSize).toString('utf8'));
    offset = dataStart + compressedSize;
  }
  return entries;
}

async function createRun(harness, runId, tabId) {
  const response = await harness.send({
    type: 'CREATE_RUN',
    runId,
    tabId,
    formTitle: 'Export regression fixture',
    formUrl: 'https://chefs-uat.example/form',
    formId: 'export-regression',
    startedAt: '2026-07-23T12:00:00.000Z'
  }, { tab: { id: tabId } });
  assert.equal(response.ok, true);
}

async function finalizeFixture(harness, runId, status, tabId) {
  await createRun(harness, runId, tabId);
  await harness.send({
    type: 'SET_SNAPSHOT',
    runId,
    name: 'final',
    snapshot: [{ key: `${runId}-final`, state: status }]
  });
  await harness.send({
    type: 'ADD_CHECKPOINT',
    runId,
    checkpoint: { reason: `${status} finalized`, status }
  });
  await harness.send({
    type: 'UPDATE_RUN',
    runId,
    patch: { status, statusLabel: status.replaceAll('_', ' ') }
  });
  return await harness.send({
    type: 'RUN_FINALIZED',
    runId,
    finalizedAt: '2026-07-23T12:01:00.000Z'
  });
}

(async () => {
  const pathContext = vm.createContext({});
  vm.runInContext(exportPathSource, pathContext, { filename: 'export-path.js' });
  const exportPath = pathContext.ChefsExportPath;

  assert.equal(exportPath.normalizeExportFolder(''), '');
  assert.equal(exportPath.normalizeExportFolder('CHEFS Exports'), 'CHEFS Exports');
  assert.equal(exportPath.normalizeExportFolder('CHEFS\\UAT'), 'CHEFS/UAT');
  assert.equal(exportPath.joinExportPath('', 'run.zip'), 'run.zip');
  assert.equal(exportPath.joinExportPath('CHEFS Exports', 'run.zip'), 'CHEFS Exports/run.zip');
  for (const rejected of [
    'C:\\Evidence',
    '\\\\server\\share',
    '/absolute',
    '../feedback',
    'folder/../feedback',
    'folder//feedback',
    'folder/',
    'bad:name',
    'trailing.',
    'CON'
  ]) {
    assert.throws(
      () => exportPath.normalizeExportFolder(rejected),
      `Unsafe export folder was accepted: ${rejected}`
    );
  }

  assert.match(optionsHtmlSource, /<label for="exportFolder">Export Folder<\/label>/);
  assert.match(optionsHtmlSource, /Leave blank to save exports directly to the browser's Downloads folder/);
  assert.match(optionsHtmlSource, /Automatically export after each run/);
  assert.doesNotMatch(optionsHtmlSource, /id="exportFolder"[^>]*\svalue=/);
  assert.match(optionsSource, /exportFolder:\s*''/);
  assert.match(optionsSource, /autoExportAfterRun:\s*false/);

  const successFinalSnapshot = contentScriptSource.indexOf("await this.setSnapshot('final'");
  const successCheckpoint = contentScriptSource.indexOf("await this.checkpoint('Submission success detected'");
  const successFinalizedSignal = contentScriptSource.indexOf("type: 'RUN_FINALIZED'", successCheckpoint);
  assert.ok(successFinalSnapshot >= 0, 'The final success snapshot call is missing.');
  assert.ok(successCheckpoint > successFinalSnapshot, 'The success checkpoint must follow the final snapshot.');
  assert.ok(successFinalizedSignal > successCheckpoint, 'Success RUN_FINALIZED must follow the success checkpoint.');

  const failStart = contentScriptSource.indexOf('    async failRun(');
  const failEnd = contentScriptSource.indexOf('    async finishStopped()', failStart);
  const failSource = contentScriptSource.slice(failStart, failEnd);
  const failureFinalSnapshot = failSource.indexOf("await this.setSnapshot('final'");
  const failureRecord = failSource.indexOf("type: 'SET_FAILURE'");
  const failureCheckpoint = failSource.indexOf("await this.checkpoint('Run failure finalized'");
  const failureFinalizedSignal = failSource.indexOf("type: 'RUN_FINALIZED'");
  assert.ok(failureFinalSnapshot >= 0, 'The final failure snapshot call is missing.');
  assert.ok(failureRecord > failureFinalSnapshot, 'Failure persistence must follow the final snapshot.');
  assert.ok(failureCheckpoint > failureRecord, 'The failure checkpoint must follow failure persistence and screenshot capture.');
  assert.ok(failureFinalizedSignal > failureCheckpoint, 'Failure RUN_FINALIZED must follow the failure checkpoint.');

  const stoppedStart = failEnd;
  const stoppedEnd = contentScriptSource.indexOf('    stop() {', stoppedStart);
  const stoppedSource = contentScriptSource.slice(stoppedStart, stoppedEnd);
  assert.ok(stoppedSource.indexOf("await this.setSnapshot('final'") >= 0);
  assert.ok(
    stoppedSource.indexOf("type: 'RUN_FINALIZED'") >
      stoppedSource.indexOf("await this.checkpoint('Stopped run finalized'")
  );

  const watchdogStart = serviceWorkerSource.indexOf('async function detectStaleRuns()');
  const watchdogEnd = serviceWorkerSource.indexOf('chrome.alarms.onAlarm', watchdogStart);
  const watchdogSource = serviceWorkerSource.slice(watchdogStart, watchdogEnd);
  assert.ok(watchdogSource.indexOf('await setSnapshot(') > watchdogSource.indexOf('await setFailure('));
  assert.ok(watchdogSource.indexOf('await addCheckpoint(') > watchdogSource.indexOf('await setSnapshot('));
  assert.ok(watchdogSource.indexOf('await finalizeRun(') > watchdogSource.indexOf('await addCheckpoint('));

  const harness = createChromeHarness();
  harness.storage.chefsTesterSettings = {
    rowsPerGrid: 2,
    captureScreenshot: true,
    exportSubfolder: 'legacy-machine-specific-folder',
    autoExportAfterSubmit: true
  };
  await harness.runInstalled();
  const migrated = harness.storage.chefsTesterSettings;
  assert.equal(migrated.exportFolder, '');
  assert.equal(migrated.autoExportAfterRun, true);
  assert.equal(Object.prototype.hasOwnProperty.call(migrated, 'exportSubfolder'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(migrated, 'autoExportAfterSubmit'), false);

  harness.storage.chefsTesterSettings = {
    exportFolder: '',
    autoExportAfterRun: true,
    captureScreenshot: true
  };

  await createRun(harness, 'AUTO001', 41);
  await harness.send({
    type: 'UPDATE_RUN',
    runId: 'AUTO001',
    patch: {
      status: 'submitted',
      statusLabel: 'Submitted',
      confirmationId: 'CONF-001'
    }
  });
  assert.equal(harness.downloads.length, 0, 'Submitted status triggered export before finalization.');
  await harness.send({
    type: 'SET_SNAPSHOT',
    runId: 'AUTO001',
    name: 'final',
    snapshot: [{ key: 'finalField', state: 'filled' }]
  });
  await harness.send({
    type: 'ADD_CHECKPOINT',
    runId: 'AUTO001',
    checkpoint: { reason: 'Submission success detected', confirmationId: 'CONF-001' }
  });
  const finalized = await harness.send({
    type: 'RUN_FINALIZED',
    runId: 'AUTO001',
    finalizedAt: '2026-07-23T12:01:00.000Z'
  });

  assert.equal(finalized.ok, true);
  assert.equal(finalized.run.status, 'submitted');
  assert.equal(finalized.run.exportState.automatic.status, 'succeeded');
  assert.equal(harness.downloads.length, 1);
  assert.equal(harness.downloads[0].saveAs, false);
  assert.equal(harness.downloads[0].conflictAction, 'uniquify');
  assert.match(
    harness.downloads[0].filename,
    /^chefs-one-click-tester-v0\.4\.9-build-2026\.08\.28\.23-run-AUTO001-/
  );
  assert.equal(harness.downloads[0].filename.includes('/'), false, 'Blank Export Folder did not route directly to Downloads.');

  const successEntries = storedZipEntries(harness.downloads[0].url);
  assert.deepEqual(JSON.parse(successEntries.get('final-components.json')), [{ key: 'finalField', state: 'filled' }]);
  assert.match(successEntries.get('checkpoints.jsonl'), /Submission success detected/);
  const successManifest = JSON.parse(successEntries.get('manifest.json'));
  assert.equal(successManifest.finalizedAt, '2026-07-23T12:01:00.000Z');
  assert.equal(successManifest.result, 'submitted');

  await harness.send({
    type: 'RUN_FINALIZED',
    runId: 'AUTO001',
    finalizedAt: '2026-07-23T12:02:00.000Z'
  });
  assert.equal(harness.downloads.length, 1, 'Duplicate finalization triggered a duplicate automatic export.');

  await createRun(harness, 'FAILED01', 42);
  await harness.send({
    type: 'SET_SNAPSHOT',
    runId: 'FAILED01',
    name: 'final',
    snapshot: [{ key: 'failedField', state: 'invalid' }]
  });
  await harness.send({
    type: 'SET_FAILURE',
    runId: 'FAILED01',
    status: 'failed',
    statusLabel: 'Failed',
    failure: { message: 'Representative failure', reason: 'Regression fixture' }
  }, { tab: { id: 42 } });
  await harness.send({
    type: 'ADD_CHECKPOINT',
    runId: 'FAILED01',
    checkpoint: { reason: 'Run failure finalized', status: 'failed' }
  });
  const failedRun = await harness.send({
    type: 'RUN_FINALIZED',
    runId: 'FAILED01',
    finalizedAt: '2026-07-23T12:03:00.000Z'
  });
  assert.equal(failedRun.run.status, 'failed');
  assert.equal(failedRun.run.exportState.automatic.status, 'succeeded');
  assert.equal(harness.downloads.length, 2);
  const failureEntries = storedZipEntries(harness.downloads[1].url);
  assert.equal(JSON.parse(failureEntries.get('failure.json')).message, 'Representative failure');
  assert.deepEqual(JSON.parse(failureEntries.get('final-components.json')), [{ key: 'failedField', state: 'invalid' }]);
  assert.match(failureEntries.get('checkpoints.jsonl'), /Run failure finalized/);
  assert.ok(failureEntries.has('failure-screenshot.png'), 'Failure screenshot was not present before automatic export.');

  const remainingTerminalStatuses = ['completed', 'stalled', 'blocked', 'safety_stop', 'stopped'];
  for (let index = 0; index < remainingTerminalStatuses.length; index += 1) {
    const status = remainingTerminalStatuses[index];
    const before = harness.downloads.length;
    const response = await finalizeFixture(harness, `TERM${index}`, status, 50 + index);
    assert.equal(response.run.status, status);
    assert.equal(response.run.exportState.automatic.status, 'succeeded');
    assert.equal(harness.downloads.length, before + 1, `${status} did not trigger exactly one automatic export.`);
  }

  const beforeNonTerminal = harness.downloads.length;
  await createRun(harness, 'ACTIVE01', 60);
  await harness.send({ type: 'RUN_FINALIZED', runId: 'ACTIVE01' });
  assert.equal(harness.downloads.length, beforeNonTerminal, 'A non-terminal run triggered automatic export.');

  harness.storage.chefsTesterSettings = {
    exportFolder: 'CHEFS Exports',
    autoExportAfterRun: false
  };
  const manual = await harness.send({ type: 'EXPORT_RUN', runId: 'FAILED01' });
  assert.equal(manual.ok, true);
  assert.equal(harness.downloads.at(-1).saveAs, true);
  assert.match(manual.downloadPath, /^CHEFS Exports\/chefs-one-click-tester-/);

  harness.storage.chefsTesterSettings = {
    exportFolder: '',
    autoExportAfterRun: true
  };
  harness.setDownloadFailure(new Error('Managed download policy rejected the destination.'));
  await createRun(harness, 'AUTOFAIL', 70);
  await harness.send({
    type: 'UPDATE_RUN',
    runId: 'AUTOFAIL',
    patch: { status: 'blocked', statusLabel: 'Blocked' }
  });
  const failedExport = await harness.send({ type: 'RUN_FINALIZED', runId: 'AUTOFAIL' });
  assert.equal(failedExport.ok, true);
  assert.equal(failedExport.run.status, 'blocked');
  assert.equal(failedExport.run.exportState.automatic.status, 'failed');
  assert.match(failedExport.run.exportState.automatic.error, /Managed download policy/);

  console.log('PASS EXPORT-01 EXPORT-02 EXPORT-03: portable blank defaults, path safety, manual routing, all finalized terminal outcomes, success/failure ZIP evidence, idempotency, and failure isolation verified.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
