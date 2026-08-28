'use strict';

// Verifies DASH-02 through DASH-05. DASH-01 lifecycle coverage is in the batch test.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..', '..');
const extensionRoot = path.join(projectRoot, 'output', 'chefs-one-click-form-tester');
const modelSource = fs.readFileSync(path.join(extensionRoot, 'dashboard-model.js'), 'utf8');
const dashboardSource = fs.readFileSync(path.join(extensionRoot, 'dashboard.js'), 'utf8');
const dashboardHtml = fs.readFileSync(path.join(extensionRoot, 'dashboard.html'), 'utf8');
const dashboardCss = fs.readFileSync(path.join(extensionRoot, 'dashboard.css'), 'utf8');
const optionsHtml = fs.readFileSync(path.join(extensionRoot, 'options.html'), 'utf8');
const optionsSource = fs.readFileSync(path.join(extensionRoot, 'options.js'), 'utf8');
const serviceWorkerSource = fs.readFileSync(
  path.join(extensionRoot, 'service-worker.js'),
  'utf8'
);

const context = vm.createContext({ Date, Math, URL });
vm.runInContext(modelSource, context, { filename: 'dashboard-model.js' });
const model = context.ChefsDashboardModel;

const CANARY = 'PID-CANARY-Alice-Smith-604-555-0100';
const rawRun = {
  runId: CANARY,
  tabId: 42,
  formTitle: CANARY,
  formUrl: `https://chefs-test.example/app/form/submit?f=12345678-1234-4123-8123-123456789abc&name=${CANARY}`,
  formId: CANARY,
  extensionVersion: '0.4.8',
  buildNumber: '2026.08.28.22',
  startedAt: '2026-07-23T12:00:00.000Z',
  finalizedAt: '2026-07-23T12:02:00.000Z',
  status: 'failed',
  confirmationId: CANARY,
  progress: {
    pass: 3,
    discovered: 8,
    filled: 6,
    remaining: 2,
    failed: 1,
    unsupported: 1,
    rowsAdded: 2,
    attachmentsCompleted: 1,
    attachmentsPending: 0,
    submitAttempts: 1
  },
  failure: {
    reason: `Validation failed for ${CANARY}`,
    stack: CANARY
  },
  validationErrors: [{ label: CANARY, message: CANARY, value: CANARY }],
  screenshots: [{ dataUrl: CANARY }],
  checkpoints: [
    {
      time: '2026-07-23T12:00:30.000Z',
      reason: 'Fill pass completed',
      pass: 1,
      actions: 4,
      progress: { filled: 4, remaining: 4 },
      values: CANARY
    },
    {
      time: '2026-07-23T12:01:00.000Z',
      reason: 'Fill pass completed',
      pass: 2,
      actions: 2,
      progress: { filled: 6, remaining: 2 }
    }
  ],
  events: [
    {
      time: '2026-07-23T12:00:10.000Z',
      event: 'INITIAL_SCAN_COMPLETED',
      label: CANARY
    },
    {
      time: '2026-07-23T12:00:20.000Z',
      event: 'FILL_ATTEMPT',
      strategy: 'input',
      componentId: CANARY,
      attempt: 1,
      value: CANARY
    },
    {
      time: '2026-07-23T12:00:22.000Z',
      event: 'FILL_SUCCEEDED',
      strategy: 'input',
      componentId: CANARY,
      attempt: 1
    },
    {
      time: '2026-07-23T12:01:30.000Z',
      event: 'SUBMIT_ATTEMPT',
      confirmationId: CANARY
    }
  ],
  snapshots: {
    final: [
      {
        key: CANARY,
        label: CANARY,
        value: CANARY,
        uploadedFilename: `${CANARY}.pdf`,
        status: 'filled',
        componentType: 'textfield'
      }
    ]
  }
};

const summary = model.buildRunSummary(rawRun, {
  suiteId: CANARY,
  index: `001-${CANARY}`
});
const serialized = JSON.stringify(summary);

