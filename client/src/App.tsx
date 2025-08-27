import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from "./pages/Landing"
import Lobby from "./pages/Lobby"
import Room from "./pages/Room"
import { SocketProvider } from "./Context/SocketContext"

function App() {
	return <div>

		<SocketProvider>
			<BrowserRouter>
			<Routes>
					<Route path="/" element={ <Landing /> } />
					<Route path="/lobby" element={ <Lobby /> } />
					<Route path="/room/:name" element={ <Room /> } />
				</Routes>
			</BrowserRouter>
		</SocketProvider>
	</div>
}

export default App