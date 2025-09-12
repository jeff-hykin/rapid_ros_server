#!/usr/bin/env -S deno run --allow-all
import { loadBag } from "./main/tools/loadBag.js"
import FileReader from "./subrepos/foxglove_rosbag/src/node/FileReader.ts"
import { certFileContents, keyFileContents } from "./main/dummyCertFiles.js"
// import ArrayReader from "./subrepos/foxglove_rosbag/src/web/ArrayReader.ts"
import { FileSystem, glob } from "https://deno.land/x/quickr@0.8.4/main/file_system.js"
import { Console, cyan, green, magenta, yellow } from "https://deno.land/x/quickr@0.8.4/main/console.js"

import { parseArgs, flag, required, initialValue } from "https://raw.githubusercontent.com/jeff-hykin/good-js/1.18.0.0/source/flattened/parse_args.js"
import { didYouMean } from "https://raw.githubusercontent.com/jeff-hykin/good-js/1.18.0.0/source/flattened/did_you_mean.js"
import Yaml from 'https://esm.sh/yaml@2.4.3'

import { printSummary } from "./main/cliMethods/printSummary.js"
import { serveRosbag } from "./main/cliMethods/serveRosbag.js"

// todo features:
    // use write("\r") to print stuff in the loop (formatted time and topic name) Console.width
    // add --topic-blacklist
    // add --skip first N messages/time
    // add --skip last N messages/time
    // batch/look ahead for faster sending

