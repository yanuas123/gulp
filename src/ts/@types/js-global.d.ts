// coockie parser
interface docCookies {
	setItem(name: string, value: string, end: number): void;
	getItem(name: string): string;
	removeItem(name: string): void;
}
declare let docCookies: docCookies;