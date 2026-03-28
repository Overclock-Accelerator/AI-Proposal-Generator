"use client";

import { AVAILABLE_TOOLS } from "@/lib/tools";

interface ToolsPanelProps {
  enabledToolIds: string[];
  onChange: (enabledIds: string[]) => void;
}

const complexityColors: Record<string, string> = {
  simple: "bg-blue-100 text-blue-700",
  moderate: "bg-orange-100 text-orange-700",
  complex: "bg-red-100 text-red-700",
};

export default function ToolsPanel({ enabledToolIds, onChange }: ToolsPanelProps) {
  const toggle = (toolId: string) => {
    if (enabledToolIds.includes(toolId)) {
      onChange(enabledToolIds.filter((id) => id !== toolId));
    } else {
      onChange([...enabledToolIds, toolId]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          Tools (toggleable)
        </label>
        <span className="text-xs text-gray-400">
          {enabledToolIds.length} of {AVAILABLE_TOOLS.length} enabled
        </span>
      </div>
      <p className="text-xs text-gray-500">
        Enabled tools are passed to the LLM — it can call them during generation. This teaches how tool-calling works in AI applications.
      </p>
      <div className="space-y-2">
        {AVAILABLE_TOOLS.map((tool) => {
          const isEnabled = enabledToolIds.includes(tool.id);
          return (
            <div
              key={tool.id}
              onClick={() => toggle(tool.id)}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isEnabled
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="mt-0.5">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isEnabled ? "bg-indigo-500 border-indigo-500" : "border-gray-300 bg-white"
                }`}>
                  {isEnabled && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-base">{tool.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{tool.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${complexityColors[tool.complexity]}`}>
                    {tool.complexity}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{tool.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
