import Bag from "../../subrepos/foxglove_rosbag/src/Bag.ts"
import FileReader from "../../subrepos/foxglove_rosbag/src/node/FileReader.ts"
import ArrayReader from "../../subrepos/foxglove_rosbag/src/web/ArrayReader.ts"

function monkeyPatch(object, attrName, createNewFunction) {
    let prevObj = null
    while (!Object.getOwnPropertyNames(object).includes(attrName)) {
        prevObj = object
        object = Object.getPrototypeOf(object)
        if (prevObj === object) {
            throw new Error(`Could not find ${attrName} on ${object}`)
        }
    }
    const originalFunction = object[attrName]
    let theThis
    const wrappedOriginal = function(...args) {
        return originalFunction.apply(theThis, args)
    }
    const innerReplacement = createNewFunction(wrappedOriginal)
    object[attrName] = function(...args) {
        theThis = this
        return innerReplacement.apply(this, args)
    }
}

export async function loadBag({filePath, array}) {
    let filelike 
    if (filePath) {
        filelike = new FileReader(filePath)
    } else if (array) {
        filelike = new ArrayReader(array)
    }
    const bag = new Bag(filelike)
    await bag.open()
    // const bag = new Bag(new FileReader(import.meta.resolve("./data.ignore/co_ral_narrow.bag").slice("file://".length)))
        // bag.startTime
        // bag.endTime
        // bag.bagOpt
    const topics = [...bag.connections.values()].map(({ topic, type, messageDefinition, latching }) => ({ name: topic, type, latching, }))
    bag.topics = topics
    Object.defineProperty(bag, "topicNames", {
        get: function () {
            return topics.map(({ name }) => name)
        },
        enumerable: true,
        configurable: true,
    })

    // default to iterating all topics if no topics are specified
    monkeyPatch(bag, "messageIterator", function (original) {
        return async function* (obj={}, ...args) {
            if (obj?.topics == null || obj.topics instanceof Array && obj.topics.length == 0) {
                obj.topics = bag.topicNames
            }
            const iterator = original.apply(bag, [obj,...args])
            for await (const item of iterator) {
                yield item
            }
        }
    })
    
    return bag
}