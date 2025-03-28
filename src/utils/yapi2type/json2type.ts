/**
 * @description 对数据进一步抽象，分析json语法树
 */
import { encodeKey } from './utils';

/** 请求体类型 */
type ReqBody = ResObjectBody;

export interface IReqObjectBody {
	/** 数据类型 */
	type: `${YapiDataType.Object}`;
	/** 属性枚举 */
	properties: Record<string, AllTypeNode>;
	title?: string;
	description?: string;
	required?: string[];
}

/** 返回对象类型 */
export interface ResObjectBody {
	/** 数据类型 */
	type: `${YapiDataType.Object}`;
	/** 属性枚举 */
	properties: Record<string, AllTypeNode>;
	title?: string;
	description?: string;
	required?: string[];
}
/** 返回数组类型 */
interface ResArrayBody {
	type: `${YapiDataType.Array}`;
	items: ResObjectBody;
	description?: string;
	required?: string[];
}

/** json抽象语法树的节点 */
export type AllTypeNode =
	| {
			type: `${
				| YapiDataType.Number
				| YapiDataType.Integer
				| YapiDataType.String
				| YapiDataType.Boolean
				| YapiDataType.Null
				| YapiDataType.Long}`;
			description?: string;
			required?: string;
	  }
	| ResObjectBody
	| ResArrayBody;

/** 请求query参数 */
type ReqQuery = {
	required: string;
	_id: string;
	name: string;
	desc: string;
}[];

const enum YapiDataType {
	Array = 'array',
	Boolean = 'boolean',
	Integer = 'integer',
	Null = 'null',
	Number = 'number',
	Object = 'object',
	String = 'string',
	Long = 'long',
}

const YapiTypeMapBasicTsType = {
	[YapiDataType.Boolean]: 'z.boolean()',
	[YapiDataType.Integer]: 'z.number().int()',
	[YapiDataType.Null]: 'z.nullable()',
	[YapiDataType.Number]: 'z.number()',
	[YapiDataType.String]: 'z.string()',
	[YapiDataType.Long]: 'z.string().or(z.number())',
};

const ZodAny = 'z.any()';

const YapiTypeMapTsType = {
	...YapiTypeMapBasicTsType,
	[YapiDataType.Array]: '.array()',
	[YapiDataType.Object]: 'z.object({})',
	int64: 'z.number()',
	text: 'z.string()',
};

export function isBasicType(
	type: `${YapiDataType}`,
): type is keyof typeof YapiTypeMapBasicTsType {
	const basicTypeList: string[] = [
		YapiDataType.Boolean,
		YapiDataType.Integer,
		YapiDataType.Null,
		YapiDataType.Number,
		YapiDataType.String,
		YapiDataType.Long,
	];
	return basicTypeList.includes(type);
}

/**
 * @description 首字母大写，可以拼接后缀
 */
export function firstCharUpperCase(word: string, suffix = '') {
	if (!word) {
		return '';
	}
	return word[0].toUpperCase() + word.slice(1) + suffix;
}

/**
 * @description 格式化tab
 */
export function formatTabSpace(tabCount: number) {
	return '  '.repeat(tabCount);
}

/**
 * @description 格式化注释
 */
export function formatComment(comment: string | undefined, tabCount = 0) {
	return comment ? `\n${formatTabSpace(tabCount)}/** ${comment} */` : '';
}

/**
 * @description GET请求参数转化typescript interface
 */
export function reqQuery2type(modelName: string, queryList: ReqQuery) {
	return `export const ${modelName} = z.object({${queryList
		.map((query) => {
			const comment = formatComment(query.desc || '', 1);
			const isRequired = query.required === '1';
			return `${comment}\n${formatTabSpace(1)}${query.name}: z.string().or(z.number())${isRequired ? '' : '.optional()'}`;
		})
		.join(',')},\n});`;
}

/**
 * 生成对应的内容
 * @param node
 * @param tabCount
 * @param hadAddTabCount
 * @returns
 */
function getTypeNode(node: AllTypeNode, tabCount = 0, hadAddTabCount = false): string {
	node.type =
		typeof node.type === 'string'
			? (node.type.toLowerCase() as `${YapiDataType}`)
			: ('string' as `${YapiDataType}`);

	if (isBasicType(node.type)) {
		return YapiTypeMapBasicTsType[node.type] || ZodAny;
	}

	if (YapiDataType.Object === node.type) {
		if (!node.properties || !Object.keys(node.properties).length) {
			return 'z.object({})';
		}

		return `z.object({${Object.keys(node.properties)
			.map((prop) => {
				const value = node.properties[prop];
				const comment = formatComment(value.description, tabCount + 1);
				const key = encodeKey(prop);
				const isRequired = (node.required || value.required)?.includes(prop);

				return `${comment}\n${formatTabSpace(tabCount + 1)}${key}: ${getTypeNode(
					value,
					tabCount + 1,
					true,
				)}${isRequired ? '' : '.optional()'}`;
			})
			.join(',')},\n${formatTabSpace(tabCount)}})`;
	}

	if (YapiDataType.Array === node.type) {
		return (
			getTypeNode(node.items, tabCount + (hadAddTabCount ? 0 : 1)) +
			YapiTypeMapTsType[YapiDataType.Array]
		);
	}
	return '';
}

function getFormTypeNode(
	reqFormBody: {
		required: '0' | '1';
		_id: string;
		name: string;
		type: YapiDataType;
		example: string;
		desc: string;
	}[],
) {
	if (!reqFormBody) {
		return '';
	}

	return `{${reqFormBody.map((item) => {
		const comment = formatComment(item.desc, 1);
		const isRequired = item.required === '1';
		return `${comment}\n${formatTabSpace(1)}${item.name}: ${YapiTypeMapTsType[item.type]}${isRequired ? '' : '.optional()'}`;
	})}}`;

	return '';
}

/**
 * @description POST请求体转化typescript interface
 */
export function resBody2type(modelName: string, resBody: AllTypeNode) {
	const result = `export const ${modelName} = ${getTypeNode(resBody)};`;

	return result;
}
/**
 * @description FORM POST请求体转化typescript interface
 */
export function resFormBody2type(modelName: string, resBody: any[]) {
	const result = `export const ${modelName} = ${getFormTypeNode(resBody)};`;

	return result;
}

export const getModelName = (name: string, suffix = '') => `${name}${suffix}Model`;

export function resBodySubProp2type(modelName: string, resBody: AllTypeNode) {
	try {
		const typeNode = getTypeNode(resBody);

		return `export const ${modelName} = ${typeNode};`;
	} catch (error) {
		return '';
	}
}
/**
 * @description POST响应体转化typescript interface
 */
export function reqBody2type(modelName: string, reqBody: ReqBody) {
	return resBody2type(modelName, reqBody);
}

/**
 * @description FROM POST响应体转化typescript interface
 */
export function reqFormBody2type(modelName: string, reqBody: ReqBody) {
	return resBody2type(modelName, reqBody);
}