assert.equal(summary.schemaVersion, 1);
assert.match(summary.runRef, /^run-[0-9a-f]{8}$/);
assert.equal(summary.formRef, 'form-12345678');
assert.equal(summary.batch.index, '001');
assert.equal(summary.confirmationCaptured, true);
assert.equal(summary.failureCategory, 'validation');
assert.equal(summary.metrics.validationErrors, 1);
assert.equal(summary.strategies[0].latencyMs[0], 2000);
assert.doesNotMatch(serialized, /PID-CANARY|Alice|Smith|604-555|example\/app|123456789abc/);
assert.deepEqual(Array.from(model.pidForbiddenKeys(summary)), []);
assert.equal(model.isDashboardSummary(summary), true);
assert.equal(model.isDashboardSummary({ ...summary, fieldValue: CANARY }), false);
assert.equal(model.isDashboardSummary({ ...summary, rawEvents: [CANARY] }), false);
assert.equal(model.isDashboardSummary({ ...summary, failureCategory: CANARY }), false);
assert.equal(model.isDashboardSummary({ ...summary, buildNumber: CANARY }), false);

const now = Date.parse('2026-07-23T13:00:00.000Z');
const history = [];
for (let index = 0; index < 205; index += 1) {
  const endedAt = new Date(now - (204 - index) * 1000).toISOString();
  history.push({
    ...summary,
    runRef: `run-${index.toString(16).padStart(8, '0')}`,
    endedAt
  });
}
history.unshift({
  ...summary,
  runRef: 'run-deadbeef',
  endedAt: new Date(now - model.HISTORY_MAX_AGE_MS - 1000).toISOString()
});
history.push({
  ...summary,
  runRef: 'run-badf00d0',
  endedAt: new Date(now - 500).toISOString(),
  arbitraryText: CANARY
});
const trimmed = model.trimHistory(history, now);
assert.equal(trimmed.length, model.HISTORY_LIMIT);
assert.equal(trimmed.some((record) => record.runRef === 'run-deadbeef'), false);
assert.equal(trimmed.some((record) => record.runRef === 'run-badf00d0'), false);

assert.match(optionsHtml, /id="openDashboardAfterCompletion"/);
assert.match(optionsHtml, /id="retainDashboardHistory"/);
assert.match(optionsHtml, /at most 200 aggregate records and 90 days/);
assert.match(optionsHtml, /id="clearDashboardHistoryButton"/);
assert.match(optionsSource, /openDashboardAfterCompletion:\s*false/);
assert.match(optionsSource, /retainDashboardHistory:\s*false/);
assert.match(serviceWorkerSource, /state\.history = settings\.retainDashboardHistory[\s\S]*:\s*\[\]/);
assert.match(serviceWorkerSource, /CLEAR_DASHBOARD_HISTORY/);

assert.match(dashboardHtml, /Results Dashboard/);
assert.match(dashboardHtml, /PID-free view/);
assert.match(dashboardHtml, /id="viewSelect"/);
assert.match(dashboardHtml, /id="chartSelect"/);
assert.doesNotMatch(dashboardHtml + dashboardCss, /https?:\/\//i);
assert.doesNotMatch(dashboardSource, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
assert.match(dashboardCss, /html,\s*body\s*\{[^}]*overflow:\s*hidden/);
assert.match(dashboardCss, /grid-template-columns:\s*repeat\(4/);
assert.match(dashboardCss, /grid-template-rows:\s*78px\s+132px\s+minmax\(0,\s*1fr\)/);

for (const group of ['simple', 'analyst', 'statistical', 'experimental']) {
  assert.match(dashboardSource, new RegExp(`group:\\s*'${group}'`));
}
for (const chart of [
  'outcome', 'progress', 'durations', 'phases',
  'pass-trend', 'strategy-latency', 'component-outcomes', 'retry-heatmap',
  'duration-histogram', 'control-chart', 'complexity-scatter', 'percentile-bands',
  'duration-candles', 'event-density', 'build-distribution'
]) {
  assert.match(dashboardSource, new RegExp(`id:\\s*'${chart}'`));
}
assert.match(dashboardSource, /comparableHistory\(\)\.length >= 20/);
assert.match(dashboardSource, /comparableHistory\(\)\.length >= 8/);
assert.match(dashboardSource, /Requires at least eight comparable retained runs across two or more days/);
assert.match(dashboardSource, /option\.disabled = !availability\.ok/);
assert.match(dashboardSource, /plainInterpretation\(selectedRun\)/);

console.log('PASS DASH-02 through DASH-05: PID-canary projection, strict schema, bounded 90-day/200-record history, no-network dashboard, widescreen layout contract, chart range, thresholds, unavailable reasons, and plain-language interpretation verified.');
