import { useContext, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import MyContext from "../Context/Context"
import { useSocketContext } from "../Context/SocketContext"
import { useConnection } from "../hooks/webrtc"
import { toast } from "sonner"

function Lobby() {
    const context = useContext(MyContext)
    const location = useLocation()
    const navigate = useNavigate()

    if (!context) return

    const { userName, setUserName, setRoomName } = context
    const { registerUser, joinRoom, requestRoomInfo } = useSocketContext()
    const { roomInfo } = useConnection()

    const handleJoinRoom = (roomName: string) => {
        if (userName === "") {
            console.log("Register with username first...")
            toast("User Registration required!!!", {
                description: "You need to register your usernmae",
            })
            return
        }
        joinRoom(roomName)
        setRoomName(roomName)
        navigate(`/room/${roomName}`)
    }

    useEffect(() => {
        requestRoomInfo()
    }, [location.pathname])

    return (
        <div className="">
            <div className="flex flex-col items-center pt-7">
                <p className="font-stretch-condensed sm:text-xl md:text-2xl">
                    ... enter your <span className="font-semibold">UserName</span> you want to register with ...
                </p>

                <div className="mt-3 font-mono sm:text-lg md:text-xl">
                    <input 
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="enter your username..." 
                        className="border-2 rounded-bl-xl px-2 py-1.5 text-lg md:py-2 md:px-6 md:bg-white"
                    />

					{/* shows toaster, when user tries joining room without registering username */}
                    <button
                        className="border-2  rounded-tr-xl bg-black text-white font-semibold cursor-pointer hover:opacity-75 px-3 md:px-7 py-3.5 hover:scale-110 active:scale-90 transform transition-transform duration-200 ease-in-out"
                        onClick={() => registerUser(userName)}
                    >Register</button>
                </div>
            </div>

            {/* Separator */}
            <hr className="border mt-10 border-slate-400"/>

            {/* Rooms Section */}
            <p className="text-4xl font-semibold font-stretch-condensed text-center underline">Rooms</p>

            <div className="mx-5 mt-5 flex gap-3 flex-wrap">
                
                {/* Room Card */}
                {roomInfo.map((cr) => (
                    <div className="border-2 w-full sm:w-1/4 h-40 min-w-52  rounded-md" key={cr.name}>
                        {/* button */}
                        <div className="flex p-2 justify-end gap-3 items-center">
                            <p> 
                                <span className="text-blue-700 font-semibold">{cr.size }/2 </span>
                                <span className="text-sm ">members</span>
                            </p>
                            <button 
                                onClick={() => handleJoinRoom(cr.name)}
								disabled={cr.size >= 2}
                                className={`border-2 rounded-md px-4 py-1.5 text-sm font-bold bg-black text-white cursor-pointer hover:opacity-75 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-90 transform transition-transform duration-200 ease-in-out }`}
                            >{ cr.size >= 2 ? "Full" : "Join"}</button> 
                        </div>

                        {/* names */}
                        <p className="text-4xl font-stretch-condensed font-semibold text-center pt-5">{cr.name}</p>
                    </div>
                ))}

            </div>
        </div>
    )
}


export default Lobby
