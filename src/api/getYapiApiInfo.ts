import yapiRequest from '../utils/request';
import type { IYapiResponse } from './types/yapi-types';
export type { IYapiResponse } from './types/yapi-types';

export async function fetchYapiApiData(id: string) {
	return yapiRequest.get<IYapiResponse>('api/interface/get', { id });
}
