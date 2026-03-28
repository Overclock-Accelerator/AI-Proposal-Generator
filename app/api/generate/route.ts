import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletion } from "openai/resources/chat/completions";
import { getModelById } from "@/lib/models";
import { AVAILABLE_TOOLS, simulateToolExecution } from "@/lib/tools";
import type { Tool } from "@/lib/tools";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ai-proposal-generator.local",
    "X-Title": "AI Proposal & Agreement Builder",
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      description,
      modelId,
      systemPrompt,
      enabledToolIds = [],
      documentType = "proposal",
      tweakRequest,
      existingContent,
    } = body;

    if (!description || !modelId || !systemPrompt) {
      return NextResponse.json(
        { error: "Missing required fields: description, modelId, systemPrompt" },
        { status: 400 }
      );
    }

    const model = getModelById(modelId);
    if (!model) {
      return NextResponse.json({ error: "Invalid model ID" }, { status: 400 });
    }

    const enabledTools = AVAILABLE_TOOLS.filter((t: Tool) =>
      enabledToolIds.includes(t.id)
    );
    const toolDefinitions = enabledTools.map((t: Tool) => t.openaiDefinition);

    const startTime = Date.now();

    // Build user message — either initial generation or a tweak on existing content
    let userMessage: string;
    if (tweakRequest && existingContent) {
      const docLabel = documentType === "agreement" ? "consulting agreement" : "proposal";
      userMessage = `Here is the existing ${docLabel}:\n\n${existingContent}\n\n---\n\nPlease apply the following tweak and return the full updated document:\n\n${tweakRequest}`;
    } else {
      const docLabel = documentType === "agreement" ? "consulting agreement" : "business proposal";
      userMessage = `Please generate a professional ${docLabel} for the following:\n\n${description}`;
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    // First API call — explicitly non-streaming
    const response = (await client.chat.completions.create({
      model: modelId,
      messages,
      stream: false,
      tools: toolDefinitions.length > 0 ? (toolDefinitions as OpenAI.Chat.ChatCompletionTool[]) : undefined,
      tool_choice: toolDefinitions.length > 0 ? "auto" : undefined,
    })) as ChatCompletion;

    const firstMessage = response.choices[0].message;
    let finalContent = firstMessage.content || "";
    const toolCallResults: Array<{
      tool_id: string;
      success: boolean;
      message: string;
      data?: Record<string, unknown>;
    }> = [];

    // Handle tool calls if any
    if (firstMessage.tool_calls && firstMessage.tool_calls.length > 0) {
      const toolCallMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        ...messages,
        firstMessage as OpenAI.Chat.ChatCompletionMessageParam,
      ];

      for (const toolCall of firstMessage.tool_calls) {
        const tc = toolCall as unknown as { function?: { name: string; arguments?: string }; name?: string; id: string };
        const toolId = tc.function?.name ?? tc.name ?? "";
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(tc.function?.arguments || "{}");
        } catch {
          // ignore parse errors
        }

        const result = simulateToolExecution(toolId, args);
        toolCallResults.push(result);

        toolCallMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      // Second call with tool results
      const followUpResponse = (await client.chat.completions.create({
        model: modelId,
        messages: toolCallMessages,
        stream: false,
      })) as ChatCompletion;

      finalContent = followUpResponse.choices[0].message.content || finalContent;
    }

    const duration = Date.now() - startTime;
    const usage = response.usage;

    // Calculate cost
    let totalCost = 0;
    if (usage && model) {
      const inputCost = (usage.prompt_tokens / 1_000_000) * model.inputCostPer1M;
      const outputCost = (usage.completion_tokens / 1_000_000) * model.outputCostPer1M;
      totalCost = inputCost + outputCost;
    }

    return NextResponse.json({
      content: finalContent,
      toolCallResults,
      metrics: {
        durationMs: duration,
        durationFormatted: `${(duration / 1000).toFixed(2)}s`,
        promptTokens: usage?.prompt_tokens ?? 0,
        completionTokens: usage?.completion_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0,
        estimatedCostUsd: totalCost,
        estimatedCostFormatted: `$${totalCost.toFixed(4)}`,
        model: model?.name ?? modelId,
        toolsUsed: toolCallResults.length,
      },
    });
  } catch (error: unknown) {
    console.error("Generate error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
