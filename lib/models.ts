export interface Model {
  id: string;
  name: string;
  provider: string;
  strength: "weak" | "moderate" | "strong";
  description: string;
  contextWindow: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
}

export const MODELS: Model[] = [
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    strength: "strong",
    description: "OpenAI's flagship model — excellent at structured output and tool use",
    contextWindow: 128000,
    inputCostPer1M: 5.0,
    outputCostPer1M: 15.0,
  },
  {
    id: "anthropic/claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    strength: "strong",
    description: "Anthropic's best balance of intelligence and speed — excellent for documents",
    contextWindow: 200000,
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    strength: "moderate",
    description: "Fast, lightweight Anthropic model — good for simple document drafts",
    contextWindow: 200000,
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
  },
  {
    id: "moonshotai/moonshot-v1-8k",
    name: "Moonshot v1 (Kimi)",
    provider: "Moonshot AI",
    strength: "moderate",
    description: "Kimi — Chinese LLM with decent English, moderate tool-calling ability",
    contextWindow: 8000,
    inputCostPer1M: 0.12,
    outputCostPer1M: 0.12,
  },
  {
    id: "thudm/glm-4-9b",
    name: "GLM-4 9B",
    provider: "THUDM",
    strength: "weak",
    description: "Small Chinese open-source model — weaker tool-calling, good for demos",
    contextWindow: 8192,
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.05,
  },
];

export function getModelById(id: string): Model | undefined {
  return MODELS.find((m) => m.id === id);
}
