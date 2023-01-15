import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const requiredPluginAssets = [
	"build/main.js",
	"build/manifest.json",
	"build/versions.json",
	"build/styles.css",
];

export const requiredScaffoldAssets = [
	"manifest.json",
	"versions.json",
	"styles.css",
];

export const requiredProjectFiles = [
	"README.md",
	"LICENSE",
];

export const requiredPaths = [
	...requiredPluginAssets,
	...requiredScaffoldAssets,
	...requiredProjectFiles,
];

export const forbiddenPaths = [
	".eslintignore",
	".eslintrc",
];

export const forbiddenPrefixes = [
	".github/",
];

export function getPackProblems(pack) {
	const entries = new Set(pack.files.map((file) => file.path));
	const missing = requiredPaths.filter((path) => !entries.has(path));
	const leakedPaths = pack.files
	.map((file) => file.path)
	.filter((path) => forbiddenPaths.includes(path) || forbiddenPrefixes.some((prefix) => path.startsWith(prefix)));

	return { missing, leakedPaths };
}

export function checkPack(pack) {
	const { missing, leakedPaths } = getPackProblems(pack);

	assert.deepEqual(missing, [], `npm package is missing required files: ${missing.join(", ")}`);
	assert.deepEqual(leakedPaths, [], `npm package includes maintainer-only files: ${leakedPaths.join(", ")}`);
}

function main() {
	const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "inherit"],
	});

	const packs = JSON.parse(output);
	assert.equal(Array.isArray(packs), true, "npm pack dry-run should return a JSON array");
	assert.equal(packs.length, 1, "npm pack dry-run should describe one package");

	checkPack(packs[0]);

	console.log(`Package dry-run includes ${packs[0].entryCount} files and required Obsidian release assets.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main();
}
