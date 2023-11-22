import {createServer} from "http"
import {Server} from "socket.io"

const httpServer = createServer()
const server = "Server"

const io = new Server(httpServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"]
    }
})

const UsersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray
    }
}

io.on('connection', socket => {
    socket.emit('message', buildMsg(server, "Welcome to Chat App!"))

    socket.on('enterRoom', ({ name, room }) => {
        const prevRoom = getUser(socket.id)?.room

        if (prevRoom) {
            socket.leave(prevRoom)
            io.to(prevRoom).emit('message', buildMsg(server, `${name} has left the room`))
        }

        const user = activateUser(socket.id, name, room)

        socket.join(user.room)

        socket.emit('message', buildMsg(server, `You have joined the ${user.room} chat room`))

        socket.broadcast.to(user.room).emit('message', buildMsg(server, `${user.name} has joined the room`))

    })

    socket.on('disconnect', () => {
        const user = getUser(socket.id)
        userLeavesApp(socket.id)

        if (user) {
            io.to(user.room).emit('message', buildMsg(server, `${user.name} has left the room`))
        }
    })

    socket.on('message', ({ name, text }) => {
        const room = getUser(socket.id)?.room
        if (room) {
            io.to(room).emit('message', buildMsg(name, text))
        }
    })

    socket.on('activity', (name) => {
        const room = getUser(socket.id)?.room
        if (room) {
            socket.broadcast.to(room).emit('activity', name)
        }
    })
})

function buildMsg(name, text) {
    return {
        name,
        text,
        time: new Intl.DateTimeFormat('default', {
            hour: 'numeric',
            minute: 'numeric',
        }).format(new Date())
    }
}


function activateUser(id, name, room) {
    const user = { id, name, room }
    UsersState.setUsers([
        ...UsersState.users.filter(user => user.id !== id),
        user
    ])
    return user
}

function userLeavesApp(id) {
    UsersState.setUsers(
        UsersState.users.filter(user => user.id !== id)
    )
}

function getUser(id) {
    return UsersState.users.find(user => user.id === id)
}

httpServer.listen(3500)