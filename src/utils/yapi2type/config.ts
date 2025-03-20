/** 生成 res 包含的属性，默认 all, 可指定为 data */
export enum ResponseKeyEnum {
	/** 返回所有属性 */
	ALL = 'all',
	/** 仅返回 data 属性 */
	DATA = 'data',
	/** 自定义属性 */
	CUSTOM = 'custom',
}
