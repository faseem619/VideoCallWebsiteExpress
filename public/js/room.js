const socket = io("/");
const container = document.querySelector(".videos-container");
const otherUsers = {};

const addVideoStream = (video, stream) => {
  video.muted = true;
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  container.append(video);
};

const connectToNewUser = (id, stream) => {
  const videoElement = document.createElement("video");
  const call = peer.call(id, stream);
  call.on("stream", (theirStream) => {
    addVideoStream(videoElement, theirStream);
  });
  call.on("close", () => {
    videoElement.remove();
  });
  otherUsers[id] = call;
};

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    const videoElement = document.createElement("video");
    addVideoStream(videoElement, stream);
    // when we are the one joining
    peer.on("call", (call) => {
      // call is the media connection( a wrapper of webrtc media stream)
      call.answer(stream);
      const videoElement = document.createElement("video");
      call.on("stream", (theirStream) => {
        addVideoStream(videoElement, theirStream);
      });
      call.on("close", () => {
        videoElement.remove();
      });
      otherUsers[call.peer] = call;
    });
    // when someone else joins the the room
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  })
  .catch((error) => console.log(error));

// webrtc section
const peer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});
peer.on("connection", (conn) => {
  conn.on(close);
});

socket.on("user-disconnected", (id) => {
  console.log("someone left");
  if (otherUsers[id]) {
    otherUsers[id].close();
  }
});
