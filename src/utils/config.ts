/**
 * @deprecated
 */
import * as fs from 'fs';
import * as path from 'path';
import { Uri, workspace } from 'vscode';
import { IYapiResponse } from '../api/types/yapi-types';
import { CONFIG_FILE_NAME } from './constant/common';
import { showErrMsg } from './message';
import { getProjectRoot } from './path';

export interface IProjectConfig {
	cookie?: string;
	apiFile?: {
		header?: string[];
		genRequest?(
			formData: {
				comment: string;
				interfaceName: string;
				apiPath: string;
				reqModelName?: string;
				resModelName?: string;
			},
			data: IYapiResponse,
		): string;
	};
	responseKey?: string;
	responseCustomKey?: string;
}

const config = {
	getPluginConfiguration(field: string): any {
		return workspace.getConfiguration('yapiDocGenerator').get(field);
	},

	get configFile(): IProjectConfig {
		const folders = workspace.workspaceFolders!;
		const fileContent = fs.readFileSync(
			path.join(folders[0].uri.fsPath, CONFIG_FILE_NAME),
			'utf-8',
		);
		return JSON.parse(fileContent) as IProjectConfig;
	},

	async getProjectConfig(): Promise<IProjectConfig | undefined> {
		const workspaceFolder = await getProjectRoot();
		return workspace.fs
			.readFile(Uri.joinPath(workspaceFolder.uri, CONFIG_FILE_NAME))
			.then(
				(res) => {
					try {
						return eval(res.toString())?.();
					} catch (error) {
						showErrMsg('配置文件异常，请检查配置项');
						console.error('getProjectConfig error', error);
					}
				},
				(err) => {
					showErrMsg('配置文件异常，请检查配置项');
					console.error('getProjectConfig error', err);
				},
			);
	},
};

export default config;
