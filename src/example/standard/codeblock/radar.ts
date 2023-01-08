import path from 'path'
import YAML from 'yaml'
import {MarkdownPostProcessorContext, Vault} from "obsidian";
import {RenderRadar} from "../panel/view/radar";
import {createRenderContainer, getFileByName, showFile} from "../../../utils";

export default function RadarFn(): [string, (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<void>] {
    return [
        "kh_radar",
        async function (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
            const yml = YAML.parse(source)
            const data: any = []
            const option: any = {}
            for (let name in yml) {
                const value = yml[name]
                if (name.startsWith("_")) {
                    option[name.substring(1)] = value
                    continue
                }
                if (typeof value !== 'number' || !isFinite(value)) continue
                data.push({name, value})
            }

            RenderRadar(createRenderContainer(el, {label: "kh::radar"}), data, option)
        }
    ]
}