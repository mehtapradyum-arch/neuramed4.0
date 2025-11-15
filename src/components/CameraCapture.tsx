"use client";
import { useState, useRef, useEffect } from "react";

export default function CameraCapture({ onCaptured }: { onCaptured: (blob: Blob) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (e) {
        console.error(e);
      }
    })();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const capture = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => blob && onCaptured(blob!), "image/jpeg", 0.8);
  };

  return (
    <div className="space-y-2">
      <video ref={videoRef} autoPlay playsInline className="rounded-lg w-full" />
      <button onClick={capture} className="w-full py-3 rounded-xl bg-black text-white">Capture</button>
    </div>
  );
}
