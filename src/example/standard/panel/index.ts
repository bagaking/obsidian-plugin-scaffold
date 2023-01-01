import {WorkspaceLeaf} from "obsidian";
import {ISetting} from "../../../type";
import {BKPlugin} from "../../../framework";
import {BKPanel, IBKPanelDescriber} from "../../../framework/panel";
import {LOG, displayErrorNotice} from "../../../utils";

import {ICON_NAME} from "../icons";
import {IConf} from "../setting";
import { renderDemoRadar } from "./view/radar.jsx"

export const ExamplePanelDescriber: IBKPanelDescriber = {
	viewType: "example-controller",
	displayText: "Example Panel",
	icon: ICON_NAME.C1
};


export default class ExamplePanel extends BKPanel {
	public readonly conf: ISetting<IConf>;

	plug: BKPlugin;
	logger = LOG("example.panel")

	public constructor(leaf: WorkspaceLeaf, plug: BKPlugin, conf: ISetting<IConf>) {
		super(leaf);
		this.conf = conf;
		this.describer = ExamplePanelDescriber;
		this.plug = plug;
	}

	async onEnable() {
		this.logger.info("example opened");
		await displayErrorNotice("example opened")

		renderDemoRadar(this.containerEl.children[1].createDiv({attr: {"style":"width: 100%; height: 100%"}}))
	}

	async onUpdate(): Promise<any> {
		this.logger.info("example update");
	}

}
