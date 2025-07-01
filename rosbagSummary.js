#!/usr/bin/env -S deno run --allow-all
import Bag from "./subrepos/foxglove_rosbag/src/Bag.ts"
import FileReader from "./subrepos/foxglove_rosbag/src/node/FileReader.ts"
// import ArrayReader from "./subrepos/foxglove_rosbag/src/web/ArrayReader.ts"
import { FileSystem, glob } from "https://deno.land/x/quickr@0.8.1/main/file_system.js"
import { certFileContents, keyFileContents } from "./main/dummyCertFiles.js"
import { indent } from 'https://esm.sh/gh/jeff-hykin/good-js@1.17.2.0/source/flattened/indent.js'

import { parseArgs, flag, required, initialValue } from "https://esm.sh/gh/jeff-hykin/good-js@1.14.3.0/source/flattened/parse_args.js"
import { didYouMean } from "https://esm.sh/gh/jeff-hykin/good-js@1.14.3.0/source/flattened/did_you_mean.js"
import stringForIndexHtml from "./main/old/index.html.binaryified.js"

const argsInfo = parseArgs({
    rawArgs: Deno.args,
    fields: [
        [["--debug", "-d", ], flag, ],
        [["--help"], flag, ],
        [["--bag-file"], initialValue(`${FileSystem.thisFolder}/data.ignore/co_ral_narrow.bag`), (str)=>str],
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
`)
}

if (args.debug) {
    console.log(`Loading rosbag file: ${args.bagFile}`)
}
const bag = new Bag(new FileReader(args.bagFile))
await bag.open()
// const bag = new Bag(new FileReader(import.meta.resolve("./data.ignore/co_ral_narrow.bag").slice("file://".length)))
    // bag.startTime
    // bag.endTime
    // bag.bagOpt
const topics = [...bag.connections.values()].map(({ topic, type, messageDefinition, latching }) => ({ topic, type, latching, }))
// messageDefinition
const topicNames = topics.map(({ topic }) => topic)
import * as yaml from "https://deno.land/std@0.168.0/encoding/yaml.ts"
if (true) {
    console.log(`# the output is valid yaml (e.g. machine parsable/safe)`)
    console.log(yaml.stringify({topics}))
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
    // TODO: to be more efficient, there should be some batching+lookahead here
    for await (const item of bag.messageIterator({ topics: topicNames })) {
        const { topic, connectionId, timestamp, data, message } = item
        const { sec, nsec } = timestamp
        topicCounts[topic] = (topicCounts[topic] || 0) + 1
        const time = sec * 1000 + nsec / 1000000
        if (firstTimestamp == null) {
            firstTimestamp = time
        }
        lastTimestamp = time
        samples[topic] = samples[topic] || message
        
        // if (prevFakeTime == null) {
        //     prevFakeTime = sec * 1000 + nsec / 1000000
        //     prevRealTime = performance.now()
        // } else {
        //     const realTimeGap = performance.now() - prevRealTime
        //     prevRealTime = performance.now()
        //     const fakeTime = sec * 1000 + nsec / 1000000
        //     const desiredTimeGap = (fakeTime - prevFakeTime) / playbackSpeed
        //     prevFakeTime = sec * 1000 + nsec / 1000000
        //     if (prevFakeTime >= 2) {
        //         // 2ms is the smallest realistic amount of time
        //         await new Promise((r) => setTimeout(r, desiredTimeGap))
        //     }
        // }
        
        // console.log(`sending message of ${topic}`)
        // for (const each of subscribers) {
        //     // FIXME: ensure these are always encoded correctly (how are services handled?)
        //     each.send(
        //         rosEncode({
        //             op: "publish",
        //             topic: item.topic,
        //             timestamp,
        //             msg: item.message,
        //         })
        //     )
        // }

        // {
        //     topic: "/clock",
        //     connectionId: 0,
        //     timestamp: { sec: 1720510809, nsec: 899027777 },
        //     data: Uint8Array(8) [
        //         65,  86, 237, 101,
        //         232, 242,  86,  50
        //     ],
        //     message: Record { clock: { sec: 1710052929, nsec: 844559080 } }
        // }
    }
    console.log(yaml.stringify({
        topicCounts,
        timingInfo: {
            durationMilliseconds: lastTimestamp - firstTimestamp,
            firstTimestamp,
            lastTimestamp,
        },
    }))
    console.log(`samples:`)
    for (const [key, value] of Object.entries(samples)) {
        console.log(`    - ${key}: ${indent({string:JSON.stringify(value, 0,4), by:"        ", noLead:true})}`)
    }
})()