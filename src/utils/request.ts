import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { login } from '../api/login';
import Yapi2ZodConfig from '../Yapi2ZodConfig';
import { AllStorageType } from './constant/storage';
import { LOGIN_PATH, SERVER_URL } from './constant/yapi';
import { showErrMsg } from './message';
import storage from './storage';

type AxiosResponseType<T> = AxiosResponse<T> & {
	errcode: number;
};

// 是否正在登录
let isLoggingIn = false;
// 请求池
let requestPool: { (value: boolean | PromiseLike<boolean>): void }[] = [];

const instance = axios.create({
	withCredentials: true,
	timeout: 30000, // 超时时间30秒
	baseURL: SERVER_URL,
	headers: {
		'Content-Type': 'application/json;charset=UTF-8',
		Cookie: storage.getStorage(AllStorageType.COOKIE) || '',
	},
});

instance.interceptors.request.use((config) => {
	console.info('发起请求：', config.url);
	const cookie = storage.getStorage<string>(AllStorageType.COOKIE) || '';
	Object.assign(config.headers, {
		Cookie: cookie,
	});

	return config;
});

instance.interceptors.response.use(
	async (res) => {
		const cookie = res.headers['set-cookie']
			?.map((item) => item.split(';')[0])
			.join('; ');
		if (cookie) {
			await storage.setStorage(AllStorageType.COOKIE, cookie);
		}
		console.info('响应结果 res：', res);
		return res.data;
	},
	(error) => {
		let msg = '请求失败';
		if (typeof error === 'string' && error.length) {
			msg = error;
		} else if (error instanceof Error && error.message.length) {
			msg = error.message;
		}
		showErrMsg(msg);

		console.error('请求失败：', error);
		return Promise.reject(error);
	},
);

const yapiRequest = {
	get<T>(path: string, params?: AxiosRequestConfig['params']) {
		return this.request<T>({
			method: 'GET',
			url: path,
			params,
		});
	},
	post<T>(path: string, data?: AxiosRequestConfig['data']) {
		return this.request<T>({
			method: 'POST',
			url: path,
			data,
		});
	},

	request: async <T>(config: AxiosRequestConfig): Promise<AxiosResponseType<T>> => {
		const { url } = config;

		const isLoginPath = url?.includes(LOGIN_PATH); // 是否是登录接口
		if (isLoginPath) {
			return instance
				.request<T, AxiosResponseType<T>>(config)
				.then(async (res) => {
					if (res.errcode !== 0) return Promise.reject();

					isLoggingIn = false;
					console.info('登录成功', res);
					for (const resolve of requestPool) {
						resolve(true);
					}
					return res;
				})
				.catch((error) => {
					isLoggingIn = false;
					for (const resolve of requestPool) {
						resolve(false);
					}

					const msg = '登录失败';
					console.error(msg, error);
					showErrMsg(msg);
					return Promise.reject(error);
				})
				.finally(() => {
					requestPool = [];
				});
		}

		// 判断是否存在cookie
		const hasLoginCookie = !!storage.getStorage<string>(AllStorageType.COOKIE);
		const email = Yapi2ZodConfig.getPluginConfiguration('email');
		const password = Yapi2ZodConfig.getPluginConfiguration('password');
		if (!email || !password) {
			const msg = '请先配置邮箱和密码';
			showErrMsg(msg);
			return Promise.reject(msg);
		}

		// 正在登录...
		if (isLoggingIn || !hasLoginCookie) {
			return pushToRequestPool<T>(config, { email, password });
		}

		const response = await instance.request<T, AxiosResponseType<T>>(config);
		const errcode = response?.errcode;
		if (errcode === 40011) {
			return pushToRequestPool<T>(config, { email, password });
		}
		if (errcode !== 0) {
			let msg = '请求失败';
			if (errcode === 490) {
				msg = '接口id不存在';
			}
			showErrMsg(msg);
			return Promise.reject(msg);
		}

		return response;
	},
};

// 将请求推入请求池并返回一个 Promise
const pushToRequestPool = <T>(
	config: AxiosRequestConfig,
	{ email, password }: { email: string; password: string },
): Promise<AxiosResponseType<T>> => {
	if (!isLoggingIn) {
		isLoggingIn = true;
		login({ email, password });
	}
	return new Promise<boolean>((resolve) => {
		requestPool.push(resolve);
	}).then((status) => {
		if (!status) {
			return Promise.reject();
		}
		return yapiRequest.request<T>(config);
	});
};

export default yapiRequest;
