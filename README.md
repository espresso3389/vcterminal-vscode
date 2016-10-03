# vcterminal

This is a Visual Studio Code extension, which enables Windows users to open Integrated Terminal with Visual Studio Tools. It is enabled by utilizing vcvarsall.bat on Visual C++ installation.

This extension supports two terminal variants:

### Visual Studio Command Prompt

You can select a Visual Studio version upon opening Visual Studio Command Prompt.

### Bash on Ubuntu on Windows

This will open `Bash on Ubuntu on Windows` on integrated terminal.

## Known Issues

- It cannot run on Mac
Of course, the extension run only on Windows! :(
- When you exit bash, it returns to cmd.exe
Currently, we cannot directly launch bash.exe from Visual Studio Code environment.
This is an API restriction now and 
- If you change `terminal.integrated.shell.windows` on your `settings.json`,
the extension may not work.
The extension assumes that the value is one of the following variations:
```
C:\\WINDOWS\\system32\\cmd.exe
C:\\WINDOWS\\sysnative\\cmd.exe
```

## GitHub URL
https://github.com/espresso3389/vcterminal-vscode

## Marketplace URL
https://marketplace.visualstudio.com/items?itemName=espresso3389.vcterminal
