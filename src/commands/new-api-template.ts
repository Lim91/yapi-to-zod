import { commands, Uri, window, workspace } from 'vscode';
import { getApiDetail } from '../api/get-api-detail';
import { getProjectDetail } from '../api/get-project-detail';
import { CONFIG_FILE_NAME } from '../utils/constant/common';
import { showErrMsg, showInfoMsg } from '../utils/message';
import { getSelectedDirPath } from '../utils/path';
import { data2Type } from '../utils/yapi2type';
import Yapi2ZodConfig from '../Yapi2ZodConfig';

/**
 * 从接口文档路径中提取项目id和接口id
 */
function extractIdsFromUrl(url: string): { projectId?: string; interfaceId: string } {
	const projectRegex = /project\/(\d+)/;
	const interfaceRegex = /interface\/api\/(\d+)/;

	const projectMatch = url.match(projectRegex);
	const interfaceMatch = url.match(interfaceRegex);

	if (interfaceMatch?.length === 2) {
		const projectId = projectMatch?.[1];
		const interfaceId = interfaceMatch[1];
		return { projectId, interfaceId };
	} else {
		const msg = '无法从URL中提取接口id，请检查接口格式';
		showErrMsg(msg);
		throw new Error(msg);
	}
}

/**
 * 下划线命名转短横杠命名
 * @example
 * ```js
 * convertUnderscoreToHyphen('hello_world'); // "hello-world"
 * ```
 */
function convertUnderscoreToHyphen(input: string): string {
	return input.replace(/_/g, '-');
}

async function generateCode(uri: Uri): Promise<void> {
	const urlPath = await window.showInputBox({
		title: '请输入接口文档地址',
		ignoreFocusOut: true,
	});

	if (!urlPath) {
		if (urlPath === '') {
			showErrMsg('请输入接口文档地址');
		}
		return;
	}

	const dirPath = getSelectedDirPath(uri);
	if (!dirPath) {
		return;
	}

	const { projectId, interfaceId } = extractIdsFromUrl(urlPath);
	const [interfaceRes, projectRes] = await Promise.all([
		getApiDetail(interfaceId),
		projectId ? getProjectDetail(projectId) : undefined,
	]);
	// 生成文件名
	const paths = interfaceRes.data?.path?.split(/[/.]/g) || [];
	const lastWord = paths[paths.length - 1];
	const fileName = convertUnderscoreToHyphen(lastWord) + '.ts';
	// 生成文件路径并判断是否存在
	const apiFileUri = Uri.joinPath(Uri.file(dirPath), fileName);
	const apiFileExists = await workspace.fs.stat(apiFileUri).then(
		() => true,
		() => false,
	);
	if (apiFileExists) {
		showInfoMsg('文件已存在!');
		return;
	}

	const tsData = await data2Type(interfaceRes.data, projectRes?.data);
	// console.log('===data===', tsData);
	let content = [
		tsData.header,
		tsData.reqDefine,
		tsData.resDefine,
		tsData.typeContent,
		tsData.requestContent,
	]
		.filter(Boolean)
		.join('\n\n');
	content += '\n';

	const encoder = new TextEncoder();
	await workspace.fs.writeFile(apiFileUri, encoder.encode(content));
	await window.showTextDocument(apiFileUri);
	await commands.executeCommand<string>('editor.action.formatDocument');
	await commands.executeCommand<string>('workbench.action.files.save');
}

export default async function newApiTemplate(...contextArgs: any[]): Promise<void> {
	try {
		if (!workspace.workspaceFolders) {
			showErrMsg(
				'An Api Template can only be generated if VS Code is opened on a workspace folder.',
			);
			return;
		}

		const yapi2ZodConfig = Yapi2ZodConfig.getInstance();
		await yapi2ZodConfig.init();
		const fileUri = await yapi2ZodConfig.getNearestConfigFileUri(contextArgs[0]);
		if (!fileUri) {
			showErrMsg(`请创建配置文件 ${CONFIG_FILE_NAME}`);
			return;
		}
		await yapi2ZodConfig.refreshProjectConfig(fileUri);

		await generateCode(contextArgs[0] || workspace.workspaceFolders[0].uri);
	} catch (error) {
		console.error(error);
	}
}
