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
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          Generating...
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
        Performance Metrics
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <MetricItem label="Duration" value={metrics.durationFormatted} icon="⏱" />
        <MetricItem label="Est. Cost" value={metrics.estimatedCostFormatted} icon="💵" />
        <MetricItem label="Prompt Tokens" value={metrics.promptTokens.toLocaleString()} icon="📥" />
        <MetricItem label="Output Tokens" value={metrics.completionTokens.toLocaleString()} icon="📤" />
        <MetricItem label="Total Tokens" value={metrics.totalTokens.toLocaleString()} icon="🔢" />
        <MetricItem label="Tools Called" value={String(metrics.toolsUsed)} icon="🔧" />
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200">
        <span className="text-xs text-gray-400">Model: {metrics.model}</span>
      </div>
    </div>
  );
}

function MetricItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm">{icon}</span>
      <div>
        <span className="text-xs text-gray-500">{label}: </span>
        <span className="text-xs font-semibold text-gray-800">{value}</span>
      </div>
    </div>
  );
}
