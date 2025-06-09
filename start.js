#!/usr/bin/env sh
"\"",`$(echo --% ' |out-null)" >$null;function :{};function dv{<#${/*'>/dev/null )` 2>/dev/null;dv() { #>
echo "1.41.3"; : --% ' |out-null <#'; }; deno_version="$(dv)"; deno="$HOME/.deno/$deno_version/bin/deno"; if [ -x "$deno" ];then  exec "$deno" run -q -A --no-lock --no-config "$0" "$@";  elif [ -f "$deno" ]; then  chmod +x "$deno" && exec "$deno" run -q -A --no-lock --no-config "$0" "$@"; fi; has () { command -v "$1" >/dev/null; };  set -e;  if ! has unzip && ! has 7z; then echo "Can I try to install unzip for you? (its required for this command to work) ";read ANSWER;echo;  if [ "$ANSWER" =~ ^[Yy] ]; then  if ! has brew; then  brew install unzip; elif has apt-get; then if [ "$(whoami)" = "root" ]; then  apt-get install unzip -y; elif has sudo; then  echo "I'm going to try sudo apt install unzip";read ANSWER;echo;  sudo apt-get install unzip -y;  elif has doas; then  echo "I'm going to try doas apt install unzip";read ANSWER;echo;  doas apt-get install unzip -y;  else apt-get install unzip -y;  fi;  fi;  fi;   if ! has unzip; then  echo ""; echo "So I couldn't find an 'unzip' command"; echo "And I tried to auto install it, but it seems that failed"; echo "(This script needs unzip and either curl or wget)"; echo "Please install the unzip command manually then re-run this script"; exit 1;  fi;  fi;   if ! has unzip && ! has 7z; then echo "Error: either unzip or 7z is required to install Deno (see: https://github.com/denoland/deno_install#either-unzip-or-7z-is-required )." 1>&2; exit 1; fi;  if [ "$OS" = "Windows_NT" ]; then target="x86_64-pc-windows-msvc"; else case $(uname -sm) in "Darwin x86_64") target="x86_64-apple-darwin" ;; "Darwin arm64") target="aarch64-apple-darwin" ;; "Linux aarch64") target="aarch64-unknown-linux-gnu" ;; *) target="x86_64-unknown-linux-gnu" ;; esac fi;  print_help_and_exit() { echo "Setup script for installing deno  Options: -y, --yes Skip interactive prompts and accept defaults --no-modify-path Don't add deno to the PATH environment variable -h, --help Print help " echo "Note: Deno was not installed"; exit 0; };  for arg in "$@"; do case "$arg" in "-h") print_help_and_exit ;; "--help") print_help_and_exit ;; "-"*) ;; *) if [ -z "$deno_version" ]; then deno_version="$arg"; fi ;; esac done; if [ -z "$deno_version" ]; then deno_version="$(curl -s https://dl.deno.land/release-latest.txt)"; fi;  deno_uri="https://dl.deno.land/release/v${deno_version}/deno-${target}.zip"; deno_install="${DENO_INSTALL:-$HOME/.deno/$deno_version}"; bin_dir="$deno_install/bin"; exe="$bin_dir/deno";  if [ ! -d "$bin_dir" ]; then mkdir -p "$bin_dir"; fi;  if has curl; then curl --fail --location --progress-bar --output "$exe.zip" "$deno_uri"; elif has wget; then wget --output-document="$exe.zip" "$deno_uri"; else echo "Error: curl or wget is required to download Deno (see: https://github.com/denoland/deno_install )." 1>&2; fi;  if has unzip; then unzip -d "$bin_dir" -o "$exe.zip"; else 7z x -o"$bin_dir" -y "$exe.zip"; fi; chmod +x "$exe"; rm "$exe.zip";  exec "$deno" run -q -A --no-lock --no-config "$0" "$@";     #>}; $DenoInstall = "${HOME}/.deno/$(dv)"; $BinDir = "$DenoInstall/bin"; $DenoExe = "$BinDir/deno.exe"; if (-not(Test-Path -Path "$DenoExe" -PathType Leaf)) { $DenoZip = "$BinDir/deno.zip"; $DenoUri = "https://github.com/denoland/deno/releases/download/v$(dv)/deno-x86_64-pc-windows-msvc.zip";  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;  if (!(Test-Path $BinDir)) { New-Item $BinDir -ItemType Directory | Out-Null; };  Function Test-CommandExists { Param ($command); $oldPreference = $ErrorActionPreference; $ErrorActionPreference = "stop"; try {if(Get-Command "$command"){RETURN $true}} Catch {Write-Host "$command does not exist"; RETURN $false}; Finally {$ErrorActionPreference=$oldPreference}; };  if (Test-CommandExists curl) { curl -Lo $DenoZip $DenoUri; } else { curl.exe -Lo $DenoZip $DenoUri; };  if (Test-CommandExists curl) { tar xf $DenoZip -C $BinDir; } else { tar -Lo $DenoZip $DenoUri; };  Remove-Item $DenoZip;  $User = [EnvironmentVariableTarget]::User; $Path = [Environment]::GetEnvironmentVariable('Path', $User); if (!(";$Path;".ToLower() -like "*;$BinDir;*".ToLower())) { [Environment]::SetEnvironmentVariable('Path', "$Path;$BinDir", $User); $Env:Path += ";$BinDir"; } }; & "$DenoExe" run -q -A --no-lock --no-config "$PSCommandPath" @args; Exit $LastExitCode; <# 
# */0}`;
import { FileSystem, glob } from "https://deno.land/x/quickr@0.7.6/main/file_system.js"
import { Console, clearAnsiStylesFrom, black, white, red, green, blue, yellow, cyan, magenta, lightBlack, lightWhite, lightRed, lightGreen, lightBlue, lightYellow, lightMagenta, lightCyan, blackBackground, whiteBackground, redBackground, greenBackground, blueBackground, yellowBackground, magentaBackground, cyanBackground, lightBlackBackground, lightRedBackground, lightGreenBackground, lightYellowBackground, lightBlueBackground, lightMagentaBackground, lightCyanBackground, lightWhiteBackground, bold, reset, dim, italic, underline, inverse, strikethrough, gray, grey, lightGray, lightGrey, grayBackground, greyBackground, lightGrayBackground, lightGreyBackground, } from "https://deno.land/x/quickr@0.7.6/main/console.js"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts"

