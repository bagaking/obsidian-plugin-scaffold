import path from 'path'
import YAML from 'yaml'
import {MarkdownPostProcessorContext, Vault} from "obsidian";
import {RenderMenu} from "../panel/view/menu";
import {createRenderContainer, getFileByName, renderErrorNotice, showFile} from "../../../utils";

export default function MenuFn(vault: Vault): [string, (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<void>] {
    return [
        "kh_menu",
        async function (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
            const yml = YAML.parse(source)
            const sourceDir = path.dirname(ctx.sourcePath)
            let prefix: string = yml?.prefix || sourceDir
            prefix = prefix.replace("$SOURCE_DIR", sourceDir)

            const div = createRenderContainer(el, {label: `kh::menu`, width: prefix.length * 6, text: prefix})
            const data: any[] = []
            const files = vault.getFiles().filter((f: any) => f.path.startsWith(prefix)).sort((a, b) => a.path.localeCompare(b.path));

            if (!files || files.length === 0) {
                renderErrorNotice(div, `cannot find items with prefix ${prefix} in dir ${sourceDir}`);
                return
            }

            files.forEach((f: any) => data.push({
                    label: f.basename,
                    jump: () => showFile(this.app.workspace, f, true)
                })
            )
            RenderMenu(div, data)
        }
    ]
}