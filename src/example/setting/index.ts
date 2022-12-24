import {BKPlugin, BKSettingTab, displayErrorNotice} from "../../framework";

const Name = "example-setting"

export interface IConf {
	arg1: number;
	arg2: string;
	arg3: boolean;
	arg4: any
}

export const CONF_DEFAULT: IConf = {
	arg1: 1000,
	arg2: ".*\\.md",
	arg3: true,
	arg4: null
};

export default class SettingTab extends BKSettingTab<IConf> {

	static async New(plug: BKPlugin, cbUpdated?: (conf: IConf) => void): Promise<SettingTab> {
		return await (new SettingTab(plug, cbUpdated)).loadConfig();
	}

	private constructor(plugin: BKPlugin, cbUpdated?: (conf: IConf) => void) {
		super(plugin, Name, cbUpdated);
	}

	public async loadConfig(): Promise<SettingTab> {
		await this.load(CONF_DEFAULT);
		this.logger.info("conf loaded", this.get())
		return this;
	}

	display(): void {
		const containerEl = this.initialEL("Example Setting Tab");
		this.createSetting(containerEl, "Arg1", "number sample", "tooltip for arg1")
			.addText((text) =>
				text
					.setValue(String(this.get().arg1))
					.onChange(async (value: string) => {
						const numberValue = Number(value);
						if (isNaN(numberValue) || !Number.isInteger(numberValue) || numberValue < 0) {
							await displayErrorNotice("Realtime processing interval should be a positive integer number!");
							return;
						}
						await this.set(c => {
							c.arg1 = numberValue;
							return c;
						});
					})
			);

		this.createSetting(containerEl, "Arg2", "string sample", "tooltip for arg2")
			.addText((text) =>
				text
					.setValue(String(this.get().arg2))
					.onChange(async (value: string) => {
						await this.set(c => {
							c.arg2 = value;
							return c;
						});
					})
			);

		this.createSetting(containerEl, "Arg3", "toggle sample", "tooltip for arg3")
			.addToggle((toggle) => toggle
				.setValue(this.get().arg3)
				.onChange(async (value) => this.set(c => {
					c.arg3 = value;
					return c;
				}))
			);

		this.createSetting(containerEl, "Arg4",  "text area sample", "tooltip for arg4")
			.addTextArea((textArea) => {
				textArea.setValue(JSON.stringify(this.get().arg4))
					.onChange(async (value: string) => {
						if (!value) return;
						try {
							const data = JSON.parse(value);
							await this.set(c => {
								c.arg4 = data;
								return c;
							});
						} catch (ex) {
							console.log(`setting: set arg4 failed, ${ex}`);
						}
					});
			});
	}
}
