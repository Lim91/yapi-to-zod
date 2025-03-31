import newApiTemplate from './new-api-template';
import newConfigProfile from './new-config-profile';

interface CommandTable {
	[propName: string]: (...args: any[]) => void | Promise<void>;
}

const commandTable: CommandTable = {
	'extension.newApiTemplate': newApiTemplate,
	'extension.newConfigProfile': newConfigProfile,
};

export default commandTable;
