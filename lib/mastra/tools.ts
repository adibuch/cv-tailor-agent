/**
 * Mastra Tools - Functions the AI Agent Can Use
 *
 * 📚 LEARNING NOTES:
 * ==================
 *
 * WHAT ARE TOOLS?
 * Tools are functions that the AI agent can call to perform specific tasks.
 * Think of them as the agent's "hands" - ways to interact with the world.
 *
 * HOW DO TOOLS WORK?
 * 1. AI receives a request: "Tailor my CV"
 * 2. AI decides: "I need to know what's in the CV first"
 * 3. AI calls: query_cv_rag("What are the candidate's skills?")
 * 4. We execute the function and return results
 * 5. AI uses results to continue its task
 *
 * TOOL STRUCTURE:
 * Each tool needs:
 * - name: Unique identifier
 * - description: What it does (AI uses this to decide when to call it)
 * - parameters: Input schema (what data it needs)
 * - execute: The actual function logic
 */

import { z } from 'zod';
import { queryDocuments } from '@/lib/chroma/client';
import type { QueryResult } from '@/lib/chroma/types';

/**
 * Tool 1: Query CV using RAG
 *
 * 📚 LEARNING: What is RAG?
 * RAG = Retrieval-Augmented Generation
 *
 * ANALOGY: Like studying for an exam
 * - WITHOUT RAG: Answer from memory only (limited, might be wrong)
 * - WITH RAG: Look up relevant info in textbook, then answer (accurate, detailed)
 *
 * HOW IT WORKS:
 * 1. AI asks: "What programming languages does candidate know?"
 * 2. We search ChromaDB for relevant CV sections
 * 3. Return matching text chunks
 * 4. AI reads those chunks and answers the question
 *
 * BENEFITS:
 * - More accurate (based on actual CV content)
 * - No hallucination (AI can't make up facts)
 * - Efficient (only processes relevant sections)
 */
export const queryCVTool = {
  name: 'query_cv_rag',

  /**
   * Description for the AI
   * 📚 LEARNING: This is crucial! The AI reads this to decide when to use the tool
   * Be specific and clear about what the tool does
   */
  description: `
    Query the candidate's CV using RAG (Retrieval-Augmented Generation).
    Use this tool to find specific information from the uploaded CV such as:
    - Work experience and job titles
    - Educational background
    - Technical skills and technologies
    - Projects and achievements
    - Certifications and awards

    Returns relevant sections from the CV that match the query.
  `,

  /**
   * Input Schema
   * 📚 LEARNING: Zod schema defines what parameters the tool accepts
   * The AI must provide data that matches this schema
   */
  parameters: z.object({
    query: z.string().describe(
      'The question or search query about the CV. Examples: ' +
      '"What programming languages does the candidate know?", ' +
      '"What is their most recent work experience?", ' +
      '"What education background do they have?"'
    ),
    collection: z.any().describe('The ChromaDB collection to query'),
    limit: z.number().optional().default(5).describe(
      'Maximum number of relevant sections to return (default: 5)'
    ),
  }),

  /**
   * Execute Function
   * 📚 LEARNING: This is the actual logic that runs when AI calls the tool
   *
   * @param params - Tool parameters from AI
   * @returns Relevant CV sections as formatted string
   */
  execute: async (params: {
    query: string;
    collection: any;
    limit?: number;
  }): Promise<string> => {
    const { query, collection, limit = 5 } = params;

    console.log('[Tool: query_cv_rag] Querying CV with:', query);

    try {
      // Query ChromaDB for relevant sections
      const results: QueryResult[] = await queryDocuments(
        collection,
        query,
        limit
      );

      // Format results for AI consumption
      // 📚 LEARNING: We format as text because LLMs understand text best
      if (results.length === 0) {
        return 'No relevant information found in the CV for this query.';
      }

      let formattedResults = `Found ${results.length} relevant sections from CV:\n\n`;

      results.forEach((result, index) => {
        formattedResults += `[Section ${index + 1}] (${result.metadata.section})\n`;
        formattedResults += `${result.document}\n\n`;
      });

      return formattedResults;
    } catch (error) {
      console.error('[Tool: query_cv_rag] Error:', error);
      return 'Error querying CV. Please try again.';
    }
  },
};

/**
 * Tool 2: Analyze Job Description
 *
 * 📚 LEARNING: Why a separate tool?
 * - Separation of concerns (each tool does ONE thing well)
 * - AI can call tools in any order
 * - Easier to test and debug
 *
 * PURPOSE:
 * Extract key requirements from job description:
 * - Required skills
 * - Preferred qualifications
 * - Company culture fit
 * - Key responsibilities
 */
export const analyzeJobTool = {
  name: 'analyze_job_description',

  description: `
    Analyze a job description to extract key requirements and qualifications.
    This tool identifies:
    - Required technical skills
    - Preferred qualifications
    - Years of experience needed
    - Education requirements
    - Key responsibilities
    - Company values and culture

    Use this to understand what the job posting is looking for.
  `,

  parameters: z.object({
    jobDescription: z.string().describe(
      'The full job description text to analyze'
    ),
  }),

  /**
   * 📚 LEARNING: This tool uses the LLM itself!
   * We're asking the AI to analyze text and extract structured info
   * This is called "AI-powered parsing"
   */
  execute: async (params: {
    jobDescription: string;
  }): Promise<string> => {
    console.log('[Tool: analyze_job_description] Analyzing job...');

    const { jobDescription } = params;

    // Simple extraction logic
    // 📚 LEARNING: In a real app, you'd use an LLM here for deeper analysis
    // For now, we'll return the job description for the agent to analyze

    return `Job Description to analyze:\n\n${jobDescription}\n\nKey aspects to focus on:\n- Required skills\n- Experience level\n- Responsibilities\n- Company culture`;
  },
};

