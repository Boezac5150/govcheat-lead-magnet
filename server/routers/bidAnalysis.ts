import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

export interface BidAnalysis {
  summary: string;
  winProbability: number;
  keyStrengths: string[];
  keyWeaknesses: string[];
  howToWin: string[];
  estimatedEffort: "low" | "medium" | "high";
  recommendedAction: "pursue" | "consider" | "skip";
}

export const bidAnalysisRouter = router({
  /**
   * Analyze a contract and provide bid strategy
   */
  analyze: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        agency: z.string(),
        contractType: z.string(),
        value: z.number().optional(),
        deadline: z.string().optional(),
        setAside: z.string().optional(),
      })
    )
    .query(async ({ input }): Promise<BidAnalysis> => {
      try {
        const prompt = `You are a government contracting expert. Analyze this contract opportunity and provide strategic bid advice.

Contract Details:
- Title: ${input.title}
- Agency: ${input.agency}
- Type: ${input.contractType}
- Set-Aside: ${input.setAside || "None"}
- Value: ${input.value ? `$${input.value.toLocaleString()}` : "Not specified"}
- Deadline: ${input.deadline || "Not specified"}
- Description: ${input.description}

Provide your analysis in JSON format with these exact fields:
{
  "summary": "2-3 sentence plain-English summary of what the government needs",
  "winProbability": <number 0-100>,
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "keyWeaknesses": ["weakness1", "weakness2"],
  "howToWin": ["step1", "step2", "step3"],
  "estimatedEffort": "low|medium|high",
  "recommendedAction": "pursue|consider|skip"
}

Be specific and actionable. Focus on what a small business needs to know.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a government contracting expert. Provide concise, actionable bid analysis. Always respond with valid JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "bid_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  winProbability: { type: "number", minimum: 0, maximum: 100 },
                  keyStrengths: {
                    type: "array",
                    items: { type: "string" },
                  },
                  keyWeaknesses: {
                    type: "array",
                    items: { type: "string" },
                  },
                  howToWin: {
                    type: "array",
                    items: { type: "string" },
                  },
                  estimatedEffort: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                  },
                  recommendedAction: {
                    type: "string",
                    enum: ["pursue", "consider", "skip"],
                  },
                },
                required: [
                  "summary",
                  "winProbability",
                  "keyStrengths",
                  "keyWeaknesses",
                  "howToWin",
                  "estimatedEffort",
                  "recommendedAction",
                ],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        if (typeof content === "string") {
          const parsed = JSON.parse(content);
          return {
            summary: parsed.summary,
            winProbability: parsed.winProbability,
            keyStrengths: parsed.keyStrengths,
            keyWeaknesses: parsed.keyWeaknesses,
            howToWin: parsed.howToWin,
            estimatedEffort: parsed.estimatedEffort,
            recommendedAction: parsed.recommendedAction,
          };
        }

        throw new Error("Invalid LLM response format");
      } catch (error) {
        console.error("[Bid Analysis] Failed to analyze contract:", error);
        // Return fallback analysis
        return {
          summary:
            "Unable to analyze this contract at this time. Please try again.",
          winProbability: 0,
          keyStrengths: [],
          keyWeaknesses: [],
          howToWin: [],
          estimatedEffort: "medium",
          recommendedAction: "skip",
        };
      }
    }),

  /**
   * Get plain-English translation of contract jargon
   */
  translateJargon: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async ({ input }): Promise<{ translation: string }> => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert at translating government contracting jargon into plain English that a small business owner can understand. Be concise and direct.",
            },
            {
              role: "user",
              content: `Translate this government contracting term or phrase into plain English for a small business owner: "${input.text}"`,
            },
          ],
        });

        const content = response.choices[0].message.content;
        return {
          translation:
            typeof content === "string"
              ? content
              : "Unable to translate this term",
        };
      } catch (error) {
        console.error("[Bid Analysis] Translation failed:", error);
        return { translation: input.text };
      }
    }),
});
