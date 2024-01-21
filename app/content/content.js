
makeElementDraggable = (element, hold) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0

    hold.forEach(h => {
        h.onmousedown = dragMouseDown
    })

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

uploadSticker = async (x, y, style) => {
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
    const userResponse = userData.response
    const activeRoom = userResponse.activeRoom

    const room = await system.roomData(activeRoom)
    const response = room.response

    if(!response) return

    const sites = response.sites
    // console.log(sites)

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
                style: style,
                type: "sticker",
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
                    style: style,
                    type: "sticker",
                    x: x,
                    y: y,
                }]
            }
        })
    }
    // console.log(room)
    await system.updateRoom(activeRoom, room.response)
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


createAnnotation = async (x, y, editable = false, text = "", uid, rid, pfp, collapsed = true) => {
    let noteDiv = createStaticNote()
    let noteDivId = uid + '0'
    noteDiv.id = noteDivId
    noteDiv.style.left = x
    noteDiv.style.top = y 
    
    let annotation = document.createElement('div')
    annotation.className = 'annotation'
    annotation.style.width = 'auto'
    annotation.style.height = 'auto'
    if(collapsed){
        annotation.style.opacity = 0
        annotation.style.pointerEvents = 'none'
    }
    
    noteDiv.appendChild(annotation)

    console.log(x, y)

    noteDiv.style.left = x + 'px'
    noteDiv.style.top = y + 'px'

    let user = document.createElement('div')
    user.className = 'user'

    let userImg = document.createElement('img')
    userImg.className = 'pfp'
    userImg.src = await chrome.runtime.getURL(`/app/images/pfp/pfp (${pfp.style}).gif`)
    userImg.title = uid

    // userImg.title = 
    // user.style.backgroundColor = pfp.colour
    user.appendChild(userImg)

    noteDiv.appendChild(user)

    let bar = document.createElement('div')
    bar.className = 'bar'

    let left = document.createElement('div')
    left.className = 'left'

    let leftImg = document.createElement('img')
    // leftImg.src = 'https://i.imgur.com/7bIhZ1f.png'
    leftImg.className = 'callout'
    leftImg.src = await chrome.runtime.getURL('/app/images/triangle.png')

    let title = document.createElement('h3')
    title.className = 'room-id'
    title.innerHTML = rid

    left.appendChild(leftImg)
    left.appendChild(title)


    let right = document.createElement('div')
    right.className = 'right'

    let minimize = document.createElement('button')
    minimize.className = 'minimize'

    let minimizeImg = document.createElement('img')
    minimizeImg.src = await chrome.runtime.getURL('/app/images/rectangle.png')

    minimize.appendChild(minimizeImg)
    let close = document.createElement('button')
    close.className = 'close'

    let closeImg = document.createElement('img')
    closeImg.src = await chrome.runtime.getURL('/app/images/ellipse.png')
    close.appendChild(closeImg)

    right.appendChild(minimize)
    right.appendChild(close)

    bar.appendChild(right)
    bar.appendChild(left)
    
    annotation.appendChild(bar)

    let noteText = document.createElement('textarea')
    noteText.className = 'note-text'
    noteText.style.width = '300px'
    noteText.style.height = '150px'
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
                // console.log(site)
                const notes = site.notes
                if(notes[uid] && notes[uid].length > 0){
                    noteDiv.id = uid + (notes[uid].length - 1)
                    noteDivId = uid + (notes[uid].length - 1)
                } else {
                    break;
                }
            } 
        }
    }
    

    if(editable){
        noteText.addEventListener('keydown', (e) => {
            // console.log(e)
            const note = noteText.value
            console.log(note)
            if(e.key === 'Enter'){
                e.preventDefault()

                const thisNoteDiv = noteText.parentElement.parentElement

                // get x and y relative to page
                // get bounding rect of noteDiv
                const rect = thisNoteDiv.getBoundingClientRect()
                const x = rect.left + window.scrollX
                const y = rect.top + window.scrollY

                // console.log(x, y, rect)
                // return
                
                const activeRoom = response.activeRoom

                uploadStaticNote(activeRoom, note, x, y)
            }
        })
    }


    closeTab = (element) => {
        element.style.opacity = 0
        element.style.pointerEvents = 'none'
    }

    openTab = (element) => {
        element.style.opacity = 1
        element.style.pointerEvents = 'all'
    }

    let click = true
    let mousedown = false
    user.addEventListener('mouseup', () => {
        if(click){
            const thisNoteDiv = user.parentElement.querySelector('.annotation')
            openTab(thisNoteDiv)
        }
        mousedown = false
        click = true
    })

    user.addEventListener('mousedown', () => {
        mousedown = true
    })

    user.addEventListener('mousemove', (e) => {
        if(mousedown){
            click = false
        }
    })

    minimize.addEventListener('click', () => {
        const thisNoteDiv = minimize.parentElement.parentElement.parentElement
        closeTab(thisNoteDiv)
    })

    close.addEventListener('click', () => {
        // delete noteDiv
        console.log(noteDiv)
        noteDiv.remove()
    })

    
    makeElementDraggable(noteDiv, [bar, user])
    annotation.appendChild(noteText)
    return noteDiv
}

createSticker = async (x, y, style) => {
    const sticker = document.createElement('div')
    sticker.className = 'sticker'
    const stickerImg = document.createElement('img')
    stickerImg.className = 'sticker-img'
    stickerImg.src = await chrome.runtime.getURL(`/app/images/stickers/sticker (${style}).png`)
    
    sticker.appendChild(stickerImg)
    
    sticker.style.left = x + 'px'
    sticker.style.top = y + 'px'
    
    makeElementDraggable(sticker, [stickerImg])
    
    return sticker
}

startSticker = async (x = 0, y = 0, style) => {
    const sticker = await createSticker(x, y, style)

    document.body.appendChild(sticker)

    await uploadSticker(x, y, style)
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

    const pfp = response.pfp

    const rid = response.activeRoom

    const note = await createAnnotation(x + 'px', y + 'px', true, "", uid, rid, pfp, false)

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
    const activeRoom = response.activeRoom

    if(!response) return
    
    const system_uid = response.uid

    const rooms = response.room
    if(!rooms) return

    const roomKeys = Object.keys(rooms)

    for(let i = 0; i < roomKeys.length; i++){
        const room = roomKeys[i]
        console.log(rooms[room]) 

        // if the user's rooms is not active, skip
        if(rooms[room] !== 1) continue
        
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

                    console.log(user_note)
                    if(!user_note) return

                    user_note.forEach(async note => {
                        const x = note.x
                        const y = note.y
                        const text = note.note
                        let editable = false; if(uid === system_uid) editable = true
                        const type = note.type

                        let noteDiv = null

                        const thisUser = await system.getOtherUser(uid)
                        const thisUserResponse = thisUser.response

                        console.log(type, "_________________________________")
                        switch(type){
                            case 'text':
                                noteDiv = await createAnnotation(x, y, editable, text, uid, room, thisUserResponse.pfp)
                                break;
                            case 'sticker':
                                noteDiv = await createSticker(x, y, note.style)
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