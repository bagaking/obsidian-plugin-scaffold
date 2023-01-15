import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { checkPack, requiredPluginAssets } from "./check-pack.mjs";

function readJson(path) {
	return JSON.parse(fs.readFileSync(path, "utf8"));
}

function deriveManifestId(packageName) {
	return packageName.startsWith("@") ? packageName.split("/").at(-1) : packageName;
}

test("manifest metadata stays aligned with package metadata", () => {
	const packageJson = readJson("package.json");
	const manifest = readJson("manifest.json");
	const versions = readJson("versions.json");

	assert.equal(manifest.id, deriveManifestId(packageJson.name), "manifest id should match package name or scoped package basename");
	assert.equal(manifest.version, packageJson.version, "manifest version should match package version");
	assert.equal(versions[manifest.version], manifest.minAppVersion, "versions.json should map the current plugin version to minAppVersion");
	assert.equal(packageJson.main, "build/main.js", "package main should point at the built Obsidian plugin entry");
});

test("package checks cover required Obsidian release assets", () => {
	const packageJson = readJson("package.json");

	assert.deepEqual(requiredPluginAssets, [
		packageJson.main,
		"build/manifest.json",
		"build/versions.json",
		"build/styles.css",
	]);

	const missingStylesPack = {
		files: [
			{ path: packageJson.main },
			{ path: "build/manifest.json" },
			{ path: "build/versions.json" },
			{ path: "README.md" },
			{ path: "LICENSE" },
			{ path: "manifest.json" },
			{ path: "versions.json" },
			{ path: "styles.css" },
		],
	};
	let error;
	try {
		checkPack(missingStylesPack);
	} catch (caught) {
		error = caught;
	}
	assert.notEqual(error, undefined, "pack:check should reject a package without build/styles.css");
	assert.equal(
		error.message.includes("npm package is missing required files: build/styles.css"),
		true,
		"pack:check should fail when the Obsidian stylesheet asset is missing",
	);
});

test("manifest keeps Obsidian-required fields populated", () => {
	const manifest = readJson("manifest.json");

	for (const field of ["id", "name", "version", "minAppVersion", "description", "author"]) {
		assert.equal(typeof manifest[field], "string", `manifest ${field} should be a string`);
		assert.notEqual(manifest[field].trim(), "", `manifest ${field} should not be empty`);
	}

	assert.equal(typeof manifest.isDesktopOnly, "boolean", "manifest isDesktopOnly should be a boolean");
});
