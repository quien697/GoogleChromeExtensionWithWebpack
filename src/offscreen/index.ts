interface Message {
  target: string;
  type: string;
  action?: string;
}

const handleMessage = async (message: Message) => {
  console.log("Offscreen -> onMessage");
  // Extensions may have an number of other reasons to send messages, so you
  // should filter out any that are not meant for the offscreen document.
  if (message.target !== "offscreen" || (!message.type)) {
    return false
  }

  switch (message.type) {
    case "playAudio":
      console.log("Offscreen -> onMessage -> playAudio");
      const audio = document.getElementById("audio") as HTMLAudioElement | null;
      if (!audio) {
        return;
      }
      switch (message.action) {
        case "play":
          audio.play();
          break;
        case "pause":
          audio.pause();
          break;
      }
      break;
  }
  return true;
}

chrome.runtime.onMessage.addListener(handleMessage);