import { useRef, useState } from "react";

import { motion } from "framer-motion";

import {
  Mic,
  Square,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AppShell from "../layouts/AppShell";

import { Button } from "@/components/ui/button";

import { uploadScreeningAudio } from "../services/screening.service";

const STATES = {
  IDLE: "idle",
  RECORDING: "recording",
  PROCESSING: "processing",
  COMPLETE: "complete",
};

function VoiceScreen() {
  const navigate = useNavigate();

  const mediaRecorderRef =
    useRef(null);

  const audioChunksRef = useRef([]);

  const [status, setStatus] =
    useState(STATES.IDLE);

  const [result, setResult] =
    useState(null);

  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current =
        mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable =
        (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(
              event.data
            );
          }
        };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(
            audioChunksRef.current,
            {
              type: "audio/webm",
            }
          );

          const response =
            await uploadScreeningAudio(
              audioBlob
            );

          setResult(response);

          setStatus(STATES.COMPLETE);

        } catch (error) {
          console.error(error);

          alert(
            "Failed to process audio"
          );

          setStatus(STATES.IDLE);
        }
      };

      mediaRecorder.start();

      setStatus(STATES.RECORDING);

    } catch (error) {
      console.error(error);

      alert(
        "Microphone access denied"
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();

    setStatus(STATES.PROCESSING);
  };

  const resetFlow = () => {
    setStatus(STATES.IDLE);

    setResult(null);
  };

  return (
    <AppShell>

      <div className="min-h-screen flex flex-col items-center justify-center px-6">

        {/* TOP */}
        <div className="w-full max-w-2xl flex items-center justify-between">

          <button
            onClick={() => navigate("/")}
            className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-right">
            <h2 className="font-semibold">
              Voice Screening
            </h2>

            <p className="text-sm text-neutral-500">
              AI-assisted analysis
            </p>
          </div>

        </div>

        {/* MAIN */}
        <div className="flex flex-col items-center justify-center flex-1">

          {/* MIC */}
          <div className="relative flex items-center justify-center">

            {status === STATES.RECORDING && (
              <motion.div
                animate={{
                  scale: [1, 1.3],
                  opacity: [0.4, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="absolute w-72 h-72 rounded-full bg-[#ea816c]"
              />
            )}

            <motion.button
              whileTap={{
                scale: 0.95,
              }}
              onClick={() => {
                if (
                  status === STATES.IDLE
                ) {
                  startRecording();

                } else if (
                  status ===
                  STATES.RECORDING
                ) {
                  stopRecording();
                }
              }}
              className={`
                relative z-10
                w-40 h-40 rounded-full
                flex items-center justify-center
                shadow-2xl
                transition-all duration-300
                ${
                  status === STATES.RECORDING
                    ? "bg-[#df6b57]"
                    : "bg-gradient-to-br from-[#ea816c] to-[#df6b57]"
                }
              `}
            >

              {status === STATES.RECORDING ? (
                <Square
                  size={42}
                  className="text-white"
                />
              ) : status === STATES.PROCESSING ? (
                <Sparkles
                  size={42}
                  className="text-white"
                />
              ) : (
                <Mic
                  size={42}
                  className="text-white"
                />
              )}

            </motion.button>

          </div>

          {/* TEXT */}
          <div className="mt-16 text-center max-w-lg">

            {status === STATES.IDLE && (
              <>
                <h1 className="text-5xl font-bold">
                  Start Recording
                </h1>

                <p className="mt-4 text-neutral-500 leading-relaxed">
                  Tap the microphone and
                  describe patient symptoms.
                </p>
              </>
            )}

            {status === STATES.RECORDING && (
              <>
                <h1 className="text-5xl font-bold text-[#df6b57]">
                  Listening...
                </h1>

                <p className="mt-4 text-neutral-500">
                  Tap again to stop recording
                </p>
              </>
            )}

            {status === STATES.PROCESSING && (
              <>
                <h1 className="text-5xl font-bold">
                  AI Analyzing
                </h1>

                <p className="mt-4 text-neutral-500">
                  Processing patient audio.
                </p>
              </>
            )}

            {status === STATES.COMPLETE && (
              <>
                <h1 className="text-5xl font-bold text-[#2d9b7f]">
                  Complete
                </h1>

                <p className="mt-4 text-neutral-500">
                  AI screening completed successfully.
                </p>

                <div className="flex justify-center gap-4 mt-10">

                  <Button
                    onClick={() =>
                      navigate("/result", {
                        state: result,
                      })
                    }
                    className="rounded-2xl"
                  >
                    View Result
                  </Button>

                  <Button
                    variant="outline"
                    onClick={resetFlow}
                    className="rounded-2xl"
                  >
                    Record Again
                  </Button>

                </div>
              </>
            )}

          </div>

        </div>

      </div>

    </AppShell>
  );
}

export default VoiceScreen;