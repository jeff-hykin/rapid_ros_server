import { Elemental } from "https://deno.land/x/elementalist@0.5.34/main/deno.js?code"
import { css, components, Column, Row, askForFiles, showToast, Code, Input, Button, Checkbox, Dropdown, popUp, Toastify, cx, } from "https://deno.land/x/good_component@0.2.5/elements.js"
import { fadeIn, fadeOut } from "https://deno.land/x/good_component@0.2.5/main/animations.js"
import { addDynamicStyleFlags, setupStyles, createCssClass, setupClassStyles, hoverStyleHelper, combineClasses, mergeStyles, AfterSilent, removeAllChildElements } from "https://deno.land/x/good_component@0.2.5/main/helpers.js"
import storageObject from "https://deno.land/x/storage_object@0.0.2.0/main.js"

// 
// 
// Initialize
// 
// 
    // 
    // Custom elements
    // 
        // NOTE: needs some work, fast dragging glitches (needs debounce for mouseout)
        const Draggable = ({ children, persistentId, x, y, initX, initY }) => {
            const localStorageId = persistentId && `$draggable:${persistentId}`
            let element
            const wrapper = html`
                <div style="">
                    ${element = html`
                        <div
                            style="background: whitesmoke; box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.3); color: black; position: absolute; top: -1rem; right: -1rem; --size: 2rem; width:  var(--size); height: var(--size);min-width:  var(--size); min-height: var(--size); border-radius: 5rem; border: 3px solid rgb(0,0,0,0.5);"
                            >
                        </div>
                    `}
                    ${children}
                </div>
            `
            if (persistentId) {
                x = initX
                y = initY
                // load whereever it was previously
                try {
                    // assign "top", and "left"
                    Object.assign(
                        wrapper.style,
                        JSON.parse(storageObject[localStorageId]),
                    )
                } catch (error) {
                    console.debug(`error is:`,error)
                    // just means it hasn't been saved yet
                }
            }
            let isDragging = false;
            let offset = { x: 0, y: 0, };

            wrapper.style.position = 'fixed';
            wrapper.style.top = x
            wrapper.style.left = y

            element.addEventListener('mouseover', (e) => {
                wrapper.style.cursor = 'grabbing'
            })
            element.addEventListener('mouseout', (e) => {
                wrapper.style.cursor = null
            })
            element.addEventListener('mousedown', (e) => {
                isDragging = true
                
                // Calculate the offset between mouse click and the top-left corner of the element
                offset = {
                    x: e.clientX - wrapper.getBoundingClientRect().left,
                    y: e.clientY - wrapper.getBoundingClientRect().top
                }

                // Set cursor style to indicate dragging
                wrapper.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    // Update element position based on mouse movement
                    wrapper.style.left = e.clientX - offset.x + 'px';
                    wrapper.style.top = e.clientY - offset.y + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    if (localStorageId) {
                        storageObject[localStorageId] = `{"top":${JSON.stringify(wrapper.style.top)},"left":${JSON.stringify(wrapper.style.left)}}`
                    }
                    isDragging = false;
                    // Reset cursor style
                    wrapper.style.cursor = 'grab';
                }
            });
            
            return wrapper
        }
        // NOTE: needs: <link rel="stylesheet" href="https://cdn.skypack.dev/gridjs@6.0.6//dist/theme/mermaid.css">
        const Grid = ({style, data, ...other})=> {
            const element = html`<div style=${style}  ...${other} />`
            window.grid = element
            element.grid = new gridjs.Grid({
                columns: [],
                data: [],
            }).render(element)
            element.updateData = (newData)=>{
                removeAllChildElements(element)
                setTimeout(()=>{
                    element.grid = new gridjs.Grid({columns: [], data:[],...newData }).render(element)
                    element.grid.forceRender()
                }, 1000)
            }
            return element
        }
    // 
    // custom elements import
    // 
        const { html } = Elemental({
            ...components,
            Grid,
            Draggable,
            UploadFileButton({style, backendEndpoint, responseHandler, children}) {
                return html`<Button
                    style=${style}
                    onClick=${
                        (event)=>{
                            askForFiles().then((files)=>{
                                if (files.length > 0) {
                                    const file = files[0];
                                    
                                    // Create a FormData object to send the file
                                    const formData = new FormData()
                                    formData.append('file', file)

                                    // Replace 'your-backend-endpoint' with the actual backend endpoint
                                    // Use the Fetch API to send the file to the backend
                                    fetch(backendEndpoint, {
                                        method: 'POST',
                                        body: formData
                                    })
                                    .then(response => response.json())
                                    .then((data => {
                                        console.log('File uploaded successfully:', data);
                                        responseHandler(data)
                                    }))
                                    .catch(error => {
                                        showError(`${error}`)
                                        console.error('Error uploading file:', error);
                                    })
                                }
                            })
                        }
                    }
                    >
                        ${children}
                </Button>`
            }
        })

// 
// 
// Main Code
// 
// 
document.body = html`
    <body font-size=15px min-height=100vh min-width=100vw background="var(--soft-gray-gradient)">
        <Draggable persistentId="BeatriceMurphy" >
            <iframe id="myIframe" src="/Users/jeffhykin/repos/primient/main/evaluations.ignore.matlab_1/create_baysian_ridge_model/scatter_plot.html" width="600" height="400"></iframe>
        </Draggable>
    </body>
`
document.body.animate(...fadeIn)