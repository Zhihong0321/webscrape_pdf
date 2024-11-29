import URLParse from 'url-parse';
import fs from 'fs/promises';
import path from 'path';
import { defaultConfig } from './config.js';
import mkdirp from 'mkdirp';

export function isInternalLink(baseUrl, linkUrl) {
  try {
    const base = new URLParse(baseUrl);
    const link = new URLParse(linkUrl);
    return base.hostname === link.hostname;
  } catch {
    return false;
  }
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function sanitizeUrl(url) {
  try {
    return new URLParse(url).toString();
  } catch {
    return url;
  }
}

export async function setupOutputDirectory() {
  try {
    await mkdirp(defaultConfig.outputDir);
    console.log(`Output directory created: ${defaultConfig.outputDir}`);
  } catch (error) {
    console.error('Error creating output directory:', error);
    throw error;
  }
}