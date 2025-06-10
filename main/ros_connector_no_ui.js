import { Ros, Topic, Param, Service, Action } from "../subrepos/roslibjs/src/core/index.js"
import { didYouMean } from 'https://esm.sh/gh/jeff-hykin/good-js@1.17.2.0/source/flattened/did_you_mean.js'
import { deferredPromise } from 'https://esm.sh/gh/jeff-hykin/good-js@1.17.2.0/source/flattened/deferred_promise.js'
const { console } = globalThis

export class RosConnector {
    constructor({ipAddress, port, onConnect, onError, onClose, topicsToSubscribeTo, topicsToPublishTo }) {
        this.ros = null
        this.ipAddress = ipAddress
        this.port = port
        this.onConnect = onConnect || function () {}
        this.onError = onError || function () {}
        this.onClose = onClose || function () {}
        this.setupStack = new Error().stack
        this.topicsToSubscribeTo = topicsToSubscribeTo || []
        this.publishableTopics = []
        this.connectionPromise = deferredPromise()
        
        // 
        // setup
        // 
        this.ros = new Ros({
            url: this.url,
        })
        
        this.ros.on("connection", async function (...args) {
            this.connectionPromise.resolve()
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
            this.connectionPromise.reject()
            try {
                await this.onError(...args)
            } catch (error) {
                console.error(`${error?.stack}\n\nWhich came from the onError of ${this.setupStack}`)
            }
        })

        this.ros.on("close", async function () {
            this.connectionPromise = deferredPromise() // reset
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
        
        for (let { name, messageType, ...otherData} of topicsToPublishTo) {
            this.registerPublishableTopic({name, messageType, ...otherData})
        }
        
        for (let { callback, name, messageType, ...otherData} of this.topicsToSubscribeTo) {
            const topic = new Topic({
                ros: this.ros,
                name,
                messageType,
                ...otherData,
            })
            topic.subscribe(callback)
        }
    }
    get isConnected() {
        return this.ros?.isConnected
    }
    get baseValue() {
        return `${this.ipAddress}:${this.port}`
    }
    get url() {
        return `wss://${this.ipAddress}:${this.port}`
    }
    registerPublishableTopic({name, messageType, ...otherData}) {
        const topic = new Topic({
            ros: this.ros,
            name,
            messageType,
            ...otherData,
        })
        this.publishableTopics.push(topic)
    }
    async publishTo(topicName, {data}) {
        const topic = this.publishableTopics.find(each=>each.name==topicName)
        if (topic) {
            await this.connectionPromise
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
    getAllTopics() {
        return new Promise((resolve, reject)=>{
            this.connectionPromise.then(_=>this.ros.getTopics(resolve, reject))
        })
    }
}