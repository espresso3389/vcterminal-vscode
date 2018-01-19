@echo off

@echo off

call :find_exe git
if ERRORLEVEL 1 goto errend
call :set_revision
if ERRORLEVEL 1 goto errend
call :set_commitid
if ERRORLEVEL 1 goto errend

call npm version 1.0.%REV%
call npm install
call node_modules\.bin\vsce publish
goto :EOF

rem -------------------------------------------------------------------------
rem Set REV environment variable using git's commit count.
rem -------------------------------------------------------------------------
:set_revision
for /f %%c in ('git log --oneline ^| find /c /v ""') do set REV=%%c
if "%REV%"=="" (
	echo Could not determine source revision.
	exit /b 1
)
echo Revision: %REV%
goto :EOF

rem -------------------------------------------------------------------------
rem Set COMMIT environment variable using git's commit count.
rem -------------------------------------------------------------------------
:set_commitid
for /f %%c in ('git log --oneline -1') do set COMMIT=%%c
goto :EOF

rem -------------------------------------------------------------------------
rem Determine whether the executable is found or not.
rem -------------------------------------------------------------------------
:find_exe
for /f %%c in ('where %1 2^>NUL') do exit /b 0
echo Command not found: %1
exit /b 1
