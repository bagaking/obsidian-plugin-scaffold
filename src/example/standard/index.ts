import {MarkdownPostProcessorContext, WorkspaceLeaf} from "obsidian";


import {BKPlugin} from "../../framework";
import {ISetting} from "../../type";


import SettingTab, {IConf} from "./setting";
import RegisterIcons from "./icons";

import {registerBecomingCmd} from "./cmds";
import ExamplePanel, {ExamplePanelDescriber} from "./panel";
import {buildPluginStaticResourceSrc, createRenderContainer, getFileByName, showFile} from "../../utils";
import {RenderRadar} from "./panel/view/radar";
import MenuFn from "./codeblock/menu";
import RadarFn from "./codeblock/radar";
import EmbedFn from "./codeblock/embed";
import TodoFn from "./codeblock/todo";
import HighlightFn from "./codeblock/highlight";


export default class StandardPlug extends BKPlugin {

    setting: ISetting<IConf>;

    protected async OnInit(): Promise<void> {
        RegisterIcons();

        /*
         * Register Commands
         */
        registerBecomingCmd(this, this.setting)

        /*
         * Register Panel View
         */
        this.panelRegister.Register(this, ExamplePanelDescriber, (leaf: WorkspaceLeaf) => new ExamplePanel(leaf, this, this.setting), {
            regCommand: true,
            showRibbon: true
        });
        /*
         * Register Setting Tab && Start life cycle
         */
        this.addSettingTab(this.setting = await SettingTab.New(this, async (conf) => {
            await this.mainLifeCycle(); // execute right now
        }));

        // @see: https://marcus.se.net/obsidian-plugin-docs/editor/markdown-post-processing
        this.registerMarkdownPostProcessor((element, context) => {
            const cb = element.querySelectorAll("code");

            for (let index = 0; index < cb.length; index++) {
                const codeblock = cb.item(index);
                const text = codeblock.innerText.trim();
                console.log("cb text", index, text)
            }

            const codeblocks = element.querySelectorAll(".view-header");
            const src = buildPluginStaticResourceSrc(this, "statics/1.png")
            codeblocks.item(0)?.createEl("img", {
                attr: {src}
            });

            // @ts-ignore
            window["vault"] = this.app.vault

        });



        this.registerMarkdownCodeBlockProcessor(...RadarFn())
        this.registerMarkdownCodeBlockProcessor(...EmbedFn(this.app))
        this.registerMarkdownCodeBlockProcessor(...MenuFn(this.app.vault))
        this.registerMarkdownCodeBlockProcessor(...TodoFn(this.app))
        this.registerMarkdownCodeBlockProcessor(...HighlightFn(this.app))

        // this.registerMarkdownCodeBlockProcessor("kh_ref", (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        //     const yml = YAML.parse(source)
        //     if (!yml?.name) {
        //         const div = createRenderContainer(el, "kh::ref (empty)")
        //         return
        //     }
        //     const div = createRenderContainer(el, "kh::ref " + yml.name)
        //     const file = getFileByName(this.app.vault, yml.name);
        //     console.log("yml.name", yml.name, this.app.vault.getFiles())
        //     if (!file) {
        //         return
        //     }
        //     console.log(file, file)
        //     const iframe = div.createEl("iframe")
        //     // file.path
        //     // this.app.fileManager.generateMarkdownLink(file)
        //     iframe.setAttribute("src", file.path)
        // })
        return
    }

    protected async OnAfterUpdate(): Promise<void> {
        return Promise.resolve(undefined);
    }

    protected async OnBeforeUpdate(): Promise<void> {
        return Promise.resolve(undefined);
    }

    onunload() {
    }
}



