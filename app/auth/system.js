const firebaseConfig = {
    apiKey: "AIzaSyCaC1S9etJ6C9uKpmE6cAuCy7B1Etr3tcU",
    authDomain: "hackville-411805.firebaseapp.com",
    databaseURL: "https://hackville-411805-default-rtdb.firebaseio.com",
    projectId: "hackville-411805",
    storageBucket: "hackville-411805.appspot.com",
    messagingSenderId: "786169359300",
    appId: "1:786169359300:web:5e358c8ccb80dac0b39291"
  };

const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// pastel colours array
const pastelColours = [
    "#FFB6C1", // light pink
    "#FFA07A", // light salmon
    "#FFDAB9", // peach puff
    "#FFDEAD", // navajo white
    "#FFE4B5", // moccasin
    "#F0E68C", // khaki
    "#E6E6FA", // lavender
    "#D8BFD8", // thistle
    "#DDA0DD", // plum
    "#EE82EE", // violet
    "#DA70D6", // orchid
]

class System {
    // load firebase config
    #firebaseConfig = firebaseConfig;    

    static DEFAULT_USER_DATA = {
        name: "New User",
        pfp:{
            style: random(1, 5),
        },
        uid: "",

        activeRoom: "test",
        room: {},
    }
    static DEFAULT_ROOM_DATA = {
        name: "New Room",
        rid: "",
        users: {},
        public: true,
        description: "This is a room",
        sites: {
            0: {
                url: "https://www.google.com",
                notes:{
                    "rid0": [
                        {
                            type: "text",
                            style: 0,
                            note: "This is a note",
                            x: 0,
                            y: 0,
                        },
                    ],
                        
                    "rid1": [
                        {
                            type: "sticker",
                            style: 0,
                            x: 0,
                            y: 0,
                        },
                    ]

                }
            },
        },
    }

    // generic path headers for rooms and users
    #roomHeader = "rooms";
    #accountHeader = "users";
    #userCredentials = {};
    #userData = {};

    constructor() {
        this.init();
    }

