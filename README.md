# Obsidian Plugin Scaffold

This is a scaffolding scent to help you quickly create [Obsidian](https://obsidian.md) plugins

## 运行 DogFood 脚本

通过执行 `npm run dogfood` 可以打包并将 plugin 配置到指定的 vault 中

1. 将 Vault 的绝对路径配置到环境变量 OBS_PLUG_DOGFOOD_VAULT, 比如 `/User/me/vault`
2. 手动将 "obsidian-plugin-scaffold-sample" 加到插件清单中，本例中对应的文件为 `/User/me/vault/.obsidian/core-plugins.json`
3. 执行 `npm run dogfood`
4. 刷新 Obsidian

