#!/usr/bin/env sh
"\"",`$(echo --% ' |out-null)" >$null;function :{};function dv{<#${/*'>/dev/null )` 2>/dev/null;dv() { #>
echo "2.2.11"; : --% ' |out-null <#'; }; deno_version="$(dv)"; deno="$HOME/.deno/$deno_version/bin/deno"; if [ -x "$deno" ];then  exec "$deno" run -q -A --no-lock --no-config "$0" "$@";  elif [ -f "$deno" ]; then  chmod +x "$deno" && exec "$deno" run -q -A --no-lock --no-config "$0" "$@"; fi; has () { command -v "$1" >/dev/null; };  set -e;  if ! has unzip && ! has 7z; then echo "Can I try to install unzip for you? (its required for this command to work) ";read ANSWER;echo;  if [ "$ANSWER" =~ ^[Yy] ]; then  if ! has brew; then  brew install unzip; elif has apt-get; then if [ "$(whoami)" = "root" ]; then  apt-get install unzip -y; elif has sudo; then  echo "I'm going to try sudo apt install unzip";read ANSWER;echo;  sudo apt-get install unzip -y;  elif has doas; then  echo "I'm going to try doas apt install unzip";read ANSWER;echo;  doas apt-get install unzip -y;  else apt-get install unzip -y;  fi;  fi;  fi;   if ! has unzip; then  echo ""; echo "So I couldn't find an 'unzip' command"; echo "And I tried to auto install it, but it seems that failed"; echo "(This script needs unzip and either curl or wget)"; echo "Please install the unzip command manually then re-run this script"; exit 1;  fi;  fi;   if ! has unzip && ! has 7z; then echo "Error: either unzip or 7z is required to install Deno (see: https://github.com/denoland/deno_install#either-unzip-or-7z-is-required )." 1>&2; exit 1; fi;  if [ "$OS" = "Windows_NT" ]; then target="x86_64-pc-windows-msvc"; else case $(uname -sm) in "Darwin x86_64") target="x86_64-apple-darwin" ;; "Darwin arm64") target="aarch64-apple-darwin" ;; "Linux aarch64") target="aarch64-unknown-linux-gnu" ;; *) target="x86_64-unknown-linux-gnu" ;; esac fi;  print_help_and_exit() { echo "Setup script for installing deno  Options: -y, --yes Skip interactive prompts and accept defaults --no-modify-path Don't add deno to the PATH environment variable -h, --help Print help " echo "Note: Deno was not installed"; exit 0; };  for arg in "$@"; do case "$arg" in "-h") print_help_and_exit ;; "--help") print_help_and_exit ;; "-"*) ;; *) if [ -z "$deno_version" ]; then deno_version="$arg"; fi ;; esac done; if [ -z "$deno_version" ]; then deno_version="$(curl -s https://dl.deno.land/release-latest.txt)"; fi;  deno_uri="https://dl.deno.land/release/v${deno_version}/deno-${target}.zip"; deno_install="${DENO_INSTALL:-$HOME/.deno/$deno_version}"; bin_dir="$deno_install/bin"; exe="$bin_dir/deno";  if [ ! -d "$bin_dir" ]; then mkdir -p "$bin_dir"; fi;  if has curl; then curl --fail --location --progress-bar --output "$exe.zip" "$deno_uri"; elif has wget; then wget --output-document="$exe.zip" "$deno_uri"; else echo "Error: curl or wget is required to download Deno (see: https://github.com/denoland/deno_install )." 1>&2; fi;  if has unzip; then unzip -d "$bin_dir" -o "$exe.zip"; else 7z x -o"$bin_dir" -y "$exe.zip"; fi; chmod +x "$exe"; rm "$exe.zip";  exec "$deno" run -q -A --no-lock --no-config "$0" "$@";     #>}; $DenoInstall = "${HOME}/.deno/$(dv)"; $BinDir = "$DenoInstall/bin"; $DenoExe = "$BinDir/deno.exe"; if (-not(Test-Path -Path "$DenoExe" -PathType Leaf)) { $DenoZip = "$BinDir/deno.zip"; $DenoUri = "https://github.com/denoland/deno/releases/download/v$(dv)/deno-x86_64-pc-windows-msvc.zip";  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;  if (!(Test-Path $BinDir)) { New-Item $BinDir -ItemType Directory | Out-Null; };  Function Test-CommandExists { Param ($command); $oldPreference = $ErrorActionPreference; $ErrorActionPreference = "stop"; try {if(Get-Command "$command"){RETURN $true}} Catch {Write-Host "$command does not exist"; RETURN $false}; Finally {$ErrorActionPreference=$oldPreference}; };  if (Test-CommandExists curl) { curl -Lo $DenoZip $DenoUri; } else { curl.exe -Lo $DenoZip $DenoUri; };  if (Test-CommandExists curl) { tar xf $DenoZip -C $BinDir; } else { tar -Lo $DenoZip $DenoUri; };  Remove-Item $DenoZip;  $User = [EnvironmentVariableTarget]::User; $Path = [Environment]::GetEnvironmentVariable('Path', $User); if (!(";$Path;".ToLower() -like "*;$BinDir;*".ToLower())) { [Environment]::SetEnvironmentVariable('Path', "$Path;$BinDir", $User); $Env:Path += ";$BinDir"; } }; & "$DenoExe" run -q -A --no-lock --no-config "$PSCommandPath" @args; Exit $LastExitCode; <# 
# */0}`;
import { loadBag } from "../main/tools/loadBag.js"
// import ArrayReader from "./subrepos/foxglove_rosbag/src/web/ArrayReader.ts"
import { FileSystem, glob } from "https://deno.land/x/quickr@0.8.1/main/file_system.js"
import { certFileContents, keyFileContents } from "../main/dummyCertFiles.js"
import { indent } from 'https://esm.sh/gh/jeff-hykin/good-js@1.18.2.0/source/flattened/indent.js'

