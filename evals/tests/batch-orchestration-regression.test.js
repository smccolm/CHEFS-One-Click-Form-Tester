'use strict';

// Verifies BATCH-01 through BATCH-06 and UX-02.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const { TextDecoder, TextEncoder } = require('node:util');

const projectRoot = path.resolve(__dirname, '..', '..');
const extensionRoot = path.join(projectRoot, 'output', 'chefs-one-click-form-tester');
const exportPathSource = fs.readFileSync(path.join(extensionRoot, 'export-path.js'), 'utf8');
const dashboardModelSource = fs.readFileSync(path.join(extensionRoot, 'dashboard-model.js'), 'utf8');
const serviceWorkerSource = fs.readFileSync(path.join(extensionRoot, 'service-worker.js'), 'utf8');
const optionsSource = fs.readFileSync(path.join(extensionRoot, 'options.js'), 'utf8');
const optionsHtmlSource = fs.readFileSync(path.join(extensionRoot, 'options.html'), 'utf8');
const popupSource = fs.readFileSync(path.join(extensionRoot, 'popup.js'), 'utf8');
const popupHtmlSource = fs.readFileSync(path.join(extensionRoot, 'popup.html'), 'utf8');
const popupCssSource = fs.readFileSync(path.join(extensionRoot, 'popup.css'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(extensionRoot, 'manifest.json'), 'utf8'));
const launcherPath = path.join(projectRoot, 'run-regression-suite.cmd');
const launcherSource = fs.readFileSync(launcherPath, 'utf8');

const TEST_ORIGIN = 'https://chefs-test.apps.silver.devops.gov.bc.ca';
const TEST_PERMISSION = 'https://chefs-test.apps.silver.devops.gov.bc.ca/*';
const TOKEN = 'a'.repeat(64);

function markedUrl(formId, index, token = TOKEN, origin = TEST_ORIGIN, suite = 'suite001') {
  return `${origin}/app/form/submit?f=${formId}` +
    `#chefs-one-click-batch=${token}&suite=${suite}&index=${index}`;
}

