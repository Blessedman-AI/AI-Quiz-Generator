// utils/pdfjs-worker.js
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs';
import PDFWorker from 'pdfjs-dist/build/pdf.worker.mjs';

GlobalWorkerOptions.workerPort = new PDFWorker();
