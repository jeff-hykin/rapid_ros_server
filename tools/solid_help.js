import h from "https://esm.sh/solid-js@1.9.7/h"
import htm from "./xhtm.js"

export * from "https://esm.sh/solid-js@1.9.7"
export default htm.bind((...args)=>h(...args)())