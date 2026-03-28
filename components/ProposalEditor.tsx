"use client";

import { useState } from "react";

interface ToolCallResult {
  tool_id: string;
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

interface ProposalEditorProps {
  content: string;
  toolCallResults: ToolCallResult[];
  onCopy: () => void;
}

export default function ProposalEditor({ content, toolCallResults, onCopy }: ProposalEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content) return null;

  return (
    <div className="space-y-3">
      {toolCallResults.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
            Tool Calls ({toolCallResults.length})
          </h3>
          <div className="space-y-1.5">
            {toolCallResults.map((result, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`text-sm ${result.success ? "text-green-600" : "text-red-600"}`}>
                  {result.success ? "✓" : "✗"}
                </span>
                <div>
                  <span className="text-xs font-mono text-amber-900">{result.tool_id}()</span>
                  <span className="text-xs text-amber-700 ml-1">→ {result.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Generated Proposal</h3>
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
