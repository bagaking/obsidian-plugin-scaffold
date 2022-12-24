export const DIRTY_IMAGE_TAG = /\[\!\[\[(?<anchor>.*?)\]\]\((?<link>.+?)\)\]/g;

function recreateImageTag(match: string, anchor: string, link: string) {
	return `![${anchor}](${link})`;
}

export function clearImageTag(content: string) {
	const cleanedContent = content.replace(DIRTY_IMAGE_TAG, recreateImageTag);
	return cleanedContent;
}
