import Bag from "./subrepos/foxglove_rosbag/src/Bag.ts"
import FileReader from "./subrepos/foxglove_rosbag/src/node/FileReader.ts"
// import ArrayReader from "./subrepos/foxglove_rosbag/src/web/ArrayReader.ts"
import { FileSystem, glob } from "https://deno.land/x/quickr@0.8.1/main/file_system.js"

const bag = new Bag(new FileReader(`${FileSystem.thisFolder}/data.ignore/co_ral_narrow.bag`))
await bag.open()
// const bag = new Bag(new FileReader(import.meta.resolve("./data.ignore/co_ral_narrow.bag").slice("file://".length)))
    // bag.startTime
    // bag.endTime
    // bag.bagOpt
const topics = [...bag.connections.values()].map(({ topic, type, messageDefinition, latching }) => ({ topic, type, messageDefinition, latching }))
const topicNames = topics.map(({ topic }) => topic)
for await (const { topic, connectionId, timestamp, data, message } of bag.messageIterator({ topics: topicNames })) {
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
    break
}