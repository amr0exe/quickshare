let peerConnection
let dataChannel
let userName
let peerName

const ws = new WebSocket("ws://localhost:3000")
const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302"}] }

let incomingFileChunks = []
let receivingFile = false
let incomingFileName = ""

ws.onmessage = async (event) => {
    const data = JSON.parse(event.data)

    switch(data.type) {
        case "offer":
            await handleOffer(data.offer, data.from)
            break
        case "answer":
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
            break
        case "candidate":
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
            break
    }
}

function register() {
    userName = document.getElementById("username").value
    ws.send(JSON.stringify({ type: "register", name: userName }))
}

async function startCall() {
    peerName = document.getElementById("peername").value
    peerConnection = new RTCPeerConnection(config)

    // data-channel
    dataChannel = peerConnection.createDataChannel("myChannel")

    setupDataChannel(dataChannel)

    // ice-candidate
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: "candidate",
                candidate: event.candidate,
                to: peerName
            }))
        }
        console.log("ICE Connection State: From caller:", event.candidate)
    }

    // createOffer
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    // sendOffer
    ws.send(JSON.stringify({ type: "offer", offer, to: peerName, from: userName}))
}

async function handleOffer(offer, from) {
    peerName = from
    peerConnection = new RTCPeerConnection(config)

    // listen for incoming dataChannel
    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel
        setupDataChannel(dataChannel)
    }

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
        ws.send(JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
            to: peerName
        }));
        }
        console.log("ICE Connection State: ", peerConnection.iceConnectionState)
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    ws.send(JSON.stringify({ type: "answer", answer, to: peerName, from: userName }));
}

function setupDataChannel(channel) {
    channel.onopen = () => {
        console.log(" ### Data channel is open!!!")
    }

    channel.onmessage = (event) => {
           // handle end of file transfer
        if (typeof event.data === "string" && event.data.startsWith("EOF:")) { 
            const blob = new Blob(incomingFileChunks)
            const downloadLink = document.createElement("a")
            downloadLink.href = URL.createObjectURL(blob)

            incomingFileName = event.data.slice(4)

            downloadLink.download = incomingFileName
            downloadLink.textContent = `Download ${incomingFileName}`

            document.getElementById("chat").appendChild(downloadLink)
            document.getElementById("chat").appendChild(document.createElement("br"))
        
            // Reset for next file
            incomingFileChunks = []
            receivingFile = false

            // handle binary file chunk
        } else if (event.data instanceof ArrayBuffer) {
            incomingFileChunks.push(event.data)
            receivingFile = true
        
            // handle text message
        } else {
            const div = document.createElement("div")
            div.innerText = `From Peer: ${event.data}`
            document.getElementById("chat").appendChild(div)
        }
    }
}

function sendFile() {
    const fileInput = document.getElementById("fileInput")
    const file = fileInput.files[0]
    if (!file) return

    const chunkSize = 16 * 1024 // 16KB
    let offset = 0

    const reader = new FileReader()
    reader.onload = (e) => {
        dataChannel.send(e.target.result)
        offset += e.target.result.byteLength

        if (offset < file.size) {
            readSlice(offset)
        } else {
            dataChannel.send("EOF:" + file.name)
            console.log("File transfer completed...")
        }
    }

    const readSlice = (o) => {
        const slice = file.slice(o, o+chunkSize)
        reader.readAsArrayBuffer(slice)
    }

    readSlice(0)
}

function sendMessage() {
    const input = document.getElementById("msgInput")
    const msg = input.value

    if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(msg)

        const div = document.createElement("div")
        div.textContent = ` Your message: ${msg}`
        document.getElementById("chat").appendChild(div)
    
        input.value = ""
    }
}