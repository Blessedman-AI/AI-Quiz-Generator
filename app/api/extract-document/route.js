// // app/api/extract-document/route.js
// import { NextResponse } from 'next/server';
// import * as mammoth from 'mammoth';
// import * as pdfjs from 'pdfjs-dist';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export async function POST(request) {
//   try {
//     // Parse the FormData from the request
//     const formData = await request.formData();
//     const file = formData.get('file');

//     if (!file) {
//       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
//     }

//     const fileType = file.name.split('.').pop().toLowerCase();
//     let extractedText = '';

//     // Extract text based on file type
//     if (fileType === 'pdf') {
//       // Get the PDF file buffer
//       const buffer = await file.arrayBuffer();
//       extractedText = await extractTextFromPDF(buffer);
//     } else if (fileType === 'docx') {
//       // Get the DOCX file buffer
//       const buffer = await file.arrayBuffer();
//       extractedText = await extractTextFromDOCX(buffer);
//     } else if (fileType === 'txt') {
//       // For text files, just read the text
//       extractedText = await file.text();
//     } else {
//       return NextResponse.json(
//         {
//           error:
//             'Unsupported file type. Please upload PDF, DOCX, or TXT files.',
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json({ text: extractedText });
//   } catch (error) {
//     console.error('Error extracting document text:', error);
//     return NextResponse.json(
//       { error: error.message || 'Failed to process document' },
//       { status: 500 }
//     );
//   }
// }

// // Function to extract text from PDF
// async function extractTextFromPDF(buffer) {
//   // Initialize PDF.js workerSrc
//   const pdfjsLib = await import('pdfjs-dist');
//   pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

//   // Load the PDF document
//   const loadingTask = pdfjsLib.getDocument({ data: buffer });
//   const pdf = await loadingTask.promise;

//   let textContent = '';

//   // Loop through each page
//   for (let i = 1; i <= pdf.numPages; i++) {
//     const page = await pdf.getPage(i);
//     const content = await page.getTextContent();
//     const strings = content.items.map((item) => item.str);
//     textContent += strings.join(' ') + '\n';
//   }

//   return textContent;
// }

// // Function to extract text from DOCX
// async function extractTextFromDOCX(buffer) {
//   const result = await mammoth.extractRawText({ arrayBuffer: buffer });
//   return result.value;
// }
