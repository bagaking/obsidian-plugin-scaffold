import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import copy from "./bagaking.copy.mjs";

function setupCopyHook(option) {
	let onEndHook;
	copy(option).setup({
		onEnd(hook) {
			onEndHook = hook;
		},
	});
	assert.equal(typeof onEndHook, "function");
	return onEndHook;
}

test("copy plugin skips copying after esbuild errors", () => {
	const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "bagaking-copy-"));
	const source = path.join(workspace, "source.txt");
	const dest = path.join(workspace, "out", "source.txt");
	fs.writeFileSync(source, "asset");

	const onEnd = setupCopyHook({ from: source, dest });
	onEnd({ errors: [{ text: "build failed" }] });

	assert.equal(fs.existsSync(dest), false);
});

test("copy plugin copies assets after successful builds", () => {
	const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "bagaking-copy-"));
	const source = path.join(workspace, "source.txt");
	const dest = path.join(workspace, "out", "source.txt");
	fs.writeFileSync(source, "asset");

	const onEnd = setupCopyHook({ from: source, dest });
	onEnd({ errors: [] });

	assert.equal(fs.readFileSync(dest, "utf8"), "asset");
});
