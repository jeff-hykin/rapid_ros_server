#!/usr/bin/env -S deno run --allow-all
import { indent } from 'https://esm.sh/gh/jeff-hykin/good-js@1.18.2.0/source/flattened/indent.js'
import Yaml from 'https://esm.sh/yaml@2.4.3'
import { timestampToMilliseconds } from "../tools/timestampToMilliseconds.js"

export async function printSummary(bag) {
    console.log(`# the output is valid yaml (e.g. machine parsable/safe)`)
    console.log(Yaml.stringify({topics: bag.topics}))

    //
    // start sending out messages
    //
    let prevFakeTime = null
    let prevRealTime = 0
    let topicCounts = {}
    let samples = {}
    let firstTimestamp = null
    let lastTimestamp = null
    for await (const item of bag.messageIterator()) {
        const { topic, connectionId, timestamp, data, message } = item
        // const { sec, nsec } = timestamp
        topicCounts[topic] = (topicCounts[topic] || 0) + 1
        const time = timestampToMilliseconds(timestamp)
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
        console.log(`    - ${key}: ${indent({string:"\n"+Yaml.stringify(value), by:"        ", noLead:true})}`)
    }
}