import { state } from "../state/state.js";

const register_name = (ws, name) => {
	if (state.users_name.has(ws)) {
		console.log("Client already registered!!!")
		return
	}
	
	state.users_name.set(ws, name)
	console.log("current users: ", state.users_name.values())

	// add client-metadata
	state.users_room.set(ws, new Set())
}

const get_name = (ws) => {
	return state.users_name.get(ws)
}

const get_socket = (name) => {
	const clients = state.users_name
	for (const [k, v] of clients) {
		if (name === v) {
			return k
		}
	}
	return null
}

const get_roomName = (ws) => {
	return state.users_room.get(ws)
}

const find_room_peer = (roomName, peerName) => {
    // Check if roomName exists
    if (!roomName || roomName.trim() === "") {
        return null
    }

    const room = state.rooms.get(roomName)
    if (!room) {
        return null
    }

    const rcvr_socket = get_socket(peerName)
    if (!rcvr_socket) {
        return null
    }

    // Check if the peer is actually in this room
    if (room.has(rcvr_socket)) {
        return rcvr_socket
    }

    return null
}

export { get_name, register_name, find_room_peer, get_roomName }