/**
 * Tool 3: Generate Tailored CV
 *
 * 📚 LEARNING: The Main Tool
 * This is where the magic happens - taking CV content and job requirements
 * to create a perfectly tailored CV
 *
 * PROCESS:
 * 1. Receives CV sections (from query_cv_rag)
 * 2. Receives job requirements (from analyze_job_description)
 * 3. AI rewrites CV to highlight relevant experience
 * 4. Returns tailored CV in structured format
 */
export const generateTailoredCVTool = {
  name: 'generate_tailored_cv',

  description: `
    Generate a tailored CV based on the candidate's information and job requirements.

    This tool creates a new version of the CV that:
    - Emphasizes relevant skills for the job
    - Reorders experience to highlight most relevant roles
    - Uses keywords from the job description
    - Maintains truthfulness (never fabricates experience)
    - Follows professional CV formatting

    Use this after gathering CV info and analyzing the job description.
  `,

  parameters: z.object({
    cvContent: z.string().describe(
      'The candidate\'s CV content (usually from query_cv_rag results)'
    ),
    jobRequirements: z.string().describe(
      'Key requirements from the job description'
    ),
    tone: z.enum(['professional', 'casual', 'academic']).optional().default('professional'),
  }),

  /**
   * 📚 LEARNING: This returns structured data
   * We'll have the LLM generate JSON that we can easily parse
   */
  execute: async (params: {
    cvContent: string;
    jobRequirements: string;
    tone?: 'professional' | 'casual' | 'academic';
  }): Promise<string> => {
    console.log('[Tool: generate_tailored_cv] Generating tailored CV...');

    const { cvContent, jobRequirements, tone = 'professional' } = params;

    // Return instructions for the LLM
    // 📚 LEARNING: The LLM will use this context to generate the actual CV
    return `
TASK: Generate a tailored CV based on the following:

CANDIDATE'S ORIGINAL CV:
${cvContent}

JOB REQUIREMENTS:
${jobRequirements}

TONE: ${tone}

INSTRUCTIONS:
1. Analyze the job requirements and identify key skills needed
2. Review the candidate's CV and find matching experience
3. Rewrite the CV to emphasize relevant experience
4. Use keywords from the job description naturally
5. Maintain chronological order but highlight relevant roles
6. Keep all information truthful - never invent experience
7. Format professionally with clear sections

Please generate the tailored CV now.
`;
  },
};

/**
 * Tool 4: Generate Cover Letter
 *
 * 📚 LEARNING: Cover letters need personality
 * Unlike CV (factual), cover letters are persuasive:
 * - Show enthusiasm for the role
 * - Connect experience to job requirements
 * - Demonstrate culture fit
 * - Tell a story
 */
export const generateCoverLetterTool = {
  name: 'generate_cover_letter',

  description: `
    Generate a compelling cover letter based on the tailored CV and job posting.

    The cover letter will:
    - Open with enthusiasm for the specific role
    - Highlight 2-3 most relevant experiences
    - Show understanding of company values
    - Explain why candidate is a great fit
    - Close with clear call-to-action

    Use this after generating the tailored CV.
  `,

  parameters: z.object({
    tailoredCV: z.string().describe('The tailored CV content'),
    jobDescription: z.string().describe('The full job description'),
    companyName: z.string().describe('Name of the company'),
    positionTitle: z.string().describe('Job title being applied for'),
  }),

  execute: async (params: {
    tailoredCV: string;
    jobDescription: string;
    companyName: string;
    positionTitle: string;
  }): Promise<string> => {
    console.log('[Tool: generate_cover_letter] Generating cover letter...');

    const { tailoredCV, jobDescription, companyName, positionTitle } = params;

    return `
TASK: Generate a compelling cover letter

CANDIDATE'S TAILORED CV:
${tailoredCV}

JOB DETAILS:
Company: ${companyName}
Position: ${positionTitle}

JOB DESCRIPTION:
${jobDescription}

COVER LETTER STRUCTURE:
1. Opening (1 paragraph)
   - Express enthusiasm for the role
   - Mention how you found the position
   - Brief statement of why you're a great fit

2. Body (2-3 paragraphs)
   - Paragraph 1: Highlight most relevant experience/achievement
   - Paragraph 2: Show understanding of company/role, explain fit
   - Paragraph 3 (optional): Additional relevant skills/experiences

3. Closing (1 paragraph)
   - Reiterate interest
   - Mention availability for interview
   - Thank them for consideration

TONE: Professional, enthusiastic, confident but humble

Please generate the cover letter now.
`;
  },
};

/**
 * 📚 LEARNING: Tool Selection Strategy
 * =====================================
 *
 * HOW DOES THE AI DECIDE WHICH TOOL TO USE?
 *
 * 1. AI reads all tool descriptions
 * 2. Based on user's request, AI picks relevant tool(s)
 * 3. AI generates parameters for the tool
 * 4. We execute and return results
 * 5. AI continues or calls more tools
 *
 * EXAMPLE WORKFLOW:
 * User: "Tailor my CV for this Software Engineer job"
 *
 * Step 1: AI calls query_cv_rag("What is the candidate's experience?")
 * Step 2: AI calls analyze_job_description(jobText)
 * Step 3: AI calls generate_tailored_cv(cvInfo, jobRequirements)
 * Step 4: AI calls generate_cover_letter(tailoredCV, jobDescription)
 * Step 5: AI returns results to user
 *
 * The AI orchestrates this automatically based on the task!
 */

/**
 * Export all tools as an array
 * 📚 LEARNING: Mastra expects tools in this format
 */
export const tools = [
  queryCVTool,
  analyzeJobTool,
  generateTailoredCVTool,
  generateCoverLetterTool,
];
