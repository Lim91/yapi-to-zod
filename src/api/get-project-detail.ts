import { get } from '../utils/request';

export interface IYapiProjectRes {
	name?: string;
	[key: PropertyKey]: unknown;
}

export async function getProjectDetail(id: string) {
	return get<IYapiProjectRes>('/api/project/get', { id });
}
