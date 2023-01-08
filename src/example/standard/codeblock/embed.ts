import path from 'path'
import YAML from 'yaml'
import {MarkdownPostProcessorContext, Vault, MarkdownRenderer, App} from "obsidian";
import {RenderRadar} from "../panel/view/radar";
import {createRenderContainer, getFileByName, renderErrorNotice, showFile} from "../../../utils";


export default function EmbedFn(app: App): [string, (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<void>] {
    return [
        "kh_embed",
        async function (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
            const yml = YAML.parse(source)
            const fileName = yml?.note;
            if (!fileName) {
                renderErrorNotice(el, "note should be set");
                return;
            }

            const matchingFile = app.metadataCache.getFirstLinkpathDest(fileName, '');

            if (!matchingFile || matchingFile.extension !== "md") {
                renderErrorNotice(el, "cannot found: " + fileName);
                return;
            }

            const uri = `obsidian://open?vault=${app.vault.getName()}&file=${fileName}.md`
            const container = createRenderContainer(el, {
                label: "kh::embed",
                text: fileName,
                link: uri,
                width: fileName.length * 6
            })

            const fileContents = await app.vault.cachedRead(matchingFile);
            MarkdownRenderer.renderMarkdown(fileContents, container, ctx.sourcePath, this);
        }
    ]
}