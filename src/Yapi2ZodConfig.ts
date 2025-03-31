import { Disposable, Uri, workspace } from 'vscode';
import { IYapiResponse } from './api/types/yapi-types';
import { CONFIG_FILE_NAME } from './utils/constant/common';
import { showErrMsg } from './utils/message';

export interface IProjectConfig {
	header?: string[];
	genRequest?(
		formData: {
			/** 注释 */
			comment: string;
			/** 接口名称，大驼峰格式 */
			interfaceName: string;
			apiPath: string;
			/** 请求数据变量名 */
			reqModelName?: string;
			/** 响应数据变量名 */
			resModelName?: string;
			/** 微服务名称 */
			resource: string;
		},
		data: IYapiResponse,
	): string;
	responseKey?: string;
	responseCustomKey?: string;
}

/**
 * 计算两段文字匹配的字数
 */
function countConsecutiveMatchesFromStart(text1: string, text2: string) {
	let matchLength = 0;

	while (
		matchLength < text1.length &&
		matchLength < text2.length &&
		text1[matchLength] === text2[matchLength]
	) {
		matchLength++;
	}

	return matchLength;
}

export default class Yapi2ZodConfig {
	private static _instance: Yapi2ZodConfig | undefined;
	private isInitialized = false;
	private configFileUris: Uri[] = [];
	public projectConfig: IProjectConfig | undefined;

	public static getInstance(): Yapi2ZodConfig {
		if (!this._instance) {
			this._instance = new Yapi2ZodConfig();
		}
		return this._instance;
	}

	/**
	 * 获取所有配置文件的Uri
	 */
	public async getConfigFileUris(): Promise<Uri[]> {
		return await workspace.findFiles(
			`**/${CONFIG_FILE_NAME}`,
			'{**/node_modules/**,**/src/**}',
		);
	}

	public async init() {
		if (this.isInitialized) return;

		const fileUris = await this.getConfigFileUris();
		fileUris.forEach((uri) => {
			this.configFileUris.push(uri);
		});

		this.isInitialized = true;
	}

	/**
	 * 获取最近的一个配置文件Uri
	 */
	public async getNearestConfigFileUri(uri?: Uri): Promise<Uri | undefined> {
		const configFileUris = this.configFileUris;
		if (configFileUris.length === 0) {
			return undefined;
		} else if (configFileUris.length === 1 || !uri) {
			return configFileUris[0];
		} else {
			// 拿到最近的配置文件路径
			const { index } = configFileUris.reduce(
				(pre, cur, curIdx) => {
					const matchCharacterCount = countConsecutiveMatchesFromStart(
						uri.fsPath,
						cur.fsPath,
					);

					if (matchCharacterCount > pre.matchCharacterCount) {
						return { index: curIdx, matchCharacterCount };
					} else return pre;
				},
				{ index: -1, matchCharacterCount: 0 },
			);

			return configFileUris[index];
		}
	}

	public async getProjectConfig(uri?: Uri): Promise<IProjectConfig | undefined> {
		const nearestConfigFileUri = await this.getNearestConfigFileUri(uri);
		if (!nearestConfigFileUri) return undefined;

		return workspace.fs.readFile(nearestConfigFileUri).then(
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
	}

	public async refreshProjectConfig(uri?: Uri) {
		this.projectConfig = await this.getProjectConfig(uri);
		return this.projectConfig;
	}

	public registerDisposables(): Disposable {
		const prettierConfigWatcher = workspace.createFileSystemWatcher(
			`**/${CONFIG_FILE_NAME}`,
		);

		// prettierConfigWatcher.onDidChange(this.handleFileUri);
		prettierConfigWatcher.onDidCreate((uri: Uri) => {
			console.info('onDidCreate uri', uri);
			this.configFileUris.push(uri);
		});
		prettierConfigWatcher.onDidDelete((uri: Uri) => {
			console.info('onDidDelete uri', uri);
			this.configFileUris.forEach((configFileUri, index) => {
				if (configFileUri.fsPath === uri.fsPath) {
					this.configFileUris.splice(index, 1);
				}
			});
		});

		return prettierConfigWatcher;
	}

	static getPluginConfiguration(field: 'email' | 'password'): string | undefined {
		return workspace.getConfiguration('yapiToZod').get(field);
	}
}
