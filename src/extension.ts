// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, commands } from 'vscode';
import commandTable from './commands';
import storage from './utils/storage';
import Yapi2ZodConfig from './Yapi2ZodConfig';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	const { subscriptions } = context;
	const { registerCommand } = commands;

	storage.init(context);

	Object.keys(commandTable).forEach((key) => {
		subscriptions.push(registerCommand(key, commandTable[key]));
	});

	const yapi2ZodConfig = Yapi2ZodConfig.getInstance();
	subscriptions.push(yapi2ZodConfig.registerDisposables());
}

// This method is called when your extension is deactivated
export function deactivate() {}
