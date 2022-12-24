import path from "path";
import got from "got";
import {fileTypeFromBuffer} from "file-type";
import isSvg from "is-svg";

export function isUrl(link: string) {
	try {
		return Boolean(new URL(link));
	} catch (_) {
		return false;
	}
}

export async function downloadImage(url: string): Promise<ArrayBuffer> {
	const res = await got(url, {responseType: "buffer"});
	return res.body;
}

export async function fileExtByContent(content: ArrayBuffer) {
	const fileExt = (await fileTypeFromBuffer(content))?.ext;

	// if XML, probably it is SVG
	if (fileExt == "xml") {
		const buffer = Buffer.from(content);
		if (isSvg(buffer)) return "svg";
	}

	return fileExt;
}

function recreateImageTag(match: string, anchor: string, link: string) {
	return `![${anchor}](${link})`;
}

export function pathJoin(dir: string, ...paths: string[]): string {
	const result = path.join(dir, ...paths)
	// it seems that obsidian do not understand paths with backslashes in Windows, so turn them into forward slashes
	return result.replace(/\\/g, "/");
}

export function combineRegex(regParent: RegExp, placeHolder: string, regChild: RegExp): RegExp {
	const cleanChildSource = regChild.source.replace(/\(\?\<\w+>/g, "(?:");
	return new RegExp(regParent.source.replace(placeHolder, cleanChildSource), regParent.flags);
}
