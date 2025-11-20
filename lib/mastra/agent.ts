/**
 * Mastra CV Tailor Agent
 *
 * 📚 LEARNING NOTES:
 * ==================
 *
 * WHAT IS THIS FILE?
 * This is the "brain" of our application - it connects:
 * - LLM (the thinking part)
 * - Tools (the hands - what AI can do)
 * - System Prompt (the instructions)
 * - ChromaDB (the memory - CV storage)
 *
 * AGENT WORKFLOW:
 * 1. User uploads CV and provides job description
 * 2. Agent receives request to tailor CV
 * 3. Agent calls tools to gather info and generate content
 * 4. Agent returns tailored CV + cover letter
 *
 * KEY CONCEPTS:
 * - Agent Orchestration: Managing multiple steps automatically
 * - Tool Calling: AI decides which tools to use and when
 * - Context Management: Keeping track of conversation history
 * - Error Handling: Gracefully handling failures
 */

import Groq from 'groq-sdk';
import { systemPrompts } from './prompts';
import { tools } from './tools';

/**
 * Initialize Groq Client
 *
 * 📚 LEARNING: Why Groq?
 * - Ultra-fast inference (10-100x faster than other providers)
 * - Cost-effective
 * - Supports function calling (tool use)
 * - Great for agent workflows
 *
 * Models available:
 * - llama-3.1-70b-versatile: Best for complex reasoning (our choice!)
 * - llama-3.1-8b-instant: Faster, good for simple tasks
 * - mixtral-8x7b: Alternative, balanced performance
 */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

/**
 * LLM Configuration
 *
 * 📚 LEARNING: These parameters control how the AI behaves
 *
 * temperature (0.0 - 2.0):
 * - 0.0: Deterministic, always same answer (boring but consistent)
 * - 0.7: Balanced creativity and consistency (our choice)
 * - 2.0: Very creative but unpredictable (risky)
 *
 * max_tokens:
 * - Maximum length of response
 * - 1 token ≈ 0.75 words
 * - 4000 tokens ≈ 3000 words (enough for CV + cover letter)
 *
 * top_p (nucleus sampling):
 * - Controls diversity of word choices
 * - 0.9 means "consider top 90% probable words"
 * - Higher = more variety
 *
 * MODEL UPDATE (Nov 2025):
 * - llama-3.3-70b-versatile is the latest model
 * - Replaces llama-3.1-70b-versatile (deprecated)
 * - Better performance, same API
 */
const llmConfig = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7, // Balanced creativity
  max_tokens: 4000, // Long enough for detailed responses
  top_p: 0.9, // Good diversity
};

/**
 * Agent Configuration
 *
 * 📚 LEARNING: For now, we're creating a simplified agent structure
 * In Phase 6, we'll integrate this with Mastra's actual Agent class
 * This allows us to:
 * - Define our tools and prompts clearly
 * - Test the structure
 * - Integrate with Mastra when ready
 */
export const agentConfig = {
  name: 'CV Tailor Agent',
  systemPrompt: systemPrompts.cvTailorAgent,
  tools: tools,
  llmConfig: llmConfig,
};

/**
 * Create CV Tailor Agent
 *
 * 📚 LEARNING: Agent vs LLM vs Chatbot
 *
 * LLM (Large Language Model):
 * - Just text in, text out
 * - No memory, no tools
 * - Example: Raw GPT-4 API
 *
 * Chatbot:
 * - LLM + conversation memory
 * - Can remember previous messages
 * - Example: ChatGPT interface
 *
 * Agent:
 * - LLM + tools + memory + orchestration
 * - Can perform actions (not just talk)
 * - Can plan multi-step tasks
 * - Example: Our CV Tailor Agent!
 *
 * @param collection - ChromaDB collection with uploaded CV
 * @returns Agent configuration
 */
export function createCVTailorAgent(collection: any) {
  /**
   * 📚 LEARNING: Why pass collection as parameter?
   * - Each user session has its own ChromaDB collection
   * - Agent needs access to the specific user's CV data
   * - This keeps user data isolated and private
   */

  // Inject collection into tools that need it
  const toolsWithCollection = tools.map((tool) => ({
    ...tool,
    // If tool needs collection, inject it
    execute: async (params: any) => {
      if (tool.name === 'query_cv_rag') {
        return await tool.execute({ ...params, collection });
      }
      return await tool.execute(params);
    },
  }));

  return {
    name: agentConfig.name,
    systemPrompt: agentConfig.systemPrompt,
    tools: toolsWithCollection,
    llmConfig: agentConfig.llmConfig,
    groqClient: groq,
  };
}

