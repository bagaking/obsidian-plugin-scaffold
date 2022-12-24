#!/bin/bash
set -ex

# Set the dogfood vault
# `export OBS_PLUG_DOGFOOD_VAULT=/Users/xxxxx`
if test "$(which json)x" == "x"
then
	echo "you should run \`npm i\` first to install the \`json\` package"
	exit
fi

pluginName=$(cat manifest.json | json id)
echo $pluginName
if test "${pluginName}x" == "x"
then
	echo "you should set the id in the \`manifest.json\` file"
	exit
fi

if test "${OBS_PLUG_DOGFOOD_VAULT}x" == "x"
then
	echo OBS_PLUG_DOGFOOD_VAULT are not set, skip
	exit
fi

PluginPath="${OBS_PLUG_DOGFOOD_VAULT}/.obsidian/plugins/${pluginName}/"
echo copy to ${PluginPath}
cp -r ./build $PluginPath

