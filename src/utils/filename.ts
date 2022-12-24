import filenamify from "filenamify";

export const REGEX_FORBIDDEN_FILENAME_SYMBOLS = /[\s]+/g;

export function cleanFileName(name: string) {
	// filenamify contains rule : /[\\\/<>?:*\"|]+/g
	const cleanedName = filenamify(name).replace(REGEX_FORBIDDEN_FILENAME_SYMBOLS, "_");
	console.log(`file name cleaned, input= ${name}, output= ${cleanedName}`)
	return cleanedName;
}
