import {Plugin} from "obsidian";
import {LOG} from "../utils";
import {PanelRegister} from "./panel";
import {easyMutex} from "../utils/algocontainers";

export interface IPluginDocLoadResult {
	exist: boolean,
	data: any,
}

export interface IPluginDocSaveRequest {
	override: boolean,
	data: any,
}

export abstract class BKPlugin extends Plugin {
	private logger = LOG("bk.plugin");
	protected intervalId: number | null = null;

	protected panelRegister: PanelRegister = new PanelRegister();

	protected abstract OnInit(): Promise<void>;
	protected abstract OnBeforeUpdate(): Promise<void>;
	protected abstract OnAfterUpdate(): Promise<void>;

	async onload() {
		await this.OnInit()
		this.setupInterval(1)
	}

	async mainLifeCycle() {
		await this.OnBeforeUpdate()
		await this.panelRegister.triggerUpdates()
		await this.OnAfterUpdate()
	}

	protected setupInterval(interval: number) {
		if (interval < 100) {
			interval = 100;
		}

		if (this.intervalId) {
			const intervalId = this.intervalId;
			this.intervalId = null;
			window.clearInterval(intervalId);
		}

		this.intervalId = window.setInterval(this.mainLifeCycle.bind(this), interval);
		this.registerInterval(this.intervalId);
		console.info(`setup interval: ${this.intervalId}, interval= ${interval} `);
	}

	async LoadDoc(key: string): Promise<IPluginDocLoadResult> { // fetch?
		let appData = await this.loadData();
		const doc = appData ? appData[key] : null;
		return {
			exist: !!doc,
			data: doc || {}
		};
	}

	async SetDoc(key: string, setter: (conf: IPluginDocLoadResult) => IPluginDocSaveRequest | null): Promise<Error | undefined> {
		const {err} = await new easyMutex().guard(async () => {
			let appData = await this.loadData();
			let exist = appData && appData[key]
			const conf = {exist, data: exist ? appData[key] : {}};
			let update = setter(conf);
			if (!update || !update.override) {
				return;
			}
			appData[key] = update.data;
			await this.saveData(appData);
		});
		return err;
	}
}
