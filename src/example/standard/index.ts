import {MarkdownPostProcessorContext, WorkspaceLeaf} from "obsidian";
import YAML from 'yaml'


import {BKPlugin} from "../../framework";
import {ISetting} from "../../type";


import SettingTab, {IConf} from "./setting";
import RegisterIcons from "./icons";


import {registerBecomingCmd} from "./cmds";
import ExamplePanel, {ExamplePanelDescriber} from "./panel";
import {buildPluginStaticResourceSrc, createRenderContainer} from "../../utils";
import {RenderRadar} from "./panel/view/radar";


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


        this.registerMarkdownPostProcessor((element, context) => {
            const codeblocks = element.querySelectorAll(".view-header");
            const src = buildPluginStaticResourceSrc(this, "statics/1.png")
            codeblocks.item(0)?.createEl("img", {
                attr: {src}
            });

            // @ts-ignore
            window["vault"] = this.app.vault

            console.log("!! codeblocks", src, element, this.app.vault, this.app.workspace)
        });

        this.registerMarkdownCodeBlockProcessor("kh_radar", (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
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

            RenderRadar(createRenderContainer(el, "kh::radar"), data, option)
        })
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



