# vcterminal

![](https://raw.githubusercontent.com/espresso3389/vcterminal-vscode/master/images/intro.gif)

This is a Visual Studio Code extension, which enables Windows users to open Integrated Terminal with Visual Studio Tools. It is enabled by utilizing vcvarsall.bat on Visual C++ installation.

It also support Bash on Ubuntu on Windows (WSL) invocation without modifying integrated terminal configuration.

## Visual Studio Command Prompt

You can select a Visual Studio version upon opening Visual Studio Command Prompt.

Currently, it supports VS2010, VS2012, VS2013, VS2015, and VS2017.

## Bash on Ubuntu on Windows (WSL)

This will open `Bash on Ubuntu on Windows` on integrated terminal.

## Known Issues

### It cannot run on Mac
Of course, the extension runs only on Windows! :(

### When you exit bash, it returns to cmd.exe
Currently, we cannot directly launch bash.exe from Visual Studio Code environment.
This is an API restriction now. 

### Integrated Terminal Restriction
If you change `terminal.integrated.shell.windows` on your `settings.json`,
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
