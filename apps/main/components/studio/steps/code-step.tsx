"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code, Play, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import dynamic from "next/dynamic";
import type { StudioStep, CodeMetadata } from "@/types/studios";

const CodeEditor = dynamic(() => import("@/components/main/code-editor"), { ssr: false });

interface CodeStepProps {
  step: StudioStep;
}

export function CodeStep({ step }: CodeStepProps) {
  const metadata = (step.metadata || {}) as Partial<CodeMetadata>;
  const [isRunning, setIsRunning] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      <div className="rounded-2xl overflow-hidden bg-neutral-900">
        <div className="px-6 py-4 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {metadata.problemTitle || "Code Challenge"}
              </h3>
              <p className="text-sm text-neutral-400">
                {metadata.language || "javascript"}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => setIsRunning(true)}
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run
          </Button>
        </div>

        <div className="h-64">
          <CodeEditor
            height="100%"
            language={metadata.language || "javascript"}
            code={step.content || "// Start coding here..."}
            onChange={() => {}}
            showLanguageSelector={false}
            showCopyButton={false}
            showExpandButton={false}
          />
        </div>
      </div>
    </motion.div>
  );
}
