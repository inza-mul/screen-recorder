//globals
let mediaRecorder;
let recordedChunks = [];

//main elements
const videoElement = document.getElementById('video');
const startBtn = document.getElementById('start_btn');
const stopBtn = document.getElementById('stop_btn');
const chooseBtn = document.getElementById('choose_btn');

startBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state === 'inactive') {
    startBtn.innerText = 'Recording';
    startBtn.classList.add('is-danger');
    //
    mediaRecorder.start(200);
  }
});
stopBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    startBtn.innerText = 'Start';
    startBtn.classList.remove('is-danger');
    //
    mediaRecorder.stop();
  }
});
chooseBtn.addEventListener('click', setVideoStream);
window.api.onReceiveId(handleMedia);

//getting video sources with ipc
function setVideoStream() {
  const types = ['window', 'screen'];
  window.api.setMediaStream(types);
}

//handle media with specific window id
async function handleMedia(source) {
  const { id, name } = source;
  chooseBtn.innerText = name;
  chooseBtn.classList.add('is-text');

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: id,
        minWidth: 1280,
        maxWidth: 1280,
        minHeight: 720,
        maxHeight: 720,
      },
    },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoElement.srcObject = stream;
  videoElement.play();

  const recordingOptions = {
    mimeType: 'video/webm; codecs=vp9',
  };
  mediaRecorder = new MediaRecorder(stream, recordingOptions);
  mediaRecorder.ondataavailable = handleRecordData;
  mediaRecorder.onstart = () => (chooseBtn.style.pointerEvents = 'none');
  mediaRecorder.onstop = handleRecordStop;
}

//handling recording data
function handleRecordData(e) {
  if (e.data.size > 0) {
    recordedChunks.push(e.data);
  }
}
//handling recording data on stop recording
// const {Buffer} = require('buffer')
async function handleRecordStop() {
  chooseBtn.style.pointerEvents = 'auto';
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9',
  });
  const filePath = await window.api.getSavePath({
    defaultPath: `vid-${Date.now()}.webm`,
  });
  window.api.saveFile(filePath, blob);

  recordedChunks = [];
}
