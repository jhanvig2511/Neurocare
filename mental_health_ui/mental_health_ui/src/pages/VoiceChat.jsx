import React, { useRef, useState } from "react";
import axios from "axios";
import "../styles/VoiceChat.css";

function VoiceChat() {
  const [botReply, setBotReply] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [userText, setUserText] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);

  // =========================
  // WAVEFORM ANIMATION
  // =========================
  const startWaveAnimation = async () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const audioContext = new window.AudioContext();
    const analyser = audioContext.createAnalyser();

    const source = audioContext.createMediaStreamSource(stream);

    source.connect(analyser);

    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#eef2ff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 4;
      ctx.strokeStyle = "#4f46e5";

      ctx.beginPath();

      let sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        let y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }

    draw();
  };

  // =========================
  // START RECORDING
  // =========================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      mediaRecorderRef.current = new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();

      startWaveAnimation();
    } catch (error) {
      console.log(error);
      alert("Microphone permission denied!");
    }
  };

  // =========================
  // STOP RECORDING
  // =========================
  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const formData = new FormData();

        formData.append("file", audioBlob, "recording.webm");

        const response = await axios.post(
          "http://localhost:8000/voicechat",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setBotReply(response.data.reply);
        setAudioUrl(response.data.audio_url);
        setUserText(response.data.user_text);

        const audio = new Audio(response.data.audio_url);
        audio.play();
      } catch (error) {
        console.log(error);
        alert("Backend error!");
      }
    };
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="voice-page">

      <div className="voice-header">
        <h1>🎤 Voice Chat with NeuroCare AI</h1>
        <p>Speak into the microphone and get AI-powered replies</p>
      </div>

      <div className="wave-container">
        <canvas
          ref={canvasRef}
          width={850}
          height={220}
          className="waveform"
        />
      </div>

      <div className="controls">

        <button className="start-btn" onClick={startRecording}>
          🎙 Start Recording
        </button>

        <button className="stop-btn" onClick={stopRecording}>
          ⏹ Stop
        </button>

      </div>

      <div className="chat-box">

        <h2>🧑 You said:</h2>
        <p className="chat-text">{userText}</p>

        <h2>🤖 Bot says:</h2>
        <p className="chat-text">{botReply}</p>

        {audioUrl && (
          <audio controls autoPlay>
            <source src={audioUrl} type="audio/mpeg" />
          </audio>
        )}

      </div>

    </div>
  );
}

export default VoiceChat;