function createHarness(shared = {}) {
  const storage = shared.storage || {};
  const tabs = shared.tabs || new Map();
  const listeners = {};
  const starts = [];
  const stops = [];
  const activations = [];
  const downloads = [];
  const createdTabs = [];
  const reloadedTabs = [];
  const grantedPermissions = shared.grantedPermissions || new Set([TEST_PERMISSION]);
  const formReady = shared.formReady || new Map();
  const controllerStatuses = shared.controllerStatuses || new Map();
  const scheduledDelays = [];

  const chrome = {
    alarms: {
      get: async () => ({ name: 'chefsTesterWatchdog' }),
      create: async () => undefined,
      onAlarm: { addListener: (listener) => { listeners.alarm = listener; } }
    },
    downloads: {
      download: async (options) => {
        downloads.push(options);
        return downloads.length;
      }
    },
    permissions: {
      contains: async ({ origins }) => origins.every((origin) => grantedPermissions.has(origin))
    },
    runtime: {
      getURL: (relativePath) => `chrome-extension://fixture/${relativePath}`,
      onInstalled: { addListener: (listener) => { listeners.installed = listener; } },
      onStartup: { addListener: (listener) => { listeners.startup = listener; } },
      onMessage: { addListener: (listener) => { listeners.message = listener; } }
    },
    scripting: {
      executeScript: async (options) => {
        if (options.func && !options.args) {
          const configured = formReady.get(options.target.tabId);
          if (configured && typeof configured === 'object') {
            return [{ result: configured }];
          }
          const ready = configured !== false;
          return [{
            result: {
              ready,
              stable: ready,
              componentCount: ready ? 2 : 0,
              interactiveCount: ready ? 2 : 0
            }
          }];
        }
        return [{ result: true }];
      }
    },
    storage: {
      local: {
        get: async (keys) => {
          if (keys === null) {
            return { ...storage };
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
      query: async ({ url }) => Array.from(tabs.values())
        .filter((tab) => String(tab.url || '').startsWith(String(url || '').replace(/\*$/, ''))),
      create: async (options) => {
        const tab = { id: 9000 + createdTabs.length, ...options };
        createdTabs.push(tab);
        tabs.set(tab.id, tab);
        return tab;
      },
      reload: async (tabId) => {
        reloadedTabs.push(tabId);
      },
      get: async (tabId) => {
        if (!tabs.has(tabId)) {
          throw new Error(`Tab ${tabId} is closed.`);
        }
        return tabs.get(tabId);
      },
      update: async (tabId, changes) => {
        activations.push({ tabId, changes });
        return { ...tabs.get(tabId), ...changes };
      },
      captureVisibleTab: async () => 'data:image/png;base64,AA==',
      sendMessage: async (tabId, message) => {
        if (message.type === 'CHEFS_TESTER_START') {
          starts.push(tabId);
          return { ok: true, runId: `BATCH${tabId}` };
        }
        if (message.type === 'CHEFS_TESTER_STOP') {
          stops.push(tabId);
          return { ok: true };
        }
        if (message.type === 'CHEFS_TESTER_STATUS') {
          return controllerStatuses.get(tabId) || { running: false };
        }
        return { ok: true };
      },
      onCreated: { addListener: (listener) => { listeners.tabCreated = listener; } },
      onUpdated: { addListener: (listener) => { listeners.tabUpdated = listener; } },
      onRemoved: { addListener: (listener) => { listeners.tabRemoved = listener; } }
    }
  };

  const context = vm.createContext({
    atob,
    btoa,
    chrome,
    clearTimeout: () => undefined,
    console,
    crypto: webcrypto,
    Date,
    setTimeout: (callback, delay) => {
      scheduledDelays.push(delay);
      return scheduledDelays.length;
    },
    TextDecoder,
    TextEncoder,
    Uint8Array,
    URL,
    URLSearchParams
  });
  context.importScripts = () => undefined;
  vm.runInContext(exportPathSource, context, { filename: 'export-path.js' });
  vm.runInContext(dashboardModelSource, context, { filename: 'dashboard-model.js' });
  vm.runInContext(serviceWorkerSource, context, { filename: 'service-worker.js' });

  async function call(expression, values = {}) {
    Object.assign(context, values);
    return await vm.runInContext(expression, context);
  }

  async function send(message, sender = {}) {
    return await new Promise((resolve) => {
      const keepAlive = listeners.message(message, sender, resolve);
      assert.equal(keepAlive, true);
    });
  }

  return {
    activations,
    call,
    createdTabs,
    downloads,
    controllerStatuses,
    formReady,
    grantedPermissions,
    listeners,
    send,
    scheduledDelays,
    reloadedTabs,
    starts,
    stops,
    storage,
    tabs
  };
}

function configure(harness, overrides = {}) {
  harness.storage.chefsTesterSettings = {
    rowsPerGrid: 2,
    captureScreenshot: true,
    allowProduction: false,
    additionalHosts: [],
    exportFolder: '',
    autoExportAfterRun: true,
    batchLauncherEnabled: true,
    batchLauncherToken: TOKEN,
    batchOrigins: [TEST_ORIGIN],
    openDashboardAfterCompletion: false,
    retainDashboardHistory: false,
    dashboardDefaultView: 'simple',
    ...overrides
  };
}

async function upsert(harness, tab, ready = true) {
  harness.tabs.set(tab.id, tab);
  return await harness.call('upsertBatchTab(__tab, __ready)', {
    __tab: tab,
    __ready: ready
  });
}

async function state(harness) {
  return await harness.call('getBatchState()');
}

async function createAndFinalizeRun(harness, tabId, status) {
  const runId = `BATCH${tabId}`;
  const created = await harness.send({
    type: 'CREATE_RUN',
    runId,
    tabId,
    formTitle: 'Batch fixture',
    formUrl: harness.tabs.get(tabId).url,
    formId: `fixture-${tabId}`,
    startedAt: '2026-07-23T20:00:00.000Z'
  }, { tab: { id: tabId } });
  assert.equal(created.ok, true);
  await harness.send({
    type: 'SET_SNAPSHOT',
    runId,
    name: 'final',
    snapshot: [{ key: 'final', state: status }]
  });
  await harness.send({
    type: 'ADD_CHECKPOINT',
    runId,
    checkpoint: { reason: 'Batch fixture finalized', status }
  });
  await harness.send({
    type: 'UPDATE_RUN',
    runId,
    patch: { status, statusLabel: status }
  });
  return await harness.send({
    type: 'RUN_FINALIZED',
    runId,
    finalizedAt: '2026-07-23T20:01:00.000Z'
  });
}

(async () => {
  assert.equal(manifest.version, '0.4.9');
  assert.equal(manifest.version_name, '0.4.9 build 2026.08.28.23');
  assert.ok(manifest.permissions.includes('tabs'));
  assert.ok(manifest.optional_host_permissions.includes('https://*/*'));
  assert.match(optionsHtmlSource, /Batch regression launcher/);
  assert.match(optionsHtmlSource, /id="batchLauncherEnabled"/);
  assert.match(optionsHtmlSource, /id="batchLauncherToken"/);
  assert.match(optionsHtmlSource, /id="batchOrigins"/);
  assert.match(optionsSource, /batchLauncherEnabled:\s*false/);
  assert.match(optionsSource, /chrome\.permissions\.request/);
  assert.match(popupHtmlSource, /Stop Batch/);
  assert.match(popupSource, /GET_BATCH_STATE/);
  assert.match(popupSource, /STOP_BATCH/);
  assert.match(popupHtmlSource, /id="settingsButton" class="full-width"/);
  assert.match(popupHtmlSource, /id="dashboardButton" class="full-width"/);
  assert.match(popupHtmlSource, /id="stopBatchButton" class="danger full-width hidden"/);
  assert.match(popupCssSource, /\.secondary-actions \.full-width\s*\{\s*grid-column:\s*1\s*\/\s*-1;/);
  assert.match(popupSource, /Preparing marked tabs/);
  assert.match(popupSource, /waiting for CHEFS form/);

  assert.equal(path.dirname(launcherPath), projectRoot);
  assert.match(
    launcherSource,
    /LAUNCHER_TOKEN=(?:PASTE_TOKEN_FROM_EXTENSION_SETTINGS_HERE|[A-Za-z0-9_-]{16,128})/
  );
  assert.match(launcherSource, /#chefs-one-click-batch=%LAUNCHER_TOKEN%&suite=%SUITE_ID%&index=%FORM_INDEX%/);
  assert.match(launcherSource, /--profile-directory="%CHROME_PROFILE%"/);
  const embeddedForms = Array.from(
    launcherSource.matchAll(/call :OPEN_FORM "(\d{3})" "([^"]+)"/g),
    (match) => [match[1], match[2]]
  );
  assert.deepEqual(embeddedForms, [
    ['001', `${TEST_ORIGIN}/app/form/submit?f=8e1678c7-5f1e-4f9b-b9e4-87a81d0ecd7f`],
    ['002', `${TEST_ORIGIN}/app/form/submit?f=13d98806-cf0a-4e96-a396-f98322220ca2`],
    ['003', `${TEST_ORIGIN}/app/form/submit?f=6f3fe864-8942-4849-9396-0c343e24a72d`],
    ['004', `${TEST_ORIGIN}/app/form/submit?f=90d32c33-4932-4de3-adaa-ea3d5998059e`],
    ['005', `${TEST_ORIGIN}/app/form/submit?f=8a1aae54-f534-4207-b3f7-e8c1f61c337e`],
    ['006', `${TEST_ORIGIN}/app/form/submit?f=34a28edb-251d-4f94-80ac-89c42e68e17c`],
    ['007', `${TEST_ORIGIN}/app/form/submit?f=55d5a529-3687-4726-8c09-3f8aa6ae2431`],
    ['008', `${TEST_ORIGIN}/app/form/submit?f=b73a4e19-d607-4c4e-be7c-6cac281b099f`]
  ]);
  assert.doesNotMatch(launcherSource, /chrome-extension:\/\//);

  const sequential = createHarness();
  configure(sequential);
  await upsert(sequential, {
    id: 102,
    windowId: 1,
    status: 'complete',
    url: markedUrl('form-two', '002')
  });
  assert.equal(sequential.scheduledDelays.at(-1), 1500);
  await upsert(sequential, {
    id: 101,
    windowId: 1,
    status: 'complete',
    url: markedUrl('form-one', '001')
  });
  await sequential.call('processBatchQueue()');
  let current = await state(sequential);
  assert.equal(current.active.tabId, 101);
  assert.doesNotMatch(current.active.url, /chefs-one-click-batch|suite=|index=/);
  assert.deepEqual(sequential.starts, [101]);
  assert.equal(current.queue.length, 1);
  assert.equal(current.queue[0].tabId, 102);
  assert.equal(sequential.activations[0].tabId, 101);

  const finalized = await createAndFinalizeRun(sequential, 101, 'submitted');
  assert.equal(finalized.ok, true);
  assert.equal(sequential.downloads.length, 1);
  current = await state(sequential);
  assert.equal(current.active, null);
  assert.equal(current.completed.at(-1).tabId, 101);
  assert.equal(current.completed.at(-1).exportStatus, 'succeeded');

  const restarted = createHarness({
    storage: sequential.storage,
    tabs: sequential.tabs,
    grantedPermissions: sequential.grantedPermissions
  });
  await restarted.call('processBatchQueue()');
  current = await state(restarted);
  assert.equal(current.active.tabId, 102);
  assert.deepEqual(restarted.starts, [102]);

  const readiness = createHarness({
    formReady: new Map([[601, {
      ready: false,
      stable: false,
      componentCount: 0,
      interactiveCount: 0
    }]])
  });
  configure(readiness);
  await upsert(readiness, {
    id: 601,
    status: 'complete',
    url: markedUrl('slow-form', '001', TOKEN, TEST_ORIGIN, 'readiness001')
  });
  await readiness.call('processBatchQueue()');
  current = await state(readiness);
  assert.equal(current.active.status, 'waiting_for_form');
  assert.equal(current.active.readinessComponentCount, 0);
  assert.equal(current.active.readinessInteractiveCount, 0);
  assert.deepEqual(readiness.starts, []);
  readiness.formReady.set(601, {
    ready: true,
    stable: true,
    componentCount: 12,
    interactiveCount: 8
  });
  await readiness.call('processBatchQueue()');
  current = await state(readiness);
  assert.equal(current.active.status, 'running');
  assert.equal(current.active.readinessComponentCount, 12);
  assert.equal(current.active.readinessInteractiveCount, 8);
  assert.deepEqual(readiness.starts, [601]);

  const readinessTimeout = createHarness({
    formReady: new Map([[611, false], [612, true]])
  });
  configure(readinessTimeout);
  await upsert(readinessTimeout, {
    id: 611,
    status: 'complete',
    url: markedUrl('never-ready', '001', TOKEN, TEST_ORIGIN, 'readiness002')
  });
  await upsert(readinessTimeout, {
    id: 612,
    status: 'complete',
    url: markedUrl('ready-next', '002', TOKEN, TEST_ORIGIN, 'readiness002')
  });
  await readinessTimeout.call('processBatchQueue()');
  readinessTimeout.storage.chefsTesterBatchQueue.active.readinessStartedAt =
    Date.now() - 46000;
  await readinessTimeout.call('processBatchQueue()');
  current = await state(readinessTimeout);
  assert.equal(current.completed.at(-1).status, 'form_not_ready');
  assert.equal(current.active.tabId, 612);
  assert.deepEqual(readinessTimeout.starts, [612]);

  const longRunning = createHarness();
  configure(longRunning);
  await upsert(longRunning, {
    id: 701,
    status: 'complete',
    url: markedUrl('long-running', '001', TOKEN, TEST_ORIGIN, 'long001')
  });
  await upsert(longRunning, {
    id: 702,
    status: 'complete',
    url: markedUrl('must-wait', '002', TOKEN, TEST_ORIGIN, 'long001')
  });
  await longRunning.call('processBatchQueue()');
  await longRunning.send({
    type: 'CREATE_RUN',
    runId: 'BATCH701',
    tabId: 701,
    formTitle: 'Long-running fixture',
    formUrl: longRunning.tabs.get(701).url,
    formId: 'long-running',
    startedAt: '2026-07-23T20:20:00.000Z'
  }, { tab: { id: 701 } });
  await longRunning.send({
    type: 'UPDATE_RUN',
    runId: 'BATCH701',
    patch: {
      status: 'filling',
      currentAction: 'Filling a slow advanced select'
    }
  });
  longRunning.storage.chefsTesterBatchQueue.active.startedAt = Date.now() - 120000;
  await longRunning.call('processBatchQueue()');
  current = await state(longRunning);
  assert.equal(current.active.tabId, 701);
  assert.equal(current.queue[0].tabId, 702);
  assert.deepEqual(longRunning.starts, [701]);

  longRunning.storage['chefsTesterRun:BATCH701'].updatedAt = '2000-01-01T00:00:00.000Z';
  longRunning.controllerStatuses.set(701, {
    running: true,
    runId: 'BATCH701',
    currentAction: 'Waiting for a slow advanced select',
    progress: { pass: 13, filled: 54 }
  });
  await longRunning.call('detectStaleRuns()');
  assert.equal(longRunning.storage['chefsTesterRun:BATCH701'].status, 'filling');
  assert.equal(
    longRunning.storage['chefsTesterRun:BATCH701'].currentAction,
    'Waiting for a slow advanced select'
  );
  assert.ok(
    longRunning.storage['chefsTesterRun:BATCH701'].watchdogState.lastResponsiveProbeAt
  );

  const interrupted = createHarness();
  configure(interrupted);
  await upsert(interrupted, {
    id: 501,
    status: 'complete',
    url: markedUrl('interrupted-export', '001', TOKEN, TEST_ORIGIN, 'restart001')
  });
  await upsert(interrupted, {
    id: 502,
    status: 'complete',
    url: markedUrl('after-interruption', '002', TOKEN, TEST_ORIGIN, 'restart001')
  });
  await interrupted.call('processBatchQueue()');
  await interrupted.send({
    type: 'CREATE_RUN',
    runId: 'BATCH501',
    tabId: 501,
    formTitle: 'Interrupted export fixture',
    formUrl: interrupted.tabs.get(501).url,
    formId: 'interrupted-export',
    startedAt: '2026-07-23T20:10:00.000Z'
  }, { tab: { id: 501 } });
  await interrupted.send({
    type: 'UPDATE_RUN',
    runId: 'BATCH501',
    patch: {
      status: 'submitted',
      exportState: {
        automatic: {
          status: 'pending',
          requestedAt: '2026-07-23T20:11:00.000Z'
        }
      }
    }
  });
  const recovered = createHarness({
    storage: interrupted.storage,
    tabs: interrupted.tabs,
    grantedPermissions: interrupted.grantedPermissions
  });
  await recovered.call('processBatchQueue()');
  assert.equal(
    recovered.storage['chefsTesterRun:BATCH501'].exportState.automatic.status,
    'failed'
  );
  assert.match(
    recovered.storage['chefsTesterRun:BATCH501'].exportState.automatic.error,
    /background worker restarted/
  );
  assert.deepEqual(recovered.starts, [502]);

  const wrongToken = createHarness();
  configure(wrongToken);
  await upsert(wrongToken, {
    id: 301,
    status: 'complete',
    url: markedUrl('wrong-token', '001', 'b'.repeat(64))
  });
  assert.equal((await state(wrongToken)).queue.length, 0);
  assert.equal((await state(wrongToken)).completed.length, 0);

  const wrongOrigin = createHarness();
  configure(wrongOrigin);
  await upsert(wrongOrigin, {
    id: 302,
    status: 'complete',
    url: markedUrl('wrong-origin', '001', TOKEN, 'https://chefs-test.other.example')
  });
  assert.equal((await state(wrongOrigin)).completed.at(-1).status, 'launcher_rejected');
  assert.doesNotMatch(
    (await state(wrongOrigin)).completed.at(-1).url,
    /chefs-one-click-batch|suite=|index=/
  );

  const noPermission = createHarness({ grantedPermissions: new Set() });
  configure(noPermission);
  await upsert(noPermission, {
    id: 303,
    status: 'complete',
    url: markedUrl('no-permission', '001')
  });
  assert.match((await state(noPermission)).completed.at(-1).error, /host access/i);

  const production = createHarness({
    grantedPermissions: new Set(['https://chefs.gov.bc.ca/*'])
  });
  configure(production, { batchOrigins: ['https://chefs.gov.bc.ca'] });
  await upsert(production, {
    id: 304,
    status: 'complete',
    url: markedUrl('production', '001', TOKEN, 'https://chefs.gov.bc.ca')
  });
  assert.equal((await state(production)).completed.at(-1).status, 'launcher_rejected');

  const stoppable = createHarness();
  configure(stoppable);
  await upsert(stoppable, {
    id: 401,
    status: 'complete',
    url: markedUrl('stop-active', '001', TOKEN, TEST_ORIGIN, 'stop001')
  });
  await upsert(stoppable, {
    id: 402,
    status: 'complete',
    url: markedUrl('stop-queued', '002', TOKEN, TEST_ORIGIN, 'stop001')
  });
  await stoppable.call('processBatchQueue()');
  const stopped = await stoppable.send({ type: 'STOP_BATCH' });
  assert.equal(stopped.ok, true);
  assert.deepEqual(stoppable.stops, [401]);
  assert.equal(stopped.state.queue.length, 0);
  assert.equal(stopped.state.active.tabId, 401);
  assert.ok(stopped.state.active.stopRequestedAt);
  assert.equal(stopped.state.completed.at(-1).status, 'stopped_before_start');

  await stoppable.call('handleBatchTabRemoved(401)');
  current = await state(stoppable);
  assert.equal(current.active, null);
  assert.equal(current.completed.at(-1).status, 'tab_closed');

  const singletonDashboard = createHarness();
  configure(singletonDashboard, {
    autoExportAfterRun: false,
    openDashboardAfterCompletion: true
  });
  singletonDashboard.tabs.set(801, {
    id: 801,
    windowId: 1,
    status: 'complete',
    url: `${TEST_ORIGIN}/app/form/submit?f=11111111-1111-4111-8111-111111111111`
  });
  await createAndFinalizeRun(singletonDashboard, 801, 'submitted');
  assert.equal(singletonDashboard.createdTabs.length, 1);
  assert.equal(
    singletonDashboard.createdTabs[0].url,
    'chrome-extension://fixture/dashboard.html'
  );
  await singletonDashboard.send({
    type: 'RUN_FINALIZED',
    runId: 'BATCH801',
    finalizedAt: '2026-07-23T20:01:00.000Z'
  });
  assert.equal(singletonDashboard.createdTabs.length, 1);
  assert.deepEqual(singletonDashboard.reloadedTabs, []);
  assert.equal(singletonDashboard.storage.chefsTesterDashboardHistory.length, 0);
  singletonDashboard.storage.chefsTesterDashboardHistory = [
    singletonDashboard.storage.chefsTesterDashboardState.runs[0]
  ];
  singletonDashboard.tabs.set(803, {
    id: 803,
    windowId: 1,
    status: 'complete',
    url: `${TEST_ORIGIN}/app/form/submit?f=55555555-5555-4555-8555-555555555555`
  });
  await createAndFinalizeRun(singletonDashboard, 803, 'submitted');
  assert.equal(singletonDashboard.storage.chefsTesterDashboardHistory.length, 0);

  const retainedDashboard = createHarness();
  configure(retainedDashboard, {
    autoExportAfterRun: false,
    retainDashboardHistory: true
  });
  retainedDashboard.tabs.set(804, {
    id: 804,
    windowId: 1,
    status: 'complete',
    url: `${TEST_ORIGIN}/app/form/submit?f=66666666-6666-4666-8666-666666666666`
  });
  await createAndFinalizeRun(retainedDashboard, 804, 'submitted');
  assert.equal(retainedDashboard.storage.chefsTesterDashboardHistory.length, 1);
  const clearedDashboard = await retainedDashboard.send({ type: 'CLEAR_DASHBOARD_HISTORY' });
  assert.equal(clearedDashboard.ok, true);
  assert.equal(retainedDashboard.storage.chefsTesterDashboardHistory.length, 0);

  const reusedDashboard = createHarness();
  configure(reusedDashboard, {
    autoExportAfterRun: false,
    openDashboardAfterCompletion: true
  });
  reusedDashboard.tabs.set(8800, {
    id: 8800,
    windowId: 1,
    status: 'complete',
    url: 'chrome-extension://fixture/dashboard.html'
  });
  reusedDashboard.tabs.set(802, {
    id: 802,
    windowId: 1,
    status: 'complete',
    url: `${TEST_ORIGIN}/app/form/submit?f=22222222-2222-4222-8222-222222222222`
  });
  await createAndFinalizeRun(reusedDashboard, 802, 'failed');
  assert.equal(reusedDashboard.createdTabs.length, 0);
  assert.deepEqual(reusedDashboard.reloadedTabs, [8800]);
  assert.ok(reusedDashboard.activations.some(({ tabId }) => tabId === 8800));

  const batchDashboard = createHarness();
  configure(batchDashboard, {
    autoExportAfterRun: false,
    openDashboardAfterCompletion: true
  });
  await upsert(batchDashboard, {
    id: 811,
    windowId: 1,
    status: 'complete',
    url: markedUrl('33333333-3333-4333-8333-333333333333', '001', TOKEN, TEST_ORIGIN, 'dash001')
  });
  await upsert(batchDashboard, {
    id: 812,
    windowId: 1,
    status: 'complete',
    url: markedUrl('44444444-4444-4444-8444-444444444444', '002', TOKEN, TEST_ORIGIN, 'dash001')
  });
  await batchDashboard.call('processBatchQueue()');
  await createAndFinalizeRun(batchDashboard, 811, 'submitted');
  assert.equal(batchDashboard.createdTabs.length, 0);
  await batchDashboard.call('processBatchQueue()');
  await createAndFinalizeRun(batchDashboard, 812, 'failed');
  assert.equal(batchDashboard.createdTabs.length, 1);
  assert.equal(batchDashboard.storage.chefsTesterDashboardState.mode, 'batch');
  assert.equal(batchDashboard.storage.chefsTesterDashboardState.runs.length, 2);
  assert.equal(batchDashboard.storage.chefsTesterDashboardState.batch.completed, true);

  console.log('PASS BATCH-01 through BATCH-06, UX-02 and DASH-01: gated launcher, stable Form.io readiness, persistent strict sequencing, liveness probing, export ordering, stop/recovery, full-width actions, and context-aware idempotent dashboard opening.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