import archy from "https://deno.land/x/archaeopteryx@1.0.8/mod.ts"
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
        [["--port"], initialValue(`8080`), (str)=>str],
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
    rrs --html index.html --port 8080
    rrs --html index.html --port 8080 --address 0.0.0.0

Options:
    --debug, -d
        Run in debug mode (prints more stuff)

    --server-path
        Path to the html file to serve
        default: ./index.html

    --port
        The port to run the server on
        default: 8080

    --address
        The address to run the server on
        default: localhost
`)
}

// 
// setup certificates
// 
const certFilePath = Deno.makeTempFileSync()
const certFileContents = `-----BEGIN CERTIFICATE-----
MIIEFzCCAv+gAwIBAgIUQb4rDc2cK6W11JPhOPXjBjot94swDQYJKoZIhvcNAQEL
BQAwgZoxCzAJBgNVBAYTAlVTMQ4wDAYDVQQIDAVUZXhhczEYMBYGA1UEBwwPQ29s
bGVnZSBTdGF0aW9uMQ0wCwYDVQQKDARUQU1VMREwDwYDVQQLDAhDU0NFIDYzNTES
MBAGA1UEAwwJMTI3LjAuMC4xMSswKQYJKoZIhvcNAQkBFhx5YXNoYXMuc2FsYW5r
aW1hdHRAZ21haWwuY29tMB4XDTIzMDIwNzAyNDEyMFoXDTMzMDIwNDAyNDEyMFow
gZoxCzAJBgNVBAYTAlVTMQ4wDAYDVQQIDAVUZXhhczEYMBYGA1UEBwwPQ29sbGVn
ZSBTdGF0aW9uMQ0wCwYDVQQKDARUQU1VMREwDwYDVQQLDAhDU0NFIDYzNTESMBAG
A1UEAwwJMTI3LjAuMC4xMSswKQYJKoZIhvcNAQkBFhx5YXNoYXMuc2FsYW5raW1h
dHRAZ21haWwuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuqlF
v0ORgfHAIsARLoexMLdmTbIMqkdzcv443RMu3MUhrS6EA3c9mENTskAqSxxu4zPG
JR0yEVBmiJVLmr5eAwvNx+JXORsbIJ9sHzPQHmv/eFnIS+9QhasSThXV0Ni5iXME
5QMsX6Rva5Fm7GICLH5u1+veXLMatN7RsqrLEWaC9J7qqwDPcqc093MyhyNhtKtd
lt2Ph9+ryuOb0Uflx3K/3SKdpFIsou5jr7y/YJFMEGYIZRP8+dkcQr8e0jZBPmn9
dlu//hJd2F2wp+NEHWX+TCboi8iIFXRH4cjNOa89WpmOO6Gh2pzkjWLSuMsVtvMg
x/bfuKbbDZXr9jYpGQIDAQABo1MwUTAdBgNVHQ4EFgQUgpdHXRlBoZNV36zTdVAW
EciUvU8wHwYDVR0jBBgwFoAUgpdHXRlBoZNV36zTdVAWEciUvU8wDwYDVR0TAQH/
BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAepw5bo75lAEncZNaP2gKd03YYJ1Y
EOHJlwe4yYl7fSMwEDP7SvpEQ1uQqmDAxQntoQhQXqptfwaU2GVttkZioXOC4D3+
EODwWQx5VI1rnLxC/g9jhxbyNJvVplaBYwjH1yx6rO/8bPzaN4Qs2MLfiGRBGQBs
Dhp19CIPpboVRiRSGfcn0bvEfQIGNl4ABH+h0bFHp0vEtioAp7o+XJ72xj2ojjcP
KbFYuQtxbcSB2lv2Tj++EJzAwg5woIcbXREpKOrurQjF1Y679p5kUPmB77a14fHA
lakwyzfcPycR32PISk12f0sfQxvfSDFrdChp009q5RtPMoR287Ks8iHyig==
-----END CERTIFICATE-----
`
await FileSystem.write({ data: certFileContents, path: certFilePath })
const keyFilePath = Deno.makeTempFileSync()
const keyFileContents = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6qUW/Q5GB8cAi
wBEuh7Ewt2ZNsgyqR3Ny/jjdEy7cxSGtLoQDdz2YQ1OyQCpLHG7jM8YlHTIRUGaI
lUuavl4DC83H4lc5Gxsgn2wfM9Aea/94WchL71CFqxJOFdXQ2LmJcwTlAyxfpG9r
kWbsYgIsfm7X695csxq03tGyqssRZoL0nuqrAM9ypzT3czKHI2G0q12W3Y+H36vK
45vRR+XHcr/dIp2kUiyi7mOvvL9gkUwQZghlE/z52RxCvx7SNkE+af12W7/+El3Y
XbCn40QdZf5MJuiLyIgVdEfhyM05rz1amY47oaHanOSNYtK4yxW28yDH9t+4ptsN
lev2NikZAgMBAAECggEBAJQTsMb4PThOpdNrdrXo40H4W+oK800p/YYd8tI+Y5Cz
ufF+0y9EqtJdpsnjaSnI1pba/bd3n75of86eUSnjFwVnmcmV3wfoXu7USZu/KLzZ
hALfhqvmn4RKn+zeGY7iPt2xJxLeH5eIBPPal0GyxnKxohEchnwXgXo2wTfxkcKs
qKUbHtDnk8yhgr2oc3wVN3E7s2N4SAlDjwYhoLVjhUsgqZHEsALKO+0/Nrn2Ybdr
VeApVN7+jO9BS53Pk1JYmuES6bvN4Lqj7mWPDpPh1Gi/biP+33msnB7/iI9LGJu7
82YsiVMNKb+PdUoRBFDR80/VY1beX54Tul7iU55SMnkCgYEA9n1RRvlRHVx5kkbJ
xlPPF8/kxCVF/C8REUeppImxt+hFk4VjBXVKzFyVyw+W/8bbEJrgBHXDHbrhsZu3
usm29FRKUw4+Knynutn4/VPcV1jJjNdTTkSymYcr7xmjFpQnpoiKCjQJNpX9IAgm
6oOavKHWyXKYiP7UU+Bssraz8QcCgYEAwd0BVk7ZcCSg9ZDEmP8kGDpM6fIcWXFP
nJABiFERtbFfl39MAk8QNMxXxOMCnz2gnohtAY9R6pJ6Dngi7h92mT0OHMnKWH6M
KghcvhtysMznaXjwJRfTEIsX8iGteCMPWUeMUpCg6fgv/PZCMDAdpVjIdaT9y8SH
yfuIhU0mLN8CgYABIdA2wDxkIyGXz2Vr2MSxuk21rOomX1z3tFmOHOfJDXMMW2d6
BfDjAWXaueaapCIrcFqpCpVr1Ijm1O1CGV0SwDRbL0yPy2TF0ex31WPEru62C+Mh
D+W2GM3V2ktKdkG8XRItO9HzAztXY1Iyb4pNZXzkDfevYWQ+QmCdbYNkDwKBgQCg
gU4+GwJDqs/pAHcFBRjpRjuv5dg65Wm4gjICnrw+5h/y2l4f+z27uQNh62GcXfXB
y8oUZIi54ZRUrnqdFEepD7fDdf6lzgBWPJ4sd6U5ZCykUpDg5RzGsaKdwexRbxWi
IW64XS4dCHMSyQB7zRp+b0dov7WxI4IZZLvfQcS9mQKBgFNAjNfGwejl8le39Dqe
yXjMbfg7J24nv8dOMWAIQCN5QxOflZYIucBRgXFPN/eQXXVqw8OAmMCNCPuxQihV
FnFjKvQ4hCeCUxUL24yWNJzZ4HEFo0WwDyVPnsa98mkJgkZKaRk5k6FbByAZ3w4d
zBG38Q8YwfFN/k419qnKkT2E
-----END PRIVATE KEY-----
`
await FileSystem.write({ data: keyFileContents, path: keyFilePath })

