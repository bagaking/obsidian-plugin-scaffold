import fs from "fs";
import * as path from "path";

const defaultSetting = {
	from: "./statics",
	dest: "./build/statics",
	force: true,
	dereference: true,
	errorOnExist: false,
	preserveTimestamps: true,
	recursive: true
}

export default (option = defaultSetting) => {
	const copySetting = { ...defaultSetting, ...option };
	let plugin = {
		name: 'copy',
		setup(build) {
			// needs node version >= 16
			build.onEnd((result) => {
				if (result.errors.length > 0) {
					return;
				}

				let destDir = path.dirname(copySetting.dest)
				if (!fs.existsSync(destDir)){
					fs.mkdirSync(destDir, { recursive: true });
				}
				fs.cpSync(
						copySetting.from,
						copySetting.dest,
						copySetting)
				}
			)
		},
	}
	return plugin
}
