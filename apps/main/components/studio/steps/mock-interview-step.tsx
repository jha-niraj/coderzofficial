"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Play, Square, Clock, Trophy } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import type { StudioStep, MockInterviewMetadata } from "@/types/studios";

interface MockInterviewStepProps {
  step: StudioStep;
}

export function MockInterviewStep({ step }: MockInterviewStepProps) {
  const metadata = (step.metadata || {}) as Partial<MockInterviewMetadata>;
  const [isStarted, setIsStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200 dark:border-cyan-800">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-cyan-500 flex items-center justify-center">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Mock Interview
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {metadata.topic || "Technical Interview"} • {metadata.durationMinutes || 10} minutes
              </p>
            </div>
          </div>
          {metadata.difficulty && (
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-cyan-100 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 capitalize">
              {metadata.difficulty}
            </span>
          )}
        </div>

        {/* Interview area */}
        <div className="px-6 pb-6">
          {!isStarted ? (
            <div className="text-center py-8">
              {/* Orb visualization placeholder */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-cyan-500/30"
              >
                <Mic className="h-10 w-10 text-white" />
              </motion.div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                Start a mock interview session on <strong>{metadata.topic || "this topic"}</strong>.
                The AI interviewer will ask you questions and provide feedback.
              </p>
              <Button
                onClick={() => setIsStarted(true)}
                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <Play className="h-4 w-4" />
                Start Interview
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              {/* Active interview visualization */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(6, 182, 212, 0.4)",
                    "0 0 0 20px rgba(6, 182, 212, 0)",
                    "0 0 0 0 rgba(6, 182, 212, 0)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 mx-auto mb-6 flex items-center justify-center"
              >
                <Mic className="h-10 w-10 text-white" />
              </motion.div>
              <p className="text-sm text-neutral-500 mb-6">Interview in progress...</p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="gap-2"
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsStarted(false)}
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  End Interview
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Info footer */}
        <div className="px-6 py-3 bg-cyan-100/50 dark:bg-cyan-950/30 border-t border-cyan-200 dark:border-cyan-800 flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {metadata.durationMinutes || 10} min session
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            AI-powered feedback
          </span>
        </div>
      </div>
    </motion.div>
  );
}
