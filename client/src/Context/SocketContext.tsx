import { useContext, createContext } from "react";
import { useSocket } from "../hooks/socket";

export const SocketContext = createContext<ReturnType<typeof useSocket> | null>(null)

export const useSocketContext = () => {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error("useSocketContext must be inside a Socket Provider")
    return ctx
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const url = import.meta.env.VITE_WS_URL
    const socket = useSocket(url)

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}