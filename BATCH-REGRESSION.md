# Batch regression launcher

`run-regression-suite.cmd` opens the embedded CHEFS form list in Chrome. If version 0.3.1 or later of the extension is loaded and its batch launcher is configured, the extension activates and tests one marked tab at a time. It waits for each run to reach a terminal state and for any automatic export attempt to finish before starting the next tab.

The tabs are opened together, but the extension runs them sequentially. This avoids background-tab throttling and ensures screenshots come from the form being tested.

The extension allows a brief 1.5-second collection window after marked tabs arrive, then activates index `001`. v0.4.0 waits for stable mounted Form.io components and interactive controls; an empty outer form shell is not ready. The popup distinguishes **Preparing marked tabs** from **waiting for CHEFS form**. Once created, even a long run retains the only active queue slot until it finalizes.

## One-time setup

1. In Chrome, open `chrome://extensions`, find **CHEFS One-Click Form Tester**, and select **Details** > **Extension options**.
2. Under **Batch regression launcher**, select **Generate Token**.
3. Add each exact non-production regression origin, one per line. For the included eight-form suite use:

   ```text
   https://chefs-test.apps.silver.devops.gov.bc.ca
   ```

4. Select **Grant Host Access** and approve the Chrome prompt.
5. Enable **Allow the project batch file to start marked regression tabs**, then select **Save Settings**.
6. Open `run-regression-suite.cmd` in a text editor. Replace:

   ```bat
   set "LAUNCHER_TOKEN=PASTE_TOKEN_FROM_EXTENSION_SETTINGS_HERE"
   ```

   with the generated token. The values must match exactly.
7. Set `CHROME_PROFILE` to the Chrome profile containing the loaded extension. It is normally `Default`. To confirm it, open `chrome://version` in that profile and use the final folder name from **Profile Path**, such as `Default` or `Profile 2`.

The launcher is now ready to double-click or invoke from Command Prompt.

## Maintain the form list

The form list is embedded near the bottom of `run-regression-suite.cmd`:

```bat
call :OPEN_FORM "001" "https://example.test/form/one"
call :OPEN_FORM "002" "https://example.test/form/two"
```

Add, remove, or reorder these lines. Keep each index unique and zero-padded so the execution order remains obvious. Add every new URL's exact origin to the extension setting and grant host access before launching it.

The embedded default is the eight-form suite evidenced in `feedback/round-004.md`, in its original execution order:

| Index | Form |
| --- | --- |
| `001` | CGG - Human and Social Services (TEST) |
| `002` | CGG - DPAC - UAT |
| `003` | Template - Simple Functional Chefs Form (TEST) |
| `004` | Template - Custom Fields |
| `005` | Template - Core Fields |
| `006` | REDIP - Economic Capacity (UAT) |
| `007` | 2026 Community Event Support Fund |
| `008` | A&C Rebate calculations |

All eight historically submitted successfully in round 004. That historical result describes the baseline; each new batch run must still be evaluated from its new exports.

If a URL contains a literal percent sign, write it as `%%` in the batch file.

## Run and monitor

Double-click `run-regression-suite.cmd`, or run:

```bat
cd /d "C:\Local Data\Codex-Workspace\Project - CHEFS-One-Click-Form-Tester"
run-regression-suite.cmd
```

Open the extension popup to see active, queued, and completed counts. **Stop Batch** stops the active run and removes the remaining queued tabs from the batch; it does not close the Chrome tabs.

Automatic ZIP downloads use the existing export settings. If **Automatically export after each run** is enabled, each successful or failed/blocked run is downloaded after its final evidence is stored. A blank **Export Folder** saves directly to Downloads; a configured folder uses the existing Downloads-relative destination logic.

If **Open results dashboard after completion** is enabled, the extension opens or refreshes the PID-free dashboard once after the final batch item. It does not open a dashboard between individual batch runs.

## Safety boundaries

- Batch launching is disabled by default.
- A tab must contain the per-install launcher token in its URL fragment.
- The extension removes the launcher marker from browser history before injecting the tester and stores only the cleaned form URL in queue records.
- The tab's exact origin must be listed in Settings and have Chrome host access.
- Existing environment checks still apply. Production-like hosts remain blocked unless production testing is explicitly enabled separately.
- The batch file does not know the extension ID. If the extension is missing, disabled, or loaded in a different Chrome profile, the marked tabs simply open and no tests start.
- Regenerate the token and update the batch file if the token is exposed or copied somewhere unintended.

## Troubleshooting

- **Tabs open but nothing runs:** confirm the selected Chrome profile, enable the batch launcher, match the token exactly, save Settings, and grant access for the exact origin.
- **A tab is recorded as rejected:** check its exact origin, host permission, and the extension's non-production/production policy.
- **The wrong profile opens:** change `CHROME_PROFILE` to the final folder name shown by `chrome://version`.
- **Chrome is not found:** edit `CHROME_EXE` in the batch file to the full path of `chrome.exe`.
- **The queue does not advance:** open the extension popup. A closed tab, start failure, or timeout is bounded and should allow the next item to proceed; use **Stop Batch** if an active page itself is unresponsive.
