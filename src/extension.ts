'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let terminalStacks = new Map<string, vscode.Terminal[]>();

    let shell = (vscode.workspace.getConfiguration().get('terminal.integrated.shell.windows') as string).toLowerCase();
    let system32 = 'system32'; //shell.indexOf("sysnative") > 0 ? 'sysnative' : 'system32';
    let isPowershell = shell.indexOf("powershell.exe") > 0;
    let isCmdExe = shell.indexOf("cmd.exe") > 0;
    if (!isPowershell && !isCmdExe)
    {
        vscode.window.showErrorMessage('Could not determine shell type. It should be either cmd.exe or powershell.exe in system32 or sysnative directory.');
        return;
    }

    context.subscriptions.push(vscode.commands.registerCommand('terminalVcVers.createBashShell', () => {

        showTerminal('c:\\Windows\\' + system32 + '\\bash.exe', 'bash');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('terminalVcVers.createVsCmdPrompt', () => {
        let commands = new Map<string,string>();
        for (let vs of vsEditions()) {
            let vcvarsall = vs[0];
            let vsname = vs[1];
            if (fs.existsSync(vcvarsall)) {
                for (let arch of ['x86', 'amd64'])
                    commands.set(`${vsname} (${arch})`, `"${vcvarsall}" ${arch}`);
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

    function *vsEditions(): Iterable<[string, string]> {
        let vsvers = {'100': '2010', '110': '2012', '120': '2013', '140': '2015'};
        for (let vsver in vsvers) {
            let vstooldir = process.env['VS' + vsver + 'COMNTOOLS'];
            let vsname = 'VS' + vsvers[vsver];
            if (vstooldir) {
                let vcvarsall = path.join(vstooldir, '..\\..\\VC\\vcvarsall.bat');
                yield [vcvarsall, 'VS' + vsvers[vsver]];
            }
        }

        // FIXME: hardcoded path for new Visual Studio versions/editions.
        let vsvers2 = ['2017'];
        let editions = ['Community', 'Professional', 'Enterprise'];
        for (let i = 0; i < vsvers2.length; i++) {
            let v = vsvers2[i];
            let vsdirRoot = path.join(process.env['ProgramFiles(x86)'], 'Microsoft Visual Studio', v);
            for (let j = 0; j < editions.length; j++) {
                let ed = editions[j];
                yield [path.join(vsdirRoot, ed, 'VC\\Auxiliary\\Build\\vcvarsall.bat'), 'VS ' + ed + ' ' + v];
            }
        }
    }

    function showTerminal(cmd: string, caption: string) {
        let terms = terminalStacks[caption];
        if (!terms)
            terminalStacks[caption] = terms = [];

        let term = vscode.window.createTerminal(`${caption} #${terms.length + 1}`);
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
        return term;
    }

    function showCmd64(cmd: string, caption: string) {
        if (!cmd)
            return;
        if (isCmdExe)
            showTerminal('call ' + cmd, caption);
        else
            showTerminal('c:\\Windows\\' + system32 + '\\cmd.exe /K ' + cmd, caption);
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
