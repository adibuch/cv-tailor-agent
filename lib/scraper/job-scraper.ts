/**
 * Job Scraper Service
 *
 * LEARNING NOTES:
 * ===============
 * This service extracts job descriptions from URLs using two methods:
 *
 * 1. PUPPETEER (Primary Method):
 *    - Headless browser automation
 *    - Runs a real Chrome browser in the background
 *    - Can handle JavaScript-heavy sites
 *    - FREE and runs locally (privacy-first!)
 *
 * 2. FIRECRAWL API (Fallback):
 *    - External API service
 *    - More reliable for complex sites
 *    - Requires API key (paid service)
 *
 * WHY WE NEED THIS:
 * - Users paste job URLs instead of manually copying text
 * - Different job sites have different HTML structures
 * - Some sites load content dynamically with JavaScript
 */

import puppeteer from 'puppeteer';

/**
 * Interface for scraped job data
 *
 * LEARNING: TypeScript interfaces define the "shape" of our data
 * This helps catch errors at compile time and provides autocomplete
 */
export interface ScrapedJobData {
  title: string;           // Job title (e.g., "Senior Software Engineer")
  company: string;         // Company name (e.g., "Google")
  description: string;     // Full job description text
  location?: string;       // Job location (optional)
  url: string;            // Original URL
  scrapedAt: Date;        // When we scraped it
  method: 'puppeteer' | 'firecrawl'; // Which method succeeded
}

/**
 * Scrape job description using Puppeteer
 *
 * LEARNING: Puppeteer workflow
 * 1. Launch browser (headless = no visible window)
 * 2. Create a new page (like opening a new tab)
 * 3. Navigate to URL
 * 4. Wait for content to load
 * 5. Extract text from specific HTML elements
 * 6. Clean up and close browser
 *
 * @param url - Job posting URL
 * @returns Scraped job data
 */
export async function scrapeWithPuppeteer(
  url: string
): Promise<ScrapedJobData> {
  console.log('[Scraper] Starting Puppeteer scrape for:', url);

  // Step 1: Launch headless Chrome browser
  // LEARNING: 'headless: true' means no visible window (runs in background)
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',              // Required for some server environments
      '--disable-setuid-sandbox',  // Security setting for containers
      '--disable-dev-shm-usage',   // Prevents memory issues
    ],
  });

  try {
    // Step 2: Create a new page (like a new tab)
    const page = await browser.newPage();

    // Set a realistic user agent to avoid bot detection
    // LEARNING: Some sites block requests that look like bots
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Step 3: Navigate to the URL
    // LEARNING: 'waitUntil: networkidle2' means wait until page is fully loaded
    await page.goto(url, {
      waitUntil: 'networkidle2', // Wait for network to be idle (no more requests)
      timeout: 30000,             // 30 second timeout
    });

    // Step 4: Extract data from the page
    // LEARNING: page.evaluate() runs JavaScript IN THE BROWSER
    // It's like opening DevTools console and running code
    const jobData = await page.evaluate(() => {
      // This function runs in the browser context, not Node.js!

      /**
       * Helper function to get text from CSS selector
       * LEARNING: CSS selectors are patterns to find HTML elements
       * Example: 'h1' finds all <h1> tags, '.job-title' finds elements with class="job-title"
       */
      const getText = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      /**
       * Try multiple selectors (different sites use different HTML)
       * LEARNING: We use arrays because job sites have different structures
       * LinkedIn might use '.job-title', Indeed might use 'h1.jobsearch-JobInfoHeader-title'
       */
      const getTextFromMultiple = (selectors: string[]): string => {
        for (const selector of selectors) {
          const text = getText(selector);
          if (text) return text;
        }
        return '';
      };

      // Extract job title
      // LEARNING: These selectors are common patterns found on job sites
      const title = getTextFromMultiple([
        'h1',                                    // Generic heading
        '.job-title',                            // Common class name
        '[data-testid="job-title"]',           // LinkedIn pattern
        '.jobsearch-JobInfoHeader-title',      // Indeed pattern
        'h1.topcard__title',                   // LinkedIn pattern 2
      ]);

      // Extract company name
      const company = getTextFromMultiple([
        '.company-name',
        '[data-testid="company-name"]',
        '.jobsearch-InlineCompanyRating-companyHeader',
        'a.topcard__org-name-link',
        '.jobs-unified-top-card__company-name',
      ]);

      // Extract job description (usually the longest text block)
      const description = getTextFromMultiple([
        '.job-description',
        '[data-testid="job-description"]',
        '#jobDescriptionText',                  // Indeed
        '.show-more-less-html__markup',        // LinkedIn
        '.description__text',
      ]);

      // Extract location
      const location = getTextFromMultiple([
        '.job-location',
        '[data-testid="job-location"]',
        '.jobsearch-JobInfoHeader-subtitle',
        '.topcard__flavor--bullet',
      ]);

      // Return extracted data
      return {
        title: title || 'Job Title Not Found',
        company: company || 'Company Not Found',
        description: description || document.body.innerText, // Fallback to all text
        location: location || undefined,
      };
    });

    // Step 5: Return structured data
    return {
      ...jobData,
      url,
      scrapedAt: new Date(),
      method: 'puppeteer',
    };
  } catch (error) {
    console.error('[Scraper] Puppeteer failed:', error);
    throw new Error(`Puppeteer scraping failed: ${error}`);
  } finally {
    // Step 6: ALWAYS close the browser (prevent memory leaks)
    // LEARNING: 'finally' block runs even if there's an error
    await browser.close();
  }
}

