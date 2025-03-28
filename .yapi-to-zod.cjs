module.exports = () => {
	return {
		/** 头部内容，可以填写导入的请求实例等 */
		header: [],
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
};