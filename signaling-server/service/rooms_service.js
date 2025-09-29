import { state } from "../state/state.js";
import { get_name } from "./util_service.js";
import { wss } from "../app.js";

const joinRoom = (roomName, ws) => {

	// ask if room exists
	// if yes join only if memberspace left
	// if not drop action

	const current_rooms = state.rooms.get(roomName)

	if (current_rooms.has(ws)) {
		console.log("Client duplication!!")
		return
	}
		
	// Capacity check before adding
	if (current_rooms.size >= 2) {
		console.log("Room is full");
		return
	}

	// add ws client 
	// actual joining
	current_rooms.add(ws)

	// ensurance1
	if (!state.users_room.has(ws)) {
		state.users_room.set(ws, new Set())
	}
	// add to client's room_list
	state.users_room.get(ws).add(roomName)
	console.log("Clients current Rooms: ", state.users_room.get(ws))

	if (current_rooms.size >= 2) {
		const sender = state.users_name.get(ws)
		// room-full message
		for (const cr of current_rooms) {
			console.log("send")
			cr.send(JSON.stringify({
				type: "room_full",
				from: sender
			}))
			break
		}
	}

	broadcastRoomInfo(ws)
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

	let client = get_name(ws)
	// delete user_records
	//state.users_name.delete(ws)
	// delete from user's room records
	if (state.users_room.get(ws).size > 0) {
		state.users_room.get(ws).delete(roomName)
	}
	console.log(`${client} Left room:: ${roomName}`)

	broadcastRoomInfo(ws)
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

const broadcastRoomInfo = (c_ws) => {
	const info = []
	for (const [name, members] of state.rooms) {
		info.push({name, size: members.size})
	}

	// push room_state toAll
	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN && client != c_ws) {
			client.send(JSON.stringify({
				type: "room_info",
				rooms: info
			}))
		}
	})
}

const delete_user_records = (ws) => {
	// delete user_records on websocket_disconnect
	state.users_name.delete(ws)
}

export { joinRoom, createRoom, leaveRoom, getRoomInfo, delete_user_records }
