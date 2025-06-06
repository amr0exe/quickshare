import { WebSocketServer } from "ws"
import http from "http"
import express from "express"

const app = express()
app.use(express.static("."))
const server = http.createServer(app)
const wss = new WebSocketServer({ server })
const clients = {}

wss.on("connection", (ws) => {
    console.log("_____ new client")

    ws.on("message", (msg) => {
        const data = JSON.parse(msg)
        switch (data.type) {
            case "offer":    
            case "answer":
            case "candidate":
                // if receiver[to] exists
                if (clients[data.to]) {
                    clients[data.to].send(JSON.stringify(data))
                }
            break

            // register name with ws-client
            case "register":
                clients[data.name] = ws
                console.log(`${data.name} registered`)
            break
        }
    })

    // on-close cleanups
    ws.on("close", () => {
        for (let name in clients) {
            if (clients[name] === ws) delete clients[name]
        }
    })
})

server.listen(3000, "0.0.0.0", () => { console.log("SignallingServer runnng on port :3000")})

/*
Offer format:
{
    type: "offer",
    offer,
    to: peerName,
    from: userName
}

Answer format:
{
    type: "answer",
    answer,
    to: peerName,
    from: userName
}

ice-candidate format:
{
    type: "candidate",
    candidate,
    to: peerName
}

*/
