import newApiTemplate from './newApiTemplate';
import newConfigProfile from './newConfigProfile';

interface CommandTable {
	[propName: string]: (...args: any[]) => void | Promise<void>;
}

const commandTable: CommandTable = {
	'extension.newApiTemplate': newApiTemplate,
	'extension.newConfigProfile': newConfigProfile,
};

export default commandTable;
