"use client";

import { SYSTEM_PROMPT_PRESETS } from "@/lib/systemPrompt";

interface SystemPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const PRESET_LABELS: Record<string, string> = {
  default: "Default",
  concise: "Concise",
  technical: "Technical SOW",
  marketing: "Marketing",
};

export default function SystemPromptEditor({ value, onChange }: SystemPromptEditorProps) {
  const handlePreset = (key: string) => {
    onChange(SYSTEM_PROMPT_PRESETS[key]);
  };

  return (
    <div className="space-y-2 pt-1">
      <div className="flex gap-1 flex-wrap">
        {Object.keys(SYSTEM_PROMPT_PRESETS).map((key) => (
          <button
            key={key}
            onClick={() => handlePreset(key)}
            className="text-xs px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md transition-colors font-medium"
          >
            {PRESET_LABELS[key] || key}
          </button>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full px-3 py-2 text-xs text-zinc-900 border border-zinc-200 rounded-lg resize-y font-mono bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
        placeholder="Enter a system prompt to define how the AI generates proposals..."
      />
      <p className="text-xs text-zinc-400">
        {value.length} chars · edit freely or pick a preset
      </p>
    </div>
  );
}
