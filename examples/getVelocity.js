#!/usr/bin/env -S deno run --allow-all
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