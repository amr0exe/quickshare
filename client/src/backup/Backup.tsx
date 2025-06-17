import { useEffect, useRef, useState } from "react"

function Backup() {
	const [username, setUsername] = useState("")
	const [peerName, setPeerName] = useState("")
	const [currentMsg, setCurrentMsg] = useState("") 
	const [messages, setMessages] = useState<Array<{type: 'text' | 'file', content: string, fileName?: string}>>([])

	const fileRef = useRef(null)
	const ws = useRef<WebSocket|null>(null)
	const peerConnection = useRef<RTCPeerConnection|null>(null)
	const dataChannel = useRef<RTCDataChannel|null>(null)
	const incomingChunksRef = useRef<ArrayBuffer[]>([])

	const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302"}] }
	
	const register = () => {
		ws.current?.send(JSON.stringify({
			type: "register",
			name: username
		}))
	}

	const startCall = async () => {
		peerConnection.current = new RTCPeerConnection(config)

		dataChannel.current = peerConnection.current.createDataChannel("mychannel", { ordered: true})
		dataChannel.current.binaryType = "arraybuffer"
		setupDC(dataChannel.current)

		peerConnection.current.onicecandidate = (event) => {
			if (event.candidate) {
				ws.current?.send(JSON.stringify({
					type: "candidate",
					candidate: event.candidate,
					to: peerName
				}))
			}
		}

		const offer = await peerConnection.current.createOffer()
		await peerConnection.current.setLocalDescription(offer)

		ws.current?.send(JSON.stringify({
			type: "offer",
			offer,
			to: peerName,
			from: username
		}))
	}

	const handleOffer = async (offer: RTCSessionDescription, from: string) => {
		peerConnection.current = new RTCPeerConnection(config)	

		peerConnection.current.ondatachannel = (event) => {
			dataChannel.current = event.channel
			dataChannel.current.binaryType = "arraybuffer"
			setupDC(dataChannel.current)
		}

		peerConnection.current.onicecandidate = (event) => {
			if (event.candidate) {
				ws.current?.send(JSON.stringify({
					type: "candidate",
					candidate: event.candidate,
					to : from
				}))
			}
			// console.log("Ice Candidate State: ", peerConnection.current?.iceConnectionState)
			// console.log("Ice Gathering State: ", peerConnection.current?.iceGatheringState)
		}

		await peerConnection.current.setRemoteDescription(offer)
		const answer = await peerConnection.current.createAnswer()
		await peerConnection.current.setLocalDescription(answer)
	
		ws.current?.send(JSON.stringify({
			type: "answer",
			answer,
			to: from,
			from: peerName
		}))
	}

	const setupDC = (channel: RTCDataChannel) => {
		channel.binaryType = "arraybuffer"
		
		channel.onopen = () => {
			console.log("### DataChannel Open ...")
		}

		channel.onmessage = (event) => {
			if (typeof event.data === "string" && event.data.startsWith("EOF:")) {
				const incomingFileName = event.data.slice(4)
				console.log("EOF received for file:", incomingFileName, "chunks:", incomingChunksRef.current.length)
				
				if (incomingChunksRef.current.length > 0) {
					const blob = new Blob(incomingChunksRef.current)
					const fileUrl = URL.createObjectURL(blob)
					console.log("Created blob size:", blob.size, "bytes")

					setMessages(prev => [...prev, {
						type: "file",
						content: fileUrl,
						fileName: incomingFileName
					}])
					
					incomingChunksRef.current = []
				} else {
					console.log("No chunks received for file:", incomingFileName)
				}
			} else if (event.data instanceof ArrayBuffer) {
				incomingChunksRef.current.push(event.data)
				// if (incomingChunksRef.current.length % 10 === 0) {
				// 	console.log("Received chunks:", incomingChunksRef.current.length)
				// }
			} else {
				console.log("Received text message:", event.data)
				setMessages(prev => [...prev, {
					type: 'text',
					content: "from peer: " + event.data
				}])
			}
		}
	}

	const sendFile = () => {
		const fileInput = fileRef.current as HTMLInputElement | null
		const file = fileInput?.files?.[0]
		if (!file || !dataChannel.current || dataChannel.current.readyState !== "open") {
			console.log("Cannot send file - missing file or datachannel not ready")
			return
		}

		console.log("Starting file transfer: ", file.name, file.size, "byte")

		const chunkSize = 16 * 1024
		let offset = 0

		const reader = new FileReader()
		reader.onload = (e) => {
			const result = e.target?.result as ArrayBuffer
			if (result && dataChannel.current) {
				dataChannel.current.send(result)
				offset += result.byteLength

				if (offset < file.size) {
					readSlice(offset)
				} else {
					dataChannel.current.send("EOF:" + file.name)
					console.log("File transfer completed ...")

					setMessages(prev => [...prev, {
						type: "text",
						content: `Sent: ${file.name}`,
					}])
				}
			}
		}

		const readSlice = (o: number) => {
			const slice = file.slice(o, o+chunkSize)
			reader.readAsArrayBuffer(slice)
		}

		readSlice(0)
	}

	const sendMessage = () => {
		if (dataChannel.current && dataChannel.current.readyState === "open") {
			dataChannel.current.send(currentMsg)
			setMessages(prev => [...prev, {
				type: 'text',
				content: "Your message: "+currentMsg
			}])
		}
	}

	useEffect(() => {
		ws.current = new WebSocket("ws://localhost:3000")

		ws.current.onmessage = async (event) => {
			const data = JSON.parse(event.data)

			switch (data.type) {
				case "offer":
				await handleOffer(data.offer, data.from)
				break

				case "answer":
				await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer))
				break

				case "candidate":
				await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate))
				break
			}
		}
	}, [])
	
	return <div className="max-w-2xl mx-auto font-mono">
		{/* Username */}
		<input 
			value={username} 
			placeholder="Your username: " 
			className="px-4 py-2 border rounded-sm mt-4" 
			onChange={(e) => setUsername(e.target.value)}
		/>
		<button onClick={register} className="bg-black rounded-sm text-white px-5 py-2 ml-2">Register</button>

		<br />

		{/* PeerName */}
		<input 
			value={peerName} 
			placeholder="Enter peerName: " 
			className="px-4 py-2 border rounded-sm mt-4"
			onChange={(e) => setPeerName(e.target.value)}
		/>
		<button onClick={startCall} className="bg-black rounded-sm text-white px-5 py-2 ml-2">Connect</button>

		<br />

		<div className="min-h-0.5 w-full bg-black mt-4" />
		<div className="min-h-0.5 w-full bg-black mt-4" />
		<div className="min-h-0.5 w-full bg-black mt-4" />

		{/* file-selector */}
		<label htmlFor="file-upload" className="mt-4 inline-block border p-3 rounded-sm">
			<span className="opacity-25 hover:opacity-100">Choose File ...</span>
		</label>
		<input 
		 	id="file-upload"
			type="file" 
			ref={fileRef}
			className="hidden"
		/>
		<button onClick={sendFile} className="bg-black rounded-sm text-white px-5 py-2 ml-2">Send File</button>

		<br />

		{/* input-message */}
		<input  
			value={currentMsg}
		 	onChange={(e) => setCurrentMsg(e.target.value)}
			placeholder="Type Message ..."
			className="px-4 py-2 border rounded-sm mt-4"
		/>
		<button onClick={sendMessage} className="bg-black rounded-sm text-white px-5 py-2 ml-2">Send</button>


		<div className="min-h-0.5 w-full bg-black mt-4" />
		<div className="min-h-0.5 w-full bg-black mt-4" />

		<div>
		</div>
	</div>
}

export default Backup