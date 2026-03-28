export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  complexity: "simple" | "moderate" | "complex";
  openaiDefinition: {
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: {
        type: string;
        properties: Record<string, unknown>;
        required?: string[];
      };
    };
  };
}

export const AVAILABLE_TOOLS: Tool[] = [
  {
    id: "convert_to_pdf",
    name: "Convert to PDF",
    description: "Export the generated proposal as a formatted PDF document",
    icon: "📄",
    complexity: "simple",
    openaiDefinition: {
      type: "function",
      function: {
        name: "convert_to_pdf",
        description: "Convert the current proposal content into a downloadable PDF document",
        parameters: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the proposal document",
            },
            include_cover_page: {
              type: "boolean",
              description: "Whether to include a cover page",
            },
          },
          required: ["title"],
        },
      },
    },
  },
  {
    id: "email_document",
    name: "Email Document",
    description: "Send the completed proposal directly to a recipient via email",
    icon: "📧",
    complexity: "simple",
    openaiDefinition: {
      type: "function",
      function: {
        name: "email_document",
        description: "Email the proposal to a specified recipient",
        parameters: {
          type: "object",
          properties: {
            recipient_email: {
              type: "string",
              description: "Email address of the recipient",
            },
            subject: {
              type: "string",
              description: "Email subject line",
            },
            message: {
              type: "string",
              description: "Brief cover message to accompany the proposal",
            },
          },
          required: ["recipient_email", "subject"],
        },
      },
    },
  },
  {
    id: "add_signature_blocks",
    name: "Add Signature Blocks",
    description: "Append professional signature/approval blocks to the proposal",
    icon: "✍️",
    complexity: "simple",
    openaiDefinition: {
      type: "function",
      function: {
        name: "add_signature_blocks",
        description: "Add signature lines and acceptance blocks to the proposal for client sign-off",
        parameters: {
          type: "object",
          properties: {
            client_name: {
              type: "string",
              description: "Name of the client signing",
            },
            provider_name: {
              type: "string",
              description: "Name of the service provider",
            },
            include_date_field: {
              type: "boolean",
              description: "Whether to include a date field",
            },
          },
          required: ["client_name", "provider_name"],
        },
      },
    },
  },
  {
    id: "extract_from_existing",
    name: "Extract from Existing Doc",
    description: "Upload an existing proposal and extract key elements for reuse",
    icon: "📂",
    complexity: "moderate",
    openaiDefinition: {
      type: "function",
      function: {
        name: "extract_from_existing",
        description: "Parse an uploaded proposal document and extract structured elements like scope, pricing, timeline, and terms",
        parameters: {
          type: "object",
          properties: {
            file_name: {
              type: "string",
              description: "Name of the uploaded file",
            },
            extract_fields: {
              type: "array",
              items: { type: "string" },
              description: "Which fields to extract: scope, pricing, timeline, terms, deliverables",
            },
          },
          required: ["file_name"],
        },
      },
    },
  },
  {
    id: "generate_pricing_table",
    name: "Generate Pricing Table",
    description: "Auto-generate a line-item pricing table based on the scope",
    icon: "💰",
    complexity: "moderate",
    openaiDefinition: {
      type: "function",
      function: {
        name: "generate_pricing_table",
        description: "Create a structured pricing table with line items, quantities, rates, and totals based on the proposal scope",
        parameters: {
          type: "object",
          properties: {
            currency: {
              type: "string",
              description: "Currency code (USD, EUR, GBP, etc.)",
            },
            include_tax: {
              type: "boolean",
              description: "Whether to include tax line",
            },
          },
          required: ["currency"],
        },
      },
    },
  },
];

export type ToolCallResult = {
  tool_id: string;
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
};

// Simulated tool execution for demo/teaching purposes
export function simulateToolExecution(toolId: string, args: Record<string, unknown>): ToolCallResult {
  switch (toolId) {
    case "convert_to_pdf":
      return {
        tool_id: toolId,
        success: true,
        message: `PDF created: "${args.title}.pdf" (simulated — would use a PDF library like puppeteer or jsPDF in production)`,
        data: { filename: `${args.title}.pdf`, size: "142 KB" },
      };
    case "email_document":
      return {
        tool_id: toolId,
        success: true,
        message: `Email queued to ${args.recipient_email} (simulated — would use SendGrid, Resend, or Nodemailer in production)`,
        data: { message_id: "sim_" + Date.now() },
      };
    case "add_signature_blocks":
      return {
        tool_id: toolId,
        success: true,
        message: `Signature blocks added for ${args.client_name} and ${args.provider_name}`,
        data: { blocks_added: 2 },
      };
    case "extract_from_existing":
      return {
        tool_id: toolId,
        success: true,
        message: `Extracted elements from ${args.file_name} (simulated — would use document parsing in production)`,
        data: { fields_extracted: args.extract_fields || ["scope", "pricing"] },
      };
    case "generate_pricing_table":
      return {
        tool_id: toolId,
        success: true,
        message: `Pricing table generated in ${args.currency}`,
        data: {
          line_items: [
            { description: "Project kickoff & discovery", qty: 1, rate: 2500, total: 2500 },
            { description: "Design & development", qty: 40, rate: 150, total: 6000 },
            { description: "Testing & QA", qty: 8, rate: 100, total: 800 },
          ],
          subtotal: 9300,
          currency: args.currency,
        },
      };
    default:
      return { tool_id: toolId, success: false, message: "Unknown tool" };
  }
}
