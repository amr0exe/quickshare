import { useState, createContext, type ReactNode } from "react";

interface MyContextType {
    userName: string;
    setUserName: (userName: string) => void;
    roomName: string;
    setRoomName: (roomName: string) => void;
}

interface MyContextProviderProps {
    children: ReactNode;
}

const MyContext = createContext<MyContextType | undefined>(undefined)

export const MyContextProvider = ({ children }: MyContextProviderProps) => {
    const [userName, setUserName] = useState<string>("")
    const [roomName, setRoomName] = useState<string>("")

    const value: MyContextType = { userName, setUserName, roomName, setRoomName }

    return <MyContext.Provider value={value}>
        {children}
    </MyContext.Provider>
}

export default MyContext