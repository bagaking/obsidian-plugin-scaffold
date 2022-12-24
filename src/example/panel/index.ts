import {BKPanel, IBKPanelDescriber} from "../../framework/panel";
import {ISetting} from "../../type";

import {ICON_NAME} from "../icons";
import {IConf} from "../setting";
import {BKPlugin, displayErrorNotice} from "../../framework";
import {WorkspaceLeaf} from "obsidian";
import {LOG} from "../../utils";

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
	}

	async onUpdate(): Promise<any> {
		this.logger.info("example update");
	}

}
