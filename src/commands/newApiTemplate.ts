import { commands, Uri, window, workspace } from 'vscode';
import { fetchYapiApiData } from '../api/getYapiApiInfo';
import { isNumeric } from '../utils/common';
import { CONFIG_FILE_NAME } from '../utils/constant/common';
import { showErrMsg, showInfoMsg } from '../utils/message';
import { getSelectedDirPath } from '../utils/path';
import { data2Type } from '../utils/yapi2type';
import Yapi2ZodConfig from '../Yapi2ZodConfig';

function convertUnderscoreToHyphen(input: string): string {
	return input.replace(/_/g, '-');
}

async function generateCode(uri: Uri): Promise<void> {
	const apiId = await window.showInputBox({
		title: '请输入接口id',
		ignoreFocusOut: true,
	});

	if (!apiId) {
		if (apiId === '') {
			showErrMsg('请输入接口id！');
		}
		return;
	} else if (!isNumeric(apiId)) {
		showErrMsg('接口id为数字类型！');
		return;
	}

	const dirPath = getSelectedDirPath(uri);
	if (!dirPath) {
		return;
	}
	const res = (await fetchYapiApiData(apiId)).data;
	// 生成文件名
	const paths = res?.path?.split(/[/.]/g) || [];
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

	const tsData = await data2Type(res);
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
