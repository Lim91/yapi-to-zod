import { LOGIN_PATH } from '../utils/constant/yapi';
import yapiRequest from '../utils/request';

/** 登录 */
export const login = (data: { email: string; password: string }) => {
	return yapiRequest.post(LOGIN_PATH, data);
};