let ipAddress
if (!args.address) {
    const ipAddresses = Deno.networkInterfaces().filter((each)=>each.family=="IPv4").map((each)=>each.address).filter(each=>each!="127.0.0.1").slice(0,1)
    ipAddress = ipAddresses[0]
}

const [folders, name, ext ] = FileSystem.pathPieces(FileSystem.makeAbsolutePath(args.html))
const actualHtmlPath = FileSystem.join(...folders, `${name}.ignore.html`)

const pathsToWatch = [ args.html, certFilePath, keyFilePath, [ args.watchPath ].filter(each=>each) ]
let server
const watcher = Deno.watchFs(pathsToWatch, { recursive: true })
const updateInfo = async ()=>{
    let htmlFile
    try {
        htmlFile = await FileSystem.read(args.html)
    } catch (error) {
        console.error(`Could not read html file: ${args.html}, waiting for it to change`)
        return
    }

    if (server) {
        try {
            await server.close()
        } catch (error) {
        }
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
    server = await archy({
        port: args.port,
        secure: true,
        certFile: certFilePath,
        keyFile: keyFilePath,
        hostname: ipAddress,
        root: FileSystem.parentPath(args.html),
        allowAbsolute: true,
    })
    console.log(`Running on http://${ipAddress}:${args.port}/`)
}
updateInfo()
for await (const event of watcher) {
    if (event.kind === 'modify') {
        updateInfo()
    }
}

// (this comment is part of deno-guillotine, dont remove) #>