const pages = ['login', 'register' ,'home', 'searchRoom', 'create', 'landing']

const system = new System()

// sign out button
const signOutButton = document.getElementById('sign-out')
signOutButton.addEventListener('click', async () => {
    try{
        await system.signOut()
        openPage('landing')
    } catch (e) {
        console.log(e)
    }
})


// landing buttons
const landing = document.getElementById('landing')
const landingLogin = landing.querySelector('#login-button')
const landingRegister = landing.querySelector('#register-button')

landingLogin.addEventListener('click', () => {openPage('login')})
landingRegister.addEventListener('click', () => {openPage('register')})

// login page
const loginForm = document.getElementById('login-form')
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    let email = document.getElementById('login-email').value
    let password = document.getElementById('login-password').value

    // james test account
    // email =  "yangster@gmail.com"
    // password = "yangster123"

    // email = "jamesyang663@gmail.com"
    // password = "leaping"

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

// register form
const registerForm = document.getElementById('register-form')
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    let password = document.getElementById('register-password').value
    let confirmPassword = document.getElementById('register-confirm-password').value
    if(password !== confirmPassword) return

    let email = document.getElementById('register-email').value
    let username = document.getElementById('register-username').value

    const status = await system.createNewAccount(email, password, username)
    console.log(status)
    if(status){
        openPage('home')
    } else {
        alert('Register failed')
    }
})

