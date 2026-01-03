import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { useSocketContext } from "../Context/SocketContext"
import { useConnection } from "../hooks/webrtc"

function Room() {
    const { name } = useParams()
    const [fname, setFname] = useState("choose file...")

    const { fileRef } = useSocketContext()
    const { currentMsg, setCurrentMsg, messages, sendFile, sendMessage, leaveRoom, isSending, progress } = useConnection()

	const navigate = useNavigate()

    const truncateFileName = (name: string, maxLength = 15) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + "...";
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFname(file ? truncateFileName(file.name, 15) : "choose file...");
    };

	const handleLeaveRoom= () => { 
		leaveRoom(name!) // bang, strictly saying its non-null
		navigate("/lobby")
	}

    return <div className="max-w-2xl h-screen mx-auto border-x-2 border-dashed">
		<div className="absolute top-0 right-0 p-2">
			<button
				onClick={handleLeaveRoom} 
				className="bg-red-600 text-white font-semibold font-stretch-condensed rounded-sm px-4 py-1.5 cursor-pointer hover:scale-110 active:scale-90 transform transition-transform duration-200 ease-in-out"
			>
				Leave
			</button>
		</div>
        <p className="text-4xl font-stretch-condensed font-semibold text-center p-5">RoomName: <span className="font-normal">{name}</span></p>

        <div className="h-2/3 p-5 overflow-y-scroll">
			{messages.map((msg, idx) => (
				<div key={idx} className="mb-2">
					{msg.type === 'text' ? (
						<p>{msg.content}</p>
					): (
						<div className="p-2 bg-blue-100 rounded">
							<a 
								href={msg.content}
								download={msg.fileName}
								className="text-blue-600 hover:underline"
							>
								Download: {msg.fileName}
							</a>
						</div>
					)}
				</div>
			))}			
        </div>

        <hr />

        {/* Buttons */}
        <div className="flex gap-3 justify-center mt-5">
            <input 
                value={currentMsg}
                onChange={(e) => setCurrentMsg(e.target.value)}
                className="border-2 py-1 px-3 rounded-sm font-stretch-condensed" 
                placeholder="enter your message ..."
            />
            <button 
                onClick={sendMessage}
                className="bg-black text-white font-semibold font-stretch-condensed text-base rounded-sm px-4 py-1.5 cursor-pointer hover:scale-110 active:scale-90 transform transition-transform duration-200 ease-in-out"
            >Send Msg</button>
        </div>

        {/* LOADER */}
        {isSending && (
            <div className="fixed top-0 left-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="w-11/12 rounded-lg bg-white p-6 text-center shadwo-xl md:w-1/2 lg:w-1/3 font-semibold font-stretch-condensed ">
                    <h3 className="text-xl">Sending File</h3>
                    <p className="mb-4 text-gray-500 text-base font-normal">Please wait while the transfer is in progress.</p>
                    <br />

                    <progress max="100" value={`${progress}`} className="h-2"></progress>
                    <p className="text-base">{progress}%</p>
                </div>
            </div>
        )}

        <div className="flex gap-3 justify-center mt-5">
            <label htmlFor="file-upload" className="border-2 py-1 px-3 rounded-sm truncate inline-block">
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{fname}</span>
            </label>

            <input 
                type="file" 
                ref={fileRef}
                id="file-upload" 
                className="hidden"
                onChange={handleFile}
            />

            <button 
                onClick={sendFile}
                className="bg-black text-white font-semibold font-stretch-condensed rounded-sm px-4 py-1.5 cursor-pointer hover:scale-110 active:scale-90 transform transition-transform duration-200 ease-in-out"
            >Send File</button>
        </div>
    </div>
}

export default Room
