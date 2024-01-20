makeElementDraggable = (element, hold) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    hold.onmousedown = dragMouseDown

    function dragMouseDown(e) {
        e = e || window.event
        e.preventDefault()
        // get the mouse cursor position at startup:
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag
    }

    function elementDrag(e) {
        e = e || window.event
        e.preventDefault()
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY
        // set the element's new position:
        element.style.top = (element.offsetTop - pos2) + "px"
        element.style.left = (element.offsetLeft - pos1) + "px"
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null
        document.onmousemove = null

        const x = element.style.left
        const y = element.style.top
        console.log(x, y)
    }

}

createStaticNote = () => {
    let noteDiv = document.createElement('div')
    noteDiv.className = 'static-note'
    return noteDiv
}

uploadStaticNote = async (rid, text = '', x, y) => {
    console.log(rid, text, x, y)
    if(text === '' || text === ' ') return
    const url = window.location.href

    // check if user is in a room
    // get userCredentials
    const data = await chrome.storage.local.get('userCredentials')
    const userCredentials = data.userCredentials

    if(!userCredentials || Object.keys(userCredentials).length === 0) return

    // check if user is in this room
    const system = new System()
    system.userCredentials = userCredentials

    const userData = await system.userData()

    const room = await system.roomData(rid)
    const response = room.response

    if(!response) return

    const sites = response.sites
    console.log(sites)

    let found = false
    for(let i = 0; i < sites.length; i++){
        const site = sites[i]
        if(site.url === url){
            console.log('updating existing site')
            console.log(site)

            const notes = site.notes

            const user_notes = notes[userData.response.uid]
            // add note if user has no notes
            if(user_notes === undefined || user_notes === null){ notes[userData.response.uid] = []}
            // console.log()
            
            notes[userData.response.uid].push({
                style: 0,
                type: "text",
                note: text,
                x: x,
                y: y,
            })

            found = true

            break;
        } 
    }
    if(!found){
        console.log('creating new site')
        sites.push({
            url: url,
            notes: {
                [userData.response.uid]: [{
                    style: 0,
                    type: "text",
                    note: text,
                    x: x,
                    y: y,
                }]
            }
        })
    }
    // console.log(room)
    await system.updateRoom(rid, room.response)
}


createAnnotation = async (x, y, editable = false, text = "", uid, pic, ) => {
    let noteDiv = createStaticNote()
    noteDiv.id = uid + '0'
    noteDiv.classList.add('annotation')
    // noteDiv.style.left = x + 'px'
    // noteDiv.style.top = y + 'px'
    noteDiv.style.left = x
    noteDiv.style.top = y 

    let bar = document.createElement('div')
    bar.className = 'bar'
    noteDiv.appendChild(bar)

    let noteText = document.createElement('textarea')
    noteText.className = 'note-text'
    noteText.style.width = '100%'
    noteText.style.height = '100%'
    noteText.value = text
    noteText.placeholder = 'Type here'
    noteText.readOnly = !editable

    // add id to note
    const url = window.location.href

    // check if user is in a room
    // get userCredentials
    const data = await chrome.storage.local.get('userCredentials')
    const userCredentials = data.userCredentials

    if(!userCredentials || Object.keys(userCredentials).length === 0) return

    // check if user is in this room
    const system = new System()
    system.userCredentials = userCredentials

    const userData = await system.userData()
    const response = userData.response
    if(!response) return

    const rooms = response.room

    if(!rooms) return

    const roomKeys = Object.keys(rooms)

    for(let i = 0; i < roomKeys.length; i++){
        const room = roomKeys[i]
        
        const group = await system.roomData(room)
        const response = group.response
        
        const sites = response.sites

        for(let j = 0; j < sites.length; j++){
            const site = sites[j]
            if(site.url === url){
                console.log(site)
                const notes = site.notes
                if(notes[uid] && notes[uid].length > 0){
                    noteDiv.id = uid + (notes[uid].length - 1)
                } else {
                    break;
                }
            } 
        }
    }
    

    if(editable){
        console.log(0)
        noteText.addEventListener('keydown', (e) => {
            // console.log(e)
            const note = noteText.value
            console.log(note)
            if(e.key === 'Enter'){
                e.preventDefault()

                const x = noteDiv.style.left
                const y = noteDiv.style.top

                uploadStaticNote('test', note, x, y)
            }
        })
    }

    
    makeElementDraggable(noteDiv, bar)
    noteDiv.appendChild(noteText)

    return noteDiv
}

startAnnotation = async (x = 0, y = 0) => {
    console.log(x, y)
    const data = await chrome.storage.local.get('userCredentials')
    const userCredentials = data.userCredentials

    if(!userCredentials || Object.keys(userCredentials).length === 0) return

    // check if user is in this room
    const system = new System()
    system.userCredentials = userCredentials

    const userData = await system.userData()
    const response = userData.response
    if(!response) return

    const uid = response.uid

    const note = await createAnnotation(x + 'px', y + 'px', true, "", uid)

    console.log(note)
    if(!note) return
    
    console.log(note)
    document.body.appendChild(note)
}


init = async () => {
    // window initial event listeners
    
    let keyDown = false
    window.addEventListener('keydown', (e) => {if(e.key === 'Control') keyDown = true})
    window.addEventListener('keyup', (e) => {if(e.key === 'Control') keyDown = false})
    
    window.addEventListener('mousedown', (e) => {
        if (keyDown) {
            e.preventDefault()
            // console.log(0)
        }
    })

    const data = await chrome.storage.local.get('userCredentials')
    const userCredentials = data.userCredentials
    
    if(!userCredentials || Object.keys(userCredentials).length === 0) return

    // get all rooms user is in
    const system = new System()
    system.userCredentials = userCredentials

    const userData = await system.userData()
    const response = userData.response

    if(!response) return
    
    const system_uid = response.uid

    const rooms = response.room
    if(!rooms) return

    const roomKeys = Object.keys(rooms)

    for(let i = 0; i < roomKeys.length; i++){
        const room = roomKeys[i]
        
        const group = await system.roomData(room)
        const response = group.response
        
        console.log(response)

        const sites = response.sites
        console.log(sites)
        const url = window.location.href
        sites.forEach(site => {
            if(site.url === url){
                const notes = site.notes
                const current_user_note = Object.keys(notes)

                // console.log(current_user_note)
                current_user_note.forEach(uid => {
                    const user_note = notes[uid]

                    if(!user_note) return

                    user_note.forEach(async note => {
                        const x = note.x
                        const y = note.y
                        const text = note.note
                        let editable = false; if(uid === system_uid) editable = true
                        const type = note.type

                        let noteDiv = null
                        switch(type){
                            case 'text':
                                noteDiv = await createAnnotation(x, y, editable, text, uid)
                                break;
                            case 'sticker':
                                break;
                            default:
                                break;
                        }

                        document.body.appendChild(noteDiv)
                    })
                })
            }
        });
    }
}



init()

// startAnnotation()