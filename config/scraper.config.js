export const scraperConfig = {
  maxDepth: 2,
  rateLimit: 1000,
  maxConcurrent: 3,
  outputDir: process.env.PDF_OUTPUT_DIR || './output',
  chromePath: process.env.CHROME_PATH || undefined,
  urls: []
};