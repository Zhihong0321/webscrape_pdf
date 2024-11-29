import { scrapeWebsites } from './scraper.js';
import { setupOutputDirectory } from './utils.js';
import { defaultConfig } from './config.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function promptUser() {
  return new Promise((resolve) => {
    rl.question('Enter website URL (or multiple URLs separated by commas): ', (urls) => {
      rl.question('Enter maximum depth (default: 2): ', (depth) => {
        const config = {
          ...defaultConfig,
          urls: urls.split(',').map(url => url.trim()),
          maxDepth: parseInt(depth) || defaultConfig.maxDepth
        };
        rl.close();
        resolve(config);
      });
    });
  });
}

async function main() {
  try {
    console.log('Web Scraper Starting...');
    
    // Ensure output directory exists
    await setupOutputDirectory();
    
    // Get configuration from user
    const config = await promptUser();
    
    console.log('\nStarting web scraping with configuration:');
    console.log(`URLs: ${config.urls.join(', ')}`);
    console.log(`Maximum Depth: ${config.maxDepth}`);
    console.log(`Rate Limit: ${config.rateLimit}ms`);
    console.log(`Maximum Concurrent Requests: ${config.maxConcurrent}\n`);

    await scrapeWebsites(config.urls, config);
    console.log('\nScraping completed successfully!');
    console.log(`PDFs have been saved to: ${config.outputDir}`);
  } catch (error) {
    console.error('Error during scraping:', error);
  }
}

main();