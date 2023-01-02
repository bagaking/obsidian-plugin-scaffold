import {WorkspaceLeaf} from "obsidian";
import {ISetting} from "../../../type";
import {BKPlugin} from "../../../framework";
import {BKPanel, IBKPanelDescriber} from "../../../framework/panel";
import {LOG, displayErrorNotice, createRenderContainer} from "../../../utils";

import {ICON_NAME} from "../icons";
import {IConf} from "../setting";
import { RenderPie } from "./view/pie.jsx"

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
		const data = [{
			sex: "男",
			sold: 0.45,
			fill: "p(a)https://gw.alipayobjects.com/zos/antfincdn/FioHMFgIld/pie-wenli1.png"
		}, {
			sex: "女",
			sold: 0.55,
			fill: "p(a)https://gw.alipayobjects.com/zos/antfincdn/Ye2DqRx%2627/pie-wenli2.png"
		}, {
			sex: "?",
			sold: 10,
			fill: "p(a)https://gw.alipayobjects.com/zos/antfincdn/Ye2DqRx%2627/pie-wenli2.png"
		} ];
		RenderPie(createRenderContainer(this.containerEl.children[0].createDiv(), "kh::pie"), data, {
			value: "sold", label: "sex"
		})
	}

	async onUpdate(): Promise<any> {
		this.logger.info("example update");
	}

}
