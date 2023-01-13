import path from 'path'
import YAML from 'yaml'
import {MarkdownPostProcessorContext, Vault, MarkdownRenderer, App} from "obsidian";
import {RenderRadar} from "../panel/view/radar";
import {
    createRenderContainerOptionByConf,
    createRenderContainer,
    getFileByName,
    renderErrorNotice,
    showFile
} from "../../../utils";


export default function TodoFn(): [string, (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<void>] {
    return [
        "kh_todo",
        async function (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
            // const yml = YAML.parse(source)

            const lines = source.split("\n")
            let content = ""
            let setting = ""
            for (let l of lines) {
                if (l.startsWith("::")) {
                    setting += l.substr(2) + "\n"
                    continue
                }
                content += l + "\n"
            }

            const yml = YAML.parse(setting)
            const option = createRenderContainerOptionByConf(yml)
            option.label = "kh::todo"
            if (!!yml?.name) {
                option.text = yml.name
                option.width = yml.name.length * 6
            }
            const container = createRenderContainer(el, option)

            MarkdownRenderer.renderMarkdown(content, container, ctx.sourcePath, this);
        }
    ]
}