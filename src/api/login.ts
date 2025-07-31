import { LOGIN_PATH } from '../utils/constant/yapi';
import { post } from '../utils/request';

/** 登录 */
export const login = (data: { email: string; password: string }) => {
	return post(LOGIN_PATH, data);
};
