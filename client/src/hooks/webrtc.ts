import { useRef, useContext, useState, useEffect } from "react"
import MyContext from "../Context/Context"
import { useSocketContext } from "../Context/SocketContext"

interface Room {
    name: string;
    size: number;
}

export const useConnection = () => {

    // webRTC configs/setup
    const peerConnection = useRef<RTCPeerConnection|null>(null)
    const dataChannel = useRef<RTCDataChannel|null>(null)
    const incomingChunksRef = useRef<ArrayBuffer[]>([])

	const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302"}] }

    // other miscellaneous
	const [currentMsg, setCurrentMsg] = useState<string>("") 
	const [messages, setMessages] = useState<Array<{type: 'text' | 'file', content: string, fileName?: string}>>([])
	const [roomInfo, setRoomInfo] = useState<Room[]>([])

	const [isSending, setIsSending] = useState(false)
	const [progress, setProgress] = useState(0)

    const context = useContext(MyContext)
    const { ws, fileRef } = useSocketContext()
    if (!context) {
		return {
			peerConnection,
			handleOffer: async () => {},
			startCall: async () => {},
			sendFile: async () => {},
			sendMessage: async () => {},
			currentMsg: "",
			setCurrentMsg,
			messages: [],
			roomInfo: [],
			leaveRoom: () => {},
		}
	}
    const { userName, roomName } = context

	useEffect(() => {
		if (!ws.current) return

		const handleMessage = async (event: MessageEvent) => {
			const data = JSON.parse(event.data)

			switch (data.type) {
				case "offer":
					handleOffer(data.offer, data.from, data.roomName)
					break
				
				case "answer":
					await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer))
					break

				case "candidate":
					await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate))
					break

                case "room_full":
					startCall(data.from)
                    console.log("now start the connection... ", data.from)
                    break

                case "room_info":
                    setRoomInfo(data.rooms)
                    break

                default:
                    console.log(`received wrong data type from server ${data.type}`)
			}
		}

		ws.current.addEventListener('message', handleMessage)

		return () => {
			ws.current?.removeEventListener('message', handleMessage)
		}
	}, [userName, roomName])


    // webRTC connection-setup functions
    const startCall = async (peer: string) => {
        peerConnection.current = new RTCPeerConnection(config)

        dataChannel.current = peerConnection.current.createDataChannel("mychannel", { ordered: true })
        setupDC(dataChannel.current)

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
               ws.current?.send(JSON.stringify({
                    type: "candidate",
                    candidate: event.candidate,
                    to: peer,
					from: userName,
					roomName
               })) 
            }
        }

        const offer = await peerConnection.current.createOffer()
        await peerConnection.current.setLocalDescription(offer)

        ws.current?.send(JSON.stringify({
            type: "offer",
            offer,
            to: peer,
            from: userName,
			roomName
        }))
    }

    const handleOffer = async (offer: RTCSessionDescription, from: string, room_name: string) => {
        peerConnection.current = new RTCPeerConnection(config)

        peerConnection.current.ondatachannel = (event) => {
			console.log("Data channel received")
            dataChannel.current = event.channel
            setupDC(dataChannel.current)
        }

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                ws.current?.send(JSON.stringify({
                    type: "candidate",
                    candidate: event.candidate,
                    to: from,
					from: userName,
					roomName: room_name
                }))
            }
        }

        await peerConnection.current.setRemoteDescription(offer)
        const answer = await peerConnection.current.createAnswer()
        await peerConnection.current.setLocalDescription(answer)

        ws.current?.send(JSON.stringify({
            type: "answer",
            answer,
            to: from,
            from: userName,
			roomName: room_name
        }))
    }

	const setupDC = (channel: RTCDataChannel) => {
		channel.binaryType = "arraybuffer"
		
		channel.onopen = () => {
			console.log("### DataChannel Open ...")
		}

		channel.onclose = () => {
			console.log("Datachannel closed")
		}

		channel.onerror = () => {
			console.log("datachannel error")
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
			console.log("Cannot send file - missing file or datachannel not ready", dataChannel.current?.readyState)
			return
		}

		// START LOADER
		setIsSending(true)
		setProgress(0)

		const inMB = Math.round(file.size/(1024*1024))
		console.log("Starting file transfer: ", file.name, file.size, "byte", `${inMB} MB`)

		const chunkSize = 256 * 1024 // 256KB per buffer
		if(dataChannel.current) dataChannel.current.bufferedAmountLowThreshold = chunkSize;
		let offset = 0
		let eofSent = false

		const reader = new FileReader()

		const readNextChunk = () => {
			if (offset >= file.size && !eofSent) {
				eofSent=true
				setProgress(100)

				setTimeout(() => {
					if (dataChannel.current?.readyState === "open") {
						dataChannel.current.send("EOF:" + file.name)
						console.log("File Transfer compelted...")
						setMessages(prev => [...prev, {
							type: "text",
							content: `Sent: ${file.name}`
						}])
					}

					setTimeout(() => {
						setIsSending(false)
						setProgress(0)
					}, 500)
				}, 100)
				return
			}

			// stop reading when its done
			if (offset >= file.size) {
				return
			}

			if (dataChannel.current && dataChannel.current.bufferedAmount > dataChannel.current.bufferedAmountLowThreshold) {
				return
			}

			// UPDATE PROGRESS
			const currentProgress = Math.min(Math.round((offset/file.size) * 100), 100)
			setProgress(currentProgress)

			const slice = file.slice(offset, offset+chunkSize)
			reader.readAsArrayBuffer(slice)
			offset += chunkSize
		}
		reader.onload = (e) => {
			const chunk = e.target?.result as ArrayBuffer
			if (!dataChannel.current || !chunk) return

			try {
				dataChannel.current.send(chunk)
			} catch (error) {
				console.error("Error sending data channel message:", error)
				// STOP LOADER
				setIsSending(false)
				setProgress(0)
				return
			}

			readNextChunk()
		}

		reader.onerror = (e) => {
			console.error("FileReader error: ", e)
			// STOP LOADER
			setIsSending(false)
			setProgress(0)
			return
		}

		if(dataChannel.current) {
			dataChannel.current.onbufferedamountlow = () => {
				// when buffer drains
				readNextChunk()
			}
		}

		readNextChunk()
	}

	const sendMessage = () => {
		// no empty messages
		if (!currentMsg.trim()) return
		console.log("Attempting to send message. Data Channe state", dataChannel.current?.readyState)

		if (dataChannel.current && dataChannel.current.readyState === "open") {
			dataChannel.current.send(currentMsg)
			setMessages(prev => [...prev, {
				type: 'text',
				content: "Your message: "+currentMsg
			}])
			setCurrentMsg("")
		} else {
			console.log("Data channel not ready: ", {
				exists: !!dataChannel.current,
				state: dataChannel.current?.readyState
			})
		}
	}

	const leaveRoom = (roomName: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN && roomName) {
            ws.current.send(JSON.stringify({
                type: "leave_room",
                room_name: roomName
            }))
        } 
		
		if (dataChannel.current) {
			dataChannel.current.close()
			dataChannel.current = null
		}

		if (peerConnection.current) {
			peerConnection.current.close()
		}

		incomingChunksRef.current = []
	}

    return { peerConnection, handleOffer, startCall, sendFile, sendMessage, currentMsg, setCurrentMsg, messages, roomInfo, leaveRoom, isSending, progress }
}
