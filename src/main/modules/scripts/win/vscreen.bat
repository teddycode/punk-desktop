@echo off
CHCP 936>nul
cd /d "%~dp0"
set c=deviceinstaller64.exe
if "%PROCESSOR_ARCHITECTURE%"==":x86" set c=deviceinstaller.exe

:start
echo 1. install driver
echo 2. disable driver
echo 3. add a monitor
echo 4. remove a monitor
echo 5. quit
echo 6. uninstall driver
echo 7. update monitor size

set /p n=
if %n%==1 goto add
if %n%==2 goto stop
if %n%==3 goto add1
if %n%==4 goto remove1
if %n%==5 goto end
if %n%==6 goto remove
if %n%==7 goto resolutions
goto start

:add
cmd /c %c% install usbmmidd.inf usbmmidd
goto add1

:remove1
cmd /c %c% enableidd 0
goto start

:add1
cmd /c %c% enableidd 1
goto start

:stop
cmd /c %c% stop usbmmidd
goto start

:remove
cmd /c %c% remove usbmmidd
goto start

:resolutions
echo HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\WUDF\Services\usbmmIdd\Parameters\Monitors
echo 只对修改后增加的虚拟显示器有效，通过4移除3再增加操作
echo 最多支持0至9共十个分辨率
cmd /c regedit
goto start

:end
pause