/**
 * Helper function to run the agent
 *
 * 📚 LEARNING: This is the main entry point for using the agent
 * It handles:
 * - Creating the agent
 * - Sending the user's message
 * - Calling Groq LLM with tools
 * - Error handling
 *
 * In Phase 6, we'll implement the full agent execution with tool calling
 *
 * @param params - Agent execution parameters
 * @returns Agent response
 */
export async function runCVTailorAgent(params: {
  message: string;
  collection: any;
  sessionId: string;
}) {
  const { message, collection, sessionId } = params;

  console.log('[Agent] Starting CV Tailor Agent for session:', sessionId);

  try {
    // Create agent with access to user's CV collection
    const agent = createCVTailorAgent(collection);

    /**
     * 📚 LEARNING: For now, we return the agent configuration
     * In Phase 6 (API Routes), we'll implement full tool calling
     * with Groq's function calling API
     */

    console.log('[Agent] ✓ Agent configured successfully');

    return {
      success: true,
      message: 'Agent is ready! Full implementation in Phase 6.',
      agentConfig: {
        name: agent.name,
        toolCount: agent.tools.length,
        model: agent.llmConfig.model,
      },
    };
  } catch (error) {
    console.error('[Agent] Error:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Agent execution failed',
    };
  }
}

/**
 * 📚 LEARNING: Agent Execution Flow (Detailed)
 * =============================================
 *
 * Let's trace what happens when user asks: "Tailor my CV for this job"
 *
 * STEP 1: Initial Request
 * - User sends message
 * - Agent receives it with system prompt
 *
 * STEP 2: Agent Planning
 * - LLM reads system prompt: "You are a CV Tailor Agent..."
 * - LLM sees available tools: query_cv_rag, analyze_job_description, etc.
 * - LLM decides: "I need to gather CV info first"
 *
 * STEP 3: First Tool Call
 * - LLM generates: { tool: "query_cv_rag", params: { query: "What is candidate's experience?" } }
 * - Mastra executes query_cv_rag tool
 * - ChromaDB returns relevant CV sections
 * - Results fed back to LLM
 *
 * STEP 4: Second Tool Call
 * - LLM decides: "Now I need to analyze the job"
 * - LLM generates: { tool: "analyze_job_description", params: { jobDescription: "..." } }
 * - Mastra executes tool
 * - Results fed back to LLM
 *
 * STEP 5: Third Tool Call
 * - LLM decides: "I have enough info to generate tailored CV"
 * - LLM generates: { tool: "generate_tailored_cv", params: { cvContent: "...", jobRequirements: "..." } }
 * - Tool returns tailored CV
 *
 * STEP 6: Fourth Tool Call
 * - LLM generates cover letter using generate_cover_letter tool
 *
 * STEP 7: Final Response
 * - LLM compiles all information
 * - Formats output according to system prompt guidelines
 * - Returns beautiful formatted CV + cover letter
 * - User receives result
 *
 * TOTAL TIME: ~10-30 seconds (depending on CV length and complexity)
 *
 * AMAZING PART:
 * The LLM decides ALL of this automatically!
 * We just provide:
 * - Tools it can use
 * - Instructions on what to do
 * - Initial user request
 *
 * The agent figures out the rest! 🤯
 */

/**
 * 📚 LEARNING: Common Agent Patterns
 * ===================================
 *
 * 1. REACT PATTERN (Reason + Act)
 * - Think: What do I need to do?
 * - Act: Call a tool
 * - Observe: What was the result?
 * - Repeat until task complete
 *
 * 2. PLAN-AND-EXECUTE
 * - Create full plan upfront
 * - Execute steps sequentially
 * - Adjust plan if needed
 *
 * 3. REFLECTION
 * - Do task
 * - Evaluate result
 * - If not good enough, try again with improvements
 *
 * Our agent uses a hybrid approach:
 * - Plans high-level steps (from system prompt)
 * - Executes tools as needed (ReAct pattern)
 * - Can adjust based on results
 */

/**
 * Export types for TypeScript
 */
export type CVTailorAgentResult = {
  success: boolean;
  message?: string;
  agentConfig?: {
    name: string;
    toolCount: number;
    model: string;
  };
  error?: string;
};
