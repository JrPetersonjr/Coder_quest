' TECHNOMANCER Launcher - Starts the game without showing a console window
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "npx electron .", 0, False
