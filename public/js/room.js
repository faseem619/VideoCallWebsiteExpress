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
  host: "peerjs-server-faseem.herokuapp.com",
  port: 443,
  path: "/myapp",
  config: {
    iceServers: [
      { url: "stun:stun01.sipphone.com" },
      { url: "stun:stun.ekiga.net" },
      { url: "stun:stun.fwdnet.net" },
      { url: "stun:stun.ideasip.com" },
      { url: "stun:stun.iptel.org" },
      { url: "stun:stun.rixtelecom.se" },
      { url: "stun:stun.schlund.de" },
      { url: "stun:stun.l.google.com:19302" },
      { url: "stun:stun1.l.google.com:19302" },
      { url: "stun:stun2.l.google.com:19302" },
      { url: "stun:stun3.l.google.com:19302" },
      { url: "stun:stun4.l.google.com:19302" },
      { url: "stun:stunserver.org" },
      { url: "stun:stun.softjoys.com" },
      { url: "stun:stun.voiparound.com" },
      { url: "stun:stun.voipbuster.com" },
      { url: "stun:stun.voipstunt.com" },
      { url: "stun:stun.voxgratia.org" },
      { url: "stun:stun.xten.com" },
      {
        url: "turn:numb.viagenie.ca",
        credential: "muazkh",
        username: "webrtc@live.com",
      },
      {
        url: "turn:192.158.29.39:3478?transport=udp",
        credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        username: "28224511:1379330808",
      },
      {
        url: "turn:192.158.29.39:3478?transport=tcp",
        credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        username: "28224511:1379330808",
      },
    ],
  },
});

peer.on("open", (id) => {
  console.log("connected");
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-disconnected", (id) => {
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
