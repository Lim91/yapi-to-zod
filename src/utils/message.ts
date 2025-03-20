import { window } from 'vscode';

const { showErrorMessage, showInformationMessage } = window;

export function showErrMsg(msg: string): void {
	showErrorMessage(`yapi-to-zod: ${msg}`);
}

export function showInfoMsg(msg: string): void {
	showInformationMessage(`yapi-to-zod: ${msg}`);
}