import { parseArgs, flag, required, initialValue } from "https://esm.sh/gh/jeff-hykin/good-js@1.18.2.0/source/flattened/parse_args.js"
import { didYouMean } from "https://esm.sh/gh/jeff-hykin/good-js@1.18.2.0/source/flattened/did_you_mean.js"
import stringForIndexHtml from "../main/old/index.html.binaryified.js"

const argsInfo = parseArgs({
    rawArgs: Deno.args,
    fields: [
        [["--debug", "-d", ], flag, ],
        [["--help"], flag, ],
        [["--bag-file", 0], initialValue(null), (str)=>str],
    ],
    namedArgsStopper: "--",
    allowNameRepeats: true,
    valueTransformer: JSON.parse,
    isolateArgsAfterStopper: false,
    argsByNameSatisfiesNumberedArg: true,
    implicitNamePattern: /^(--|-)[a-zA-Z0-9\-_]+$/,
    implictFlagPattern: null,
})
didYouMean({
    givenWords: Object.keys(argsInfo.implicitArgsByName).filter(each=>each.startsWith(`-`)),
    possibleWords: Object.keys(argsInfo.explicitArgsByName).filter(each=>each.startsWith(`-`)),
    autoThrow: true,
    suggestionLimit: 1,
})
const args = argsInfo.simplifiedNames
if (args.help) {
    console.log(`
Usage: rrs [options]

Options:
    --debug, -d
        Run in debug mode (prints more stuff, maybe)
    
    --bag-file [path]
        The path to the rosbag file to serve
        default: ./data.ignore/co_ral_narrow.bag
`)
}

if (args.debug) {
    console.log(`# Loading rosbag file: ${args.bagFile}`)
}
const bag = await loadBag({filePath: args.bagFile})

//
// start sending out messages
//
;(async () => {
    let prevFakeTime = null
    let prevRealTime = 0
    let topicCounts = {}
    let samples = {}
    let firstTimestamp = null
    let lastTimestamp = null
    let prevPosition = null
    let prevTime = null
    let speedSum = 0
    let speedCount = 0
    // TODO: to be more efficient, there should be some batching+lookahead here
    for await (const item of bag.messageIterator({ topics: ["/spot/odometry"] })) {
        const { topic, connectionId, timestamp, data, message } = item
        const { sec, nsec } = timestamp
        topicCounts[topic] = (topicCounts[topic] || 0) + 1
        const timeMiliseconds = sec * 1000 + nsec / 1000000
        const timeMinutes = timeMiliseconds / 60000
        if (firstTimestamp == null) {
            firstTimestamp = timeMiliseconds
        }
        lastTimestamp = timeMiliseconds
        samples[topic] = samples[topic] || message
        if (prevPosition != null) {
            const distance = Math.sqrt(
                (message.pose.pose.position.x-prevPosition.x)**2 + (message.pose.pose.position.y-prevPosition.y)**2
            )
            const duration = timeMinutes - prevTime
            const speed = distance / duration
            // console.debug(`    - `)
            // console.debug(`        duration is:`,duration)
            // console.debug(`        speed is:`,speed)
            // console.debug(`        message.pose.pose.position is:`,message.pose.pose.position)
            speedSum += speed
            speedCount += 1
        }
        prevTime = timeMinutes
        prevPosition = message.pose.pose.position
    }
    const speedAverage = speedSum / speedCount
    console.debug(`positionAverageChangePerMinute:`,speedAverage)
})()
// (this comment is part of deno-guillotine, dont remove) #>