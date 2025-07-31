import { get } from '../utils/request';
import type { IYapiResponse } from './types/yapi-types';
export type { IYapiResponse } from './types/yapi-types';

export async function getApiDetail(id: string) {
	return get<IYapiResponse>('/api/interface/get', { id });
}
