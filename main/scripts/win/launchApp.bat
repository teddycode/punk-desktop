@echo off
setlocal enabledelayedexpansion

set "search_name=%~1"

set "highest_match=0"
set "highest_match_path="

for /r "%USERPROFILE%\AppData\Roaming\Microsoft\Windows\Start Menu" %%F in (*.lnk) do (
    set "shortcut_name=%%~nF"
    set "match_score=0"

    for /f "delims=" %%A in ('echo !shortcut_name! ^| find /i "%search_name%"') do (
        set /a "match_score+=1"
    )

    if !match_score! gtr !highest_match! (
        set "highest_match=!match_score!"
        set "highest_match_path=%%~dpF%%~nF"
    )
)

for /r "%USERPROFILE%\Desktop" %%F in (*.lnk) do (
    set "shortcut_name=%%~nF"
    set "match_score=0"

    for /f "delims=" %%A in ('echo !shortcut_name! ^| find /i "%search_name%"') do (
        set /a "match_score+=1"
    )

    if !match_score! gtr !highest_match! (
        set "highest_match=!match_score!"
        set "highest_match_path=%%~dpF%%~nF"
    )
)

if defined highest_match_path (
    echo %highest_match_path%
) else (
    echo empty.
)

endlocal

