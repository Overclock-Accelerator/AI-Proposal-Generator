"use client";

import { useState } from "react";
import ModelSelector from "@/components/ModelSelector";
import SystemPromptEditor from "@/components/SystemPromptEditor";
import ToolsPanel from "@/components/ToolsPanel";
import MetricsDisplay from "@/components/MetricsDisplay";
import ProposalEditor from "@/components/ProposalEditor";
import { MODELS } from "@/lib/models";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/systemPrompt";

interface Metrics {
  durationMs: number;
  durationFormatted: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  estimatedCostFormatted: string;
  model: string;
  toolsUsed: number;
}

interface ToolCallResult {
  tool_id: string;
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

type PanelKey = "model" | "prompt" | "tools";

export default function Home() {
  const [description, setDescription] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [enabledToolIds, setEnabledToolIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState("");
  const [toolCallResults, setToolCallResults] = useState<ToolCallResult[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<PanelKey | null>("model");

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsLoading(true);
    setError(null);
    setProposal("");
    setToolCallResults([]);
    setMetrics(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          modelId: selectedModelId,
          systemPrompt,
          enabledToolIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setProposal(data.proposal);
      setToolCallResults(data.toolCallResults || []);
      setMetrics(data.metrics);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePanel = (key: PanelKey) => {
    setOpenPanel(openPanel === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              AI Proposal Generator
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Powered by OpenRouter · Teaching AI application architecture
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
              LLM + System Prompt + Tools
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — configuration */}
          <div className="lg:col-span-1 space-y-4">

            {/* Architecture explanation */}
            <div className="bg-indigo-600 text-white rounded-xl p-4 text-sm">
              <h2 className="font-semibold mb-1">How this works</h2>
              <p className="text-indigo-100 text-xs leading-relaxed">
                This app shows the 4 core layers of an AI application:
              </p>
              <ol className="mt-2 space-y-1 text-xs text-indigo-100 list-decimal list-inside">
                <li><strong className="text-white">LLM</strong> — the model you choose below</li>
                <li><strong className="text-white">System Prompt</strong> — defines the AI&apos;s behavior</li>
                <li><strong className="text-white">UI</strong> — this interface</li>
                <li><strong className="text-white">Tools</strong> — functions the AI can call</li>
              </ol>
            </div>

            {/* Collapsible panels */}
            <CollapsiblePanel
              title="Model Selection"
              isOpen={openPanel === "model"}
              onToggle={() => togglePanel("model")}
              badge={MODELS.find(m => m.id === selectedModelId)?.name}
            >
              <ModelSelector
                selectedModelId={selectedModelId}
                onChange={setSelectedModelId}
              />
            </CollapsiblePanel>

            <CollapsiblePanel
              title="System Prompt"
              isOpen={openPanel === "prompt"}
              onToggle={() => togglePanel("prompt")}
              badge={`${systemPrompt.length} chars`}
            >
              <SystemPromptEditor
                value={systemPrompt}
                onChange={setSystemPrompt}
              />
            </CollapsiblePanel>

            <CollapsiblePanel
              title="Tools"
              isOpen={openPanel === "tools"}
              onToggle={() => togglePanel("tools")}
              badge={`${enabledToolIds.length} enabled`}
            >
              <ToolsPanel
                enabledToolIds={enabledToolIds}
                onChange={setEnabledToolIds}
              />
            </CollapsiblePanel>
          </div>

          {/* Right column — main workspace */}
          <div className="lg:col-span-2 space-y-4">

            {/* Proposal description input */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Describe your proposal
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="E.g., I need a proposal for building a custom e-commerce website for a local bakery. The budget is around $8,000 and we need it done in 6 weeks. They need online ordering, inventory management, and local delivery integration..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {description.length} characters
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !description.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Proposal
                      {enabledToolIds.length > 0 && (
                        <span className="text-indigo-200 text-xs">+ {enabledToolIds.length} tools</span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Metrics */}
            <MetricsDisplay metrics={metrics} isLoading={isLoading} />

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Generated proposal */}
            {(proposal || toolCallResults.length > 0) && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <ProposalEditor
                  content={proposal}
                  toolCallResults={toolCallResults}
                  onCopy={() => {}}
                />
              </div>
            )}

            {/* Empty state */}
            {!proposal && !isLoading && !error && (
              <div className="bg-white rounded-xl border border-gray-200 p-10 shadow-sm text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-gray-600 font-medium mb-1">Ready to generate</h3>
                <p className="text-sm text-gray-400">
                  Describe your proposal above, configure the AI settings, and click Generate.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Collapsible panel component
interface CollapsiblePanelProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}

function CollapsiblePanel({ title, isOpen, onToggle, badge, children }: CollapsiblePanelProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}
