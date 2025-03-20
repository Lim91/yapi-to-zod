/** 请求方式 */
export enum Method {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
	HEAD = 'HEAD',
	OPTIONS = 'OPTIONS',
	PATCH = 'PATCH',
}

/** 是否必需 */
export enum Required {
	/** 不必需 */
	false = '0',
	/** 必需 */
	true = '1',
}

/** 请求数据类型 */
export enum RequestBodyType {
	/** 查询字符串 */
	query = 'query',
	/** 表单 */
	form = 'form',
	/** JSON */
	json = 'json',
	/** 纯文本 */
	text = 'text',
	/** 文件 */
	file = 'file',
	/** 原始数据 */
	raw = 'raw',
	/** 无请求数据 */
	none = 'none',
}

/** 请求路径参数类型 */
export enum RequestParamType {
	/** 字符串 */
	string = 'string',
	/** 数字 */
	number = 'number',
}

/** 请求查询参数类型 */
export enum RequestQueryType {
	/** 字符串 */
	string = 'string',
	/** 数字 */
	number = 'number',
}

/** 请求表单条目类型 */
export enum RequestFormItemType {
	/** 纯文本 */
	text = 'text',
	/** 文件 */
	file = 'file',
}

/** 返回数据类型 */
export enum ResponseBodyType {
	/** JSON */
	json = 'json',
	/** 纯文本 */
	text = 'text',
	/** XML */
	xml = 'xml',
	/** 原始数据 */
	raw = 'raw',

	// yapi 实际上返回的是 json，有另外的字段指示其是否是 json schema
	/** JSON Schema */
	// jsonSchema = 'json-schema',
}

/** 查询字符串数组格式化方式 */
export enum QueryStringArrayFormat {
	/** 示例: `a[]=b&a[]=c` */
	'brackets' = 'brackets',
	/** 示例: `a[0]=b&a[1]=c` */
	'indices' = 'indices',
	/** 示例: `a=b&a=c` */
	'repeat' = 'repeat',
	/** 示例: `a=b,c` */
	'comma' = 'comma',
	/** 示例: `a=["b","c"]` */
	'json' = 'json',
}

// export interface IResBody {
//   $schema: string;
//   properties: {
//     code: {
//       default: string;
//       type: string;
//     };
//     data: {
//       type: string;

//     };
//     msg:
//   }
//   required: string[];
//   type: string;
// }

/** 接口定义 */
export interface IYapiResponse {
	type: string;
	api_opened: boolean;
	index: number;
	__v: number;
	/** 接口 ID */
	_id: number;
	/** 接口在 YApi 上的地址（由 YTT 自行实现） */
	_url: string;
	/** 接口名称 */
	title: string;
	/** 状态 */
	status: 'done' | 'undone';
	/** 接口备注 */
	markdown: string;
	/** 请求路径 */
	path: string;
	/** 请求方式，HEAD、OPTIONS 处理与 GET 相似，其余处理与 POST 相似 */
	method: 'GET' | 'POST' | 'DELETE' | 'PUT';
	/** 所属项目 id */
	project_id: number;
	/** 所属分类 id */
	catid: number;
	/** 标签列表 */
	tag: string[];
	query_path: {
		path: string;
		params: string[];
	};
	/** 请求头 */
	req_headers: (
		| string
		| {
				required: string;
				_id: string;
				name: string;
				value: string;
		  }
	)[];
	/** 路径参数 */
	req_params: Array<{
		/** 名称 */
		name: string;
		/** 备注 */
		desc: string;
		/** 示例 */
		example: string;
		/** 类型（YApi-X） */
		type?: RequestParamType;
	}>;
	/** 仅 GET：请求串 */
	req_query: Array<{
		/** 备注 */
		desc: string;
		/** 示例 */
		example: string;
		/** 名称 */
		name: string;
		/** 是否必需 */
		required: Required;
		_id: string;
	}>;
	/** 仅 POST：请求内容类型。为 text, file, raw 时不必特殊处理。 */
	req_body_type: 'json';
	/** `req_body_type = json` 时是否为 json schema */
	req_body_is_json_schema: boolean;
	/** `req_body_type = form` 时的请求内容 */
	req_body_form: Array<{
		/** 名称 */
		name: string;
		/** 类型 */
		type: RequestFormItemType;
		/** 备注 */
		desc: string;
		/** 示例 */
		example: string;
		/** 是否必需 */
		required: Required;
	}>;
	/** `req_body_type = json` 时的请求内容 */
	req_body_other: string;
	/** 返回数据类型 */
	res_body_type: ResponseBodyType;
	/** `res_body_type = json` 时是否为 json schema */
	res_body_is_json_schema: boolean;
	/** 返回数据 */
	res_body: string;
	/** 创建时间（unix时间戳） */
	add_time: number;
	/** 更新时间（unix时间戳） */
	up_time: number;
	/** 创建人 ID */
	uid: number;
	[key: string]: any;
}
