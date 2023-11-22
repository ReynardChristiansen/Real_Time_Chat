const socket = io('ws://localhost:3500')


const chatRoom = document.querySelector('#user_room')
const activity = document.querySelector('.activity')
const chatDisplay = document.querySelector('.chat')
const msgInput = document.querySelector('#user_message')
const nameInput = document.querySelector('#user_name')
let activityTimer
let hasJoined = false;

function sendMessage(e) {
    e.preventDefault()
    if (!hasJoined) {
        return;
    }

    if (nameInput.value && msgInput.value && chatRoom.value) {
        if (msgInput.value.length <= 40) {
            socket.emit('message', {
                name: nameInput.value,
                text: msgInput.value
            });
            msgInput.value = "";
            msgInput.placeholder = 'Your message';
        } else {
            msgInput.value = "";
            msgInput.placeholder = 'Message should be less than 30 characters';

            setTimeout(() => {
                msgInput.placeholder = 'Your message...';
            }, 3000);
        }
    }

    msgInput.focus();
}

function enterRoom(e) {
    e.preventDefault()
    if (nameInput.value && chatRoom.value) {
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        })
        hasJoined = true;
    }
}

document.querySelector('.form-msg')
    .addEventListener('submit', sendMessage)

document.querySelector('.form-join')
    .addEventListener('submit', enterRoom)

socket.on("message", (data) => {
    activity.textContent = ""
    const { name, text, time } = data
    const li = document.createElement('li')
    li.className = 'post'
    if (name === nameInput.value) li.className = 'post post--right'
    if (name !== nameInput.value) li.className = 'post post--left'
        li.innerHTML = `
        <div class="post__header ${name === nameInput.value}">
        <span class="post__header--name ${name === 'Server' ? 'server-name' : ''}" >${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>
        `
    
    document.querySelector('.chat').appendChild(li)

    chatDisplay.scrollTop = chatDisplay.scrollHeight
})

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
})


socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`


    clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
        activity.textContent = ""
    }, 3000)
})