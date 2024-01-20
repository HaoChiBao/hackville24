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

createAnnotation = (editable = false, text = "", user, pic) => {
    let noteDiv = createStaticNote()
    noteDiv.classList.add('annotation')

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

    if(!editable){
        noteText.addEventListener('keydown', (e) => {
            console.log('save to database')
        })
    }

    
    makeElementDraggable(noteDiv, bar)
    noteDiv.appendChild(noteText)

    return noteDiv
}

startAnnotation = (x = 0, y = 0) => {
    const note = createAnnotation(true)
    
    note.style.left = x + 'px'
    note.style.top = y + 'px'

    document.body.appendChild(note)
}




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

// startAnnotation()