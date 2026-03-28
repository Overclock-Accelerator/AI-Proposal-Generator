"use client";

import { MODELS, type Model } from "@/lib/models";

interface ModelSelectorProps {
  selectedModelId: string;
  onChange: (modelId: string) => void;
}

const strengthColors: Record<Model["strength"], string> = {
  strong: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  weak: "bg-red-100 text-red-800",
};

export default function ModelSelector({ selectedModelId, onChange }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Select Model
      </label>
      <div className="grid gap-2">
        {MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => onChange(model.id)}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
              selectedModelId === model.id
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900">{model.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{model.provider}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${strengthColors[model.strength]}`}>
                  {model.strength} tool-caller
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{model.description}</p>
              <span className="text-xs text-gray-400 ml-2 shrink-0">
                ${model.inputCostPer1M}/1M in · ${model.outputCostPer1M}/1M out
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
