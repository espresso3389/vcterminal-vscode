'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as childProcess from 'child_process';
import * as vscode from 'vscode';

interface VSWhere {
    installationPath: string;
    displayName: string;
    catalog: {
        productDisplayVersion: string;
        productLineVersion: string;
    }
}

export function activate(context: vscode.ExtensionContext) {
    const terminalStacks = new Map<string, vscode.Terminal[]>();

    const shell = (vscode.workspace.getConfiguration().get('terminal.integrated.shell.windows') as string).toLowerCase();
    const system32 = 'system32'; //shell.indexOf("sysnative") > 0 ? 'sysnative' : 'system32';
    const isPowershell = shell.indexOf("powershell.exe") > 0;
    const isCmdExe = shell.indexOf("cmd.exe") > 0;
    const isWslBash = shell.indexOf("bash.exe") > 0;
    if (!isPowershell && !isCmdExe && !isWslBash)
    {
        vscode.window.showErrorMessage('Could not determine shell type. It should be either cmd.exe or powershell.exe in system32 or sysnative directory.');
        return;
    }

    context.subscriptions.push(vscode.commands.registerCommand('terminalVcVers.createBashShell', () => {
        showTerminal('c:\\Windows\\' + system32 + '\\bash.exe', 'bash');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('terminalVcVers.createVsCmdPrompt', async() => {
        let commands = new Map<string,string>();
        for (let vs of await getVsEditionsAsync()) {
            commands.set(vs[1], vs[0]);
        }
        if (commands.size == 0) {
            vscode.window.showErrorMessage('No Visual Studio installation found.');
            return;
        }

        vscode.window
            .showQuickPick(Array.from(commands.keys()), {　placeHolder: "Select VS version to show command prompt:"　})
            .then(n => showCmd64(commands.get(n), n));
    }));

    async function getVsEditionsAsync(): Promise<[string, string][]> {
        const ret: [string, string][] = [];
        const vsvers = {'90': '2008', '100': '2010', '110': '2012', '120': '2013', '140': '2015'};
        for (const vsver in vsvers) {
            const vstooldir = process.env['VS' + vsver + 'COMNTOOLS'];
            const vsname = 'VS' + vsvers[vsver];
            if (vstooldir) {
                const vcvarsall = path.join(vstooldir, '..\\..\\VC\\vcvarsall.bat');
                if (fs.existsSync(vcvarsall)) {
                    for (let arch of ['x86', 'amd64']) {
                        const name = `VS ${vsvers[vsver]} (${arch})`;
                        const cmd = `"${vcvarsall}" ${arch}`;
                        ret.push([cmd, name]);
                    }
                }
            }
        }

        for (const vsi of await enumAllVsInstallationsAsync()) {
            const vcvarsall = path.join(vsi.installationPath, 'VC\\Auxiliary\\Build\\vcvarsall.bat');
            const dname = vsi.displayName.replace('Visual Studio', 'VS');
            // FIXME: we need arm or arm64 here. See #4
            for (let arch of ['x86', 'amd64']) {
                const cmd = `"${vcvarsall}" ${arch}`;
                ret.push([cmd, `${dname} ${vsi.catalog.productDisplayVersion} (${arch})`]);
            }
        }
        return ret;
    }

    async function enumAllVsInstallationsAsync() {
        // https://github.com/Microsoft/vswhere
        const vswhereExe = path.join(process.env['ProgramFiles(x86)'], 'Microsoft Visual Studio\\Installer\\vswhere.exe');
        const buf = await getRedirectedDataAsync(vswhereExe, '-all', '-prerelease', '-format', 'json');
        return JSON.parse(buf.toString()) as VSWhere[];
    }
    
    async function getRedirectedDataAsync(command: string, ...args: string[]) {
        return new Promise<Buffer>((resolve, reject) => {
            try {
                const proc = childProcess.spawn(command, args);
                let data = Buffer.alloc(0);
                proc.stdout.on('data', chunk => {
                    data = Buffer.concat([data, chunk as Buffer]);
                });
                proc.on('close', () => {
                    try {
                        resolve(data);
                    } catch (ex) {
                        reject(ex);
                    }
                });
            } catch (ex) {
                reject(ex);
            }
        });
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
        else if (isPowershell)
            showTerminal('c:\\Windows\\' + system32 + '\\cmd.exe /K ' + cmd, caption);
        else if (isWslBash)
            showTerminal('/mnt/c/Windows/System32/cmd.exe /K ' + cmd, caption);
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
