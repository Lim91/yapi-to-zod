import { ExtensionContext } from 'vscode';

import { AllStorageType } from './constant/storage';

type StorageTypePlus = `${AllStorageType}` | `${AllStorageType}_${string}`;

class Store<IStorage extends Record<StorageTypePlus, any>> {
	context: ExtensionContext | null = null;

	init(context: ExtensionContext) {
		this.context = context;
	}
	setStorage(key: StorageTypePlus, value: unknown) {
		return this.context?.globalState.update(key, value);
	}
	getStorage<DefaultValue = unknown, T extends StorageTypePlus = StorageTypePlus>(
		key: T,
	):
		| (IStorage[T] extends NonNullable<IStorage[T]> ? IStorage[T] : DefaultValue)
		| undefined {
		return this.context?.globalState.get(key);
	}
	clear(key: StorageTypePlus) {
		this.context?.globalState.update(key, undefined);
	}
	clearAll() {
		// 清空储存
		Object.values(AllStorageType).forEach((key) => {
			this.clear(key);
		});
	}
}
export default new Store();
