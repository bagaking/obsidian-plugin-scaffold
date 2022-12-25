import {Editor, MarkdownView, Notice, Plugin_2, TFile, Vault, Workspace, WorkspaceLeaf} from "obsidian";
import {LOG} from "./log";
import {pathJoin} from "./staff";


const logger = LOG("bk.obsutils");

export async function ensureFolderExists(vault: Vault, folderPath: string) {
	try {
		await vault.createFolder(folderPath);
	} catch (error) {
		if (!error.message.contains("Folder already exists")) {
			throw error;
		}
	}
}

// It is good idea to create the plugin more verbose
export async function displayErrorNotice(error: Error | string, file?: TFile) {
	if (file) {
		new Notice(`BKTimeline [Error]: Error while handling file ${file.name}, ${error.toString()}`);
	} else {
		new Notice(`BKTimeline [Error]: ${error.toString()}`);
	}
	console.error(`BKTimeline [Error]: ${error}`);
}

export function editorJumpTo(editor: Editor, rowInd: number, selectLine?: boolean) {
	// @ts-ignore
	if (!editor || rowInd === undefined) {
		return;
	}

	logger.info("editor jump to", editor, rowInd, selectLine);
	if (rowInd >= editor.lineCount()) {
		logger.err(`jump line error, line count exceeded ${rowInd}/${editor.lineCount()}`, editor, selectLine);
	}
	const lineStr = editor.getLine(rowInd);
	let from = {line: rowInd, ch: 0}, to = {
		line: rowInd,
		ch: selectLine ? (lineStr.length || 0) : 0
	};
	editor.setSelection(from, to);
	editor.scrollIntoView({from, to});
}

export async function showFile(workspace: Workspace, file: TFile, newSplit: boolean): Promise<void> {
	const leaf = newSplit ? workspace.splitActiveLeaf() : workspace.getUnpinnedLeaf();
	await leaf.openFile(file);
	workspace.setActiveLeaf(leaf, true, true);
}

export function getFileByPath(vault: Vault, path: string): TFile | undefined {
	const files = vault.getFiles();
	return files.find(f => f.path == path);
}

export function getFileByName(vault: Vault, name: string): TFile | undefined {
	const files = vault.getFiles();
	return files.find(f => f.name == name);
}

export function findActiveEditorOfActiveFile(workspace: Workspace): Editor | null {
	return findActiveEditorOfFile(workspace, workspace.getActiveFile());
}

export function findActiveEditorOfFile(workspace: Workspace, file: TFile | null): Editor | null {
	if (!file) return null;
	let editor: Editor | null = null;
	workspace.iterateAllLeaves(l => {
		if (!l.view || !(l.view instanceof MarkdownView)) {
			return;
		}
		if (file == l.view.file) {
			editor = l.view.editor;
		}
	});
	return editor;
}

export function issueLeafToMarkdown(leaf: WorkspaceLeaf) {
	if (!leaf) {
		logger.err(`cannot jump, cuz the active leaf is empty`);
	}
	const view = leaf.view;
	if (!(view instanceof MarkdownView)) {
		logger.err(`cannot jump, cuz the active leaf is not a markdown`, view);
		return;
	}
}

export function buildPluginStaticResourceSrc(plug: Plugin_2, assetPth: string, forceRefresh: boolean = true) {
	let url = plug.app.vault.adapter.getResourcePath(pathJoin(plug.app.vault.configDir, "plugins", plug.manifest.id, assetPth))
	return forceRefresh ? url : url.slice(0, url.lastIndexOf("?"))
}
