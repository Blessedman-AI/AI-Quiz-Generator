// app/api/extract-document/route.js
import { NextResponse } from 'next/server';
import formidable from 'formidable';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { PdfReader } from 'pdfreader';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Parse form data
const parseForm = async (req) => {
  const form = formidable();

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

// Extract text from PDF
const extractPdfText = async (filePath) => {
  return new Promise((resolve, reject) => {
    let text = '';
    new PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve(text);
      else if (item.text) text += item.text + ' ';
    });
  });
};

// Extract text from DOCX
const extractDocxText = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
};

export async function POST(request) {
  try {
    const { files } = await parseForm(request);
    const file = files.file[0];

    let text = '';

    // Extract text based on file type
    if (file.mimetype === 'application/pdf') {
      text = await extractPdfText(file.filepath);
    } else if (
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword'
    ) {
      text = await extractDocxText(file.filepath);
    } else {
      // For other text-based files, read as text
      const fileContent = await createReadStream(file.filepath).read();
      text = fileContent.toString();
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error extracting document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract document' },
      { status: 500 }
    );
  }
}
