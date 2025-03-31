import yapiRequest from '../utils/request';

export interface IYapiProjectRes {
	name?: string;
	[key: PropertyKey]: any;
}

export async function getProjectDetail(id: string) {
	return yapiRequest.get<IYapiProjectRes>('/api/project/get', { id });
}
