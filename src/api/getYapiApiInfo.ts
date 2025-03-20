import { get } from './api';
import type { IYapiResponse } from './types/yapi-types';
export type { IYapiResponse } from './types/yapi-types';

export async function fetchYapiApiData(id: string) {
	return get<IYapiResponse>('api/interface/get', { id });
}
