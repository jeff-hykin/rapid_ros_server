#!/usr/bin/env -S deno run --allow-all
import { indent } from 'https://esm.sh/gh/jeff-hykin/good-js@1.18.2.0/source/flattened/indent.js'
import Yaml from 'https://esm.sh/yaml@2.4.3'
import { Console, cyan, green, magenta, yellow } from "https://deno.land/x/quickr@0.8.4/main/console.js"
import { asyncIterablePrefetcher } from "https://esm.sh/gh/jeff-hykin/good-js@1.18.2.0/source/flattened/async_iterator_prefetcher.js"

import { timestampToMilliseconds } from "../tools/timestampToMilliseconds.js"
import { rosEncode } from "../tools/rosEncode.js"

export function serveRosbag(bag, args={}) {
    // 
    // serve bag file
    // 
    let subscribers = []
    let startTimeMilliseconds = null

    //
    // start sending out messages
    //
    ;(async () => {
        const playbackSpeed = args.playbackSpeed
        let prevFakeTime = null
        let prevRealTime = 0
        let firstTimeMsInBag = null
        while (1) {
            // TODO: to be more efficient, there should be some batching+lookahead here
            for await (const item of asyncIterablePrefetcher(bag.messageIterator({ topics: args.topicWhitelist || bag.topicNames }), { bufferSize: 20 })) {
                const { topic, connectionId, timestamp, data, message } = item
                const { sec, nsec } = timestamp
                const isFirstMessage = startTimeMilliseconds == null
                const timestampMilliseconds = timestampToMilliseconds(timestamp)
                if (isFirstMessage) {
                    firstTimeMsInBag = timestampMilliseconds
                    if (args.useTimestampsAsOffsets) {
                        startTimeMilliseconds = Date.now()
                    } else {
                        startTimeMilliseconds = 0
                    }
                }
                const timeMs = timestampMilliseconds - firstTimeMsInBag
                const timeSec = timeMs / 1000
                const timeMin = timeSec / 60
                const date = new Date(timestampMilliseconds)
                if (args.fastForwardFunction && args.fastForwardFunction({ ...item, date, timeMin, timeSec, timeMs, unixTimeMs: timestampMilliseconds, timestamp })) {
                    continue
                }
                if (args.logFunction) {
                    const logValue = args.logFunction({ ...item, date, timeMin, timeSec, timeMs, unixTimeMs: timestampMilliseconds, timestamp, })
                    if (logValue!=null) {
                        Console.write(`${logValue}\r`)
                    }
                }
                if (prevFakeTime == null) {
                    prevFakeTime = timestampMilliseconds + startTimeMilliseconds
                    prevRealTime = performance.now()
                } else {
                    const realTimeGap = performance.now() - prevRealTime
                    prevRealTime = performance.now()
                    const fakeTime = timestampMilliseconds + startTimeMilliseconds
                    const desiredTimeGap = (fakeTime - prevFakeTime) / playbackSpeed
                    prevFakeTime = fakeTime
                    if (prevFakeTime >= 2) {
                        // 2ms is the smallest realistic amount of time
                        await new Promise((r) => setTimeout(r, desiredTimeGap))
                    }
                }
                
                // console.log(`sending message of ${topic}`)
                if (subscribers.length != 0) {
                    const messageBytes = rosEncode({
                        op: "publish",
                        topic: item.topic,
                        msg: { name: item.topic, timestamp, data: item.message},
                    })
                    for (const each of subscribers) {
                        if (args.debug) {
                            console.debug(`publishing item.topic is:`,item.topic)
                        }
                        // FIXME: ensure these are always encoded correctly (how are services handled?)
                        each.send(messageBytes)
                    }
                }

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
            console.log(`#`)
            console.log(`# reached end of rosbag file`)
            console.log(`#`)
            if (args.noRepeatOnEnd) {
                break
            } else {
                console.log(`# repeating from the beginning, use --no-repeat-on-end to disable this behavior`)
            }
        }
    })()

    let extras = {}
    if (args.dummyWss) {
        extras = {
            cert: certFileContents,
            key: keyFileContents,
        }
    }
    Deno.serve(
        {
            port: args.port-0,
            hostname: args.address,
            ...extras,
            // onListen: () => {
            //   console.log(`Running on http://127.0.0.1:9093`)
            // },
        },
        (req) => {
            //
            // asked for something other than websocket
            //
            if (req.headers.get("upgrade") != "websocket") {
                return new Response(new TextEncoder().encode("howdee"), { status: 200, headers: { "content-type": "text/plain" } })
            }

            const { socket, response } = Deno.upgradeWebSocket(req)
            subscribers.push(socket)
            socket.addEventListener("open", () => {
                console.log("a client connected!")
            })
            socket.addEventListener("message", (event) => {
                // TODO: clean up
                if (event.data === "ping") {
                    console.log(`got ping`)
                }
            })
            socket.addEventListener("close", () => {
                subscribers = subscribers.filter((each) => each !== socket)
            })

            return response
        }
    )
}