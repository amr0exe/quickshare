import { WebSocketServer } from "ws";
import http from "http"

import { messageController } from "./controller/message_controller.js";
import { leaveRoom } from "./service/rooms_service.js";
import { get_roomName } from "./service/util_service.js";

const server = http.createServer()
const wss = new WebSocketServer({ server })

wss.on("connection", (ws) => {
	console.log("---- new client connected")

	ws.on("message", (msg) => messageController(ws, msg))

	ws.on("error", (err) => {
		console.log("Websocket Error!!! from server!!!", err)
	})

	ws.on("close", () => {
		let roomNames = get_roomName(ws);
		try {
			roomNames.forEach((e) => leaveRoom(e, ws))
		} catch (err) {
			console.log("No client/room to leave form", err)
		}

		console.log("---- client disconnected!!!")
	})
})

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || "0.0.0.0"

server.listen(PORT, HOST, () => {
	console.log(`Signalling server running on ${HOST}:${PORT}`)
})
