import {LOG} from "../utils";
import {App, ItemView, Plugin, WorkspaceLeaf} from "obsidian";

const logger = LOG("bk.framework.panel");


export interface IBKPanelDescriber {
	viewType: string;
	displayText: string;
	icon: string;
}

export class PanelRegister {
	public views: BKPanel[] = [];

	public constructor() {
		logger.info("panel register initialed")
	}

	public async openView(app: App, viewType: string) {
		const leaf = app.workspace.getLeavesOfType(viewType)
		if (leaf.length > 0) {
			return;
		}

		await app.workspace.getRightLeaf(true).setViewState({type: viewType});
	}

	public async focus(app: App, viewType: string) {
		const leaf = app.workspace.getLeavesOfType(viewType)
		if (leaf.length <= 0) {
			return this.openView(app, viewType)
		}

		logger.info("try focus", leaf[0])

		app.workspace.setActiveLeaf(leaf[0], true, true) // activity 确实改变了, 但是界面没有切
	}

	public Register(plug: Plugin, describer: IBKPanelDescriber, viewCreator: (leaf: WorkspaceLeaf) => BKPanel, option?: {
		regCommand: boolean,
		showRibbon: boolean,
	}) {
		if (!describer) {
			logger.err("describer cannot be null");
			return;
		}
		plug.registerView(describer.viewType, leaf => {
			const view = viewCreator(leaf);
			if (view instanceof BKPanel) {
				this.views.push(view);
			}
			return view;
		});

		let openView = async () => this.openView(plug.app, describer.viewType);

		if (option?.regCommand) {
			plug.addCommand({
				id: `app:show-${describer.viewType}`,
				name: `Show ${describer.displayText}`,
				callback: openView,
				hotkeys: []
			});
		}

		if (option?.showRibbon) {
			plug.addRibbonIcon(describer.icon, describer.viewType, openView);
		}
	}

	public async triggerUpdates() {
		return await Promise.all(this.views.map(v => v.onUpdate).filter(f => !!f))
	}
}

export abstract class BKPanel extends ItemView {
	public describer: IBKPanelDescriber;

	public abstract onUpdate(): Promise<any>;
	public abstract onEnable(): Promise<any>;

	async onOpen() {
		await this.onEnable()
	}

	public getViewType(): string {
		if (!this.describer) {
			logger.err("null this.describer", this)
		}
		return this.describer?.viewType;
	}

	public getDisplayText(): string {
		return this.describer?.displayText;
	}

	public getIcon(): string {
		return this.describer?.icon;
	}
}

