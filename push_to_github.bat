@echo off
setlocal EnableExtensions

set "REPO_DIR=%~dp0"
if "%REPO_DIR:~-1%"=="\" set "REPO_DIR=%REPO_DIR:~0,-1%"
set "REMOTE_NAME=origin"
set "BRANCH_NAME=main"

cd /d "%REPO_DIR%" || goto :failure

rem Codex created this repository under its sandbox account. Permit Git to use
rem this exact working tree when the script is double-clicked by its owner.
rem This setting exists only for this script process and does not trust any
rem other directory or modify the user's global Git configuration.
set "GIT_CONFIG_COUNT=1"
set "GIT_CONFIG_KEY_0=safe.directory"
set "GIT_CONFIG_VALUE_0=%REPO_DIR%"

echo ====================================================================
echo  CHEFS One-Click Form Tester - Safe GitHub Sync
echo  https://github.com/smccolm/CHEFS-One-Click-Form-Tester
echo ====================================================================
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo ERROR: Git is not installed or is not available on PATH.
  goto :failure
)

git rev-parse --is-inside-work-tree >nul
if errorlevel 1 (
  echo ERROR: Git could not open "%REPO_DIR%" as a working tree.
  echo Review the Git error printed above.
  goto :failure
)

for /f "delims=" %%i in ('git branch --show-current') do set "CURRENT_BRANCH=%%i"
if not "%CURRENT_BRANCH%"=="%BRANCH_NAME%" (
  echo ERROR: Expected branch "%BRANCH_NAME%" but found "%CURRENT_BRANCH%".
  goto :failure
)

git remote get-url "%REMOTE_NAME%" >nul 2>&1
if errorlevel 1 (
  echo ERROR: Git remote "%REMOTE_NAME%" is not configured.
  goto :failure
)

echo Staging workspace files...
git add --all
if errorlevel 1 goto :failure

git diff --cached --quiet
set "DIFF_EXIT=%ERRORLEVEL%"
if "%DIFF_EXIT%"=="0" goto :fetch
if not "%DIFF_EXIT%"=="1" goto :failure

for /f "delims=" %%i in ('powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"') do set "TIMESTAMP=%%i"

echo Committing workspace progress...
git commit -m "Update CHEFS One-Click Form Tester - %TIMESTAMP%"
if errorlevel 1 goto :failure

:fetch
echo Fetching %REMOTE_NAME%/%BRANCH_NAME%...
git fetch "%REMOTE_NAME%" "%BRANCH_NAME%"
if errorlevel 1 goto :failure

echo Rebasing local commits onto %REMOTE_NAME%/%BRANCH_NAME%...
git rebase "%REMOTE_NAME%/%BRANCH_NAME%"
if errorlevel 1 (
  echo ERROR: Rebase stopped. Resolve the reported conflict, then run:
  echo   git rebase --continue
  echo Do not force-push to bypass the conflict.
  goto :failure
)

echo Pushing %BRANCH_NAME% to GitHub...
git push --set-upstream "%REMOTE_NAME%" "%BRANCH_NAME%"
if errorlevel 1 goto :failure

echo.
echo ====================================================================
echo  Git Sync Completed Successfully
echo ====================================================================
git status --short --branch
goto :done

:failure
echo.
echo ====================================================================
echo  Git Sync FAILED - review the error above
echo ====================================================================
git status --short --branch 2>nul
set "SYNC_EXIT=1"

:done
echo.
pause
if defined SYNC_EXIT exit /b %SYNC_EXIT%
exit /b 0
