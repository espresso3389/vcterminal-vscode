'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let terminalStacks = new Map<string, vscode.Terminal[]>();

    context.subscriptions.push(vscode.commands.registerCommand('terminalVcVers.createBashShell', () => {

        showTerminal('c:\\Windows\\Sysnative\\bash.exe', 'bash');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('terminalVcVers.createVsCmdPrompt', () => {
        let commands = new Map<string,string>();
        let vsvers = {
            '100': 'VS2010',
            '110': 'VS2012',
            '120': 'VS2013',
            '140': 'VS2015'};
        for (let vsver in vsvers) {
            let vstooldir = process.env['VS' + vsver + 'COMNTOOLS'];
            let vcvarsall = vstooldir + '..\\..\\VC\\vcvarsall.bat';
            if (fs.existsSync(vcvarsall)) {
                for (let arch of ['x86', 'amd64'])
                    commands.set(`VS${vsver} (${arch})`, `"${vcvarsall}" ${arch}`);
            }
        }
        if (commands.size == 0)
        {
            vscode.window.showErrorMessage('No Visual Studio installation found.');
            return;
        }

        vscode.window
            .showQuickPick(Array.from(commands.keys()), {　placeHolder: "Select VS version to show command prompt:"　})
            .then(n => showCmd64(commands.get(n), n));
    }));

    function showTerminal(cmd: string, caption: string) {
        let terms = terminalStacks[caption];
        if (!terms)
            terminalStacks[caption] = terms = [];

        var term = vscode.window.createTerminal(`${caption} #${terms.length + 1}`);
        if (cmd)
        {
            let dir = vscode.window.activeTextEditor ? path.dirname(vscode.window.activeTextEditor.document.fileName) : null;
            if (dir && dir != '.')
            {
                let root = or(vscode.workspace.rootPath, process.env['USERPROFILE']);
                let drive = getDrive(dir);
                if (getDrive(root) != drive)
                    term.sendText(drive + ':'); // change drive
                dir = path.relative(root, dir);
                if (dir && dir != '.')
                    term.sendText('cd "' + dir + '"'); // change directory
            }
            term.sendText(cmd);
        }
        term.show();
    }

    function showCmd64(cmd: string, caption: string) {
        showTerminal('call ' + cmd, caption);
    }

    function getDrive(fn: string): string {
        if (fn && fn.length > 3 && fn[1] == ':' && fn[2] == '\\')
        {
            let drive = fn[0];
            if ((drive >= 'a' && drive <= 'z') || (drive >= 'A' && drive <= 'Z'))
                return drive.toUpperCase();
        }
        return null;
    }

    function or(a: string, b: string) {
        return a ? a : b;
    }
}

export function deactivate() {
}
