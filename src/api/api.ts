import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Yapi2ZodConfig from '../Yapi2ZodConfig';
import { SERVER_URL } from '../utils/constant/common';
import { showErrMsg } from '../utils/message';

interface IApiResponse<T> {
	data: T;
	errorcode: number;
	errmsg: string;
}

const instance = axios.create({
	withCredentials: true,
	timeout: 30000, // 超时时间30秒
	baseURL: SERVER_URL,
});

instance.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	(error) => {
		const msg = error.message || '请求错误';
		showErrMsg(msg);
		console.error('Error fetching data:', error);
	},
);

export const request = async <T>(_params: {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	url: string;
	data?: Record<PropertyKey, any>;
	params?: Record<PropertyKey, any>;
}): Promise<AxiosResponse<IApiResponse<T>>> => {
	const { method, url, data, params } = _params;
	try {
		const yapi2ZodConfig = Yapi2ZodConfig.getInstance();
		const cookie = yapi2ZodConfig.projectConfig?.cookie;
		if (!cookie) {
			const msg = '请配置请求cookie！';
			throw new Error(msg);
		}

		const config: AxiosRequestConfig = {
			method,
			url,
			headers: {
				Cookie: cookie,
			},
		};

		if (data) {
			config.data = data;
		}

		if (params) {
			config.params = params;
		}

		const response = await instance.request(config);
		// console.warn('response', response);

		if (response.status !== 200) {
			throw new Error('');
		}

		const errcode = response.data.errcode;
		if (errcode !== 0) {
			let msg = '';
			if (errcode === 40011) {
				msg = 'cookie过期';
			}
			if (errcode === 490) {
				msg = 'id不存在';
			}
			throw new Error(msg);
		}

		return response;
	} catch (error: any) {
		const msg = error.message || '请求错误';
		showErrMsg(msg);
		console.error('Error fetching data:', error);
		throw error;
	}
};

export const get = <T>(url: string, params?: Record<PropertyKey, any>) => {
	return request<T>({ method: 'GET', url, params });
};

export const post = <T>(url: string, data?: Record<PropertyKey, any>) => {
	return request<T>({ method: 'POST', url, data });
};
