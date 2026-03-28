"use client";

import { SYSTEM_PROMPT_PRESETS } from "@/lib/systemPrompt";

interface SystemPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const PRESET_LABELS: Record<string, string> = {
  default: "Default (Professional)",
  concise: "Concise / Fast",
  technical: "Technical SOW",
  marketing: "Marketing Agency",
};

export default function SystemPromptEditor({ value, onChange }: SystemPromptEditorProps) {
  const handlePreset = (key: string) => {
    onChange(SYSTEM_PROMPT_PRESETS[key]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          System Prompt
        </label>
        <div className="flex gap-1 flex-wrap">
          {Object.keys(SYSTEM_PROMPT_PRESETS).map((key) => (
            <button
              key={key}
              onClick={() => handlePreset(key)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
            >
              {PRESET_LABELS[key] || key}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-y font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        placeholder="Enter a system prompt to define how the AI generates proposals..."
      />
      <p className="text-xs text-gray-400">
        {value.length} characters · Edit freely or select a preset above
      </p>
    </div>
  );
}
