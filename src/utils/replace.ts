import {URL} from "url";
import path from "path";

import {App, DataAdapter, TFile, TFolder, Vault} from "obsidian";

import { isUrl, downloadImage, fileExtByContent, pathJoin} from "./staff";
import {linkHashes} from "./linksHash";
import {renderTemplate} from "./template";
import {cleanFileName} from "./filename";

export const FILENAME_TEMPLATE = "media_asset";
export const MAX_FILENAME_INDEX = 1000;
export const FILENAME_ATTEMPTS = 5;


// It will be better to do it type-correct. https://stackoverflow.com/a/48032528/1020973
export async function replaceAsync(str: any, regex: RegExp, asyncFn: (match: string, ...args: any) => Promise<string>) {
	const promises: Promise<any>[] = [];
	str.replace(regex, (match: string, ...args: any) => {
		const promise = asyncFn(match, ...args);
		promises.push(promise);
	});
	const data = await Promise.all(promises);
	return str.replace(regex, () => data.shift());
}

export function replaceSync(str: string, regex: RegExp, syncFn: (match: string, ...args: any) => string) {
	return str.replace(regex, syncFn);
}

export class RegexProcessor {
	name: string;
	processHandler: (match: string, ...args: any) => Promise<string>;
	regex: RegExp;

	constructor(regex: RegExp, processHandler: (match: string, ...args: any) => Promise<string>, name: string) {
		this.regex = regex;
		this.processHandler = processHandler;
		this.name = name
	}

	public async DoAsync(content: string, modifier: Function): Promise<boolean> {
		let ret = await replaceAsync(content, this.regex, this.processHandler);
		if (ret !== content) {
			modifier(ret)
			return true;
		}
		return false;
	}
}

export const titleProc = new RegexProcessor(
	/(?<ind>\d+)\.\s*(?<tag>#+)\s*(?<content>[^\n\r]*)\s*\n/g,
	async function (match: string, ind: string, tag: string, content: string) {
		return `${tag} ${ind}. ${content}\n`;
	}, "Title Proc"
);

export const quoteListProc = new RegexProcessor(
	/^(?<front>[ \t]*-)[ \t]+>/gm,
	async function (match: string, front: string) {
		console.log("quoteListProc", match)
		return `> ${front}`;
	}, "Quote List Proc"
);

export const redundantBlankProc = new RegexProcessor(
	/(?<symbol>-|(?:\d+\.))[ \t]+(?<content>[^\n\r]*)\s*\n/g,
	async function (match: string, symbol: string, content: string) {
		return `${symbol} ${content}\n`;
	}, "Redundant Blank Proc"
);

export const headerBreathProc = new RegexProcessor(
	/(?<raw>\S+)\s*[\n\r]+#/g,
	async function (match: string, raw: string) {
		return `${raw}\n\n#`;
	}, "Header Breath Proc"
);

export const quoteBreathProc = new RegexProcessor(
	/^^>(?<raw>.*[\n\r])[\n\r]+>/gm,
	async function (match: string, raw: string) {
		return `>${raw}>\n>`;
	}, "Quote Breath Proc"
);

export function imageTagProcessor(app: App, mediaDir: string, namePattern: string, file: TFile) {
	const refFile = {
		basename: file.basename,
		stat: file.stat,
		extension: file.extension,
		vault: file.vault,
		path: file.path,
		name: file.name,
		parent: file.parent
	};

	async function processImageTag(match: string, anchor: string, link: string) {
		if (!isUrl(link)) {
			return match;
		}

		try {
			const fileData = await downloadImage(link);

			// when several images refer to the same file they can be partly
			// failed to download because file already exists, so try to resuggest filename several times
			let attempt = 0;
			while (attempt < FILENAME_ATTEMPTS) {
				try {
					const {fileName, needWrite} = await chooseFileName(
						app.vault.adapter,
						mediaDir,
						anchor,
						namePattern,
						refFile,
						link,
						fileData
					);

					if (needWrite && fileName) {
						await app.vault.createBinary(fileName, fileData);
						console.log(`binary created ${fileName}`);
					}

					if (fileName) {
						return `![${anchor}](${fileName})`;
					} else {
						return match;
					}
				} catch (error) {
					if (error.message === "File already exists.") {
						attempt++;
					} else {
						throw error;
					}
				}
			}
			return match;
		} catch (error) {
			console.warn("Image processing failed: ", error);
			return match;
		}
	}

	return processImageTag;
}

async function chooseFileName(
	adapter: DataAdapter,
	dir: string,
	anchor: string,
	namePattern: string,
	refFile: TFile,
	link: string,
	contentData: ArrayBuffer
): Promise<{ fileName: string; needWrite: boolean }> {
	const fileExt = await fileExtByContent(contentData);
	if (!fileExt) {
		return {fileName: "", needWrite: false};
	}
	// if there is no anchor try get file name from url
	let baseName = renderTemplate(namePattern, {
		anchor, file: refFile
	});

	// if there is no anchor try get file name from url
	if (!baseName) {
		const parsedUrl = new URL(link);
		baseName = path.basename(parsedUrl.pathname);
	}
	// if there is no part for file name from url use name template
	if (!baseName) {
		baseName = FILENAME_TEMPLATE;
	}

	// if filename already ends with correct extension, remove it to work with base name
	if (baseName.endsWith(`.${fileExt}`)) {
		baseName = baseName.slice(0, -1 * (fileExt.length + 1));
	}

	baseName = cleanFileName(baseName);

	let fileName = "";
	let needWrite = true;
	let index = 0;
	while (!fileName && index < MAX_FILENAME_INDEX) {
		const suggestedName = index
			? pathJoin(dir, `${baseName}-${index}.${fileExt}`)
			: pathJoin(dir, `${baseName}.${fileExt}`);

		if (await adapter.exists(suggestedName, false)) {
			linkHashes.ensureHashGenerated(link, contentData);

			const fileData = await adapter.readBinary(suggestedName);

			if (linkHashes.isSame(link, fileData)) {
				fileName = suggestedName;
				needWrite = false;
			}
		} else {
			fileName = suggestedName;
		}

		index++;
	}
	if (!fileName) {
		throw new Error("Failed to generate file name for media file.");
	}

	linkHashes.ensureHashGenerated(link, contentData);

	return {fileName, needWrite};
}
