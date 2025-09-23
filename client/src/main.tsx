import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MyContextProvider } from './Context/Context.tsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<MyContextProvider>
			<App />
			<Toaster />
		</MyContextProvider>
	</StrictMode>,
)
