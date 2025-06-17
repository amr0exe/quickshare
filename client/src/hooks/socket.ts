import { useRef, useEffect} from "react"


export function useSocket(url: string) {
    const ws = useRef<WebSocket|null>(null)
    const fileRef = useRef<HTMLInputElement|null>(null)

    const registerUser = (userName: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN && userName) {
            ws.current.send(JSON.stringify({
                type: "register",
                name: userName
            }))
        }
        console.log(`User Registered with username: ${userName}`)
    }

    const joinRoom = (roomName: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN && roomName) {
            ws.current.send(JSON.stringify({
                type: "join_room",
                room_name: roomName
            }))
        } 
    }

    const requestRoomInfo = () => {
        ws.current?.send(JSON.stringify({
            type: "rooms_list"
        }))
    }

    useEffect(() => {
        if(!ws.current) {
            ws.current = new WebSocket(url)
        }

        ws.current.onopen = () => {
            console.log("WebSocket connected!!!")
            requestRoomInfo()
        }

        // moved to webrtc.ts

        ws.current.onclose = () => {
            console.log("WebSocket disconnected!!!")
        }

    }, [url])

    return { ws, fileRef, registerUser, joinRoom, requestRoomInfo }
}