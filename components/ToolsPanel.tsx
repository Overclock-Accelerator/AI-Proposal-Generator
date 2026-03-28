"use client";

import { AVAILABLE_TOOLS } from "@/lib/tools";

interface ToolsPanelProps {
  enabledToolIds: string[];
  onChange: (enabledIds: string[]) => void;
}

const complexityStyles: Record<string, string> = {
  simple: "bg-sky-50 text-sky-700 border border-sky-200",
  moderate: "bg-amber-50 text-amber-700 border border-amber-200",
  complex: "bg-rose-50 text-rose-700 border border-rose-200",
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
    <div className="space-y-2 pt-1">
      <p className="text-xs text-zinc-500 leading-relaxed">
        Enabled tools are passed to the LLM — it can call them during generation.
      </p>
      <div className="space-y-1.5">
        {AVAILABLE_TOOLS.map((tool) => {
          const isEnabled = enabledToolIds.includes(tool.id);
          return (
            <div
              key={tool.id}
              onClick={() => toggle(tool.id)}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isEnabled
                  ? "border-violet-400 bg-violet-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  isEnabled ? "bg-violet-600 border-violet-600" : "border-zinc-300 bg-white"
                }`}>
                  {isEnabled && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm">{tool.icon}</span>
                  <span className="text-xs font-medium text-zinc-900">{tool.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${complexityStyles[tool.complexity]}`}>
                    {tool.complexity}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{tool.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-zinc-400">
        {enabledToolIds.length} of {AVAILABLE_TOOLS.length} enabled
      </p>
    </div>
  );
}
