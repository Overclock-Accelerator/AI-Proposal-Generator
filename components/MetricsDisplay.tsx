"use client";

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

interface MetricsDisplayProps {
  metrics: Metrics | null;
  isLoading: boolean;
}

export default function MetricsDisplay({ metrics, isLoading }: MetricsDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <div className="w-3.5 h-3.5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          Generating your proposal…
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Run Metrics
        </h3>
        <span className="text-xs text-zinc-400 font-mono">{metrics.model}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <MetricItem label="Duration" value={metrics.durationFormatted} />
        <MetricItem label="Cost" value={metrics.estimatedCostFormatted} />
        <MetricItem label="Tools" value={String(metrics.toolsUsed)} />
        <MetricItem label="Prompt" value={`${metrics.promptTokens.toLocaleString()} tok`} />
        <MetricItem label="Output" value={`${metrics.completionTokens.toLocaleString()} tok`} />
        <MetricItem label="Total" value={`${metrics.totalTokens.toLocaleString()} tok`} />
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-50 rounded-lg px-3 py-2">
      <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-zinc-800">{value}</p>
    </div>
  );
}
