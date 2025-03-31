export type Numeric = number | string;

/**
 * 获取数据类型
 * @param {any} arg
 */
export function getType(arg: unknown) {
	return Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
}

/**
 * 判断是否是数组
 * @param {any} arg
 */
export function isArray<T>(arg: unknown): arg is Array<T> {
	return getType(arg) === 'array';
}

/**
 * 是否是数字型数据。包含string类型
 * 注意诸如[1], ['1']等会隐式转为字符'1'
 * @param {any} arg
 */
export function isNumeric(arg: unknown): arg is Numeric {
	return !isArray(arg) && /^[+-]?[0-9]\d*$|^[+-]?[0-9]\d*\.\d+$/g.test(arg as string);
}

/**
 * @description 将下划线命名转换为大驼峰命名
 */
export const toPascalCase = (str: string): string => {
	return str
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join('');
};

/**
 * 判断是否是null数据类型
 * @param {any} arg
 */
export function isNull(arg: unknown): arg is null {
	return getType(arg) === 'null';
}

/**
 * 对象宽松的判断。 不包括null和数组，但是包括HTMLElement，Date等等其他对象
 * @param {any} arg
 */
export function isLooseObject(arg: unknown): arg is Record<PropertyKey, any> {
	return typeof arg === 'object' && !isNull(arg) && !isArray(arg);
}

/**
 * 是否是对象，同isLooseObject
 * 很多时候我们只是使用对象这种类型来方便存储数据而已，这里我们在喜好上采用宽松判断
 * @param {any} arg
 */
export function isObject(arg: unknown): arg is Record<PropertyKey, any> {
	// return Object.prototype.toString.call(arg) === '[object Object]';
	return isLooseObject(arg);
}

/**
 * 无可遍历属性视为空对象
 * @param {any} arg
 */
export function isEmptyObject(arg: unknown): arg is Record<PropertyKey, never> {
	// eslint-disable-next-line @typescript-eslint/ban-types
	return isObject(arg) && !Object.keys(arg as object).length;
}

/**
 * 提取最后一个括号里的内容
 */
export function extractContentInParentheses(text: string): string {
	// 匹配最后一个英文括号 () 或中文括号 （）中的内容
	const regex = /[(（][^)）]*[)）]/g;
	const matches = text.match(regex);

	// 匹配英文括号 () 或中文括号 （）
	if (matches && matches.length > 0) {
		// 提取最后一个匹配项，并去掉括号
		const lastMatch = matches[matches.length - 1];
		return lastMatch.slice(1, lastMatch.length - 1);
	}

	return '';
}
