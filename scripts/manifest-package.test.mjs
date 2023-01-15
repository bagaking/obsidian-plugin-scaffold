import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

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
	const packCheck = fs.readFileSync("scripts/check-pack.mjs", "utf8");

	assert.equal(
		packCheck.includes(`"${packageJson.main}"`) || packCheck.includes(`'${packageJson.main}'`),
		true,
		"pack:check should require the configured package main in the npm tarball",
	);
	assert.equal(packCheck.includes('"manifest.json"'), true, "pack:check should require the Obsidian manifest");
	assert.equal(packCheck.includes('"versions.json"'), true, "pack:check should require Obsidian version metadata");
	assert.equal(packCheck.includes('"styles.css"'), true, "pack:check should require the Obsidian stylesheet asset");

	if (fs.existsSync("build")) {
		assert.equal(fs.existsSync(packageJson.main), true, "existing build output should include the configured package main");
	}
});

test("manifest keeps Obsidian-required fields populated", () => {
	const manifest = readJson("manifest.json");

	for (const field of ["id", "name", "version", "minAppVersion", "description", "author"]) {
		assert.equal(typeof manifest[field], "string", `manifest ${field} should be a string`);
		assert.notEqual(manifest[field].trim(), "", `manifest ${field} should not be empty`);
	}

	assert.equal(typeof manifest.isDesktopOnly, "boolean", "manifest isDesktopOnly should be a boolean");
});
