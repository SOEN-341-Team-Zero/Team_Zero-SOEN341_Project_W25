import React from "react";

interface AudioPlayerProps {
  audioURL: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioURL }) => {
  return (
    <audio controls>
      <source src={audioURL} type="audio/webm" />
      <track kind="captions" srcLang="en" label="English captions" />
      Your browser does not support the audio element.
    </audio>
  );
};

export default AudioPlayer;
