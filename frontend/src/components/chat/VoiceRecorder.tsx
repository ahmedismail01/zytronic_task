import {
  CheckIcon,
  MicrophoneIcon,
  StopIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useRef } from "react";

export default function VoiceRecorder({
  handleSubmit,
}: {
  handleSubmit: (blob: Blob) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [blob, setBlob] = useState<Blob | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      chunks.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      chunks.current = [];
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setBlob(blob);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex items-center justify-center relative">
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? (
          <StopIcon className="h-6 w-6 text-red-500" />
        ) : (
          <MicrophoneIcon className="h-6 w-6 text-gray-500" />
        )}
      </button>

      {audioUrl && (
        <div className="absolute bottom-15 right-0 flex bg-white p-2 rounded-md gap-2 border border-gray-400">
          <audio controls src={audioUrl} className="  " />
          <button onClick={() => setAudioUrl(null)}>
            <XMarkIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
          </button>
          <button
            onClick={() => {
              handleSubmit(blob!);
              setAudioUrl(null);
            }}
          >
            <CheckIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
          </button>
        </div>
      )}
    </div>
  );
}
