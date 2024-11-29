import { scrapeWebsites } from '../../lib/scraper';
import { scraperConfig } from '../../config/scraper.config';
import { setupOutputDirectory } from '../../lib/utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { urls, maxDepth } = req.body;
    
    // Ensure output directory exists
    await setupOutputDirectory();
    
    const config = {
      ...scraperConfig,
      maxDepth: maxDepth || scraperConfig.maxDepth,
      urls
    };

    // Start scraping in the background
    scrapeWebsites(urls, config).catch(error => {
      console.error('Background scraping error:', error);
    });

    res.status(200).json({ 
      message: 'Scraping process started. PDFs will be saved to the output directory.',
      outputDir: config.outputDir
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ message: 'Error starting scraping process' });
  }
}