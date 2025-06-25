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
		roomNames.forEach((e) => leaveRoom(e, ws))
		console.log("---- client disconnected!!!")
	})
})

server.listen(3000, "0.0.0.0", () => {
	console.log("Signalling server running on port :3000")
})
