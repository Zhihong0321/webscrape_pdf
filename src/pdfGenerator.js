import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import { defaultConfig } from './config.js';

export async function generatePDF(content, domain, url) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filename = sanitize(`${domain}-${Date.now()}.pdf`);
    const outputPath = path.join(defaultConfig.outputDir, filename);

    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // Add metadata
    doc.info['Title'] = url;
    doc.info['CreationDate'] = new Date();

    // Add content
    doc
      .fontSize(16)
      .text(url, { align: 'center' })
      .moveDown()
      .fontSize(12)
      .text(content);

    doc.end();

    writeStream.on('finish', () => {
      console.log(`PDF generated: ${filename}`);
      resolve(filename);
    });

    writeStream.on('error', reject);
  });
}