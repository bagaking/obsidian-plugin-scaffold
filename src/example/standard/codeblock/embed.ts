import path from 'path'
import YAML from 'yaml'
import {MarkdownPostProcessorContext, Vault, MarkdownRenderer, App} from "obsidian";
import {RenderRadar} from "../panel/view/radar";
import {IKHRenderContianerOption, createRenderContainerOptionByConf, createRenderContainer, getFileByName, renderErrorNotice, showFile} from "../../../utils";


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
            const option: IKHRenderContianerOption = {
                ... createRenderContainerOptionByConf(yml),
                label: "kh::embed",
                text: fileName,
                link: uri,
                width: fileName.length * 6,
            }
            if (!!yml.zoom && el.parentElement) {
                // todo: zoom-block can adjust the display, but the interaction will affect the interaction of the front and back blocks, so it is not supported for now
                (el.parentElement.style as any).zoom = 1 // yml.zoom
            }
            const container = createRenderContainer(el, option)


            const fileContents = await app.vault.cachedRead(matchingFile);
            MarkdownRenderer.renderMarkdown(fileContents, container, ctx.sourcePath, this);
        }
    ]
}