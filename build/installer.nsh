!macro customHeader
  RequestExecutionLevel admin
!macroend
!macro customInstall
  RMDir /r "C:\ProgramData\SenseShield\ss"
  ExecWait '"$INSTDIR\resources\XXX.exe" /S（安装携带的参数，空格隔开）'
!macroend
