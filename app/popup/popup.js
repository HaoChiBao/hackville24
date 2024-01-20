const pages = ['login', 'register' ,'home']

const system = new System()

// sign out button
const signOutButton = document.getElementById('sign-out')
signOutButton.addEventListener('click', async () => {
    try{
        await system.signOut()
        openPage('login')
    } catch (e) {
        console.log(e)
    }
})

// login page
const loginForm = document.getElementById('login-form')
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    let email = document.getElementById('login-email').value
    let password = document.getElementById('login-password').value

    // james test account
    email =  "yangster@gmail.com"
    password = "yangster123"

    // amanda test account
    // email = "missy@gmail.com"
    // password = "missy123"

    try{
        const status = await system.signInWithEmailAndPassword(email, password)
        if (status) {
            openPage('home')
        } else {
            alert('Login failed')
        }
    } catch (e) {
        console.log(e)
        alert('Login failed')
    }

})

// home join room
const joinRoomForm = document.getElementById('join-room')
console.log(joinRoomForm)
joinRoomForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    let room = joinRoomForm.querySelector('input').value
    try{
        const status = await system.joinRoom(room)
        console.log(status)
        if (status) {
            // openPage('room')
        } else {
            // alert('Join room failed')
        }
    } catch (e) {
        console.log(e)
        // alert('Join room failed')
    }
})

// home create room
const createRoomForm = document.getElementById('create-room')
createRoomForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    let room = createRoomForm.querySelector('input').value
    
    try{
        const status = await system.createRoom(room)
        console.log(status)
        if (status) {
            // openPage('room')
        } else {
            // alert('Create room failed')
        }
    } catch (e) {
        console.log(e)
        // alert('Create room failed')
    }
})

// area to display all groups user is in
const allGroups = document.querySelector('.all-groups')
const showUserGroups = async () => {
    const userData = await system.userData()
    const response = userData.response
    
    if(response.room === null || response.room === undefined) return
    
    const rooms = response.room

    allGroups.innerHTML = ''

    const keys = Object.keys(rooms)
    keys.forEach(room => {
        const roomElement = document.createElement('div')
        roomElement.innerHTML = room

        allGroups.appendChild(roomElement)
    })
}


// on start
const openPage = (page) => {
    turnOffPages()

    if(page === 'home'){
        showUserGroups()
    }

    const element = document.getElementById(page)
    element.style.opacity = 1
    element.style.pointerEvents = 'all'
}

turnOffPages = () => {
    pages.forEach(page => {
        const element = document.getElementById(page)
        element.style.opacity = 0
        element.style.pointerEvents = 'none'
    })
}

openPage('login')
// openPage('home')