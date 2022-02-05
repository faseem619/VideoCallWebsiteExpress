const socket = io("/");
const myVideo = document.querySelector(".my-video");
myVideo.muted = true;

socket.emit("join-room", ROOM_ID, 10);

socket.on("user-connected", (userId) => {
  console.log("user connected", userId);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
};

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    addVideoStream(myVideo, stream);
  })
  .catch((error) => console.log(error));
