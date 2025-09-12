#!/usr/bin/env -S deno run --allow-all
import { loadBag } from "./main/tools/loadBag.js"
import { FileSystem, glob } from "https://deno.land/x/quickr@0.8.1/main/file_system.js"
import { indent } from 'https://esm.sh/gh/jeff-hykin/good-js@1.17.2.0/source/flattened/indent.js'

import { parseArgs, flag, required, initialValue } from "https://esm.sh/gh/jeff-hykin/good-js@1.14.3.0/source/flattened/parse_args.js"
import { didYouMean } from "https://esm.sh/gh/jeff-hykin/good-js@1.14.3.0/source/flattened/did_you_mean.js"
import Yaml from 'https://esm.sh/yaml@2.4.3'

const argsInfo = parseArgs({
    rawArgs: Deno.args,
    fields: [
        [["--debug", "-d", ], flag, ],
        [["--help"], flag, ],
        [["--bag-file"], initialValue(null), (str)=>str],
        [["--list-topics"], flag, ],
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
    
    --list-topics
        List all the topics in the rosbag file, then exit
`)
}

if (args.debug) {
    console.log(`# Loading rosbag file: ${args.bagFile}`)
}
const bag = await loadBag({filePath: args.bagFile})
if (args.listTopics) {
    console.log(`# the output is valid yaml (e.g. machine parsable/safe)`)
    console.log(Yaml.stringify({topics}))
    Deno.exit()
}
    // bag.startTime
    // bag.endTime
    // bag.bagOpt
    // bag.topics
    // bag.topicNames
if (true) {
    console.log(`# the output is valid yaml (e.g. machine parsable/safe)`)
    console.log(Yaml.stringify({topics: bag.topics}))
}


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
    for await (const item of bag.messageIterator()) {
        const { topic, connectionId, timestamp, data, message } = item
        const { sec, nsec } = timestamp
        topicCounts[topic] = (topicCounts[topic] || 0) + 1
        const time = sec * 1000 + nsec / 1000000
        if (firstTimestamp == null) {
            firstTimestamp = time
        }
        lastTimestamp = time
        samples[topic] = samples[topic] || message
    }
    console.log(Yaml.stringify({
        topicCounts,
        timingInfo: {
            startDate: new Date(firstTimestamp),
            durationMinutes: (lastTimestamp - firstTimestamp)/60000,
            durationMilliseconds: lastTimestamp - firstTimestamp,
            firstTimestamp,
            lastTimestamp,
        },
    }))
    console.log(`samples:`)
    for (const [key, value] of Object.entries(samples)) {
        // console.log(`    - ${key}: ${}`)
        console.log(`    - ${key}: ${indent({string:"\n"+Yaml.stringify(value), by:"        ", noLead:true})}`)
    }
})()