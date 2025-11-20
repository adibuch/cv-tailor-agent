/**
 * Unit Tests for Mastra Agent
 *
 * 📚 LEARNING NOTES:
 * ==================
 *
 * TESTING AI AGENTS IS TRICKY!
 * - LLM responses are non-deterministic (same input → different outputs)
 * - External API calls cost money
 * - Tests need to be fast
 *
 * SOLUTION: Test the Structure, Not the AI
 * We test:
 * ✅ Tool definitions are valid
 * ✅ Parameters schemas work correctly
 * ✅ Agent configuration is correct
 * ✅ Error handling works
 *
 * We DON'T test:
 * ❌ Actual LLM responses (too variable)
 * ❌ Real API calls (too slow/expensive)
 *
 * For full integration tests with real LLM, we'll create separate
 * integration tests that run manually.
 */

import { describe, expect, test } from 'bun:test';
import { tools } from '@/lib/mastra/tools';
import { systemPrompts } from '@/lib/mastra/prompts';

/**
 * Test Suite: Tool Definitions
 *
 * 📚 LEARNING: Why test tool definitions?
 * - Mastra requires specific structure
 * - Typos in tool names/descriptions break functionality
 * - Parameter schemas must be valid Zod schemas
 * - Better to catch errors in tests than production!
 */
describe('Mastra Agent - Tool Definitions', () => {
  /**
   * Test: All tools have required fields
   */
  test('all tools should have required fields', () => {
    // 📚 LEARNING: We're checking structure, not functionality
    for (const tool of tools) {
      // Each tool must have these fields
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('parameters');
      expect(tool).toHaveProperty('execute');

      // Name should be string
      expect(typeof tool.name).toBe('string');
      expect(tool.name.length).toBeGreaterThan(0);

      // Description should be string
      expect(typeof tool.description).toBe('string');
      expect(tool.description.length).toBeGreaterThan(10); // Meaningful description

      // Execute should be function
      expect(typeof tool.execute).toBe('function');
    }
  });

  /**
   * Test: Tool names are unique
   *
   * 📚 LEARNING: Why unique names?
   * - LLM uses tool names to decide which to call
   * - Duplicate names would confuse the system
   */
  test('tool names should be unique', () => {
    const names = tools.map((t) => t.name);
    const uniqueNames = new Set(names);

    expect(uniqueNames.size).toBe(tools.length);
  });

  /**
   * Test: Tool descriptions are informative
   *
   * 📚 LEARNING: Good descriptions help LLM choose the right tool
   * Each description should:
   * - Explain what the tool does
   * - Mention key use cases
   * - Be clear and specific
   */
  test('tool descriptions should be informative', () => {
    for (const tool of tools) {
      // Description should be at least 50 characters
      expect(tool.description.length).toBeGreaterThan(50);

      // Should not be all caps (bad practice)
      expect(tool.description).not.toBe(tool.description.toUpperCase());
    }
  });

  /**
   * Test: Parameter schemas are valid
   *
   * 📚 LEARNING: Zod schemas must be valid objects
   */
  test('parameter schemas should be valid Zod schemas', () => {
    for (const tool of tools) {
      // Parameters should be an object (Zod schema)
      expect(tool.parameters).toBeDefined();
      expect(typeof tool.parameters).toBe('object');

      // Should have parse method (characteristic of Zod schemas)
      expect(tool.parameters).toHaveProperty('parse');
    }
  });
});

/**
 * Test Suite: System Prompts
 *
 * 📚 LEARNING: Why test prompts?
 * - Prompts are the agent's instructions
 * - Missing or unclear prompts = poor performance
 * - Testing ensures completeness
 */
describe('Mastra Agent - System Prompts', () => {
  /**
   * Test: CV Tailor prompt exists and is comprehensive
   */
  test('CV Tailor Agent prompt should be comprehensive', () => {
    const prompt = systemPrompts.cvTailorAgent;

    // Should exist
    expect(prompt).toBeDefined();
    expect(typeof prompt).toBe('string');

    // Should be substantial (comprehensive instructions)
    expect(prompt.length).toBeGreaterThan(500);

    // Should contain key sections
    // 📚 LEARNING: A good agent prompt should cover:
    expect(prompt.toLowerCase()).toContain('role'); // Agent's role
    expect(prompt.toLowerCase()).toContain('goal'); // What to achieve
    expect(prompt.toLowerCase()).toContain('tool'); // Available tools
    expect(prompt.toLowerCase()).toContain('workflow'); // How to work

    // Should mention specific tools
    expect(prompt).toContain('query_cv_rag');
    expect(prompt).toContain('generate_tailored_cv');
    expect(prompt).toContain('generate_cover_letter');

    // Should have ethical guidelines
    expect(prompt.toLowerCase()).toContain('never');
    expect(prompt.toLowerCase()).toContain('truthful');
  });

  /**
   * Test: Prompt includes formatting guidelines
   *
   * 📚 LEARNING: Good prompts guide output format
   */
  test('prompt should include formatting guidelines', () => {
    const prompt = systemPrompts.cvTailorAgent;

    expect(prompt.toLowerCase()).toContain('format');
    expect(prompt.toLowerCase()).toContain('structure');
  });

  /**
   * Test: Prompt includes examples
   *
   * 📚 LEARNING: Examples help LLMs understand expectations
   * "Show, don't just tell"
   */
  test('prompt should include example workflow', () => {
    const prompt = systemPrompts.cvTailorAgent;

    expect(prompt.toLowerCase()).toContain('example');
  });
});