/**
 * Scrape job description using Firecrawl API (fallback)
 *
 * LEARNING: API-based scraping
 * - External service handles browser automation
 * - More reliable but requires API key
 * - Costs money (has free tier)
 *
 * @param url - Job posting URL
 * @returns Scraped job data
 */
export async function scrapeWithFirecrawl(
  url: string
): Promise<ScrapedJobData> {
  console.log('[Scraper] Starting Firecrawl scrape for:', url);

  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY not set in environment');
  }

  // Call Firecrawl API
  // LEARNING: We're making an HTTP POST request to their API
  const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'], // Get clean markdown instead of HTML
    }),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl API failed: ${response.statusText}`);
  }

  const data = await response.json();

  // Parse the markdown response
  // LEARNING: Firecrawl returns clean markdown, we extract key info
  const content = data.markdown || '';
  const lines = content.split('\n');

  return {
    title: lines[0]?.replace(/^#\s*/, '') || 'Job Title Not Found',
    company: lines[1] || 'Company Not Found',
    description: content,
    url,
    scrapedAt: new Date(),
    method: 'firecrawl',
  };
}

/**
 * Main scraper function with fallback logic
 *
 * LEARNING: Error handling pattern
 * Try method A → if fails → try method B → if fails → throw error
 *
 * @param url - Job posting URL
 * @returns Scraped job data
 */
export async function scrapeJobUrl(url: string): Promise<ScrapedJobData> {
  // Validate URL first
  // LEARNING: Always validate input before processing
  try {
    const parsedUrl = new URL(url); // Throws error if invalid URL

    // Also check for valid protocol (http or https only)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid URL');
    }
  } catch {
    throw new Error('Invalid URL provided');
  }

  console.log('[Scraper] Starting scrape for:', url);

  // Try Puppeteer first (free, local, fast)
  try {
    const data = await scrapeWithPuppeteer(url);
    console.log('[Scraper] ✓ Puppeteer succeeded');
    return data;
  } catch (puppeteerError) {
    console.log('[Scraper] ✗ Puppeteer failed, trying Firecrawl...');

    // Fallback to Firecrawl
    try {
      const data = await scrapeWithFirecrawl(url);
      console.log('[Scraper] ✓ Firecrawl succeeded');
      return data;
    } catch (firecrawlError) {
      console.error('[Scraper] ✗ Both methods failed');
      throw new Error(
        'Failed to scrape job URL. Please copy and paste the job description manually.'
      );
    }
  }
}

/**
 * Clean and format scraped text
 *
 * LEARNING: Text cleaning is important because:
 * - Scraped text often has extra whitespace
 * - May contain HTML entities (&nbsp;, &amp;, etc.)
 * - Need consistent formatting for AI processing
 */
export function cleanScrapedText(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')           // Replace HTML space entities
    .replace(/&amp;/g, '&')            // Replace ampersand entities
    .replace(/&lt;/g, '<')             // Replace less-than entities
    .replace(/&gt;/g, '>')             // Replace greater-than entities
    .replace(/[ \t]+/g, ' ')           // Normalize spaces and tabs (but preserve newlines)
    .replace(/\n\s*\n\s*\n+/g, '\n\n') // Multiple newlines → double newline
    .trim();                           // Remove leading/trailing whitespace
}
