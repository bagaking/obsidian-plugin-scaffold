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
	let plugin = {
		name: 'copy',
		setup(build) {
			// needs node version >= 16
			build.onEnd(() => {
				let destDir = path.dirname(option.dest)
				if (!fs.existsSync(destDir)){
					fs.mkdirSync(destDir, { recursive: true });
				}
				fs.cpSync(
						option.from,
						option.dest,
						{
							...defaultSetting, ...option
						})
				}
			)
		},
	}
	return plugin
}
