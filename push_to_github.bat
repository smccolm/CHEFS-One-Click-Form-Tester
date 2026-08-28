@echo off
setlocal EnableExtensions

set "REPO_DIR=%~dp0"
set "REMOTE_NAME=origin"
set "BRANCH_NAME=main"

cd /d "%REPO_DIR%" || goto :failure

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

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo ERROR: "%REPO_DIR%" is not a Git working tree.
  echo Run the one-time repository setup before using this sync script.
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
