const socket = io("/");
const container = document.querySelector(".videos-container");
const otherUsers = {};
let userStream;

const addVideoStream = (video, stream) => {
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
    userStream = stream;
    const videoElement = document.createElement("video");
    videoElement.muted = true;
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
      console.log("someone else connected");
      connectToNewUser(userId, stream);
    });
  })
  .catch((error) => console.log(error));

// webrtc section
const peer = new Peer(undefined, {
  host: "/",
  port: 9000,
  path: "/myapp",
  proxied: true,
});

peer.on("open", (id) => {
  console.log("connected");
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-disconnected", (id) => {
  console.log("someone left");
  if (otherUsers[id]) {
    otherUsers[id].close();
  }
});

// client side functions

const muteUnmute = (element) => {
  userStream.getAudioTracks()[0].enabled =
    !userStream.getAudioTracks()[0].enabled;
  element.classList.toggle("button-selected");
};
const toggleVideo = (element) => {
  userStream.getVideoTracks()[0].enabled =
    !userStream.getVideoTracks()[0].enabled;
  element.classList.toggle("button-selected");
};
const leaveMeeting = () => {
  window.location.href = `${window.origin}/`;
};
const copyToClipBoard = () => navigator.clipboard.writeText(ROOM_ID);
