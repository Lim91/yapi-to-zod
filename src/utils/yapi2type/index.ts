import {
	AllTypeNode,
	getModelName,
	IReqObjectBody,
	reqBody2type,
	reqQuery2type,
	resBody2type,
	resBodySubProp2type,
	resFormBody2type,
	ResObjectBody,
} from './json2type';

import type { IYapiResponse } from '../../api/types/yapi-types';
import Yapi2ZodConfig, { IProjectConfig } from '../../Yapi2ZodConfig';
import { isEmptyObject, toPascalCase } from '../common';
import { SERVER_URL } from '../constant/common';
import { ResponseKeyEnum } from './config';
import { parseJson } from './utils';

/**
 * @description 获取接口名称
 */
const getApiName = (data: IYapiResponse) => {
	const paths = data?.path?.split(/[/.]/g) || [];
	const lastWord = paths[paths.length - 1];
	// const preLastWord = paths[paths.length - 2]
	return toPascalCase(lastWord);
};

// /**
//  * @description 格式化数字2位，0填充
//  */
// const format2num = (num: number | string) => {
// 	const strNum = num.toString();
// 	return strNum.length === 1 ? '0' + strNum : strNum;
// };
// /**
//  * @description 格式化时间
//  */
// const formatTime = (stamp: number) => {
// 	const date = new Date(stamp * 1e3);
// 	return `${date.getFullYear()}-${format2num(date.getMonth() + 1)}-${format2num(
// 		date.getDate()
// 	)} ${format2num(date.getHours())}:${format2num(
// 		date.getMinutes()
// 	)}:${format2num(date.getSeconds())}`;
// };

/**
 * @description 格式化顶部的注释说明
 */
const formatInterfaceComment = (data: IYapiResponse, subName: string) => {
	return `/**
 * @description ${data.title}-${subName}
 */`;
};

export const formatBaseTips = (data: IYapiResponse, decs = '') => {
	return `/**
 * ${decs}，暂时无法生成类型
 * 详情点击：${getApiUrl(data)}
*/\n`;
};

export const genHeader = (projectConfig: IProjectConfig | undefined) => {
	if (!projectConfig) {
		return '';
	}

	const rows = [`import z from 'zod';`];

	const header = projectConfig?.apiFile?.header;
	if (header && Array.isArray(header) && header.length) {
		rows.unshift(...header);
	}
	return rows.join(`\n`);
};

export const genTypes = (modelNames: string[]) => {
	const content = modelNames.map((modelName) => {
		const interfaceName = modelName.replace(/Model$/, '');
		return `export type ${interfaceName}Type = z.infer<typeof ${modelName}>;`;
	});

	return content.length ? content.join(`\n`) : '';
};

type GenRequestOptionsType = {
	/** 接口名称 */
	interfaceName: string;
	/** 是否有请求类型 */
	hasReqDefine: boolean;
	/** 是否有响应类型 */
	hasResDefine: boolean;
	/** 请求数据zod模型名称 */
	reqModelName: string;
	/** 响应数据zod模型名称 */
	resModelName: string;
} & IProjectConfig;
export const genRequest = (data: IYapiResponse, options: GenRequestOptionsType) => {
	const { interfaceName, hasReqDefine, hasResDefine, reqModelName, resModelName } =
		options;
	const comment = `/**
 * @description ${data.title}
 * @see {@link ${getApiUrl(data)}}
 */`;
	const defMethodName = `${interfaceName}ApiDef`;

	if (options.apiFile?.genRequest) {
		return options.apiFile.genRequest(
			{
				comment,
				interfaceName,
				apiPath: data?.path,
				reqModelName: hasReqDefine ? reqModelName : undefined,
				resModelName: hasResDefine ? resModelName : undefined,
			},
			data,
		);
	}

	const apiDef = `${comment}
export const ${defMethodName} = BizRemoteRequestApiDef.url(
  '${data.path}',
)
  .method('${data.method}')
  .custom({ version: 'v2', service: '' })${
		hasReqDefine
			? `
  .data(${reqModelName})`
			: ''
	}${
		hasResDefine
			? `
  .response(
    RemoteBaseResponse.extend({
      data: ${resModelName},
    }),
  )`
			: ''
	};`;

	const apiObserver = `/**
 * @description ${data.title}
 */
export const ${interfaceName}ApiObserver = BizRemoteRequestObserver.consume(${defMethodName});`;

	return `${apiDef}\n\n${apiObserver}`;
};

export const getApiUrl = (data: IYapiResponse) => {
	return SERVER_URL + `/project/${data.project_id}/interface/api/${data._id}`;
};
/**
 * @description 数据转类型
 */
export async function data2Type(data: IYapiResponse) {
	const yapi2ZodConfig = Yapi2ZodConfig.getInstance();
	const projectConfig = yapi2ZodConfig.projectConfig;
	const { responseKey, responseCustomKey } = projectConfig || {};

	const interfaceName = getApiName(data); // 接口名称，大驼峰写法
	const reqModelName = getModelName(interfaceName, 'Req');
	const resModelName = getModelName(interfaceName, 'Res');
	const reqQuery = data?.req_query?.length
		? `${formatInterfaceComment(data, 'query请求参数')}\n${reqQuery2type(reqModelName, data.req_query)}`
		: '';
	const reqBody =
		data.req_body_other &&
		!isEmptyObject((parseJson(data.req_body_other) as IReqObjectBody).properties)
			? `${formatInterfaceComment(data, 'post请求体')}\n${reqBody2type(
					reqModelName,
					parseJson(data.req_body_other),
				)}`
			: '';
	const reqBodyForm = data.req_body_form?.length
		? `${formatInterfaceComment(data, 'post请求体')}\n${resFormBody2type(reqModelName, data.req_body_form)}`
		: '';
	const reqDefine =
		data.method.toLowerCase() === 'get' ? reqQuery : reqBody || reqBodyForm;

	const parseResBody = parseJson(data.res_body);
	const resBodyType = data.res_body
		? `${formatInterfaceComment(data, '响应体')}\n${resBody2type(resModelName, parseResBody)}`
		: '';

	const isReturnResDataProp =
		!responseKey ||
		ResponseKeyEnum.DATA === responseKey ||
		ResponseKeyEnum.CUSTOM === responseKey;

	const getNestData = (data: Record<string, any>, str: string) => {
		return str.split('.').reduce((prev, curr) => {
			prev = prev?.['properties']?.[curr];
			return prev;
		}, data) as AllTypeNode;
	};

	const dataKey =
		isReturnResDataProp && ResponseKeyEnum.DATA === responseKey
			? responseKey
			: responseCustomKey || 'data';

	const resBodyDataType = Object.keys(
		(getNestData(parseResBody, dataKey) as ResObjectBody).properties,
	).length
		? `${formatInterfaceComment(data, '响应体')}\n${resBodySubProp2type(
				resModelName,
				getNestData(parseResBody, dataKey),
			)}`
		: '';

	const resDefine = isReturnResDataProp ? resBodyDataType : resBodyType;

	const typeContent = genTypes(
		[reqDefine ? reqModelName : undefined, resDefine ? resModelName : undefined].filter(
			Boolean,
		) as string[],
	);

	const header = genHeader(projectConfig);

	const requestContent = genRequest(data, {
		interfaceName,
		hasReqDefine: !!reqDefine,
		hasResDefine: !!resDefine,
		reqModelName,
		resModelName,
		...projectConfig,
	});

	return {
		header,
		reqDefine,
		resDefine,
		typeContent,
		requestContent,
		reqQuery,
		reqBody: reqBody || reqBodyForm,
	};
}
