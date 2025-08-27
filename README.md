<h1>
<p align="center">
  <img src="https://github.com/user-attachments/assets/ef14e71d-4fa5-46fd-ae84-a87031163c33" alt="Logo" width="128">
  <br>QuickShare
</h1>
  <p align="center">
    <i>... makes tranferring random text-snippets/files easier as it gets ...</i>
    <br />
  </p>
</p>


## QuickShare

**QuickShare** is a lightweight, p2p files and text sharing tool between your PC/Laptop and phone, perfect for quick transfers imitating airdrop. It's particularly suitable for tranfer of small text snippets, PDFs where there ain't much friction in process.

##  Features

-  **Peer-to-Peer Transfer (WebRTC)**: Transfers files and messages directly using WebRTC, favoring local LAN connections.
-  **No Cloud, No Storage**: Data is sent directly between devices — nothing is stored on any server.
-  **Cross-Platform**: Works seamlessly between desktop and mobile browsers.
-  **Text + File Support**: Send plain messages or files (e.g., PDFs, images).
-  **Room-Based Pairing**: Join a room with a name and start transferring instantly.

---

## Demo
<video src="https://github.com/user-attachments/assets/d17d0352-19de-4bd7-a1ac-156877b10bc8" width="600" autoplay></video>

----

## Start Locally:

- Clone the Repository

```
git clone https://github.com/amr0exe/quickshare.git
```

- Install Dependencies
```
cd client && pnpm install
cd ../signaling-server && pnpm install
```

- Run the app
```
[on client]
pnpm run dev

[on signalling-server]
node app.js
```
- visit http://localhost:5173
