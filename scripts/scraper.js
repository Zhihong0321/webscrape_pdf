import puppeteer from 'puppeteer';
import pLimit from 'p-limit';
import URLParse from 'url-parse';
import { generatePDF } from './pdfGenerator.js';
import { isInternalLink, delay, sanitizeUrl } from './utils.js';

export async function scrapeWebsites(startUrls, config) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const limit = pLimit(config.maxConcurrent);
  const visited = new Set();

  async function scrapeUrl(url, depth = 0) {
    const sanitizedUrl = sanitizeUrl(url);
    if (depth > config.maxDepth || visited.has(sanitizedUrl)) {
      return;
    }

    visited.add(sanitizedUrl);
    console.log(`Scraping ${sanitizedUrl} (Depth: ${depth})`);

    try {
      const page = await browser.newPage();
      await page.goto(sanitizedUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Extract text content
      const content = await page.evaluate(() => {
        const elements = document.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, span, div');
        return Array.from(elements)
          .map(element => element.innerText)
          .filter(text => text.trim().length > 0)
          .join('\n\n');
      });

      // Generate PDF
      const parsedUrl = new URLParse(sanitizedUrl);
      await generatePDF(content, parsedUrl.hostname, sanitizedUrl);

      // Find internal links
      const links = await page.evaluate(() => {
        return Array.from(document.links).map(link => link.href);
      });

      await page.close();

      // Rate limiting
      await delay(config.rateLimit);

      // Process internal links
      const internalLinks = links
        .filter(link => isInternalLink(sanitizedUrl, link))
        .map(link => sanitizeUrl(link));

      const promises = internalLinks.map(link => 
        limit(() => scrapeUrl(link, depth + 1))
      );

      await Promise.all(promises);
    } catch (error) {
      console.error(`Error scraping ${sanitizedUrl}:`, error);
    }
  }

  try {
    const initialPromises = startUrls.map(url => 
      limit(() => scrapeUrl(url))
    );
    await Promise.all(initialPromises);
  } finally {
    await browser.close();
  }
}