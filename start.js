#!/usr/bin/env sh
"\"",`$(echo --% ' |out-null)" >$null;function :{};function dv{<#${/*'>/dev/null )` 2>/dev/null;dv() { #>
echo "1.41.3"; : --% ' |out-null <#'; }; deno_version="$(dv)"; deno="$HOME/.deno/$deno_version/bin/deno"; if [ -x "$deno" ];then  exec "$deno" run -q -A --no-lock --no-config "$0" "$@";  elif [ -f "$deno" ]; then  chmod +x "$deno" && exec "$deno" run -q -A --no-lock --no-config "$0" "$@"; fi; has () { command -v "$1" >/dev/null; };  set -e;  if ! has unzip && ! has 7z; then echo "Can I try to install unzip for you? (its required for this command to work) ";read ANSWER;echo;  if [ "$ANSWER" =~ ^[Yy] ]; then  if ! has brew; then  brew install unzip; elif has apt-get; then if [ "$(whoami)" = "root" ]; then  apt-get install unzip -y; elif has sudo; then  echo "I'm going to try sudo apt install unzip";read ANSWER;echo;  sudo apt-get install unzip -y;  elif has doas; then  echo "I'm going to try doas apt install unzip";read ANSWER;echo;  doas apt-get install unzip -y;  else apt-get install unzip -y;  fi;  fi;  fi;   if ! has unzip; then  echo ""; echo "So I couldn't find an 'unzip' command"; echo "And I tried to auto install it, but it seems that failed"; echo "(This script needs unzip and either curl or wget)"; echo "Please install the unzip command manually then re-run this script"; exit 1;  fi;  fi;   if ! has unzip && ! has 7z; then echo "Error: either unzip or 7z is required to install Deno (see: https://github.com/denoland/deno_install#either-unzip-or-7z-is-required )." 1>&2; exit 1; fi;  if [ "$OS" = "Windows_NT" ]; then target="x86_64-pc-windows-msvc"; else case $(uname -sm) in "Darwin x86_64") target="x86_64-apple-darwin" ;; "Darwin arm64") target="aarch64-apple-darwin" ;; "Linux aarch64") target="aarch64-unknown-linux-gnu" ;; *) target="x86_64-unknown-linux-gnu" ;; esac fi;  print_help_and_exit() { echo "Setup script for installing deno  Options: -y, --yes Skip interactive prompts and accept defaults --no-modify-path Don't add deno to the PATH environment variable -h, --help Print help " echo "Note: Deno was not installed"; exit 0; };  for arg in "$@"; do case "$arg" in "-h") print_help_and_exit ;; "--help") print_help_and_exit ;; "-"*) ;; *) if [ -z "$deno_version" ]; then deno_version="$arg"; fi ;; esac done; if [ -z "$deno_version" ]; then deno_version="$(curl -s https://dl.deno.land/release-latest.txt)"; fi;  deno_uri="https://dl.deno.land/release/v${deno_version}/deno-${target}.zip"; deno_install="${DENO_INSTALL:-$HOME/.deno/$deno_version}"; bin_dir="$deno_install/bin"; exe="$bin_dir/deno";  if [ ! -d "$bin_dir" ]; then mkdir -p "$bin_dir"; fi;  if has curl; then curl --fail --location --progress-bar --output "$exe.zip" "$deno_uri"; elif has wget; then wget --output-document="$exe.zip" "$deno_uri"; else echo "Error: curl or wget is required to download Deno (see: https://github.com/denoland/deno_install )." 1>&2; fi;  if has unzip; then unzip -d "$bin_dir" -o "$exe.zip"; else 7z x -o"$bin_dir" -y "$exe.zip"; fi; chmod +x "$exe"; rm "$exe.zip";  exec "$deno" run -q -A --no-lock --no-config "$0" "$@";     #>}; $DenoInstall = "${HOME}/.deno/$(dv)"; $BinDir = "$DenoInstall/bin"; $DenoExe = "$BinDir/deno.exe"; if (-not(Test-Path -Path "$DenoExe" -PathType Leaf)) { $DenoZip = "$BinDir/deno.zip"; $DenoUri = "https://github.com/denoland/deno/releases/download/v$(dv)/deno-x86_64-pc-windows-msvc.zip";  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;  if (!(Test-Path $BinDir)) { New-Item $BinDir -ItemType Directory | Out-Null; };  Function Test-CommandExists { Param ($command); $oldPreference = $ErrorActionPreference; $ErrorActionPreference = "stop"; try {if(Get-Command "$command"){RETURN $true}} Catch {Write-Host "$command does not exist"; RETURN $false}; Finally {$ErrorActionPreference=$oldPreference}; };  if (Test-CommandExists curl) { curl -Lo $DenoZip $DenoUri; } else { curl.exe -Lo $DenoZip $DenoUri; };  if (Test-CommandExists curl) { tar xf $DenoZip -C $BinDir; } else { tar -Lo $DenoZip $DenoUri; };  Remove-Item $DenoZip;  $User = [EnvironmentVariableTarget]::User; $Path = [Environment]::GetEnvironmentVariable('Path', $User); if (!(";$Path;".ToLower() -like "*;$BinDir;*".ToLower())) { [Environment]::SetEnvironmentVariable('Path', "$Path;$BinDir", $User); $Env:Path += ";$BinDir"; } }; & "$DenoExe" run -q -A --no-lock --no-config "$PSCommandPath" @args; Exit $LastExitCode; <# 
# */0}`;
import { FileSystem, glob } from "https://deno.land/x/quickr@0.7.6/main/file_system.js"
import { Console, clearAnsiStylesFrom, black, white, red, green, blue, yellow, cyan, magenta, lightBlack, lightWhite, lightRed, lightGreen, lightBlue, lightYellow, lightMagenta, lightCyan, blackBackground, whiteBackground, redBackground, greenBackground, blueBackground, yellowBackground, magentaBackground, cyanBackground, lightBlackBackground, lightRedBackground, lightGreenBackground, lightYellowBackground, lightBlueBackground, lightMagentaBackground, lightCyanBackground, lightWhiteBackground, bold, reset, dim, italic, underline, inverse, strikethrough, gray, grey, lightGray, lightGrey, grayBackground, greyBackground, lightGrayBackground, lightGreyBackground, } from "https://deno.land/x/quickr@0.7.6/main/console.js"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts"

