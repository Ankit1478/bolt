import React from "react";
import { CheckCircle, Circle, Clock } from "lucide-react";
import { Step } from "../types";

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  return (
    <div className="space-y-4 p-5">
      <h2 className="text-xl font-bold text-white tracking-tight [text-shadow:0_0_20px_#3B82F640]">
        Build Steps
      </h2>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`relative group cursor-pointer transition-all duration-300 ${
              currentStep === step.id ? "scale-[1.02]" : ""
            }`}
          >
            {currentStep === step.id && (
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            )}

            <div
              className={`p-4 rounded-xl border transition-colors relative ${
                currentStep === step.id
                  ? "bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-transparent"
                  : "bg-zinc-900/80 border-zinc-800/80 hover:bg-zinc-900/90"
              }`}
            >
              <div className="flex items-center gap-3">
                {step.status === "completed" ? (
                  <CheckCircle className="w-5 h-5 text-cyan-500" />
                ) : step.status === "in-progress" ? (
                  <Clock className="w-5 h-5 text-blue-500" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-600" />
                )}

                <h3
                  className={`font-medium ${
                    currentStep === step.id
                      ? "text-white [text-shadow:0_0_20px_#3B82F640]"
                      : "text-zinc-200"
                  }`}
                >
                  {step.title}
                </h3>
              </div>

              <p
                className={`text-sm mt-2 ${
                  currentStep === step.id ? "text-zinc-300" : "text-zinc-400"
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
