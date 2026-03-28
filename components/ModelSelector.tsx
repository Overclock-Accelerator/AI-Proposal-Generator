"use client";

import { MODELS, type Model } from "@/lib/models";

interface ModelSelectorProps {
  selectedModelId: string;
  onChange: (modelId: string) => void;
}

const strengthStyles: Record<Model["strength"], string> = {
  strong: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  moderate: "bg-amber-50 text-amber-700 border border-amber-200",
  weak: "bg-rose-50 text-rose-700 border border-rose-200",
};

export default function ModelSelector({ selectedModelId, onChange }: ModelSelectorProps) {
  return (
    <div className="space-y-2 pt-1">
      <div className="grid gap-2">
        {MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => onChange(model.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all ${
              selectedModelId === model.id
                ? "border-violet-500 bg-violet-50"
                : "border-zinc-200 bg-white hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-medium text-zinc-900 text-sm">{model.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400">{model.provider}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${strengthStyles[model.strength]}`}>
                  {model.strength}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">{model.description}</p>
              <span className="text-xs text-zinc-400 ml-2 shrink-0 font-mono">
                ${model.inputCostPer1M}/${model.outputCostPer1M}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