    init = async () => {
        await chrome.storage.local.get('userCredentials').then( async (data) => {
            if(data.userCredentials !== undefined || data.userCredentials !== null) {
                this.#userCredentials = data.userCredentials;
                console.log("Credentials Retrieved")
                console.log(this.#userCredentials)

                const userData = await this.#get(`/${this.#accountHeader}/${this.#userCredentials.localId}`)
                console.log("User Data Retrieved")
                console.log(userData)
                this.#userData = userData.response;
            } else {
                console.log("No Credentials Found")
                this.#userCredentials = {};
                await chrome.storage.local.set({userCredentials: {}});
            }
        })
    }

    isSignedIn = () => {
        return this.#userCredentials.idToken !== undefined;
    }

    signInWithEmailAndPassword = async (email, password) => {
        try {
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.#firebaseConfig.apiKey}`, {
            //   const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyC_3AUmJ8rDAr0E95xq9K80PCbzgyuSlLo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true,
                }),
            });
      
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message);
            }
      
            const userCredentials = await response.json();
            
            this.#userCredentials = userCredentials;

            // save the user data to local storage
            await chrome.storage.local.set({userCredentials: this.#userCredentials});

            console.log("Credentials Retrieved")

            /*
            get the current user data and see if there is a reference in the database
            if not then create a new reference in the db (using the default user data)
            */
            const userData = await this.#get(`/${this.#accountHeader}/${this.#userCredentials.localId}`)
            console.log("User Data Retrieved")

            if (userData.response === null) {
                this.#createUserDetails();
                // const uid = this.#userCredentials.localId;
                // this.#userData = System.DEFAULT_USER_DATA;
                // this.#userData.uid = uid;

                // await this.#post(`/${this.#accountHeader}/${uid}`, this.#userData)
            } else {
                this.#userData = userData.response;
            } 

            return true

            // console.log("User signed in:", userData);
        } catch (error) {
            console.error("Authentication error:", error.message);
        }
        return false
    };

    #createUserDetails = async (username) => {
        const uid = this.#userCredentials.localId;
        this.#userData = System.DEFAULT_USER_DATA;
        if(username && username != '') this.#userData.name = username;
        this.#userData.uid = uid;

        await this.#post(`/${this.#accountHeader}/${uid}`, this.#userData)
    }

    createNewAccount = async (email, password, username = '') => {
        try {
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.#firebaseConfig.apiKey}`, {
            // const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyC_3AUmJ8rDAr0E95xq9K80PCbzgyuSlLo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true,
                }),
             });
      
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message);
            }
      
            const userCredentials = await response.json();
            this.#userCredentials = userCredentials;

            await chrome.storage.local.set({userCredentials: this.#userCredentials});
            // console.log(this.#userCredentials)
            this.#createUserDetails(username);
            // console.log("Account created:", userData);
            return true
        }   
        catch (error) {
            console.error("Account creation error:", error.message);
            return false
        }
        return false
    };

    signOut = async () => {
        this.#userCredentials = {};
        this.#userData = {};

        await chrome.storage.local.set({userCredentials: {}});

        console.log("User signed out");
    }

    createRoom = async (rid = this.#generate_unique_rid(5), room_description = 'generic description', room_public = true) => {
        // generate a unique room id if one is not provided

        console.log("Creating room:", rid)

        // create a new room with the default room data
        const path = `/${this.#roomHeader}/${rid}`
        const roomData = System.DEFAULT_ROOM_DATA;
        roomData.public = room_public;
        roomData.description = room_description;
        roomData.rid = rid;
        const status = await this.#post(path, roomData)

        console.log(status)
        // join the room
        await this.joinRoom(rid);

        return status;
    }

    joinRoom = async (rid) => {
        console.log("Joining room:", rid)
        const t1 = performance.now();
        let roomReturn = {}
        try {
            // get the room data
            const room = await this.getRoom(rid);
            const roomData = room.response;
            
            if(room.response === null || rid == "") throw new Error("Room does not exist");

            // check if the roomData.user object exits
            if (roomData.users === undefined) {
                roomData.users = {};
            }

            // add the user to the room
            roomData.users[this.#userData.uid] = 0;


            // update the room data
            roomReturn = await this.#post(`/${this.#roomHeader}/${rid}`, roomData);

            // check if the user has room data
            if (this.#userData.room === undefined) {
                this.#userData.room = {};
            }

            // update the user data with the new room id
            this.#userData.room[rid] = 0;

            // update the db user data with the new room id
            await this.updateUser();

        } catch (error) {
            console.error("Room join error:", error.message);
        }
        const t2 = performance.now();
        const ping = t2 - t1;
        return {response: roomReturn.response, ping: ping};
    }
    
    leaveRoom = async (rid) => {
        // const rid = this.#userData.room;
        const rooms = Object.keys(this.#userData.room);
        try {
            if(rooms.length <= 0) throw new Error("User is not in a room");

            // get the room data
            const room = await this.getRoom(rid);
            const roomData = room.response;

            // remove the user from the room
            delete roomData.users[this.#userData.uid];

            // if the room is empty then delete the room
            if (Object.keys(roomData.users).length === 0) {
                await this.#deleteRoom(rid);
            } else {
                // update the room data
                await this.#post(`/${this.#roomHeader}/${rid}`, roomData);
            }

            // update the user data with the new room id
            delete this.#userData.room[rid]
            // update the db user data with the new room id
            await this.updateUser();
        } catch (error) {
            console.error("Room leave error:", error.message);
        }
    }

    getRoom = async (id) => {
        const path = `/${this.#roomHeader}/${id}`
        const status = await this.#get(path)

        return status;
    }
    
    #deleteRoom = async (id) => {
        console.log("Deleting room:", id)
        const path = `/${this.#roomHeader}/${id}`
        const status = await this.#post(path, null)

        return status;
    }

    // post data to firebase
    #post = async (path, data) => {
        let response = null;

        const t1 = performance.now();

        // make a post request to firebase
        // this uses databaseUrl and the user idToken from GCP identity platform

        await fetch(`${this.#firebaseConfig.databaseURL}${path}.json?auth=${this.#userCredentials.idToken}`, {
            // await fetch(`${this.#firebaseConfig.databaseURL}${path}.json?auth=${this.#firebaseConfig.apiKey}`, {
        // await fetch(`${this.#firebaseConfig.databaseURL}${path}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            // body: test,
        })
        .then(response => response.json())
        .then(updatedData => {
            // console.log('Data updated:', updatedData);
            response = updatedData;
        })
        .catch(error => console.error('Error updating data:', error));
        
        const t2 = performance.now();

        const ping = t2 - t1;
        return {
            response: response, 
            ping: ping,
        };
    }

    // get data from firebase
    #get = async (path) => {
        let response = null;

        const t1 = performance.now();
        // await fetch(`${this.#firebaseConfig.databaseURL}${path}.json?auth=${this.#firebaseConfig.apiKey}`, {
        await fetch(`${this.#firebaseConfig.databaseURL}${path}.json?auth=${this.#userCredentials.idToken}`, {

            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            // console.log('Data received:', data);
            response = data;
        })
        .catch(error => console.error('Error receiving data:', error));
        
        const t2 = performance.now();

        const ping = t2 - t1;
        return {
            response: response, 
            ping: ping,
        };
    }

    // generate unique room id
    #generate_unique_rid = (num) => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = '';
        const time = new Date().getTime();
        for (let i = 0; i < num; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `${time}_${id}`;
    }

    // update the db user data with local user data
    updateUser = async () => {
        const path = `/${this.#accountHeader}/${this.#userData.uid}`

        // overwrite the user data in the db with the local user data
        const status = await this.#post(path, this.#userData)

        return status;
    }

    updateRoom = async (rid, data) => {
        // check if user is in this room
        const userData = await this.#get(`/${this.#accountHeader}/${this.#userCredentials.localId}`)
        const response = userData.response

        if(!response) return
        const rooms = response.room
        const keys = Object.keys(rooms)

        if(!keys.includes(rid)) return

        console.log(data)

        const path = `/${this.#roomHeader}/${rid}`

        // overwrite the user data in the db with the local user data
        const status = await this.#post(path, data)

        return status;
    }

    getAllRooms = async () => {
        const rooms = await this.#get(`/${this.#roomHeader}`)
        return rooms.response
    }

    getUserName = async () => {
        const data = await this.#get(`/${this.#accountHeader}/${this.#userCredentials.localId}`)
        return data.response.name
    }

    // testing purposes
    get userCredentials() {
        return this.#userCredentials;
    }

    set userCredentials(userCredentials) {
        this.#userCredentials = userCredentials;
    }

    setUserData(userData) {
        this.#userData = userData;
    }

    roomData = async (rid) =>{
        return await this.#get(`/${this.#roomHeader}/${rid}`)
    }

    getOtherUser = async (user) => {
        return await this.#get(`/${this.#accountHeader}/${user}`)
    }

    userData = async () => {
        return await this.#get(`/${this.#accountHeader}/${this.#userCredentials.localId}`)
        // return this.#userData;
    }
}
