import path from "path";

import YAML from 'yaml'

import {App, Editor, MarkdownView, Notice, Plugin_2, TFile, Vault, Workspace, WorkspaceLeaf} from "obsidian";
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


export async function renderErrorNotice(el: HTMLElement, text: string, cls?: string[]) {
    el.createEl("div", {
        text: text, cls: cls, attr: {
            style: "width: 100%; text-align: center; font-size: 14px; background: #ffffaa; border-radius: 3px; padding: 6px;"
        }
    });
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

// getFileByName
// get the name matched file in given vault
export function getFileByName(vault: Vault, name: string): TFile | undefined {
    const files = vault.getFiles();
    return files.find(f => f.name.substring(0, f.name.length - (path.extname(f.name)?.length || 0)).trim().toLowerCase() == name.trim().toLowerCase()) || getFileByExactName(vault, name)
}


export function getFileByExactName(vault: Vault, name: string): TFile | undefined {
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


interface IStyleSet {
    [key: string]: string
}

export interface IKHRenderContianerOption {
    label?: string
    width?: number
    style?: string
    text?: string
    link?: string
    contentStyle?: string
    childrenStyle?: IStyleSet
}

function flattenStyle(map: { [key: string]: string }): string {
    let styleStr = ""
    for (let key in map) {
        styleStr += `${key}: ${map[key]};`
    }
    return styleStr
}

export async function readNoteAll(filename: string, obsApp?: App): Promise<string | undefined> {
    obsApp = obsApp || app // try set global app
    const name = filename.trim()

    const matchingFile = obsApp.metadataCache.getFirstLinkpathDest(name, '');
    // console.log("readNoteAll", name, matchingFile)
    if (!matchingFile || matchingFile.extension !== "md") {
        displayErrorNotice("warning: cannot found config file: " + name);
        return
    }
    return await obsApp.vault.cachedRead(matchingFile);
}

export async function readYmlConf(setting: string, obsApp?: App): Promise<any> {
    const yml = YAML.parse(setting)
    let appends: any = {}
    for (let k in yml) {
        if (k.toLowerCase().trim() === "<") {
            const fileName = yml[k]
            const fileContents = await readNoteAll(fileName, obsApp)
            // console.log(`parse '<' of ${fileName}`, fileContents, appends)
            if (fileContents === undefined) {
                displayErrorNotice(`warning: cannot found config file: ${fileName}`);
                continue
            }
            appends = {
                ...appends,
                ...await readYmlConf(fileContents, obsApp)
            }
        }
    }
    // console.log("readYmlConf", setting, yml, appends)
    return {
        ...yml,
        ...appends,
    }
}

export function createRenderContainerOptionByConf(
    conf: {
        style?: IStyleSet,
        childrenStyle?: { [key: string]: IStyleSet }
    }
): IKHRenderContianerOption {
    let opt: IKHRenderContianerOption = {}
    if (!!conf?.style) {
        opt.style = flattenStyle(conf.style)
    }
    if (!!conf?.childrenStyle) {
        let styleSet: any = {}
        for (let childrenKey in conf.childrenStyle) {
            styleSet[childrenKey] = flattenStyle(conf.childrenStyle[childrenKey])
        }
        opt.childrenStyle = styleSet
    }

    return opt
}

export function createRenderContainer(el: HTMLElement, options?: IKHRenderContianerOption): HTMLDivElement {
    const bgColor = "#333333cc"
    const color = "#eeeeee"

    const div = el.createDiv({attr: {style: `width: 99%; height: 99%; margin: 2px; padding: 5px 5px; border: 2px solid ${bgColor}; border-radius: 2px; ${options?.style ?? ""}`}})
    let ret = div

    if (!!options?.label) {
        const title = div.createDiv({
            attr: {
                "style": `width: ${128 + (options?.width || 0)}px; height: 20; font-size: 12px; padding: 0 0 3px 6px;\
                background-color: ${bgColor}; border-radius: 0 0 2px 0; position: relative; left: -5px; top: -5px;`
            },
            title: `code block of ${options.label}`,
        })

        const linkOption: DomElementInfo = {
            attr: {"style": `width: 100%; height: 100%; color: ${color};`},
            text: options.label,
        }
        title.createSpan(linkOption)

        if (!!options.text) {
            linkOption.text = (options.text ? (" - " + options.text) : "")
            if (!!options?.link && !!linkOption.attr) {
                linkOption.attr.style = linkOption.attr.style + ";font-weight: bold; cursor:pointer;"
                linkOption.attr.onclick = `window.location.href='${options?.link ?? "#"}'`
            }
            title.createSpan(linkOption)
        }


        ret = div.createDiv({
            attr: {
                "style": `width: 100%; height: 100%; margin: 10px 0px 5px 0px; ${options?.contentStyle}`
            }
        })
    }

    if (!!options?.childrenStyle) {
        let cls = "kh-" + Math.round(Math.random() * 999999999)
        ret.setAttr("class", cls)
        let styleStr = "\n"
        for (let childKey in options.childrenStyle) {
            styleStr += `.${cls} ${childKey} { ${options.childrenStyle[childKey]} }\n`
        }
        ret.createEl("style").setText(styleStr)
    }

    return ret
}