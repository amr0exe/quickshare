import { useNavigate } from "react-router-dom"

function Landing() {
    const navigate = useNavigate()
    const goTo = () => { navigate("/lobby")}

    return <div className="h-screen font-stretch-condensed flex justify-center items-center">
        <div className="mx-4 -mt-14">
            <p className="text-6xl font-bold md:text-8xl">QuickShare</p>

            <p className="text-xl mt-8">"Platform for quick and efficient file/text sharing between your PC/Laptop and Phone"</p>

            <button 
                className="text-white bg-black font-semibold px-7 py-3 rounded-lg mt-3 cursor-pointer hover:opacity-60"
                onClick={goTo}
            >Get Started</button>
        </div>
    </div>
}

export default Landing