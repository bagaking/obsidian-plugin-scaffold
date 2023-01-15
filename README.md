# Obsidian Plugin Scaffold

This scaffold helps you quickly create and dogfood
[Obsidian](https://obsidian.md) plugins.

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
- `npm run dogfood` type-checks, builds, and copies the `build/` output into
  a local Obsidian vault.

## Continuous Integration

CI runs the reproducible checks that do not require a local Obsidian vault:

```sh
npm ci
npm test
npm run build
```

`npm run lint` and `npm run dogfood` remain local checks for now. Lint still
tracks existing baseline debt, and dogfood needs a vault path supplied by the
operator.

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
