import { ISetting } from "../../../type";
import {BKPlugin} from "../../../framework";
import {LOG, findActiveEditorOfActiveFile} from "../../../utils";

import {IConf} from "../setting";


const logger = LOG("example-cmd");

export function registerBecomingCmd(plug: BKPlugin, setting: ISetting<IConf>) {

	plug.addCommand({
		id: "app:do_something",
		name: "Example for do something by cmd",
		callback: async () => {
			// cannot do this
			// const leaf = plug.app.workspace.activeLeaf;
			// if (!(leaf?.view instanceof MarkdownView)) {
			//   return;
			// }
			const editor = findActiveEditorOfActiveFile(plug.app.workspace);
			if (!editor) {
				logger.err("cannot find the editor");
			}
			logger.info(`editor of active file got`, editor);
		},
		hotkeys: []
	});

}
