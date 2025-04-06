'use client';
// utils/pdfExtractor.js
import * as pdfjs from 'pdfjs-dist/build/pdf';

// Set the worker source to use the local file from the public directory
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js';
}

/**
 * Extract text from a PDF file
 * @param {File} file - The PDF file to extract text from
 * @returns {Promise<string>} - The extracted text
 */
export async function extractPdfText(file) {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Get the total number of pages
    const numPages = pdf.numPages;
    let text = '';

    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      text += pageText + '\n';
    }

    return text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}
