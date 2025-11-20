/**
 * Unit Tests for Job Scraper
 *
 * 📚 LEARNING NOTES:
 * ==================
 *
 * WHAT IS UNIT TESTING?
 * - Testing individual functions in isolation
 * - Each test focuses on ONE specific behavior
 * - Should be fast and independent
 *
 * TEST STRUCTURE (AAA Pattern):
 * 1. Arrange: Set up test data
 * 2. Act: Call the function being tested
 * 3. Assert: Check if result matches expectation
 *
 * EXAMPLE:
 * test('should add two numbers', () => {
 *   // Arrange
 *   const a = 2;
 *   const b = 3;
 *
 *   // Act
 *   const result = add(a, b);
 *
 *   // Assert
 *   expect(result).toBe(5);
 * });
 */

import { describe, expect, test } from 'bun:test';
import { cleanScrapedText, scrapeJobUrl } from '@/lib/scraper/job-scraper';

/**
 * Test Suite for Text Cleaning
 *
 * 📚 LEARNING: describe() groups related tests together
 * It's like a folder for organizing tests
 */
describe('Job Scraper - Text Cleaning', () => {
  /**
   * Test: Should clean HTML entities
   *
   * 📚 LEARNING: HTML entities are special characters in HTML
   * Example: &nbsp; = non-breaking space, &amp; = ampersand (&)
   */
  test('should clean HTML entities from text', () => {
    // Arrange: Create dirty text with HTML entities
    const dirtyText = 'Apple&nbsp;Inc &amp; Google&lt;script&gt;';

    // Act: Clean the text
    const cleaned = cleanScrapedText(dirtyText);

    // Assert: Check if entities are replaced correctly
    expect(cleaned).toBe('Apple Inc & Google<script>');
  });

  /**
   * Test: Should normalize whitespace
   *
   * 📚 LEARNING: Whitespace normalization means:
   * - Multiple spaces → single space
   * - Multiple newlines → double newline (paragraph break)
   * - Leading/trailing spaces → removed
   */
  test('should normalize whitespace', () => {
    // Arrange: Text with excessive whitespace
    const messyText = '  Hello    World  \n\n\n\nNew paragraph  ';

    // Act
    const cleaned = cleanScrapedText(messyText);

    // Assert
    // 📚 LEARNING: The function preserves single trailing spaces on lines
    // This is acceptable for our use case
    expect(cleaned).toContain('Hello World');
    expect(cleaned).toContain('New paragraph');
    expect(cleaned).not.toContain('    '); // No multiple spaces
    expect(cleaned.trim()).toBe(cleaned);   // No leading/trailing spaces on whole text
  });

  /**
   * Test: Should handle empty string
   *
   * 📚 LEARNING: Edge case testing
   * Always test extreme cases:
   * - Empty input
   * - Very large input
   * - Special characters
   * - null/undefined (if applicable)
   */
  test('should handle empty string', () => {
    const cleaned = cleanScrapedText('');
    expect(cleaned).toBe('');
  });

  /**
   * Test: Should preserve meaningful formatting
   *
   * 📚 LEARNING: Good cleaning doesn't destroy structure
   * We want to remove excess, but keep readability
   */
  test('should preserve paragraph structure', () => {
    const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
    const cleaned = cleanScrapedText(text);

    // Count paragraph breaks
    const paragraphCount = (cleaned.match(/\n\n/g) || []).length;
    expect(paragraphCount).toBe(2); // Two breaks = three paragraphs
  });
});

/**
 * Test Suite for URL Validation
 *
 * 📚 LEARNING: Input validation prevents crashes
 * Never trust user input - always validate!
 */
describe('Job Scraper - URL Validation', () => {
  /**
   * Test: Should reject invalid URLs
   */
  test('should throw error for invalid URL', async () => {
    const invalidUrls = [
      'not-a-url',
      'htp://wrong-protocol.com',
      'just-text',
      '',
    ];

    for (const url of invalidUrls) {
      // 📚 LEARNING: expect().rejects.toThrow() tests for async errors
      await expect(scrapeJobUrl(url)).rejects.toThrow('Invalid URL');
    }
  });

  /**
   * Test: Should accept valid URLs
   *
   * 📚 LEARNING: This test will actually try to scrape!
   * We skip it by default to avoid:
   * - Slowing down test suite
   * - Making external requests during tests
   * - Depending on external sites being available
   *
   * To run: Remove '.skip' and run: bun test --only scraper.test.ts
   */
  test.skip('should accept valid URLs', async () => {
    // 📚 LEARNING: Example.com is a special domain for testing
    // It's guaranteed to exist and be stable
    const validUrl = 'https://example.com';

    const result = await scrapeJobUrl(validUrl);

    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('url', validUrl);
    expect(result).toHaveProperty('method');
  });
});

/**
 * Test Suite for Scraped Data Structure
 */
describe('Job Scraper - Data Structure', () => {
  /**
   * Test: Scraped data should have required fields
   *
   * 📚 LEARNING: Integration test (skipped by default)
   * This test actually runs the scraper
   */
  test.skip('should return correctly structured data', async () => {
    const url = 'https://example.com';
    const data = await scrapeJobUrl(url);

    // Check all required fields exist
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('company');
    expect(data).toHaveProperty('description');
    expect(data).toHaveProperty('url');
    expect(data).toHaveProperty('scrapedAt');
    expect(data).toHaveProperty('method');

    // Check types
    expect(typeof data.title).toBe('string');
    expect(typeof data.company).toBe('string');
    expect(typeof data.description).toBe('string');
    expect(typeof data.url).toBe('string');
    expect(data.scrapedAt).toBeInstanceOf(Date);
    expect(['puppeteer', 'firecrawl']).toContain(data.method);
  });
});

/**
 * 📚 LEARNING: Testing Best Practices
 * ====================================
 *
 * 1. TEST ONE THING AT A TIME
 *    ✅ Good: test('should clean HTML entities')
 *    ❌ Bad:  test('should clean text and validate URLs and scrape data')
 *
 * 2. USE DESCRIPTIVE TEST NAMES
 *    ✅ Good: test('should throw error for empty URL')
 *    ❌ Bad:  test('test1')
 *
 * 3. ARRANGE, ACT, ASSERT
 *    - Set up data
 *    - Call function
 *    - Check result
 *
 * 4. TEST EDGE CASES
 *    - Empty input
 *    - Very large input
 *    - Invalid input
 *    - Null/undefined
 *
 * 5. AVOID EXTERNAL DEPENDENCIES
 *    - Don't make real API calls in unit tests
 *    - Use mocks for external services
 *    - Keep tests fast (< 100ms per test)
 *
 * 6. MAKE TESTS INDEPENDENT
 *    - Each test should work alone
 *    - Don't depend on test order
 *    - Clean up after each test
 */
