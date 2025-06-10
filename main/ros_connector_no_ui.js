import * as ROSLIB from "../subrepos/roslibjs/src/RosLib.js"
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
    }
    get baseValue() {
        return `${this.ipAddress}:${this.port}`
    }
    get url() {
        return `wss://${this.ipAddress}:${this.port}`
    }
    setup() {
        this.ros = new ROSLIB.Ros({
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
            const topic = new ROSLIB.Topic({
                ros: this.ros,
                name,
                messageType,
                ...otherData,
            })
            this.topics.push(topic)
        }
        
        for (let { callback, name, messageType, ...otherData} of this.topicsToSubscribeTo) {
            const topic = new ROSLIB.Topic({
                ros: this.ros,
                name,
                messageType,
                ...otherData,
            })
            this.topics.push(topic)
            topic.subscribe(callback)
        }
    }
}