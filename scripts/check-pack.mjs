import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const requiredPaths = [
	"build/main.js",
	"manifest.json",
	"versions.json",
	"README.md",
	"LICENSE",
];

const forbiddenPaths = [
	".eslintignore",
	".eslintrc",
];

const forbiddenPrefixes = [
	".github/",
];

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
	encoding: "utf8",
	stdio: ["ignore", "pipe", "inherit"],
});

const packs = JSON.parse(output);
assert.equal(Array.isArray(packs), true, "npm pack dry-run should return a JSON array");
assert.equal(packs.length, 1, "npm pack dry-run should describe one package");

const entries = new Set(packs[0].files.map((file) => file.path));
const missing = requiredPaths.filter((path) => !entries.has(path));
const leakedPaths = packs[0].files
	.map((file) => file.path)
	.filter((path) => forbiddenPaths.includes(path) || forbiddenPrefixes.some((prefix) => path.startsWith(prefix)));

assert.deepEqual(missing, [], `npm package is missing required files: ${missing.join(", ")}`);
assert.deepEqual(leakedPaths, [], `npm package includes maintainer-only files: ${leakedPaths.join(", ")}`);

console.log(`Package dry-run includes ${packs[0].entryCount} files and required Obsidian assets.`);
