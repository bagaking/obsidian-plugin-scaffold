# Obsidian Plugin Scaffold

This scaffold helps you quickly create and dogfood
[Obsidian](https://obsidian.md) plugins.

## Current Scope

This repository is a scaffold and sample plugin, not a finished end-user
Obsidian plugin.

- It provides the sample plugin source, build wiring, package metadata, and
  dogfood copy script needed to create and test an Obsidian plugin locally.
- The verified automated flow covers dependency installation, scaffold helper
  tests, and production build output.
- The dogfood flow builds the sample and copies generated assets into a vault
  selected by the operator. It does not edit Obsidian settings automatically
  beyond writing the plugin files.
- Obsidian reload, plugin enablement, vault choice, and plugin-specific product
  behavior remain manual/local checks.
- `npm run lint` is kept as a debt visibility check and is not currently a
  passing release gate.

## Setup

Install dependencies before running local checks:

```sh
npm ci
```

This repository tracks `package-lock.json` so dependency installation is
reproducible. Use `npm ci` for local setup and CI.

## Scripts

- `npm test` runs the Node test suite for scaffold helper scripts.
- `npm run build` type-checks the plugin and writes the Obsidian release
  assets to `build/`.
- `npm run pack:check` verifies that an npm dry-run tarball contains the
  generated plugin entry, Obsidian manifest/version/style assets, and required
  project files while excluding the explicitly forbidden maintainer paths
  `.eslintignore`, `.eslintrc`, and `.github/`.
- `npm run dogfood` type-checks, builds, and copies the `build/` output into
  a local Obsidian vault.

## Continuous Integration

CI runs the reproducible checks that do not require a local Obsidian vault:

```sh
npm ci
npm test
npm run build
npm run pack:check
```

`npm run lint` and `npm run dogfood` remain local checks for now. Lint still
tracks existing baseline debt, and dogfood needs a vault path supplied by the
operator.

## Packaging

Run `npm run build` before `npm pack` or `npm publish`. The npm package entry
point is `build/main.js`, and the tarball should include the generated release
assets under `build/` (`build/main.js`, `build/manifest.json`,
`build/versions.json`, and `build/styles.css`) plus root scaffold metadata such
as `manifest.json`, `versions.json`, `styles.css`, `README.md`, and `LICENSE`.
Because this repository is a scaffold, the package may also include scaffold
project content such as `src/`, `scripts/`, and `tsconfig.json`;
`npm run pack:check` only enforces required assets and the explicitly forbidden
maintainer paths listed above.

## Known Existing Debt

- `npm run lint` is a baseline visibility check for existing TypeScript lint
  debt. It currently may fail on pre-existing `src/` issues, so treat it as a
  debt signal rather than a green local gate.

## Dogfood In Obsidian

Use `npm run dogfood` to build the plugin and copy it into a local vault.

1. Set `OBS_PLUG_DOGFOOD_VAULT` to the absolute path of the target vault, such
   as the path to your local `ObsidianVault` directory.
2. Add `obsidian-plugin-scaffold-sample` to the vault community plugin list,
   for example `<vault>/.obsidian/community-plugins.json`.
3. Run `npm run dogfood`.
4. Reload Obsidian.

## License

This project is licensed under the [MIT License](LICENSE).
