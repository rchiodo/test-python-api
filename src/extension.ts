// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { IProposedExtensionAPI } from './pythontypes';

let printPathsPromise = Promise.resolve();
let counter = 1;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "test-python-api" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('test-python-api.helloWorld', async () => {
        const api = await getApi();
        if (!api) {
            throw new Error('Cannot retrieve python api');
        }
        console.log(`Paths before refresh:`);
        printPaths(api);
        api.environment.onDidInterpretersChanged(() => interpreterListChanged(api));
        api.environment.onDidActiveInterpreterChanged(() => activeInterpreterChanged(api));
        api.environment.refreshInterpreters({ clearCache: true });
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('test-python-api.setActive', async () => {
        const api = await getApi();
        if (!api) {
            throw new Error('Cannot retrieve python api');
        }
        const list = await api.environment.getInterpreterPaths();
        if (list) {
            const result = await vscode.window.showQuickPick(list, {
                canPickMany: false,
                title: 'Pick a new interpreter'
            });
            if (result) {
                await api.environment.setActiveInterpreter(result);
                printPaths(api);
            }
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

async function getApi() {
    const extension = vscode.extensions.getExtension('ms-python.python');
    if (extension) {
        if (!extension.isActive) {
            await extension.activate();
        }
        return extension.exports as IProposedExtensionAPI;
    }
    return undefined;
}

async function activeInterpreterChanged(api: IProposedExtensionAPI) {
    console.log(`Active interpreter changed`);
    const active = await api.environment.getActiveInterpreterPath();
    console.log(`Active interpreter path is ${active}`);
}

async function interpreterListChanged(api: IProposedExtensionAPI) {
    console.log(`Interpreter list changed.`);
    printPaths(api);
}

function printPaths(api: IProposedExtensionAPI) {
    printPathsPromise = printPathsPromise.then(() => printPathsImpl(api));
    return printPathsPromise;
}

async function printPathsImpl(api: IProposedExtensionAPI) {
    counter = counter + 1;
    const localCounter = counter;
    console.log(`${localCounter}: Printing paths .....`);
    if (api.environment) {
        const active = await api.environment.getActiveInterpreterPath();
        console.log(`${localCounter}: Active interpreter path is ${active}`);
        const paths = await api.environment.getInterpreterPaths();
        console.log(`${localCounter}: Interpreter paths are: ${paths?.join('\n')}`);
        if (paths) {
            await Promise.all(
                paths?.map(async (p) => {
                    const details = await api.environment.getInterpreterDetails(p);
                    console.log(`${localCounter}: Details for ${p} are: `);
                    console.log(JSON.stringify(details, undefined, ' '));
                })
            );
        }
    }
    console.log(`${localCounter}: ...End`);
}
