import { state } from "../state/state.js";

const joinRoom = (roomName, ws) => {
	// if no room
	const room = state.rooms.get(roomName)

	// if room exists
	// if client already exists
	if (room.has(ws)) {
		console.log("client duplication!!!")
		return
	}
	// add ws client
	room.add(ws)

	// ensurance1
	if (!state.users_room.has(ws)) {
		state.users_room.set(ws, new Set())
	}

	// add to client's room_list
	state.users_room.get(ws).add(roomName)

	if (room.size >= 2) {
		const sender = state.users_name.get(ws)
		// room-full message
		for (const cr of room) {
			cr.send(JSON.stringify({
				type: "room_full",
				from: sender
			}))
			break
		}
	}
}

const createRoom = (roomName) => {
	// check, if room exits
	if (state.rooms.has(roomName)) {
		console.log("Room already exists: room_name:: ", roomName)
		return
	}

	// if room doesn't exists
	state.rooms.set(roomName, new Set())
}

const leaveRoom = (roomName, ws) => {
	const room = state.rooms.get(roomName)

	if (!room) return
	if (roomName === undefined) return

	// if client is in that room
	if (room.has(ws)) {
		room.delete(ws)
	}

	state.users_name.delete(ws)
	console.log("Left room:: ", roomName)
}

const getRoomInfo = (ws) => {
	const info = []
	for (const [name, members] of state.rooms) {
		info.push({ name, size: members.size })
	}

	ws.send(JSON.stringify({
		type: "room_info",
		rooms: info
	}))
}

export { joinRoom, createRoom, leaveRoom, getRoomInfo }
