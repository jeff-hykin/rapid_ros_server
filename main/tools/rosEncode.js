import { BSON } from "https://esm.sh/bson@6.10.4"
import * as CBOR from "https://esm.sh/cbor-js@0.1.0"

export function rosEncode(message, compression = "json") {
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
        message = JSON.stringify(message, (_, value) =>typeof value === 'bigint' ? value.toString() : value)
    } else if (compression == "cbor") {
        message = CBOR.encode(message)
    } else if (compression == "bson") {
        message = BSON.serialize(message)
    } else {
        throw Error(`Unknown compression type: ${compression}`)
    }

    return message
}