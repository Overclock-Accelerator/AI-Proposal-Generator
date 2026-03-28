"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface ToolCallResult {
  tool_id: string;
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

interface ProposalEditorProps {
  content: string;
  toolCallResults: ToolCallResult[];
  onCopy?: () => void;
  documentType?: "proposal" | "agreement";
}

// Defined at module level — stable reference, never recreated on render
const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => <h1 className="text-2xl font-bold text-zinc-900 mt-0 mb-4 pb-3 border-b border-zinc-200">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-semibold text-zinc-800 mt-6 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold text-zinc-800 mt-5 mb-2">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-semibold text-zinc-700 mt-4 mb-1">{children}</h4>,
  p: ({ children }) => <p className="text-sm text-zinc-700 leading-relaxed mb-3">{children}</p>,
  ul: ({ children }) => <ul className="text-sm text-zinc-700 mb-3 space-y-1.5 list-none pl-0">{children}</ul>,
  ol: ({ children }) => <ol className="text-sm text-zinc-700 mb-3 space-y-1.5 list-decimal list-outside pl-5">{children}</ol>,
  li: ({ children, ...props }) => {
    const isOrdered = (props as { ordered?: boolean }).ordered;
    return isOrdered ? (
      <li className="text-sm text-zinc-700 pl-1">{children}</li>
    ) : (
      <li className="flex items-start gap-2 text-sm text-zinc-700">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
        <span>{children}</span>
      </li>
    );
  },
  strong: ({ children }) => <strong className="font-semibold text-zinc-900">{children}</strong>,
  em: ({ children }) => <em className="italic text-zinc-600">{children}</em>,
  blockquote: ({ children }) => <blockquote className="border-l-4 border-violet-300 pl-4 my-3 text-zinc-500 italic text-sm">{children}</blockquote>,
  code: ({ children, className }) => {
    const isBlock = !!className?.includes("language-");
    return isBlock ? (
      <code className="block bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-xs font-mono text-zinc-800 overflow-x-auto my-3 whitespace-pre">{children}</code>
    ) : (
      <code className="bg-zinc-100 text-violet-700 rounded px-1.5 py-0.5 text-xs font-mono">{children}</code>
    );
  },
  pre: ({ children }) => <pre className="my-3">{children}</pre>,
  hr: () => <hr className="border-t border-zinc-200 my-5" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-zinc-50">{children}</thead>,
  th: ({ children }) => <th className="text-left text-xs font-semibold text-zinc-600 uppercase tracking-wide px-3 py-2 border border-zinc-200">{children}</th>,
  td: ({ children }) => <td className="text-sm text-zinc-700 px-3 py-2 border border-zinc-200">{children}</td>,
};

function extractTitle(content: string): string {
  const h1 = content.match(/^#\s+(.+)/m);
  if (h1) return h1[1].trim();
  const firstLine = content.split("\n").find((l) => l.trim().length > 0);
  return firstLine?.trim().slice(0, 60) || "Document";
}

export default function ProposalEditor({ content, toolCallResults, onCopy, documentType = "proposal" }: ProposalEditorProps) {
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const label = documentType === "agreement" ? "Consulting Agreement" : "Generated Proposal";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const title = extractTitle(content);
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "PDF generation failed" }));
        throw new Error(err.error || "PDF generation failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      a.download = filenameMatch ? filenameMatch[1] : `${documentType}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setPdfError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  if (!content) return null;

  return (
    <div className="space-y-3">
      {toolCallResults.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
            Tool Calls ({toolCallResults.length})
          </h3>
          <div className="space-y-1.5">
            {toolCallResults.map((result, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`text-xs font-bold ${result.success ? "text-emerald-600" : "text-rose-600"}`}>
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
          <h3 className="text-sm font-medium text-zinc-800">{label}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-md transition-colors font-medium flex items-center gap-1.5"
            >
              {pdfLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md transition-colors font-medium flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {pdfError && (
          <div className="mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-1.5">
            {pdfError}
          </div>
        )}

        <div className="bg-white border border-zinc-200 rounded-xl px-7 py-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
