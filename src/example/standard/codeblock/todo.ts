import path from 'path'
import {MarkdownPostProcessorContext, Vault, MarkdownRenderer, App} from "obsidian";
import {RenderRadar} from "../panel/view/radar";
import {
    readYmlFrontMatter,
    createRenderContainerOptionByConf,
    createRenderContainer,
    getFileByName,
    renderErrorNotice,
    showFile
} from "../../../utils";


export default function TodoFn(app: App): [string, (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<void>] {
    return [
        "kh_todo",
        async function (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
            // const yml = YAML.parse(source)
            let {conf, content} = await readYmlFrontMatter(source, app)
            const option = createRenderContainerOptionByConf(conf)
            option.label = "kh::todo"
            if (!!conf?.name) {
                option.text = conf.name
                option.width = conf.name.length * 6
            }
            const container = createRenderContainer(el, option)

            MarkdownRenderer.renderMarkdown(content, container, ctx.sourcePath, this);
        }
    ]
}