const argsInfo = parseArgs({
    rawArgs: Deno.args,
    fields: [
        [["--debug", "-d", ], flag, ],
        [["--help"], flag, ],
        [["--bag-file", 0], initialValue(null), (str)=>str],
        [["--summarize", "--summary"], flag, ],
        [["--config-file"], initialValue(null), (str)=>str],
        [["--port"], initialValue(`9090`), (str)=>str],
        [["--address"], initialValue(`127.0.0.1`), (str)=>str],
        [["--list-topics"], flag, ],
        [["--topic-whitelist"], initialValue(null), (str)=>str.split(",")],
        [["--playback-speed", "-s"], initialValue(1), (str)=>parseFloat(str)],
        [["--no-repeat-on-end", "--no-repeat" ], flag, initialValue(false)],
        [["--use-timestamps-as-offsets", ], flag, initialValue(false)],
        [["--log-function", ], initialValue("null")],
        [["--fast-forward-function", ], initialValue("null")],
        [["--dummy-wss"], flag, ],
    ],
    namedArgsStopper: "--",
    nameRepeats: "useLast",
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
const highlightHelp = (string)=>string.replace(
        // the [value]
        /(?<=\n    --(?:\w|-)+\s+)\[.+?\]/g, (match)=>`${magenta(match)}`
    ).replace(
        // the Notes:
        /\n\w+:/g, (match)=>`\n${yellow.bold(match)}`
    ).replace(
        // the --arg
        /\n    (--(?:\w|-)+)/g, (match)=>`    ${green(match)}`
    )
const args = argsInfo.simplifiedNames
if (args.help) {
    console.log(highlightHelp(`
Usage: ${cyan("rrs")} [options]

Examples:
    ${cyan("rrs")} --list-topics --bag-file 'your_file.bag'
    
    ${cyan("rrs")} --summary --bag-file 'your_file.bag'
    
    ${cyan("rrs")} --bag-file 'your_file.bag' \
        --config-file ./package.json
        # package.json ex: { rbbConfig: { port: 9093 } } 
    
    ${cyan("rrs")} --bag-file 'your_file.bag' \
        --port 9093 \
        --address 127.0.0.1 \
        --playback-speed 2 \
        --topic-whitelist "/my1/topic1,/my2/topic2" \
        --no-repeat-on-end
    
    ${cyan("rrs")} --bag-file 'your_file.bag' \
        --port 9093 \
        --address 127.0.0.1 \
        --no-repeat-on-end \
        --playback-speed 2 \
        --topic-whitelist "/my1/topic1,/my2/topic2" \
        --fast-forward-function '({message,topic,timeMin,date,...other})=>timeMin<0.5' \
        --log-function '({message,topic,...other})=>[ date.toLocaleString(), topic ]'

    ${cyan("rrs")} --bag-file 'your_file.bag' \
        --port 9093 \
        --address 127.0.0.1 \
        --no-repeat-on-end \
        --playback-speed 2 \
        --topic-whitelist "/my1/topic1,/my2/topic2" \
        --fast-forward-function '({topic,timeMin,...other})=>timeMin<0.5' \
        --log-function '({message,topic,...other})=>{
            if (other.timeMin > 3 && other.timeMin < 5) {
                return null
            } else {
                return [ date.toLocaleString(), topic ]
            }
        '
Options:
    --bag-file [path]
        The path to the rosbag file to serve
        default: null
    
    --debug, -d
        Run in debug mode (prints more stuff, maybe)

    --list-topics
        List all the topics in the rosbag file, then exit
    
    --summarize
        Print a yaml summary of the rosbag file, then exit
    
    --help
        Print this help message
    
    --config-file [file_path]
        Highly recommended you use this.
        Use the config file to set port/ipAddress/etc
        It can be a .json/.yaml file or a .js file 
        Json example (can be inside a package.json):
            {
                "rbbConfig": {
                    "port": 9093,
                    "ipAddress": "127.0.0.1",
                    "noRepeatOnEnd": true,
                },
            }
        Js example:
            export default {
                rbbConfig: {
                    port: 9093,
                    ipAddress: "127.0.0.1",
                    playbackSpeed: 4,
                },
            }
    
    --port [portNumber]
        The port to run the server on
        default: 9093

    --address [ipAddress]
        The address to run the server on
        default: 127.0.0.1

    --topic-whitelist [topic1,topic2,...]
        Only read messages from the given topics
        default: all topics
        ex:
            --topic-whitelist /spot/odometry,/spot/status/mobility_params
    
    --no-repeat-on-end
        By default, the rosbag file will be repeated when it reaches the end
        (i.e. when the rosbag file is over, it will start from the beginning)
        This flag will disable that behavior

    --playback-speed, -s [floatValue]
        0.5 is half speed, 2 is double speed
        default: 1
    
    --dummy-wss
        Use a "secure" websocket connection
        (self-signed cert/key, not actually secure)
    
    --fast-forward-function [jsFunctionString]
        The sender will skip messages as fast as possible if the function 
        returns true. This is useful for ignoring start/end conditions.
        It is a javascript function literal, for example:
            --fast-forward-function '({message,topic,timeMin})=>timeMin<0.5'
        Here are the available properties on the message object:
            - message // object
            - topic // string
            - timeMin // time in minutes (relative to first message), float value
            - timeSec
            - timeMs
            - unixTimeMs // time in milliseconds relative to unix epoch
            - date // javascript Date object, ex: date.toLocaleString()
            - connectionId
            - data // Uint8Array (e.g. raw bytes)
    
    --log-function [jsFunctionString]
        A function that will be called for each non-skipped message.
        Whatever non-null value is returned will be printed.
        Examples:
            --log-function '({date,topic})=>[date,topic]'
            --log-function '({message})=>message?.pose?.pose?.position?.x'
            --log-function '({message,date,topic})=>[date, topic, message?.pose?.pose?.position?.x]'
            --log-function '({message,date,topic,timeMin})=>( (timeMin<0.5) ? null : [date, topic, message?.pose?.pose?.position?.x] )'
            --log-function '({message,topic,timeMin,date,...other})=>[ date.toLocaleString(), message?.pose?.pose?.position?.x ]'
            --log-function '({message,date,topic})=>{
                if (topic.startsWith("/spot/odometry")) {
                    return [date,message]
                }
            }'
Notes:
    - Cli arguments take precedence over config file values
    - You can give an argument twice, but only the last one will be used
`))
    Deno.exit()
}

if (args.configFile) {
    if (args.debug) {
        console.log(`Checking config file: ${JSON.stringify(args.configFile)}`)
    }
    if (!await FileSystem.isFileOrSymlinkToNormalFile(args.configFile)) {
        console.warn(`[rrs] tried to load from config file, but it didn't exist: ${JSON.stringify(args.configFile)}`)
    } else {
        let config
        // js or ts or jsx
        if (args.configFile.match(/\.[jt]sx?$/)) {
            try {
                config = (await import(args.configFile)).default
            } catch (error) {
                throw Error(`${error.stack}\n\n\nbbs wasn't able to load config file: ${JSON.stringify(args.configFile)} (error above)`)
            }
        // assume json or yaml
        } else {
            const data = await FileSystem.read(args.configFile)
            if (data == null) {
                throw Error(`[rrs] The config file exists but something is corrupt because I'm unable to read it: ${JSON.stringify(args.configFile)}`)
            }
            try {
                config = Yaml.parse(data)
            } catch (error) {
                throw Error(`${error.stack}\n\n\nbbs wasn't able to load config file: ${JSON.stringify(args.configFile)}\nNote: you have to options:\n    1. use a .json, .jsonc, or .yaml file\n       (thats what failed to load just now)\n    2. use a file that ends with js/ts/jsx, which will get imported`)
            }
        }

        //
        // use the config
        //
        if (config.rbbConfig) {
            // prefer cli commands
            Object.assign(args, config.rbbConfig, args)
        } else {
            console.warn(`[rrs] was able to load the config file, but I didn't see a rbbConfig field. E.g. I expect:\n    { rbbConfig: { port: 9093 } }\nNOT:\n    { port: 9093 }`)
        }
    }
    if (args.debug) {
        console.log(`Checking config file: complete`)
    }
}

// 
// load bag
// 
if (args.debug) {
    console.log(`Loading rosbag file: ${JSON.stringify(args.bagFile)}`)
}
const bag = await loadBag({filePath: args.bagFile})
if (args.debug) {
    console.log(`Loading rosbag file: complete`)
}
const {topics, topicNames} = bag

// evaled here so that bag,topics,etc are available
args.logFunction         = typeof args.logFunction         == "string" ? eval(args.logFunction)         : args.logFunction
args.fastForwardFunction = typeof args.fastForwardFunction == "string" ? eval(args.fastForwardFunction) : args.fastForwardFunction

// 
// pick action
// 
if (args.listTopics) {
    console.log(`# the output is valid yaml (e.g. machine parsable/safe)`)
    console.log(Yaml.stringify({topics}))
    Deno.exit()
} else if (args.summarize) {
    await printSummary(bag)
    Deno.exit()
} else {
    // will never finish but await helps with error message stack traces
    await serveRosbag(bag, args)
}