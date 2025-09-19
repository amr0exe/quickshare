import { getRoomInfo, joinRoom, leaveRoom } from "../service/rooms_service.js"
import { find_room_peer, register_name } from "../service/util_service.js"

const messageController = (ws, msg) => {
	console.log("message received: ", msg.toString())

	try {
		const data = JSON.parse(msg)

		switch (data.type) {
			// for room-logic
			case "register":
				register_name(ws, data.name)
			break

			case "join_room":
				joinRoom(data.room_name, ws)
			break

			case "leave_room":
				leaveRoom(data.room_name, ws)
			break

			case "rooms_list":
				getRoomInfo(ws)
			break
			// end

			case "offer":
			case "answer":
			case "candidate":
				const socket = find_room_peer(data.roomName, data.to)
				if (socket === null)  {
					console.log("socket being null....")
					return
				}
				socket.send(JSON.stringify(data))
			break

			default:
			console.log("Wrong data-type")
		}
	} catch (err) {
		console.log("Error handling mesage: ", err)
	}
}

export { messageController }
