import { html, passAlongProps } from "https://esm.sh/gh/jeff-hykin/elemental@0.6.5/main/deno.js"
const { Option } = globalThis

// position: fixed; right: 0; top: 0; height: 60vh;
export default function MessageLogger({ maxLength=10_000, ...props }) {
    let messages = []
    // note all the <br>'s are to help with viewing on mobile 
    const element = html`
        <span
            style="padding: 1rem; overflow: auto; width: 21rem; background-color: rgba(0,0,0,0.18); color: white; border-left: 2px gray solid; border-bottom: 2px gray solid; box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.3);"
            >
            (message log)
        </span>
    `
    passAlongProps(element, props)
    element.logHtml = function (...messages) {
        const message = messages.join(" ")
        element.innerHTML += `<br>...<br>${message}`
        element.scrollTop = MessageLog.element.scrollHeight
    }
    
    element.logMessage = function (...messages) {
        const message = messages.join(" ")
        const escapedText = new Option(message).innerHTML
        element.innerHTML = element.innerHTML.slice(-maxLength) // cap it so it doesnt just become massive
        element.innerHTML += `<br>...<br>${escapedText.replace(/\n/g,"<br>")}`
        element.scrollTop = element.scrollHeight
    }
    return element
}
