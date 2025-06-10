import { Ros, Topic, Param, Service, Action } from "../subrepos/roslibjs/src/core/index.js"
import { didYouMean } from 'https://esm.sh/gh/jeff-hykin/good-js@1.17.2.0/source/flattened/did_you_mean.js'
const { console } = globalThis

export class RosConnector {
    constructor({ipAddress, port, onConnect, onError, onClose, topicsToSubscribeTo, topicsToPublishTo }) {
        this.ros = null
        this.rosIsSetup = false
        this.ipAddress = ipAddress
        this.port = port
        this.onConnect = onConnect || function () {}
        this.onError = onError || function () {}
        this.onClose = onClose || function () {}
        this.setupStack = new Error().stack
        this.topicsToPublishTo = topicsToPublishTo || []
        this.topicsToSubscribeTo = topicsToSubscribeTo || []
        this.topics = []
        this.subscriptions = []
        
        // 
        // setup
        // 
        this.ros = new Ros({
            url: this.url,
        })
        
        this.ros.on("connection", async function (...args) {
            this.rosIsSetup = true
            try {
                await this.onConnect(...args)
            } catch (error) {
                try {
                    await this.onError(error)
                } catch (error) {
                    console.error(`${error?.stack}\n\nWhich came from the onError of ${this.setupStack}`)
                }
            }
        })

        this.ros.on("error", async function (...args) {
            try {
                await this.onError(...args)
            } catch (error) {
                console.error(`${error?.stack}\n\nWhich came from the onError of ${this.setupStack}`)
            }
        })

        this.ros.on("close", async function () {
            this.rosIsSetup = false
            try {
                await this.onClose(...args)
            } catch (error) {
                try {
                    await this.onError(error)
                } catch (error) {
                    console.error(error, `${error?.stack}\n\nWhich came from the onError of ${this.setupStack}`)
                }
            }
        })
        
        for (let { name, messageType, ...otherData} of this.topicsToPublishTo) {
            const topic = new Topic({
                ros: this.ros,
                name,
                messageType,
                ...otherData,
            })
            this.topics.push(topic)
        }
        
        for (let { callback, name, messageType, ...otherData} of this.topicsToSubscribeTo) {
            const topic = new Topic({
                ros: this.ros,
                name,
                messageType,
                ...otherData,
            })
            this.topics.push(topic)
            topic.subscribe(callback)
        }
    }
    get baseValue() {
        return `${this.ipAddress}:${this.port}`
    }
    get url() {
        return `wss://${this.ipAddress}:${this.port}`
    }
    publishTo(topicName, {data}) {
        const topic = this.topics.find(each=>each.name==topicName)
        if (topic) {
            topic.publish({data})
            // ex: 
            // data: Array.from(
            //     new Float32Array(
            //         event.inputBuffer.getChannelData(0)
            //     )
            // )
        } else {
            didYouMean({
                givenWord: topicName,
                possibleWords: this.topics.map(each=>each.name),
                autoThrow: true,
                suggestionLimit: 1 
            })
        }
    }
}