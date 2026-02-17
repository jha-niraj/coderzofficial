"use client";

import { motion } from "framer-motion";
import { Rocket, Clock, Star } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import type { StudioStep, ProjectMetadata } from "@/types/studios";

interface ProjectStepProps {
  step: StudioStep;
}

export function ProjectStep({ step }: ProjectStepProps) {
  const metadata = (step.metadata || {}) as Partial<ProjectMetadata>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      <div className="space-y-4">
        {metadata.suggestions?.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {project.title}
                  </h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">
                    {project.projectType}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {project.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {project.estimatedHours}h
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {project.difficulty}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {project.projectType === "minor" ? (
                    <Button size="sm" variant="outline">
                      Add to Portfolio
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Create Project
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
