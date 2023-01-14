# Obsidian Plugin Scaffold

This scaffold helps you quickly create and dogfood
[Obsidian](https://obsidian.md) plugins.

## Setup

Install dependencies before running local checks:

```sh
npm install
```

## Scripts

- `npm test` runs the Node test suite for scaffold helper scripts.
- `npm run build` type-checks the plugin and writes the Obsidian release
  assets to `build/`.
- `npm run lint` runs ESLint over the TypeScript source files.
- `npm run dogfood` type-checks, builds, and copies the `build/` output into
  a local Obsidian vault.

## Dogfood In Obsidian

Use `npm run dogfood` to build the plugin and copy it into a local vault.

1. Set `OBS_PLUG_DOGFOOD_VAULT` to the absolute path of the target vault, such
   as the path to your local `ObsidianVault` directory.
2. Add `obsidian-plugin-scaffold-sample` to the vault community plugin list,
   for example `<vault>/.obsidian/community-plugins.json`.
3. Run `npm run dogfood`.
4. Reload Obsidian.
