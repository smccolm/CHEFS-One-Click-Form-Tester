'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..', '..');
const extensionRoot = path.join(projectRoot, 'output', 'chefs-one-click-form-tester');
const exportPathSource = fs.readFileSync(path.join(extensionRoot, 'export-path.js'), 'utf8');
const pickerSource = fs.readFileSync(path.join(extensionRoot, 'export-folder-picker.js'), 'utf8');
const optionsHtmlSource = fs.readFileSync(path.join(extensionRoot, 'options.html'), 'utf8');
const optionsSource = fs.readFileSync(path.join(extensionRoot, 'options.js'), 'utf8');
const serviceWorkerSource = fs.readFileSync(path.join(extensionRoot, 'service-worker.js'), 'utf8');

function loadPicker() {
  const context = vm.createContext({
    clearTimeout,
    encodeURIComponent,
    setTimeout
  });
  vm.runInContext(exportPathSource, context, { filename: 'export-path.js' });
  vm.runInContext(pickerSource, context, { filename: 'export-folder-picker.js' });
  return {
    exportPath: context.ChefsExportPath,
    picker: context.ChefsExportFolderPicker
  };
}

function createDownloads(options) {
  const settings = options || {};
  const calls = {
    download: [],
    erase: [],
    removeFile: []
  };
  const listeners = new Set();
  return {
    api: {
      download: async (downloadOptions) => {
        calls.download.push(downloadOptions);
        if (settings.downloadError) {
          throw settings.downloadError;
        }
        return 701;
      },
      erase: async (query) => {
        calls.erase.push(query);
        return [701];
      },
      onChanged: {
        addListener: (listener) => listeners.add(listener),
        removeListener: (listener) => listeners.delete(listener)
      },
      removeFile: async (downloadId) => {
        calls.removeFile.push(downloadId);
      },
      search: async () => [{ id: 701, state: 'complete' }]
    },
    calls,
    listeners
  };
}

function notFoundError() {
  const error = new Error('Probe not found.');
  error.name = 'NotFoundError';
  return error;
}

(async () => {
  const { exportPath, picker } = loadPicker();

  assert.match(
    optionsHtmlSource,
    /<button id="selectExportFolderButton" type="button" class="secondary">Select<\/button>/
  );
  assert.match(optionsHtmlSource, /temporary file/);
  assert.match(optionsSource, /const previousValue = input\.value/);
  assert.match(optionsSource, /input\.value = previousValue/);
  assert.match(optionsSource, /ChefsExportFolderPicker\.selectValidatedFolder\(\)/);
  assert.match(serviceWorkerSource, /ChefsExportPath\.joinExportPath\(settings\.exportFolder/);
  assert.doesNotMatch(serviceWorkerSource, /ChefsExportFolderPicker/);
  assert.doesNotMatch(pickerSource, /indexedDB|storage\.local/);

  const validDownloads = createDownloads();
  let selectedProbeName = '';
  const validHandle = {
    kind: 'directory',
    name: 'CHEFS Exports',
    async getFileHandle(probeName) {
      selectedProbeName = probeName;
      return { kind: 'file', name: probeName };
    }
  };
  const validFolder = await picker.validateSelectedFolder(validHandle, {
    delay: async () => undefined,
    downloads: validDownloads.api,
    exportPath,
    probeAttempts: 1,
    randomUUID: () => 'valid-probe'
  });
  assert.equal(validFolder, 'CHEFS Exports');
  assert.equal(selectedProbeName, 'chefs-export-folder-validation-valid-probe.txt');
  assert.equal(validDownloads.calls.download.length, 1);
  assert.equal(
    validDownloads.calls.download[0].filename,
    'CHEFS Exports/chefs-export-folder-validation-valid-probe.txt'
  );
  assert.equal(validDownloads.calls.download[0].saveAs, false);
  assert.deepEqual(validDownloads.calls.removeFile, [701]);
  assert.equal(validDownloads.calls.erase.length, 1);
  assert.equal(validDownloads.calls.erase[0].id, 701);
  assert.equal(validDownloads.listeners.size, 0, 'Download change listener was not removed.');

  let pickerOptions = null;
  const selectDownloads = createDownloads();
  const selected = await picker.selectValidatedFolder({
    delay: async () => undefined,
    downloads: selectDownloads.api,
    exportPath,
    probeAttempts: 1,
    randomUUID: () => 'select-probe',
    showDirectoryPicker: async (options) => {
      pickerOptions = options;
      return validHandle;
    }
  });
  assert.equal(selected, 'CHEFS Exports');
  assert.equal(pickerOptions.startIn, 'downloads');
  assert.equal(pickerOptions.mode, 'read');

  const arbitraryDownloads = createDownloads();
  const arbitraryHandle = {
    kind: 'directory',
    name: 'Arbitrary Folder',
    async getFileHandle() {
      throw notFoundError();
    }
  };
  await assert.rejects(
    picker.validateSelectedFolder(arbitraryHandle, {
      delay: async () => undefined,
      downloads: arbitraryDownloads.api,
      exportPath,
      probeAttempts: 1,
      randomUUID: () => 'arbitrary-probe'
    }),
    /not a direct child of Downloads/
  );
  assert.deepEqual(arbitraryDownloads.calls.removeFile, [701]);
  assert.equal(arbitraryDownloads.calls.erase.length, 1);
  assert.equal(arbitraryDownloads.calls.erase[0].id, 701);
  assert.equal(arbitraryDownloads.listeners.size, 0);

  const invalidDownloads = createDownloads();
  await assert.rejects(
    picker.validateSelectedFolder({
      kind: 'directory',
      name: 'bad:name',
      async getFileHandle() {
        throw new Error('Should not be called.');
      }
    }, {
      downloads: invalidDownloads.api,
      exportPath,
      randomUUID: () => 'invalid-probe'
    }),
    /invalid Windows filename character/
  );
  assert.equal(invalidDownloads.calls.download.length, 0, 'Unsafe name triggered a probe download.');

  const policyDownloads = createDownloads({
    downloadError: new Error('Managed download policy rejected the probe.')
  });
  await assert.rejects(
    picker.validateSelectedFolder(validHandle, {
      downloads: policyDownloads.api,
      exportPath,
      randomUUID: () => 'policy-probe'
    }),
    /Managed download policy/
  );
  assert.equal(policyDownloads.calls.removeFile.length, 0);
  assert.equal(policyDownloads.calls.erase.length, 0);

  await assert.rejects(
    picker.selectValidatedFolder({
      showDirectoryPicker: async () => {
        const error = new Error('User cancelled.');
        error.name = 'AbortError';
        throw error;
      }
    }),
    /User cancelled/
  );

  console.log('PASS EXPORT-04: Select starts in Downloads, validates a direct child through the existing download path, cleans the probe, rejects arbitrary and unsafe locations, preserves cancellation, and retains no folder handle.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
