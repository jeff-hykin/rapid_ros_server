import Bag from "./subrepos/foxglove_rosbag/src/Bag.ts"
import FileReader from "./subrepos/foxglove_rosbag/src/node/FileReader.ts"
// import ArrayReader from "./subrepos/foxglove_rosbag/src/web/ArrayReader.ts"
import { FileSystem, glob } from "https://deno.land/x/quickr@0.8.1/main/file_system.js"
import { certFileContents, keyFileContents } from "./main/dummyCertFiles.js"

const bag = new Bag(new FileReader(`${FileSystem.thisFolder}/data.ignore/co_ral_narrow.bag`))
await bag.open()
// const bag = new Bag(new FileReader(import.meta.resolve("./data.ignore/co_ral_narrow.bag").slice("file://".length)))
    // bag.startTime
    // bag.endTime
    // bag.bagOpt
const topics = [...bag.connections.values()].map(({ topic, type, messageDefinition, latching }) => ({ topic, type, messageDefinition, latching }))
const topicNames = topics.map(({ topic }) => topic)

import { BSON } from "https://esm.sh/bson@6.10.4"
import * as CBOR from "https://esm.sh/cbor-js@0.1.0"
function rosEncode(message, compression = "json") {
    const { op, id, topic, msg, service, action } = message
    // op is one of:
        // "publish"
        // "service_response"
        // "call_service"
        // "send_action_goal"
        // "cancel_action_goal"
        // "action_feedback"
        // "action_result"
        // "png"
        // "status"
    // compression is one of:
    // "json"
    // "cbor"
    // "bson"

    let rawData
    if (compression == "json") {
        message = JSON.stringify(message)
    } else if (compression == "cbor") {
        message = CBOR.encode(message)
    } else if (compression == "bson") {
        message = BSON.serialize(message)
    } else {
        throw Error(`Unknown compression type: ${compression}`)
    }

    return message
}

let subscribers = []

//
// start sending out messages
//
;(async () => {
    const playbackSpeed = 0.001
    let prevFakeTime = null
    let prevRealTime = 0
    console.log(`here`)
    // TODO: to be more efficient, there should be some batching+lookahead here
    for await (const item of bag.messageIterator({ topics: topicNames })) {
        const { topic, connectionId, timestamp, data, message } = item
        const { sec, nsec } = timestamp
        if (prevFakeTime == null) {
            prevFakeTime = sec * 1000 + nsec / 1000000
            prevRealTime = performance.now()
        } else {
            const realTimeGap = performance.now() - prevRealTime
            prevRealTime = performance.now()
            const fakeTime = sec * 1000 + nsec / 1000000
            const desiredTimeGap = (fakeTime - prevFakeTime) / playbackSpeed
            prevFakeTime = sec * 1000 + nsec / 1000000
            if (prevFakeTime >= 2) {
                // 2ms is the smallest realistic amount of time
                await new Promise((r) => setTimeout(r, desiredTimeGap))
            }
        }

        console.log(`sending message of ${topic}`)
        for (const each of subscribers) {
            // FIXME: needs to have an op
            each.send(
                rosEncode({
                    op: "publish",
                    topic: item.topic,
                    timestamp,
                    msg: item.message,
                })
            )
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
})()

Deno.serve(
    {
        port: 9093,
        hostname: "127.0.0.1",
        // cert: certFileContents,
        // key: keyFileContents,
        // onListen: () => {
        //   console.log(`Running on http://127.0.0.1:9093`)
        // },
    },
    (req) => {
        console.debug(`req is:`, req)
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
