import { Uri, window, workspace } from 'vscode';
import { CONFIG_FILE_NAME } from '../utils/constant/common';
import { showInfoMsg } from '../utils/message';
import { getProjectRoot } from '../utils/path';

const genConfigTemplate = () => {
	return `module.exports = () => {
	return {
		cookie: '',
		/** Api文件配置 */
		apiFile: {
			/** 头部代码，如 import xxx from 'xxx',一行代码为数组的一项 */
			header: []
		},
		/**
		 * 生成请求内容
		 * @param {object} param0
		 * @param {string} param0.comment 注释内容
		 * @param {string} param0.interfaceName 接口名，大驼峰
		 * @param {string | undefined} reqModelName 请求参数模型名
		 * @param {string | undefined} resModelName 返回数据模型名
		 * @param {string} param0.apiPath 接口路径
		 * @param {object} yapiData
		 */
		genRequest({comment, interfaceName, hasReqDefine, hasResDefine, apiPath}, yapiData) {
			//
		}
	};
};`;
};

export default async function newConfigProfile(...contextArgs: any[]): Promise<void> {
	const rootWorkspace = await getProjectRoot();
	const configFileUri = Uri.joinPath(rootWorkspace.uri, CONFIG_FILE_NAME);

	const exists = await workspace.fs.stat(configFileUri).then(
		() => true,
		() => false,
	);
	if (exists) {
		showInfoMsg('文件已存在!');
		return;
	}

	const encoder = new TextEncoder();
	await workspace.fs.writeFile(configFileUri, encoder.encode(genConfigTemplate()));
	await window.showTextDocument(configFileUri);
}
