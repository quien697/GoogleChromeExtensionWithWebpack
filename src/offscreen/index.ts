interface Message {
  action: string;
}

const handleMessage = async (message: Message) => {
  console.log(`Offscreen -> onMessage -> message = ${message}`);
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
}

chrome.runtime.onMessage.addListener(handleMessage);