import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Landing() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const goTo = () => { navigate("/lobby")}

  return <div className="min-h-screen w-full bg-white overflow-x-hidden">

    {/* NavBar */}
    <div className="relative z-50 flex pt-6 justify-between mx-10 sm:mx-auto sm:justify-center sm:w-8/12 md:w-1/2 lg:w-2/5">
      <h1 className="font-playfair text-xl tracking-wider pb-1.5 font-semibold">
        <span className="font-jetbrains font-semibold text-lg">Q</span>uickshare.
      </h1>

      <div className="w-5/12 hidden ml-5 lg:ml-16 sm:flex justify-between items-center font-jetbrains text-xs  text-slate-600 uppercase">
        <p>How It Works</p>
        <p>Demo</p>
        <p>Contact</p>
      </div>

      {/* toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="block sm:hidden uppercase text-sm cursor-pointer tracking-widest"
      >
        {isOpen ? "close" : "list"}
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 w-full bg-white border-b border-black shadow-lg sm:hidden flex flex-col items-center py-6 gap-4 text-xs uppercase font-jetbrains text-slate-600 tracking-wider"
        >
          <p onClick={() => setIsOpen(false)} className="cursor-pointer hover:font-bold">how it works</p>
          <p onClick={() => setIsOpen(false)} className="cursor-pointer hover:font-bold">demo</p>
          <p onClick={() => setIsOpen(false)} className="cursor-pointer hover:font-bold">contact</p>
        </div>
      )}
    </div>

    {/* Hero Section */}
    <div className="flex flex-col items-center justify-center mt-26">
      <h1 className="font-playfair font-bold text-center text-4xl w-11/12 sm:w-10/12 md:text-8xl">
        From phone to desk.
        <br />
        In seconds.
      </h1>

      <p className="pt-5 font-playfair tracking-widest text-center w-10/12 text-sm md:w-1/2 md:text-md ">
        quickshare lets you share you random PDFs, photos with your PC/laptop in seconds.
        <br />
        <br className="block sm:hidden"/>
        Stop mailing yourself! <span className="font-bold text-md sm:text-lg ">Use QuickShare!</span>
      </p>

      <div className="mt-15 flex gap-2 sm:gap-10">
        <p className="font-jetbrains text-md">
          No Account required.
          <br/>
          Just share and Move!
        </p>

        <button
          onClick={goTo}
          className="border border-black w-32 text-sm font-jetbrains rounded-sm bg-black text-white"
        >Get Started</button>
      </div>

      {/* How It Works */}
      <div className="w-full max-w-4xl mt-40 mx-auto px-6 mb-10">
        <div className="flex items-baseline justify-between mb-14">
          <h2 className="text-xs uppercase font-jetbrains tracking-[0.3em] text-slate-500">
            How It Works
          </h2>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
          {[
            {
              n: "01",
              title: "Join",
              copy: "Navigate to the lobby and join one of the predefined rooms.",
            },
            {
              n: "02",
              title: "Share",
              copy: "Open the same room on both devices and share a file or text.",
            },
            {
              n: "03",
              title: "Leave",
              copy: "Once the transfer's done, close the room and you're free to go.",
            },
          ].map((step) => (
            <div key={step.n} className="relative font-jetbrains mx-5 sm:mx-0">
              <div className="relative z-10 inline-flex items-center justify-center w-8 h-8 -ml-1 mb-4 bg-white text-xs rounded-full">
                {step.n}
              </div>
              <p className="uppercase text-sm tracking-wide font-semibold mb-1.5">
                {step.title}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed sm:max-w-[22ch]">
                {step.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>


  </div>

}

export default Landing