// home create room
const createRoomForm = document.getElementById('create-room')
createRoomForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    let room = createRoomForm.querySelector('input').value
    
    let description = createRoomForm.querySelector('textarea').value
    let public = createRoomForm.querySelector('input[type="checkbox"]').checked

    try{
        const status = await system.createRoom(room, description, public)
        console.log(status)
        init_home()
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

const createAllGroup = async (uid, description = 'generic text') => {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('group');

    // Create the left side of the group
    const leftDiv = document.createElement('div');
    leftDiv.classList.add('left');

    // Create an h4 element with text 'Group Name'
    const groupNameHeading = document.createElement('h4');
    groupNameHeading.textContent = uid;

    // Create a p element with text 'Group Description'
    const groupDescriptionParagraph = document.createElement('p');
    groupDescriptionParagraph.textContent = description;

    // Append the h4 and p elements to the left div
    leftDiv.appendChild(groupNameHeading);
    leftDiv.appendChild(groupDescriptionParagraph);

    // Create the right side of the group
    const rightDiv = document.createElement('div');
    rightDiv.classList.add('right');

    // Create a button element with class 'activateRoom' and text 'add'
    const addButton = document.createElement('button');
    addButton.classList.add('activateRoom');
    addButton.addEventListener('click', async () => {
        const data = await system.userData()
        const response = data.response

        const activeRooms = response.room
        activeRooms[uid] = 1
        
        // console.log(response)
        // update userdata
        system.setUserData(response)

        console.log(await system.updateUser())
        init_home()
    })

    // Create a button element with class 'leaveRoom' and text 'leave'
    const leaveButton = document.createElement('button');
    leaveButton.classList.add('leaveRoom');

    leaveButton.addEventListener('click', async () => {
        // leave room
        try{
            const status = await system.leaveRoom(uid)
            groupDiv.remove()

            init_home()
        } catch (e) {
            console.log(e)
            // alert('Leave room failed')
        }
    })

    const addImg = document.createElement('img')
    addImg.src = await chrome.runtime.getURL('/app/images/ellipse.png')

    const leaveImg = document.createElement('img')
    leaveImg.src = await chrome.runtime.getURL('/app/images/close.png')

    addButton.appendChild(addImg)
    leaveButton.appendChild(leaveImg)

    // Append the buttons to the right div
    rightDiv.appendChild(addButton);
    rightDiv.appendChild(leaveButton);

    // Append the left and right divs to the group div
    groupDiv.appendChild(leftDiv);
    groupDiv.appendChild(rightDiv);

    // Append the group div to the body (or any other parent element)
    return groupDiv;
}

const createActiveGroup = async (uid, description = 'active room') => {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('group');

    // Create the left side of the group
    const leftDiv = document.createElement('div');
    leftDiv.classList.add('left');

    // Create an h4 element with text 'Group Name'
    const groupNameHeading = document.createElement('h4');
    groupNameHeading.textContent = uid;

    // Create a p element with text 'Group Description'
    const groupDescriptionParagraph = document.createElement('p');
    groupDescriptionParagraph.textContent = description;

    // Append the h4 and p elements to the left div
    leftDiv.appendChild(groupNameHeading);
    leftDiv.appendChild(groupDescriptionParagraph);

    // Create the right side of the group
    const rightDiv = document.createElement('div');
    rightDiv.classList.add('right');

    // Create a button element with class 'activateRoom' and text 'add'
    const rmButton = document.createElement('button');
    rmButton.classList.add('deactivateRoom');
    rmButton.addEventListener('click', async () => {
        const data = await system.userData()
        const response = data.response

        const rooms = response.room
        rooms[uid] = 0

        // console.log(rooms)
        
        // console.log(response)
        // update userdata
        system.setUserData(response)

        console.log(await system.updateUser())

        groupDiv.remove()
        init_home()
    })

    // Create a button element with class 'leaveRoom' and text 'leave'
    const setEdit = document.createElement('button');
    setEdit.classList.add('setEdit');

    setEdit.addEventListener('click', async () => {
        // leave room
        try{
            const data = await system.userData()
            const response = data.response

            response.activeRoom = uid
            system.setUserData(response)

            console.log(await system.updateUser())
            init_home()
        } catch (e) {
            console.log(e)
            // alert('Leave room failed')
        }
    })

    const rmImg = document.createElement('img')
    rmImg.src = await chrome.runtime.getURL('/app/images/minus.png')

    const setImg = document.createElement('img')
    setImg.src = await chrome.runtime.getURL('/app/images/star.png')

    rmButton.appendChild(rmImg)
    setEdit.appendChild(setImg)

    // Append the buttons to the right div
    rightDiv.appendChild(rmButton);
    rightDiv.appendChild(setEdit);

    // Append the left and right divs to the group div
    groupDiv.appendChild(leftDiv);
    groupDiv.appendChild(rightDiv);

    // Append the group div to the body (or any other parent element)
    return groupDiv;
}

const createPublicGroup = async (uid, description = 'public room') => {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('group');

    // Create the left side of the group
    const leftDiv = document.createElement('div');
    leftDiv.classList.add('left');

    // Create an h4 element with text 'Group Name'
    const groupNameHeading = document.createElement('h4');
    groupNameHeading.textContent = uid;

    // Create a p element with text 'Group Description'
    const groupDescriptionParagraph = document.createElement('p');
    groupDescriptionParagraph.textContent = description;

    // Append the h4 and p elements to the left div
    leftDiv.appendChild(groupNameHeading);
    leftDiv.appendChild(groupDescriptionParagraph);

    // Create the right side of the group
    const rightDiv = document.createElement('div');
    rightDiv.classList.add('right');

    // Create a button element with class 'activateRoom' and text 'add'
    const joinPublic = document.createElement('button');
    joinPublic.classList.add('joinPublic');
    // joinPublic.textContent = 'join';
    joinPublic.addEventListener('click', async () => {
        const data = await system.userData()
        const response = data.response

        const rooms = response.room
        if(rooms === null || rooms === undefined) {response.room = {}}
        response.room[uid] = 0
        
        // console.log(response)
        // update userdata
        system.setUserData(response)

        console.log(await system.updateUser())
        init_home()
    })

    joinImg = document.createElement('img')
    joinImg.src = await chrome.runtime.getURL('/app/images/plus.png')
    joinPublic.appendChild(joinImg)

    // Append the buttons to the right div
    rightDiv.appendChild(joinPublic);

    // Append the left and right divs to the group div
    groupDiv.appendChild(leftDiv);
    groupDiv.appendChild(rightDiv);

    // Append the group div to the body (or any other parent element)
    return groupDiv;
}

// area to display all groups user is in
const allGroups = document.querySelector('.all-groups .groups')
const activeGroups = document.querySelector('.active-groups .groups')
const init_home = async () => {
    const userData = await system.userData()
    const response = userData.response
    
    allGroups.innerHTML = ''
    activeGroups.innerHTML = ''
    // console.log(activeGroups)
    
    const userPfp = document.querySelector('.user-info .pfp')
    const img = userPfp.querySelector('img')
    img.src = await chrome.runtime.getURL(`/app/images/pfp/pfp (${response.pfp.style}).gif`)
    
    const username = document.querySelector('.user-info .username')
    username.textContent = response.name
    
    // add user rooms to screen
    
    if(response.room === null || response.room === undefined) return
    const rooms = response.room

    const activeRoom = response.activeRoom

    const keys = Object.keys(rooms)
    keys.forEach(async room => {
        const roomData = await system.getRoom(room)
        const roomResponse = roomData.response

        const roomElement = await createAllGroup(room, roomResponse.description)
        // console.log(roomElement)
        allGroups.appendChild(roomElement)


        if(rooms[room] === 1){
            const activeRoomElement = await createActiveGroup(room, roomResponse.description)

            if(activeRoom === room) activeRoomElement.style.filter = 'grayScale(0)'
            activeGroups.appendChild(activeRoomElement)
        }
    })
}

const search = document.getElementById('search-public')
search.addEventListener('submit', async (e) => {
    e.preventDefault()
    const input = search.querySelector('input').value

    if(input === '' || input === " ") return


})

// button to open find rooms
const findRooms = document.getElementById('findRooms')
findRooms.addEventListener('click', async () => {
    openPage('searchRoom')
})

const directToCreate = document.getElementById('create-page')
directToCreate.addEventListener('click', async () => {
    openPage('create')
})

const homeButtons = document.querySelectorAll('.home-button')
homeButtons.forEach(button => {
    button.addEventListener('click', () => {
        openPage('home')
    })
})

const init_searchRoom = async () => {
    const rooms = await system.getAllRooms()

    if(rooms === null || rooms === undefined) return

    const keys = Object.keys(rooms)
    // console.log(rooms, keys)
    const publicRoomsElement = document.querySelector('.public .groups')
    publicRoomsElement.innerHTML = ''
    keys.forEach(async rid => {
        const room = rooms[rid]
        if(room.public){
            const roomData = await system.getRoom(rid)
            const roomResponse = roomData.response
            // console.log(publicRoomsElement)

            const roomElement = await createPublicGroup(rid, roomResponse.description)
            publicRoomsElement.appendChild(roomElement)
        }
    })
    return 
} 

// on start
const openPage = (page) => {
    turnOffPages()

    if(page === 'home'){
        init_home()
    }

    if(page == 'searchRoom'){
        init_searchRoom()
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

const main = async () => {
    let userCredentials = await chrome.storage.local.get(['userCredentials'])
    console.log(userCredentials)

    if(userCredentials.userCredentials === undefined || userCredentials.userCredentials === null || Object.keys(userCredentials.userCredentials).length === 0) {
        system.userCredentials = userCredentials.userCredentials
        openPage('landing')
    } else {
        openPage('home')
    }
    // openPage('login')
    // openPage('register')
    // openPage('home')
    // openPage('searchRoom')
    // openPage('create')
}

main()

