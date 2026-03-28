"use client";

import { useState } from "react";
import ModelSelector from "@/components/ModelSelector";
import SystemPromptEditor from "@/components/SystemPromptEditor";
import MetricsDisplay from "@/components/MetricsDisplay";
import ProposalEditor from "@/components/ProposalEditor";
import { MODELS } from "@/lib/models";
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_AGREEMENT_PROMPT } from "@/lib/systemPrompt";

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

type Tab = "generate" | "proposals" | "agreements";
type DocType = "proposal" | "agreement";

// Static — defined once at module level
const HOW_IT_WORKS = [
  ["Proposals", "Scope, deliverables, timeline, pricing"],
  ["Agreements", "IP, confidentiality, compensation, termination"],
  ["Model selection", "GPT-4o, Claude, and others with cost estimates"],
  ["Tweaks", "Targeted edits to generated output without regenerating"],
] as const;

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");
  const [openPanel, setOpenPanel] = useState<string | null>("model");

  // Generate tab state
  const [description, setDescription] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
  const [proposalSystemPrompt, setProposalSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [agreementSystemPrompt, setAgreementSystemPrompt] = useState(DEFAULT_AGREEMENT_PROMPT);

  // Proposal state
  const [proposal, setProposal] = useState("");
  const [proposalToolCallResults, setProposalToolCallResults] = useState<ToolCallResult[]>([]);
  const [proposalMetrics, setProposalMetrics] = useState<Metrics | null>(null);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalTweak, setProposalTweak] = useState("");
  const [proposalTweakLoading, setProposalTweakLoading] = useState(false);

  // Agreement state
  const [agreement, setAgreement] = useState("");
  const [agreementToolCallResults, setAgreementToolCallResults] = useState<ToolCallResult[]>([]);
  const [agreementMetrics, setAgreementMetrics] = useState<Metrics | null>(null);
  const [agreementLoading, setAgreementLoading] = useState(false);
  const [agreementTweak, setAgreementTweak] = useState("");
  const [agreementTweakLoading, setAgreementTweakLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const callGenerateApi = async (params: {
    description: string;
    modelId: string;
    systemPrompt: string;
    documentType: DocType;
    tweakRequest?: string;
    existingContent?: string;
  }) => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, enabledToolIds: [] }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Generation failed");
    return data;
  };

  const handleGenerate = async (docType: DocType) => {
    if (!description.trim()) return;
    const isProposal = docType === "proposal";
    const setLoading = isProposal ? setProposalLoading : setAgreementLoading;
    const systemPrompt = isProposal ? proposalSystemPrompt : agreementSystemPrompt;
    setLoading(true);
    setError(null);
    try {
      const data = await callGenerateApi({ description, modelId: selectedModelId, systemPrompt, documentType: docType });
      if (isProposal) {
        setProposal(data.content);
        setProposalToolCallResults(data.toolCallResults || []);
        setProposalMetrics(data.metrics);
        setActiveTab("proposals");
      } else {
        setAgreement(data.content);
        setAgreementToolCallResults(data.toolCallResults || []);
        setAgreementMetrics(data.metrics);
        setActiveTab("agreements");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleTweak = async (docType: DocType) => {
    const isProposal = docType === "proposal";
    const tweakValue = isProposal ? proposalTweak : agreementTweak;
    const existingContent = isProposal ? proposal : agreement;
    if (!tweakValue.trim() || !existingContent) return;
    const setTweakLoading = isProposal ? setProposalTweakLoading : setAgreementTweakLoading;
    const systemPrompt = isProposal ? proposalSystemPrompt : agreementSystemPrompt;
    setTweakLoading(true);
    setError(null);
    try {
      const data = await callGenerateApi({
        description,
        modelId: selectedModelId,
        systemPrompt,
        documentType: docType,
        tweakRequest: tweakValue,
        existingContent,
      });
      if (isProposal) {
        setProposal(data.content);
        setProposalToolCallResults(data.toolCallResults || []);
        setProposalMetrics(data.metrics);
        setProposalTweak("");
      } else {
        setAgreement(data.content);
        setAgreementToolCallResults(data.toolCallResults || []);
        setAgreementMetrics(data.metrics);
        setAgreementTweak("");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setTweakLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; dot: boolean }[] = [
    { key: "generate", label: "Generate", dot: false },
    { key: "proposals", label: "Proposals", dot: !!proposal },
    { key: "agreements", label: "Agreements", dot: !!agreement },
  ];

  const anyLoading = proposalLoading || agreementLoading;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">Proposal & Agreement Builder</h1>
            <p className="text-xs text-zinc-500">For independent consultants and LLCs · Powered by OpenRouter</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 pt-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-inset ${
                activeTab === tab.key
                  ? "bg-zinc-50 text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {tab.label}
              {tab.dot && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* ── GENERATE TAB ── */}
        {activeTab === "generate" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1 space-y-3">
              <CollapsiblePanel title="Model Selection" panelKey="model" openPanel={openPanel} onToggle={setOpenPanel} badge={MODELS.find((m) => m.id === selectedModelId)?.name}>
                <ModelSelector selectedModelId={selectedModelId} onChange={setSelectedModelId} />
              </CollapsiblePanel>
              <CollapsiblePanel title="Proposal System Prompt" panelKey="proposal-prompt" openPanel={openPanel} onToggle={setOpenPanel} badge={`${proposalSystemPrompt.length} chars`}>
                <SystemPromptEditor value={proposalSystemPrompt} onChange={setProposalSystemPrompt} />
              </CollapsiblePanel>
              <CollapsiblePanel title="Agreement System Prompt" panelKey="agreement-prompt" openPanel={openPanel} onToggle={setOpenPanel} badge={`${agreementSystemPrompt.length} chars`}>
                <SystemPromptEditor value={agreementSystemPrompt} onChange={setAgreementSystemPrompt} />
              </CollapsiblePanel>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
                <label className="block text-sm font-medium text-zinc-800 mb-2">Describe your engagement</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={7}
                  placeholder="E.g., I'm an independent consultant helping a fintech startup redesign their onboarding flow. 3-month engagement, fixed fee around $18,000. They need UX research, wireframes, and a final design handoff..."
                  className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-900 bg-white placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
                />
                <p className="text-xs text-zinc-400 mt-1">{description.length} characters</p>
              </div>

              <div className="flex gap-3">
                <GenerateButton
                  label="Generate Proposal"
                  loading={proposalLoading}
                  loadingLabel="Generating Proposal…"
                  disabled={anyLoading || !description.trim()}
                  onClick={() => handleGenerate("proposal")}
                  accent="violet"
                />
                <GenerateButton
                  label="Generate Agreement"
                  loading={agreementLoading}
                  loadingLabel="Generating Agreement…"
                  disabled={anyLoading || !description.trim()}
                  onClick={() => handleGenerate("agreement")}
                  accent="zinc"
                />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider mb-2">How it works</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {HOW_IT_WORKS.map(([k, v]) => (
                    <div key={k} className="text-zinc-400">
                      <span className="text-zinc-200 font-medium">{k}</span> — {v}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROPOSALS TAB ── */}
        {activeTab === "proposals" && (
          <DocumentTab
            content={proposal}
            metrics={proposalMetrics}
            toolCallResults={proposalToolCallResults}
            loading={proposalTweakLoading}
            documentType="proposal"
            tweakValue={proposalTweak}
            onTweakChange={setProposalTweak}
            onTweakSubmit={() => handleTweak("proposal")}
            accent="violet"
            onNavigateToGenerate={() => setActiveTab("generate")}
          />
        )}

        {/* ── AGREEMENTS TAB ── */}
        {activeTab === "agreements" && (
          <DocumentTab
            content={agreement}
            metrics={agreementMetrics}
            toolCallResults={agreementToolCallResults}
            loading={agreementTweakLoading}
            documentType="agreement"
            tweakValue={agreementTweak}
            onTweakChange={setAgreementTweak}
            onTweakSubmit={() => handleTweak("agreement")}
            accent="zinc"
            onNavigateToGenerate={() => setActiveTab("generate")}
          />
        )}
      </main>
    </div>
  );
}

// ── Sub-components ──

interface GenerateButtonProps {
  label: string;
  loading: boolean;
  loadingLabel: string;
  disabled: boolean;
  onClick: () => void;
  accent: "violet" | "zinc";
}

function GenerateButton({ label, loading, loadingLabel, disabled, onClick, accent }: GenerateButtonProps) {
  const base = accent === "violet"
    ? "bg-violet-600 hover:bg-violet-700"
    : "bg-zinc-900 hover:bg-zinc-700";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 px-5 py-2.5 ${base} disabled:bg-zinc-100 disabled:text-zinc-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed`}
    >
      {loading ? (
        <>
          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          {loadingLabel}
        </>
      ) : label}
    </button>
  );
}

interface DocumentTabProps {
  content: string;
  metrics: Metrics | null;
  toolCallResults: ToolCallResult[];
  loading: boolean;
  documentType: "proposal" | "agreement";
  tweakValue: string;
  onTweakChange: (v: string) => void;
  onTweakSubmit: () => void;
  accent: "violet" | "zinc";
  onNavigateToGenerate: () => void;
}

function DocumentTab({ content, metrics, toolCallResults, loading, documentType, tweakValue, onTweakChange, onTweakSubmit, accent, onNavigateToGenerate }: DocumentTabProps) {
  const emptyTitle = documentType === "proposal" ? "No proposal yet" : "No agreement yet";
  const emptyDesc = documentType === "proposal"
    ? "Go to the Generate tab, describe your engagement, and click Generate Proposal."
    : "Go to the Generate tab, describe your engagement, and click Generate Agreement.";
  const tweakPlaceholder = documentType === "proposal"
    ? "E.g., Make the pricing section more detailed, add a phase 3..."
    : "E.g., Add a non-solicitation clause, change payment terms to net-15...";

  if (!content) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDesc}
        onAction={onNavigateToGenerate}
        actionLabel="Go to Generate"
      />
    );
  }

  return (
    <div className="space-y-4">
      <MetricsDisplay metrics={metrics} isLoading={loading} />
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
        <ProposalEditor content={content} toolCallResults={toolCallResults} documentType={documentType} />
      </div>
      <TweakBar
        value={tweakValue}
        onChange={onTweakChange}
        onSubmit={onTweakSubmit}
        loading={loading}
        placeholder={tweakPlaceholder}
        accent={accent}
      />
    </div>
  );
}

interface CollapsiblePanelProps {
  title: string;
  panelKey: string;
  openPanel: string | null;
  onToggle: (key: string | null) => void;
  badge?: string;
  children: React.ReactNode;
}

function CollapsiblePanel({ title, panelKey, openPanel, onToggle, badge, children }: CollapsiblePanelProps) {
  const isOpen = openPanel === panelKey;
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <button
        onClick={() => onToggle(isOpen ? null : panelKey)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
      >
        <span className="text-sm font-medium text-zinc-800">{title}</span>
        <div className="flex items-center gap-2">
          {badge && <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">{badge}</span>}
          <svg className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-zinc-100">
          {children}
        </div>
      )}
    </div>
  );
}

interface TweakBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  placeholder: string;
  accent: "violet" | "zinc";
}

function TweakBar({ value, onChange, onSubmit, loading, placeholder, accent }: TweakBarProps) {
  const btnClass = accent === "violet"
    ? "bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-100 disabled:text-zinc-400 text-white"
    : "bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-100 disabled:text-zinc-400 text-white";
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
      <label className="block text-sm font-medium text-zinc-800 mb-2">Request a Tweak</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && value.trim() && onSubmit()}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
        />
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0 ${btnClass}`}
        >
          {loading ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Apply Tweak"}
        </button>
      </div>
      <p className="text-xs text-zinc-400 mt-1.5">Press Enter or click Apply Tweak · output is replaced in-place</p>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  onAction: () => void;
  actionLabel: string;
}

function EmptyState({ title, description, onAction, actionLabel }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-12 shadow-sm text-center">
      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
        <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h3 className="text-zinc-700 font-medium mb-1 text-sm">{title}</h3>
      <p className="text-sm text-zinc-400 mb-4">{description}</p>
      <button onClick={onAction} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors">
        {actionLabel}
      </button>
    </div>
  );
}