// import archy from "https://deno.land/x/archaeopteryx@1.0.8/mod.ts"
import archy from "/Users/jeffhykin/repos/archaeopteryx/mod.ts"
import * as yaml from "https://deno.land/std@0.168.0/encoding/yaml.ts"

import { parseArgs, flag, required, initialValue } from "https://esm.sh/gh/jeff-hykin/good-js@1.14.3.0/source/flattened/parse_args.js"
import { didYouMean } from "https://esm.sh/gh/jeff-hykin/good-js@1.14.3.0/source/flattened/did_you_mean.js"
import stringForIndexHtml from "./main/index.html.binaryified.js"

const argsInfo = parseArgs({
    rawArgs: Deno.args,
    fields: [
        [["--debug", "-d", ], flag, ],
        [["--help"], flag, ],
        [["--html"], initialValue(`./index.html`), (str)=>str],
        [["--watch-path"], initialValue(null), (str)=>str],
        [["--port"], initialValue(`8081`), (str)=>str],
        [["--ros-js-port"], required, (str)=>str],
        [["--address"], initialValue(`localhost`), (str)=>str],
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

Examples:
    rrs --html index.html --port 8081
    rrs --html index.html --port 8081 --address 0.0.0.0

Options:
    --debug, -d
        Run in debug mode (prints more stuff)

    --server-path
        Path to the html file to serve
        default: ./index.html

    --port
        The port to run the server on
        default: 8081

    --address
        The address to run the server on
        default: localhost
`)
}

import { certFileContents, keyFileContents } from "./main/dummyCertFiles.js"

let ipAddress = args.address
if (!args.address) {
    const ipAddresses = Deno.networkInterfaces().filter((each)=>each.family=="IPv4").map((each)=>each.address).filter(each=>each!="127.0.0.1").slice(0,1)
    ipAddress = ipAddresses[0]
}

const [folders, name, ext ] = FileSystem.pathPieces(FileSystem.makeAbsolutePath(args.html))
const actualHtmlPath = FileSystem.join(...folders, `${name}.ignore.html`)

const pathsToWatch = [ args.html, [ args.watchPath ].filter(each=>each) ]
const watcher = Deno.watchFs(...pathsToWatch, { recursive: true })
const updateInfo = async ()=>{
    // TODO: fix all this HTML stuff later

    let htmlFile
    try {
        htmlFile = await FileSystem.read(args.html)
    } catch (error) {
        console.error(`Could not read html file: ${args.html}, waiting for it to change`)
        return
    }

    try {
        var document = new DOMParser().parseFromString(
            FileSystem.sync.read(args.html),
            "text/html",
        )
    } catch (error) {
        console.error(`Could not parse html file: ${args.html}`, error)
        return
    }
    // TODO: fix scripts that are outside of the body and head
    await FileSystem.write({
        path: actualHtmlPath,
        data: stringForIndexHtml.replace(
            /<!-- HEADER INJECTION HERE -->/,
            document.head.innerHTML,
        ).replace(
            /<!-- BODY INJECTION HERE -->/,
            document.body.innerHTML
        ).replace(
            /"localhost"\/\* AUTOREPLACE:rosIpAddress \*\//, `"${ipAddress}"`
        ).replace(/9093\/\* AUTOREPLACE:rosPort \*\//, `${args.rosJsPort}`),
    })
}
updateInfo()

// 
// tiny secure file server
// 
Deno.serve({
    port: args.port-0,
    hostname: ipAddress,
    cert: certFileContents,
    key: keyFileContents,
    onListen: () => {
        console.log(`Running on http://${ipAddress}:${args.port}/`)
    },
}, (req) => {
    const path = "."+new URL(req.url).pathname
    try {
        return new Response(Deno.readFileSync(path == "./" ? "./index.html" : path), {
            status: 200,
            headers: {
                "content-type": path.endsWith(".js") ? "text/javascript" : "text/html",
            },
        })
    } catch (error) {
        return new Response(error.message, {
            status: 500,
            headers: {
                "content-type": "text/plain",
            },
        })
    }
})

for await (const event of watcher) {
    if (event.kind === 'modify') {
        updateInfo()
    }
}

// (this comment is part of deno-guillotine, dont remove) #>