import { statSync } from 'fs';
import { homedir } from 'os';
import { basename, dirname, resolve } from 'path';
import { Uri, window, workspace, WorkspaceFolder } from 'vscode';

function parseDirPath(filePath: string | undefined): string | undefined {
	if (!filePath) {
		return undefined;
	}

	try {
		const stats = statSync(filePath);
		const folderPath = stats.isDirectory() ? filePath : dirname(filePath);
		return resolve(folderPath);
	} catch (e) {
		//
	}

	return undefined;
}

export function getCurrentDirPath(): string | undefined {
	const activeEditor = window.activeTextEditor;
	const filePath = activeEditor && activeEditor.document.fileName;
	return parseDirPath(filePath);
}

export function getSelectedDirPath(...contextArgs: any[]): string | undefined {
	const selectedPath = contextArgs[0] && contextArgs[0].fsPath;
	return parseDirPath(selectedPath);
}

export function getWorkspacePath(): string {
	const { workspaceFolders } = workspace;
	const workspaceFolder = workspaceFolders && workspaceFolders[0];
	if (!workspaceFolder) {
		return homedir();
	}
	return workspaceFolder.uri.fsPath;
}

export function getDestDirPath(...contextArgs: any[]): string {
	return (
		getSelectedDirPath(...contextArgs) || getCurrentDirPath() || getWorkspacePath()
	);
}

export function getWorkspaceFolders(): readonly WorkspaceFolder[] {
	return workspace.workspaceFolders ?? [];
}

export async function getProjectRoot(): Promise<WorkspaceFolder> {
	const workspaces: readonly WorkspaceFolder[] = getWorkspaceFolders();
	if (workspaces.length === 0) {
		return {
			uri: Uri.file(process.cwd()),
			name: basename(process.cwd()),
			index: 0,
		};
	} else if (workspaces.length === 1) {
		return workspaces[0];
	} else {
		let rootWorkspace = workspaces[0];

		for (const w of workspaces) {
			const exists = await workspace.fs.stat(w.uri).then(
				() => true,
				() => false,
			);
			if (exists) {
				rootWorkspace = w;
			}
		}
		return rootWorkspace;
	}
}
