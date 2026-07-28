import { useNavigate } from "react-router-dom"

function Landing() {
  const navigate = useNavigate()
  const goTo = () => { navigate("/lobby")}

  return <div className="h-full bg-slate-200">
    <div className="font-['Playfair_Display'] flex justify-center gap-10 text-xl pt-8">
      <a href="#about">about</a>
      <a href="#demo">demo</a>
      <a href="#work">work</a>
    </div>

    <div className="w-2xl mx-auto flex flex-col items-end py-28">
      <div className="font-['Playfair_Display']">
        <p className="text-8xl text-center tracking-wider">Quickshare</p>
        <p className="text-2xl pt-6">" makes your random file - transfers easier and effortless "</p>
      </div>

      <button
        onClick={goTo}
        className="font-['Playfair_Display'] text-xl bg-black text-slate-200 p-2 px-6 mt-6  rounded-lg"
      >Get Started</button>
    </div>

    <div className="w-3xl mt-6 mx-auto font-['PLayfair_Display']" id="about">
      <h1 className="text-3xl">About</h1>
      <p className="tracking-wider mt-2">Quickshare was built with intent of solving problem of doing random transfers of your files (i.e. pdfs, images, .docs, ppts), links through mails. We provide platform to share files from start to finish withing few clicks.</p>
    </div>

    <div className="w-3xl mt-6 mx-auto font-['PLayfair_Display']" id="work">
      <h1 className="text-3xl">How it Works?</h1>
      <p className="tracking-wider mt-2">After pressing Get Started on landing page, user is faced with lobby page with rooms register, join button. Then:</p>
      <ul className="list-disc pl-10 mt-2 space-y-1">
        <li>First, register name</li>
        <li>Join Any Room</li>
        <li>Share and Leave !!</li>
      </ul>
    </div>

    <div className="w-3xl mt-6 mx-auto font-['PLayfair_Display']" id="demo">
      <h1 className="text-3xl">Demo</h1>
      <video
        src="https://github.com/user-attachments/assets/8894d4c0-e2a5-4800-8055-9a83a2c4dfb7"
        className="w-full mt-4 rounded-lg"
        controls
        preload="metadata"
      />
    </div>
  </div>

}

export default Landing
