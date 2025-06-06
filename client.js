let localStream
let peerConnection
let userName
let peerName

const ws = new WebSocket("ws://localhost:3000")
const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302"}] }

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
    // take receivers name from inputBox
    peerName = document.getElementById("peername").value

    // get camera, mic permission
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    // stream local-video first
    document.getElementById("localVideo").srcObject = localStream
    
    // add localStream to peerConnection
    peerConnection = new RTCPeerConnection(config)
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream))

    // sends ice-candidate
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: "candidate",
                candidate: event.candidate,
                to: peerName
            }))
        }
    }

    // pointer to stream remote-peers video
    peerConnection.ontrack = (event) => {
        document.getElementById("remoteVideo").srcObject = event.streams[0]
    }

    // createOffer
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    // sendOffer
    ws.send(JSON.stringify({ type: "offer", offer, to: peerName, from: userName}))
}

async function handleOffer(offer, from) {
  peerName = from;

  // Get user media
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  document.getElementById("localVideo").srcObject = localStream;

  peerConnection = new RTCPeerConnection(config);
  localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

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

  peerConnection.ontrack = (event) => {
    document.getElementById("remoteVideo").srcObject = event.streams[0];
  };

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  ws.send(JSON.stringify({ type: "answer", answer, to: peerName, from: userName }));
}
