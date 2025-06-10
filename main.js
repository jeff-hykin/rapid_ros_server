import { Elemental, passAlongProps } from "https://esm.sh/gh/jeff-hykin/elemental@0.6.5/main/deno.js"
import { css, components, Column, Row, askForFiles, Code, Input, Button, Checkbox, Dropdown, popUp, cx, } from "https://esm.sh/gh/jeff-hykin/good-component@0.3.2/elements.js"
import { fadeIn, fadeOut } from "https://esm.sh/gh/jeff-hykin/good-component@0.3.2/main/animations.js"
import { showToast } from "https://esm.sh/gh/jeff-hykin/good-component@0.3.2/main/actions.js"
import { createCssClass, removeAllChildElements } from "https://esm.sh/gh/jeff-hykin/good-component@0.3.2/main/helpers.js"
import { zip, enumerate, count, permute, combinations, wrapAroundGet } from "https://esm.sh/gh/jeff-hykin/good-js@1.13.5.1/source/array.js"
import storageObject from "https://esm.sh/gh/jeff-hykin/storage-object@0.0.3.5/main.js"

import { createSignal } from "./tools/solid_help.js"
import html from "./tools/solid_help.js"
import { RosConnector } from "./main/ros_connector_no_ui.js"

const rosC = new RosConnector({
    ipAddress: "127.0.0.1",
    port: 9093,
    // onConnect: ,
    // onError: ,
    // onClose: ,
    topicsToSubscribeTo: [],
    topicsToPublishTo: [],
    .../*PARAMETERS START*/{
        port: 9093,
        topicsToSubscribeTo: [
            {
                name: "/clock",
                messageType: "rosgraph_msgs/Clock",
                callback: (data)=>{
                    console.log(`got clock message`,data)
                }
            }
        ],
    }/*PARAMETERS END*/
})

window.rosC = rosC

rosC.getAllTopics()

document.body = html`
    <body font-size=15px background-color=whitesmoke overflow=scroll width=100vw>
        ${Column({ children: html`
            <span>Howdy!</span>
            <span>Howdy!</span>
            <span>Howdy!</span>
        `})}
    </body>
`