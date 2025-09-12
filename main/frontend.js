import { Elemental, passAlongProps } from "https://esm.sh/gh/jeff-hykin/elemental@0.6.5/main/deno.js"
import { css, components, Column, Row, askForFiles, Code, Input, Button, Checkbox, Dropdown, popUp, cx, } from "https://esm.sh/gh/jeff-hykin/good-component@0.3.2/elements.js"
import { fadeIn, fadeOut } from "https://esm.sh/gh/jeff-hykin/good-component@0.3.2/main/animations.js"
import { showToast, showErrorToast } from "https://esm.sh/gh/jeff-hykin/good-component@0.3.2/main/actions/show_toast.js" // helpful pop-up tools (google "toast notifiction")
import { createCssClass, removeAllChildElements } from "https://esm.sh/gh/jeff-hykin/good-component@0.3.2/main/helpers.js"
import { zip, enumerate, count, permute, combinations, wrapAroundGet } from "https://esm.sh/gh/jeff-hykin/good-js@1.13.5.1/source/array.js"
import storageObject from "https://esm.sh/gh/jeff-hykin/storage-object@0.0.3.5/main.js"

import { toRepresentation } from 'https://esm.sh/gh/jeff-hykin/good-js@1.18.2.0/source/flattened/to_representation.js'

import { createSignal } from "../tools/solid_help.js"
import html from "../tools/solid_help.js"
import { RosConnector } from "./RosConnector.js"

const rosC = new RosConnector({
    ipAddress: "127.0.0.1",
    port: 9093,
    // onConnect: ,
    onError: (error)=>{
        showErrorToast(error?.message || error)
    },
    // onClose: ,
    topicsToSubscribeTo: [],
    topicsToPublishTo: [],
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