/**
 * Test Suite: Tool Execution (Mocked)
 *
 * 📚 LEARNING: We can test tool logic without real AI
 * We mock the inputs and verify the structure of outputs
 */
describe('Mastra Agent - Tool Execution', () => {
  /**
   * Test: query_cv_rag tool structure
   */
  test('query_cv_rag tool should have correct parameter structure', () => {
    const queryTool = tools.find((t) => t.name === 'query_cv_rag');

    expect(queryTool).toBeDefined();

    // Test parameter schema
    const testParams = {
      query: 'What programming languages does the candidate know?',
      collection: null, // Mock collection
      limit: 5,
    };

    // Schema should accept valid params
    const result = queryTool!.parameters.safeParse(testParams);
    expect(result.success).toBe(true);
  });

  /**
   * Test: generate_tailored_cv tool structure
   */
  test('generate_tailored_cv tool should have correct parameter structure', () => {
    const generateTool = tools.find((t) => t.name === 'generate_tailored_cv');

    expect(generateTool).toBeDefined();

    const testParams = {
      cvContent: 'Sample CV content',
      jobRequirements: 'Sample job requirements',
      tone: 'professional' as const,
    };

    const result = generateTool!.parameters.safeParse(testParams);
    expect(result.success).toBe(true);
  });

  /**
   * Test: generate_cover_letter tool structure
   */
  test('generate_cover_letter tool should have correct parameter structure', () => {
    const coverLetterTool = tools.find((t) => t.name === 'generate_cover_letter');

    expect(coverLetterTool).toBeDefined();

    const testParams = {
      tailoredCV: 'Sample tailored CV',
      jobDescription: 'Sample job description',
      companyName: 'Google',
      positionTitle: 'Software Engineer',
    };

    const result = coverLetterTool!.parameters.safeParse(testParams);
    expect(result.success).toBe(true);
  });

  /**
   * Test: Invalid parameters are rejected
   *
   * 📚 LEARNING: Zod validation should catch bad inputs
   */
  test('tools should reject invalid parameters', () => {
    const queryTool = tools.find((t) => t.name === 'query_cv_rag');

    // Missing required field 'query'
    const invalidParams = {
      collection: null,
      limit: 5,
    };

    const result = queryTool!.parameters.safeParse(invalidParams);
    expect(result.success).toBe(false);
  });
});

/**
 * 📚 LEARNING: Integration Testing Strategy
 * ==========================================
 *
 * For REAL agent testing (with actual LLM), create separate files:
 *
 * __tests__/integration/agent-integration.test.ts
 *
 * These tests would:
 * 1. Use real API keys (from env)
 * 2. Run actual agent workflows
 * 3. Verify end-to-end functionality
 * 4. Be skipped in CI/CD (too slow/expensive)
 * 5. Run manually before major releases
 *
 * Example:
 * ```typescript
 * test.skip('should tailor CV for real job posting', async () => {
 *   const agent = createCVTailorAgent(mockCollection);
 *   const result = await agent.generate('Tailor my CV for...');
 *   expect(result.text).toContain('CV');
 *   expect(result.text).toContain('Cover Letter');
 * });
 * ```
 */

/**
 * 📚 LEARNING: Why Separate Unit and Integration Tests?
 * ======================================================
 *
 * UNIT TESTS (This file):
 * ✅ Fast (run in < 1 second)
 * ✅ No external dependencies
 * ✅ No API costs
 * ✅ Run on every commit
 * ✅ Catch structural errors
 *
 * INTEGRATION TESTS (Separate file):
 * ⚠️ Slow (10-30 seconds per test)
 * ⚠️ Require API keys
 * ⚠️ Cost money (API usage)
 * ⚠️ Run manually or before releases
 * ⚠️ Catch functional errors
 *
 * BEST PRACTICE:
 * - Many unit tests (fast feedback)
 * - Few integration tests (final verification)
 * - Both are important!
 */
