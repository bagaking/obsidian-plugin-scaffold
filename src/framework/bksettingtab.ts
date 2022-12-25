import {PluginSettingTab, Setting} from "obsidian";
import {ISetting} from "../type";
import {BKPlugin} from "./bkplugin";
import {ILogger, LOG, displayErrorNotice} from "../utils";

export abstract class BKSettingTab<TConf> extends PluginSettingTab implements ISetting<TConf> {
	name: string;
	settingName: string;
	conf: TConf;
	cbUpdated?: (conf: TConf) => void;
	protected logger: ILogger;
	protected plugin: BKPlugin;

	protected constructor(plugin: BKPlugin, settingName: string, cbUpdated?: (conf: TConf) => void) {
		super(plugin.app, plugin);
		this.plugin = plugin;
		this.cbUpdated = cbUpdated;
		this.settingName = settingName;
		this.logger = LOG(`bk.settingTab.${this.settingName}`);
		this.name = `BK> ${this.settingName}`;
	}

	get(): TConf {
		return this.conf;
	}

	protected confFileKey(): string {
		return `conf.${this.settingName}`;
	}

	protected async load(defaultConf?: TConf): Promise<void> { // fetch?
		const doc = await this.plugin.LoadDoc(this.confFileKey());
		const confRead = Object.assign({}, defaultConf, doc.data || {});
		if (JSON.stringify(this.conf) !== JSON.stringify(confRead)) {
			this.conf = confRead;
			if (this.cbUpdated) {
				await this.cbUpdated(this.conf);
			}
		}
	}

	protected async set(setter: (conf: TConf) => TConf, reload: boolean = true): Promise<void> {
		const err = await this.plugin.SetDoc(this.confFileKey(), (v) => {
			const updated = setter(v?.data);
			this.logger.verbose("try set, ", v, updated);
			if (JSON.stringify(this.conf) === JSON.stringify(updated)) {
				return null;
			}
			return {
				override: true,
				data: updated
			};
		});
		if (err) {
			await displayErrorNotice(err);
		}
		if (reload) {
			await this.load(); // load after save to update this.conf
		}
	}

	protected createSetting(containerEl: HTMLElement, name: string, disc?: string, tooltip?: string): Setting {
		const v = new Setting(containerEl)
			.setName(name);

		if (disc) {
			v.setDesc(disc);
		}

		if (tooltip) {
			v.setTooltip(tooltip);
		}
		return v;
	}

	protected insertBlock(content: string, desc?: string): void {
		let {containerEl} = this;
		this.logger.info("insertBlock", content, desc);

		const div = containerEl.createDiv({cls: "setting_block_header"});
		const header = div.createEl("h3");
		header.innerText = content;
		if (desc) {
			div.createSpan({cls: "setting_block_desc"}).innerText = desc;
		}
	}

	protected initialEL(text: string): HTMLElement {
		let {containerEl} = this;
		containerEl.empty();
		containerEl.createEl("h2", {text});
		return containerEl;
	}
}
