import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function readJson(path) {
	return JSON.parse(fs.readFileSync(path, "utf8"));
}

test("manifest metadata stays aligned with package metadata", () => {
	const packageJson = readJson("package.json");
	const manifest = readJson("manifest.json");
	const versions = readJson("versions.json");

	assert.equal(manifest.id, packageJson.name, "manifest id should match package name");
	assert.equal(manifest.version, packageJson.version, "manifest version should match package version");
	assert.equal(versions[manifest.version], manifest.minAppVersion, "versions.json should map the current plugin version to minAppVersion");
	assert.equal(packageJson.main, "build/main.js", "package main should point at the built Obsidian plugin entry");
});

test("manifest keeps Obsidian-required fields populated", () => {
	const manifest = readJson("manifest.json");

	for (const field of ["id", "name", "version", "minAppVersion", "description", "author"]) {
		assert.equal(typeof manifest[field], "string", `manifest ${field} should be a string`);
		assert.notEqual(manifest[field].trim(), "", `manifest ${field} should not be empty`);
	}

	assert.equal(typeof manifest.isDesktopOnly, "boolean", "manifest isDesktopOnly should be a boolean");
});
